"""Regression test suite for ProofStack forensic remediation.

Covers:
1. _RunComplete and orchestrator terminal state finalization (unstable baseline -> COMPLETED with INCONCLUSIVE).
2. Decision model persistence and linking to Run.
3. Unexpected exception handling in orchestrator (-> FAILED).
4. Run cancellation lifecycle.
5. Database migrations, schema constraints, and delete cascades.
6. API authentication matrix (missing 401, invalid 403, valid 200, public routes).
7. Optimistic locking and atomic expected_version enforcement (409 Conflict).
8. Request schema mass assignment protection (422 on unauthorized fields).
9. Report generation (Markdown/JSON) and cross-run isolation.
10. Evidence ledger hash chain append and tamper verification.
"""

import uuid
import pytest
import asyncio
from datetime import datetime, timezone
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from fastapi.testclient import TestClient

from backend.database import Base, get_db
from backend import models
from backend.server import app, verify_api_key
from backend.orchestrator import Orchestrator, _RunComplete
from backend.report_service import ReportService
from backend.ledger_service import LedgerService

TEST_API_KEY = "test-remediation-secret-key"


@pytest.fixture
def memory_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()


@pytest.fixture
def client(memory_db):
    def override_get_db():
        try:
            yield memory_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[verify_api_key] = lambda: TEST_API_KEY
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def raw_client(memory_db):
    """Client without dependency override on verify_api_key to test real authentication."""
    def override_get_db():
        try:
            yield memory_db
        finally:
            pass

    from backend.config import settings
    original_secret = settings.secret_key
    settings.secret_key = TEST_API_KEY
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()
    settings.secret_key = original_secret


# =========================================================================
# 1. ORCHESTRATOR & _RunComplete TERMINAL STATE FINALIZATION
# =========================================================================

def _create_test_task_and_run(db, noise_max_rel_mad=0.10):
    proj = models.Project(
        id=str(uuid.uuid4()), name="Audit Project", repository_path="/tmp/repo"
    )
    db.add(proj)
    db.commit()

    task = models.Task(
        id=str(uuid.uuid4()),
        project_id=proj.id,
        name="Audit Task",
        target_file="sample.py",
        target_symbol="calc",
        baseline_commit="1111111111111111111111111111111111111111",
        benchmark_command=["python", "-m", "pyperf"],
        workload_seed=42,
        samples=20,
        noise_max_rel_mad=noise_max_rel_mad,
        test_command=["pytest"],
        protected_paths=["tests/"],
        mode="optimize",
    )
    db.add(task)
    db.commit()

    run = models.Run(
        id=str(uuid.uuid4()),
        task_id=task.id,
        requested_baseline=task.baseline_commit,
        status=models.RunStatus.CREATED,
    )
    db.add(run)
    db.commit()
    return task, run


@pytest.mark.asyncio
async def test_orchestrator_unstable_baseline_inconclusive_verdict(memory_db):
    """
    Critical Blocker A:
    When baseline instability is detected, _RunComplete is raised.
    The orchestrator must catch it at the proper boundary and transition
    the run to COMPLETED with an INCONCLUSIVE verdict, persist Decision,
    and NOT allow the run to incorrectly become FAILED.
    """
    task, run = _create_test_task_and_run(memory_db, noise_max_rel_mad=0.0001)

    orchestrator = Orchestrator(memory_db)
    await orchestrator.execute(run.id)

    memory_db.refresh(run)
    assert run.status == models.RunStatus.COMPLETED
    assert run.final_verdict == models.Verdict.INCONCLUSIVE
    assert run.current_stage == "COMPLETED"
    assert "Baseline unstable" in (run.verdict_reason or "")
    assert run.completed_at is not None
    assert run.version >= 2

    decision = memory_db.query(models.Decision).filter(models.Decision.run_id == run.id).first()
    assert decision is not None
    assert decision.verdict == models.Verdict.INCONCLUSIVE
    assert "Baseline unstable" in decision.reasons[0]

    # Verify downstream stages (AUDITING, HYPOTHESIZING, etc.) did NOT execute
    findings = memory_db.query(models.Finding).filter(models.Finding.run_id == run.id).all()
    hypotheses = memory_db.query(models.Hypothesis).filter(models.Hypothesis.run_id == run.id).all()
    assert len(findings) == 0
    assert len(hypotheses) == 0


