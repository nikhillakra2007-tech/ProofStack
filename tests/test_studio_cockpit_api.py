"""Integration tests for Studio, Cockpit, and DAST interactive endpoints."""
import pytest
from fastapi.testclient import TestClient
from backend.server import app


@pytest.fixture
def client():
    return TestClient(app)


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
