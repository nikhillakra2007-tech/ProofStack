"""
Tests for ProofStack Model HTTP API endpoints:
- /api/model/status
- /api/runs/{run_id}/analyze
- /api/runs/{run_id}/propose-patch
- Authentication and authorization enforcement
"""
import os
import sys
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.server import app
from backend.database import Base, get_db
from backend.config import settings
from backend import models

from sqlalchemy.pool import StaticPool

TEST_KEY = "test-model-api-key"
settings.secret_key = TEST_KEY

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_db():
    app.dependency_overrides[get_db] = override_get_db
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    proj = models.Project(
        id="p-1",
        name="Test Proj",
        repository_path="./repo",
        allowed_paths=["app/**"],
    )
    db.add(proj)

    task = models.Task(
        id="t-1",
        project_id="p-1",
        name="Test Task",
        target_file="app/invoices.py",
        target_symbol="get_invoice",
        baseline_commit="b156b954c5c8396157cf42a2a0ca8fe4cf96bd53",
        benchmark_command=["pytest"],
        workload_seed=42,
        samples=10,
        tau_noise=0.05,
        noise_max_rel_mad=0.10,
        max_hypotheses=3,
        max_repair_cycles=3,
        max_diff_lines=30,
        max_files_changed=1,
        protected_paths=["tests/**", ".env*"],
        test_command=["pytest"],
    )
    db.add(task)

    run = models.Run(
        id="r-1",
        task_id="t-1",
        status=models.RunStatus.AUDITING,
        requested_baseline="b156b954c5c8396157cf42a2a0ca8fe4cf96bd53",
    )
    db.add(run)

    finding = models.Finding(
        id="f-1",
        run_id="r-1",
        probe_id="P03",
        target_revision="b156b954c5c8396157cf42a2a0ca8fe4cf96bd53",
        found=True,
        status="EXPLOIT_PROVEN",
        families=["SEC"],
    )
    db.add(finding)
    db.commit()
    db.close()


def test_model_status_requires_auth():
    resp = client.get("/api/model/status")
    assert resp.status_code == 401

    resp_bad = client.get("/api/model/status", headers={"X-API-Key": "wrong"})
    assert resp_bad.status_code == 403


def test_model_status_authenticated():
    resp = client.get("/api/model/status", headers={"X-API-Key": TEST_KEY})
    assert resp.status_code == 200
    data = resp.json()
    assert "provider" in data
    assert "configured" in data
    assert "models" in data
    assert "provenance_mode" in data
    # Ensure raw secret is never returned
    assert TEST_KEY not in resp.text


def test_analyze_run_endpoint():
    resp = client.post(
        "/api/runs/r-1/analyze",
        json={"force_fallback": True},
        headers={"X-API-Key": TEST_KEY},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["run_id"] == "r-1"
    assert data["provenance"] == "deterministic_fallback"
    assert data["validation_status"] == "VALIDATED"
    assert len(data["hypotheses"]) >= 1

    # Check that database has the hypothesis persisted
    db = TestingSessionLocal()
    hyps = db.query(models.Hypothesis).filter(models.Hypothesis.run_id == "r-1").all()
    assert len(hyps) == len(data["hypotheses"])
    db.close()


def test_propose_patch_endpoint():
    # First analyze so a hypothesis exists
    client.post("/api/runs/r-1/analyze", json={}, headers={"X-API-Key": TEST_KEY})

    resp = client.post(
        "/api/runs/r-1/propose-patch",
        json={"force_fallback": True},
        headers={"X-API-Key": TEST_KEY},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["run_id"] == "r-1"
    assert data["validation_status"] == "VALID"
    assert "patch_id" in data
    assert "diff_text" in data
    assert data["touches"] == ["app/invoices.py"]


def test_analyze_run_not_found():
    resp = client.post(
        "/api/runs/nonexistent-run/analyze",
        json={},
        headers={"X-API-Key": TEST_KEY},
    )
    assert resp.status_code == 404