@pytest.mark.asyncio
async def test_orchestrator_stable_baseline_completes_full_pipeline(memory_db):
    """Verify that a normal stable run executes all stages and produces ACCEPTED or REJECTED."""
    task, run = _create_test_task_and_run(memory_db, noise_max_rel_mad=0.50)

    orchestrator = Orchestrator(memory_db)
    await orchestrator.execute(run.id)

    memory_db.refresh(run)
    assert run.status == models.RunStatus.COMPLETED
    assert run.current_stage == "COMPLETED"
    assert run.final_verdict in (models.Verdict.ACCEPTED, models.Verdict.REJECTED)

    decision = memory_db.query(models.Decision).filter(models.Decision.run_id == run.id).first()
    assert decision is not None
    assert decision.verdict == run.final_verdict

    # Downstream findings and hypotheses were generated
    findings = memory_db.query(models.Finding).filter(models.Finding.run_id == run.id).all()
    assert len(findings) > 0


@pytest.mark.asyncio
async def test_orchestrator_unexpected_exception_marks_failed(memory_db):
    """An unexpected exception during execution must result in FAILED status with error details."""
    task, run = _create_test_task_and_run(memory_db)

    orchestrator = Orchestrator(memory_db)

    async def broken_stage(run_id, t):
        raise RuntimeError("Disk quota exceeded during probe synthesis")

    orchestrator._do_baselining = broken_stage
    await orchestrator.execute(run.id)

    memory_db.refresh(run)
    assert run.status == models.RunStatus.FAILED
    assert run.error_classification == "RuntimeError"
    assert "Disk quota exceeded" in (run.error_details or "")
    assert run.completed_at is not None


@pytest.mark.asyncio
async def test_orchestrator_cancellation_honored(memory_db):
    """Cancellation prevents further processing and preserves partial state."""
    task, run = _create_test_task_and_run(memory_db)
    run.status = models.RunStatus.CANCELLED
    memory_db.commit()

    orchestrator = Orchestrator(memory_db)
    await orchestrator.execute(run.id)

    memory_db.refresh(run)
    assert run.status == models.RunStatus.CANCELLED
    assert run.final_verdict is None


# =========================================================================
# 2. DATABASE SCHEMA, VERSIONS, AND DELETE CASCADES
# =========================================================================

def test_database_schema_and_version_columns(memory_db):
    """Verify ORM models contain version column and required tables."""
    insp = inspect(memory_db.bind)
    tables = insp.get_table_names()
    assert "projects" in tables
    assert "tasks" in tables
    assert "runs" in tables
    assert "decisions" in tables
    assert "reports" in tables

    for tbl in ["projects", "tasks", "runs"]:
        col_names = [c["name"] for c in insp.get_columns(tbl)]
        assert "version" in col_names, f"version column missing in {tbl}"


def test_cascade_delete_run_cleans_decisions_and_reports(memory_db):
    """Deleting a run cascades cleanly to decisions and reports without orphans."""
    task, run = _create_test_task_and_run(memory_db)

    decision = models.Decision(
        id=str(uuid.uuid4()),
        run_id=run.id,
        verdict=models.Verdict.INCONCLUSIVE,
        policy_version="1.0",
        profile_version="1.0",
        reasons=["unstable"],
    )
    report = models.Report(
        id=str(uuid.uuid4()),
        run_id=run.id,
        report_type="investigation",
        format="markdown",
        content="# Test Report",
        decision_id=decision.id,
    )
    memory_db.add(decision)
    memory_db.add(report)
    memory_db.commit()

    assert memory_db.query(models.Decision).filter(models.Decision.run_id == run.id).count() == 1
    assert memory_db.query(models.Report).filter(models.Report.run_id == run.id).count() == 1

    memory_db.delete(run)
    memory_db.commit()

    assert memory_db.query(models.Decision).filter(models.Decision.run_id == run.id).count() == 0
    assert memory_db.query(models.Report).filter(models.Report.run_id == run.id).count() == 0


