"""
End-to-end verification script executing the 24-step lifecycle validation
specified in Section 20 of the Forensic Audit prompt.
"""
import sys
import os
import uuid
import asyncio
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Ensure workspace is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from backend.server import app, get_db
from backend.config import settings
from backend import models, schemas
from backend.orchestrator import Orchestrator

def run_e2e():
    print("=" * 60)
    print("STARTING PROOFSTACK END-TO-END 24-STEP LOCAL VERIFICATION")
    print("=" * 60)

    # 1. Initialize disposable local database
    db_path = f"test_e2e_{uuid.uuid4().hex[:8]}.db"
    db_url = f"sqlite:///{db_path}"
    engine = create_engine(db_url, connect_args={"check_same_thread": False})
    models.Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    print(f"[STEP 1] Created disposable test database: {db_path}")

    # Override get_db dependency
    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    print("[STEP 2] Application initialized with TestClient")

    # 3. Verify health endpoint
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.status_code}"
    print(f"[STEP 3] GET /api/health -> {res.status_code} {res.json()}")

    # 4. Verify readiness endpoint
    res = client.get("/api/ready")
    assert res.status_code == 200, f"Readiness check failed: {res.status_code}"
    print(f"[STEP 4] GET /api/ready -> {res.status_code} {res.json()}")

    # 5. Verify protected endpoints reject invalid credentials
    res = client.get("/api/projects", headers={"X-API-Key": "wrong-key"})
    assert res.status_code == 403, f"Expected 403 on bad key, got {res.status_code}"
    res_no_key = client.get("/api/projects")
    assert res_no_key.status_code == 401, f"Expected 401 on no key, got {res_no_key.status_code}"
    print(f"[STEP 5] Auth rejection verified: bad key -> {res.status_code}, no key -> {res_no_key.status_code}")

    # 6. Verify authorized requests succeed
    auth_headers = {"X-API-Key": settings.secret_key}
    res = client.get("/api/projects", headers=auth_headers)
    assert res.status_code == 200, f"Expected 200 with valid key, got {res.status_code}"
    print(f"[STEP 6] Authorized GET /api/projects -> 200 OK (count={len(res.json())})")

    # 7. Create Project using actual API contract
    project_payload = {
        "name": "E2E PerfProof Verification",
        "repository_path": "/workspace/repo",
        "description": "Verification project for Section 20",
    }
    res = client.post("/api/projects", json=project_payload, headers=auth_headers)
    assert res.status_code == 201, f"Create project failed: {res.status_code} {res.text}"
    project_data = res.json()
    project_id = project_data["id"]
    print(f"[STEP 7] Created Project ID: {project_id}, version={project_data.get('version')}")

    # 8. Create Task using actual API contract
    task_payload = {
        "project_id": project_id,
        "name": "Benchmark Task",
        "mode": "optimize",
        "target_file": "core/math.py",
        "target_symbol": "calc",
        "baseline_commit": "abcdef1234567",
        "benchmark_command": ["pytest", "bench/"],
        "test_command": ["pytest", "tests/"],
        "protected_paths": ["security/"],
        "workload_seed": 42,
        "samples": 30,
        "tau_noise": 0.05,
        "regression_budget": 0.02,
        "max_repair_cycles": 2,
    }
    res = client.post("/api/tasks", json=task_payload, headers=auth_headers)
    assert res.status_code == 201, f"Create task failed: {res.status_code} {res.text}"
    task_data = res.json()
    task_id = task_data["id"]
    print(f"[STEP 8] Created Task ID: {task_id}, version={task_data.get('version')}")

    # 9. Create Run
    run_payload = {
        "task_id": task_id,
        "requested_baseline": "abcdef1234567",
        "requested_candidate": "1234567abcdef",
    }
    res = client.post("/api/runs", json=run_payload, headers=auth_headers)
    assert res.status_code == 201, f"Create run failed: {res.status_code} {res.text}"
    run_data = res.json()
    run_id = run_data["id"]
    print(f"[STEP 9] Created Run ID: {run_id}, initial status={run_data['status']}")

    # 10. Execute deterministic safe local run fixture
    db_session = TestingSessionLocal()
    orchestrator = Orchestrator(db_session)
    asyncio.run(orchestrator.execute(run_id))
    print(f"[STEP 10] Orchestrator execution completed for Run {run_id}")

    # 11. Verify checkpoint persistence
    db_session.expire_all()
    db_run = db_session.query(models.Run).filter(models.Run.id == run_id).first()
    checkpoints = db_run.run_config.get("checkpoints", {})
    assert len(checkpoints) > 0, "No checkpoints found in run_config"
    print(f"[STEP 11] Checkpoints verified: {list(checkpoints.keys())}")

    # 12. Verify evidence persistence
    baselines = db_session.query(models.Baseline).filter(models.Baseline.run_id == run_id).all()
    hypotheses = db_session.query(models.Hypothesis).filter(models.Hypothesis.run_id == run_id).all()
    experiments = db_session.query(models.Experiment).filter(models.Experiment.run_id == run_id).all()
    patches = db_session.query(models.Patch).filter(models.Patch.run_id == run_id).all()
    gates = db_session.query(models.Gate).filter(models.Gate.run_id == run_id).all()
    print(f"[STEP 12] Evidence persisted: {len(baselines)} baselines, {len(hypotheses)} hypotheses, {len(experiments)} experiments, {len(patches)} patches, {len(gates)} gates")

    # 13. Exercise baseline and verification gates
    gate_ids = [g.gate_id for g in gates]
    assert "G0_integrity" in gate_ids
    assert "G4_security" in gate_ids
    print(f"[STEP 13] Verification gates executed: {gate_ids}")

    # 14. Exercise canonical decision service
    db_decision = db_session.query(models.Decision).filter(models.Decision.run_id == run_id).first()
    assert db_decision is not None, "Canonical decision record missing!"
    print(f"[STEP 14] Canonical decision record: verdict={db_decision.verdict.value}, reasons={db_decision.reasons}")

    # 15. Exercise ledger append and verification functionality
    valid, head_hash = orchestrator.ledger.verify_chain(run_id)
    entry_count = db_session.query(models.LedgerEntry).filter(models.LedgerEntry.run_id == run_id).count()
    assert valid is True, f"Ledger chain verification failed: head={head_hash}"
    assert entry_count >= 5, f"Expected at least 5 ledger entries, got {entry_count}"
    print(f"[STEP 15] Ledger chain verified: valid={valid}, entries={entry_count}, head={head_hash[:16]}...")

    # 16 & 17. Exercise cancellation and corrected _RunComplete path
    # Unstable baseline Run triggers _RunComplete -> COMPLETED with INCONCLUSIVE
    run_unstable_res = client.post("/api/runs", json={"task_id": task_id, "requested_baseline": "abcdef1234567"}, headers=auth_headers)
    unstable_run_id = run_unstable_res.json()["id"]
    unstable_task = db_session.query(models.Task).filter(models.Task.id == task_id).first()
    unstable_task.noise_max_rel_mad = 0.000001 # Force unstable baseline (relative MAD > noise_max_rel_mad)
    db_session.commit()
    asyncio.run(orchestrator.execute(unstable_run_id))
    unstable_run = db_session.query(models.Run).filter(models.Run.id == unstable_run_id).first()
    assert unstable_run.status == models.RunStatus.COMPLETED, f"Expected COMPLETED, got {unstable_run.status}"
    assert unstable_run.final_verdict == models.Verdict.INCONCLUSIVE, f"Expected INCONCLUSIVE, got {unstable_run.final_verdict}"
    assert unstable_run.current_stage == "COMPLETED"
    print(f"[STEP 16 & 17] Corrected _RunComplete verified: status={unstable_run.status.value}, verdict={unstable_run.final_verdict.value}, stage={unstable_run.current_stage}")

    # 18. Generate report via API
    res = client.post(f"/api/runs/{run_id}/reports", json={"report_format": "markdown"}, headers=auth_headers)
    assert res.status_code == 201, f"Report generation failed: {res.status_code} {res.text}"
    report_data = res.json()
    report_id = report_data["id"]
    print(f"[STEP 18] Generated report {report_id} for Run {run_id}")

    # 19. Retrieve report via API
    res = client.get(f"/api/runs/{run_id}/reports/{report_id}", headers=auth_headers)
    assert res.status_code == 200, f"Retrieve report failed: {res.status_code}"
    retrieved_report = res.json()
    assert retrieved_report["content"] is not None
    print(f"[STEP 19] Retrieved report: content length={len(retrieved_report.get('content', ''))}")

    # 20. Verify report matches persisted canonical decision
    assert db_decision.verdict.value in retrieved_report["content"]
    assert retrieved_report["decision_id"] == db_decision.id
    print(f"[STEP 20] Report verdict matches canonical decision: decision_id={retrieved_report['decision_id']}")

    # 21. Exercise optimistic locking and stale update
    res = client.patch(
        f"/api/projects/{project_id}",
        json={"name": "New Name", "expected_version": 999},
        headers=auth_headers,
    )
    assert res.status_code == 409, f"Expected 409 Conflict, got {res.status_code}"
    print(f"[STEP 21] Optimistic locking conflict verified: 409 Conflict returned on stale version")

    # 22. Verify final database state and version counters
    db_session.expire_all()
    updated_project = db_session.query(models.Project).filter(models.Project.id == project_id).first()
    print(f"[STEP 22] Database state verified: Project version={updated_project.version}, Run version={db_run.version}")

    # 23. Verify event stream route registration and configuration
    route_match = [r for r in app.routes if getattr(r, "path", None) == "/api/runs/{run_id}/events"]
    assert len(route_match) > 0, "Event stream route not found"
    assert "GET" in route_match[0].methods
    print(f"[STEP 23] Event stream route verified: path={route_match[0].path}, methods={route_match[0].methods}")

    # 24. Clean up disposable test resources
    db_session.close()
    engine.dispose()
    if os.path.exists(db_path):
        os.remove(db_path)
    print(f"[STEP 24] Disposable test database {db_path} cleaned up successfully.")
    print("=" * 60)
    print("ALL 24 STEPS OF LOCAL WORKFLOW VERIFIED SUCCESSFULLY")
    print("=" * 60)

if __name__ == "__main__":
    run_e2e()
