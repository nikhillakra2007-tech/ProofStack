"""Integration tests for Studio, Cockpit, and DAST interactive endpoints."""
import pytest
from fastapi.testclient import TestClient
from backend.server import app
from backend.config import settings
from backend.database import Base, engine


@pytest.fixture
def client():
    Base.metadata.create_all(bind=engine)
    return TestClient(app, headers={"X-API-Key": settings.secret_key})



def test_public_run_endpoint_safe(client):
    res = client.post("/api/run", json={
        "code": "import re\nURL_PATTERN = re.compile(r'^[a-zA-Z0-9]+$')\ndef validate_slug(slug):\n    return bool(URL_PATTERN.match(slug))",
        "language": "python",
        "problemId": "T1-1",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert data["exitCode"] == 0
    assert len(data["logs"]) > 0


def test_public_run_endpoint_redos_detection(client):
    res = client.post("/api/run", json={
        "code": "import re\nURL_PATTERN = re.compile(r'^([a-zA-Z0-9]+)+$')",
        "language": "python",
        "problemId": "T1-1",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is False
    assert data["exitCode"] == 1
    assert any("ReDoS" in log for log in data["logs"])


def test_public_audit_endpoint(client):
    res = client.post("/api/audit", json={
        "code": "for order in db.query(Order).all():\n    c = db.query(Customer).first()",
        "problemId": "T1-2",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["verdict"] == "REJECT"
    assert len(data["detectedFlaws"]) > 0
    assert len(data["gates"]) == 8


def test_public_heal_endpoint(client):
    res = client.post("/api/heal", json={
        "code": "vulnerable snippet",
        "problemId": "T1-2",
    })
    assert res.status_code == 200
    data = res.json()
    assert "nvidia/nemotron" in data["model"]
    assert "joinedload" in data["patchedCode"]
    assert data["gatePreview"] == "ACCEPT"


def test_public_ledger_verify_endpoint(client):
    # Seed a real project -> task -> run -> ledger entry so the endpoint
    # verifies an actual chain instead of an empty database.
    import uuid as _uuid
    from backend.database import SessionLocal
    from backend import models
    from backend.ledger_service import LedgerService

    db = SessionLocal()
    try:
        project = models.Project(id=str(_uuid.uuid4()), name="ledger-verify-proj", repository_path="/tmp/repo")
        db.add(project)
        task = models.Task(
            id=str(_uuid.uuid4()),
            project_id=project.id,
            name="ledger-verify-task",
            target_file="app.py",
            target_symbol="main",
            baseline_commit="0" * 40,
            benchmark_command=["pytest"],
            test_command=["pytest"],
            protected_paths=[],
            workload_seed=1,
        )
        db.add(task)
        run = models.Run(id=str(_uuid.uuid4()), task_id=task.id, requested_baseline="0" * 40)
        db.add(run)
        db.commit()
        LedgerService(db).append(run_id=run.id, event_type="RUN_CREATED", payload={"note": "seed for verify endpoint test"})
        db.commit()
    finally:
        db.close()

    res = client.get("/api/ledger/verify")
    assert res.status_code == 200
    data = res.json()
    assert data["verified"] is True
    assert data["status"] == "VALID"
    assert data["hashAlgorithm"] == "SHA-256"


def test_public_dast_scans_endpoint(client):
    res = client.post("/api/dast/scans", json={
        "targetUrl": "https://staging.perfproof.internal",
        "ownershipToken": "proofstack-verify-token-8f4b238e",
        "scanProfile": "OWASP Top-10 Quick",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["ownershipStatus"] == "VERIFIED"
    assert data["checksExecuted"] == 12
    assert len(data["findings"]) >= 2


def test_public_dast_targets_endpoint(client):
    res = client.post("/api/dast/targets", json={
        "targetUrl": "https://my-app.perfproof.internal",
        "repoPath": "./web",
        "scanProfile": "OWASP Top-10 Quick",
    })
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    assert "proofstack-verify" in data["target"]["verificationToken"]