# =========================================================================
# 3. API AUTHENTICATION & AUTHORIZATION MATRIX
# =========================================================================

def test_auth_public_endpoints(raw_client):
    """Public endpoints must be accessible without API key."""
    res_health = raw_client.get("/api/health")
    assert res_health.status_code == 200
    assert res_health.json()["status"] == "ok"

    res_ready = raw_client.get("/api/ready")
    assert res_ready.status_code == 200
    assert res_ready.json()["ready"] is True
    assert res_ready.json()["database"] == "up"

    res_openapi = raw_client.get("/openapi.json")
    assert res_openapi.status_code == 200


def test_auth_missing_and_invalid_key_rejected(raw_client):
    """Protected endpoints require valid API key."""
    # 1. No key -> 401
    res_no_key = raw_client.get("/api/projects")
    assert res_no_key.status_code == 401
    assert "Missing API key" in res_no_key.text

    # 2. Invalid key -> 403
    res_bad_key = raw_client.get("/api/projects", headers={"X-API-Key": "wrong-key"})
    assert res_bad_key.status_code == 403
    assert "Invalid API key" in res_bad_key.text

    # 3. Correct key -> 200
    res_ok = raw_client.get("/api/projects", headers={"X-API-Key": TEST_API_KEY})
    assert res_ok.status_code == 200


# =========================================================================
# 4. OPTIMISTIC LOCKING & ATOMIC expected_version
# =========================================================================

def test_optimistic_locking_project(client):
    """Project version increments on update and rejects stale expected_version with 409."""
    create_res = client.post("/api/projects", json={"name": "Locking Project", "repository_path": "/tmp/repo"})
    assert create_res.status_code == 201
    p_id = create_res.json()["id"]
    assert create_res.json()["version"] == 0

    # 1. Update with valid expected_version
    patch_res = client.patch(f"/api/projects/{p_id}", json={"name": "Updated 1", "expected_version": 0})
    assert patch_res.status_code == 200
    assert patch_res.json()["name"] == "Updated 1"
    assert patch_res.json()["version"] == 1

    # 2. Update with stale expected_version -> 409 Conflict
    stale_res = client.patch(f"/api/projects/{p_id}", json={"name": "Stale Update", "expected_version": 0})
    assert stale_res.status_code == 409
    assert "Stale write" in stale_res.json()["detail"]

    # 3. Update with current expected_version -> 200
    good_res = client.patch(f"/api/projects/{p_id}", json={"name": "Updated 2", "expected_version": 1})
    assert good_res.status_code == 200
    assert good_res.json()["version"] == 2


def test_optimistic_locking_task_and_run(client, memory_db):
    """Task and Run PATCH endpoints enforce expected_version."""
    task, run = _create_test_task_and_run(memory_db)

    # Task update with wrong expected_version -> 409
    res_stale_task = client.patch(f"/api/tasks/{task.id}", json={"description": "Stale", "expected_version": 99})
    assert res_stale_task.status_code == 409

    # Task update with correct expected_version -> 200
    res_ok_task = client.patch(f"/api/tasks/{task.id}", json={"description": "Fresh", "expected_version": 0})
    assert res_ok_task.status_code == 200
    assert res_ok_task.json()["version"] == 1

    # Run update with wrong expected_version -> 409
    res_stale_run = client.patch(f"/api/runs/{run.id}", json={"run_config": {"opt": 1}, "expected_version": 99})
    assert res_stale_run.status_code == 409

    # Run update with correct expected_version -> 200
    res_ok_run = client.patch(f"/api/runs/{run.id}", json={"run_config": {"opt": 1}, "expected_version": 0})
    assert res_ok_run.status_code == 200
    assert res_ok_run.json()["version"] == 1


