"""API tests: endpoints, validation, status codes."""
import uuid
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base, get_db
from backend.server import app

TEST_API_KEY = "test-secret-key-12345"


@pytest.fixture
def client():
    from sqlalchemy.pool import StaticPool
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    from backend.server import verify_api_key
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[verify_api_key] = lambda: TEST_API_KEY
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def auth_headers():
    return {"X-API-Key": TEST_API_KEY}


def test_health(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


def test_create_project(client):
    resp = client.post("/api/projects", json={
        "name": "Test Project",
        "repository_path": "/tmp/repo",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Test Project"
    assert "id" in data


def test_list_projects(client):
    client.post("/api/projects", json={"name": "P1", "repository_path": "/tmp/r1"})
    client.post("/api/projects", json={"name": "P2", "repository_path": "/tmp/r2"})
    resp = client.get("/api/projects")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_get_project_not_found(client):
    resp = client.get("/api/projects/nonexistent")
    assert resp.status_code == 404


def test_create_task(client):
    proj = client.post("/api/projects", json={"name": "P1", "repository_path": "/tmp/r1"}).json()
    resp = client.post("/api/tasks", json={
        "project_id": proj["id"],
        "name": "Test Task",
        "target_file": "app.py",
        "target_symbol": "process",
        "baseline_commit": "abc1234",
        "benchmark_command": ["python", "-m", "pyperf"],
        "workload_seed": 42,
        "test_command": ["pytest"],
        "protected_paths": ["tests/"],
        "mode": "optimize",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Test Task"


def test_create_task_invalid(client):
    proj = client.post("/api/projects", json={"name": "P1", "repository_path": "/tmp/r1"}).json()
    resp = client.post("/api/tasks", json={
        "project_id": proj["id"],
        "name": "Bad Task",
        "target_file": "app.py",
        "target_symbol": "process",
        "baseline_commit": "not-a-commit",
        "benchmark_command": ["python"],
        "workload_seed": 42,
        "test_command": ["pytest"],
        "protected_paths": ["tests/"],
    })
    assert resp.status_code == 422


def test_create_run(client):
    proj = client.post("/api/projects", json={"name": "P1", "repository_path": "/tmp/r1"}).json()
    task = client.post("/api/tasks", json={
        "project_id": proj["id"], "name": "T1",
        "target_file": "app.py", "target_symbol": "process",
        "baseline_commit": "abc1234",
        "benchmark_command": ["python"], "workload_seed": 42,
        "test_command": ["pytest"], "protected_paths": ["tests/"],
    }).json()
    resp = client.post("/api/runs", json={
        "task_id": task["id"],
        "requested_baseline": "abc1234",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["status"] == "CREATED"


def test_get_run_not_found(client):
    resp = client.get("/api/runs/nonexistent")
    assert resp.status_code == 404


def test_list_runs(client):
    proj = client.post("/api/projects", json={"name": "P1", "repository_path": "/tmp/r1"}).json()
    task = client.post("/api/tasks", json={
        "project_id": proj["id"], "name": "T1",
        "target_file": "app.py", "target_symbol": "process",
        "baseline_commit": "abc1234",
        "benchmark_command": ["python"], "workload_seed": 42,
        "test_command": ["pytest"], "protected_paths": ["tests/"],
    }).json()
    client.post("/api/runs", json={"task_id": task["id"], "requested_baseline": "abc1234"})
    resp = client.get("/api/runs")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_cancel_run(client):
    proj = client.post("/api/projects", json={"name": "P1", "repository_path": "/tmp/r1"}).json()
    task = client.post("/api/tasks", json={
        "project_id": proj["id"], "name": "T1",
        "target_file": "app.py", "target_symbol": "process",
        "baseline_commit": "abc1234",
        "benchmark_command": ["python"], "workload_seed": 42,
        "test_command": ["pytest"], "protected_paths": ["tests/"],
    }).json()
    run = client.post("/api/runs", json={"task_id": task["id"], "requested_baseline": "abc1234"}).json()
    resp = client.post(f"/api/runs/{run['id']}/cancel")
    assert resp.status_code == 200
    assert resp.json()["status"] == "CANCELLED"


def test_ledger_verify_empty(client):
    resp = client.post("/api/runs/nonexistent/ledger/verify")
    assert resp.status_code == 404


def test_decision_endpoint_not_found(client):
    resp = client.get("/api/runs/nonexistent/decision")
    assert resp.status_code == 404


def test_demo_seed_and_lifecycle(client):
    # 1. Check status before seed
    status_resp = client.get("/api/demo/status")
    assert status_resp.status_code == 200
    
    # 2. Seed fixture
    seed_resp = client.post("/api/demo/seed?force=true")
    assert seed_resp.status_code == 200
    seed_data = seed_resp.json()
    assert seed_data["status"] == "seeded"
    assert seed_data["provenance"] == "DEMO_FIXTURE"
    assert seed_data["verdict"] == "REJECTED"
    demo_run_id = seed_data["run_id"]

    # 3. Verify status after seed
    status_after = client.get("/api/demo/status").json()
    assert status_after["seeded"] is True
    assert status_after["demo_run_id"] == demo_run_id

    # 4. Verify decision endpoint
    dec_resp = client.get(f"/api/runs/{demo_run_id}/decision")
    assert dec_resp.status_code == 200
    dec_data = dec_resp.json()
    assert dec_data["verdict"] == "REJECTED"
    assert "reasons" in dec_data
    assert any("P03" in r for r in dec_data["reasons"])

    # 5. Verify ledger integrity
    verify_resp = client.post(f"/api/runs/{demo_run_id}/ledger/verify")
    assert verify_resp.status_code == 200
    assert verify_resp.json()["valid"] is True
    assert verify_resp.json()["head_hash"] == "319915dbf8ea2782e8994091c8a9f4662ded5f373ca7610856bd87dbe6893d22"

    # 6. Reset fixture
    reset_resp = client.post("/api/demo/reset")
    assert reset_resp.status_code == 200
    assert reset_resp.json()["status"] == "reset"

    # 7. Confirm reset
    status_final = client.get("/api/demo/status").json()
    assert status_final["seeded"] is False