# =========================================================================
# 5. MASS ASSIGNMENT & INPUT VALIDATION
# =========================================================================

def test_mass_assignment_protection(client, memory_db):
    """Attempts to inject forbidden fields (e.g. id, status, version) via PATCH are rejected."""
    task, run = _create_test_task_and_run(memory_db)

    # Attempt to tamper with run status or id via PATCH RunUpdate
    res = client.patch(f"/api/runs/{run.id}", json={"status": "COMPLETED", "version": 50})
    assert res.status_code == 422  # extra="forbid" raises validation error

    # Attempt to tamper with task target_file or id via PATCH TaskUpdate
    res_task = client.patch(f"/api/tasks/{task.id}", json={"target_file": "/evil/path", "id": "tampered"})
    assert res_task.status_code == 422


# =========================================================================
# 6. REPORT GENERATION & ACCESS CONTROL
# =========================================================================

def test_report_generation_and_cross_run_isolation(client, memory_db):
    """Reports can be created in markdown/json for completed runs, and cannot be accessed across run boundaries."""
    task, run = _create_test_task_and_run(memory_db)
    run.status = models.RunStatus.COMPLETED
    run.final_verdict = models.Verdict.INCONCLUSIVE
    run.verdict_reason = "Baseline unstable"
    memory_db.commit()

    decision = models.Decision(
        id=str(uuid.uuid4()),
        run_id=run.id,
        verdict=models.Verdict.INCONCLUSIVE,
        policy_version="1.0",
        profile_version="1.0",
        reasons=[run.verdict_reason],
    )
    memory_db.add(decision)
    memory_db.commit()

    # 1. Generate Markdown Report
    res_md = client.post(f"/api/runs/{run.id}/reports", json={"report_format": "markdown"})
    assert res_md.status_code == 201
    md_data = res_md.json()
    assert md_data["format"] == "markdown"
    assert "ProofStack Investigation Report" in md_data["content"]
    assert md_data["decision_id"] == decision.id

    # 2. Generate JSON Report
    res_json = client.post(f"/api/runs/{run.id}/reports", json={"report_format": "json"})
    assert res_json.status_code == 201
    json_data = res_json.json()
    assert json_data["format"] == "json"
    assert json_data["content_json"]["final_verdict"] == "INCONCLUSIVE"

    # 3. Retrieve Report
    res_get = client.get(f"/api/runs/{run.id}/reports/{md_data['id']}")
    assert res_get.status_code == 200

    # 4. Cross-run access rejection: swapping run_id returns 404
    fake_run_id = str(uuid.uuid4())
    res_cross = client.get(f"/api/runs/{fake_run_id}/reports/{md_data['id']}")
    assert res_cross.status_code == 404


# =========================================================================
# 7. EVIDENCE LEDGER TAMPER DETECTION
# =========================================================================

def test_ledger_chain_and_tamper_detection(memory_db):
    """LedgerService creates verifiable SHA-256 chains and detects corrupted entries."""
    run_id = str(uuid.uuid4())
    ledger = LedgerService(memory_db)

    e0 = ledger.append(run_id, "RUN_STARTED", {"run_id": run_id})
    e1 = ledger.append(run_id, "BASELINE", {"median_ns": 5000000.0, "rel_mad": 0.02})
    e2 = ledger.append(run_id, "FINAL_VERDICT", {"verdict": "ACCEPTED"})

    valid, head = ledger.verify_chain(run_id)
    assert valid is True
    assert head == e2.entry_hash

    # Tamper with e1 payload
    e1.payload = {**e1.payload, "median_ns": "99999999"}
    memory_db.commit()

    tampered, reason = ledger.verify_chain(run_id)
    assert tampered is False
    assert "tampered entry 1" in reason
