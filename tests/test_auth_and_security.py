"""Comprehensive security, authentication, tenant isolation, and SSRF negative tests."""
import uuid
from datetime import datetime, timedelta, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import jwt
from backend.config import Settings
from backend.database import Base, get_db
from backend.server import app
from backend import models
from backend.auth_service import (
    hash_password, verify_password, create_access_token, decode_access_token,
    ensure_default_users, TOKEN_ISSUER
)


@pytest.fixture
def sec_db():
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool)
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    db = TestingSessionLocal()
    ensure_default_users(db)
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def sec_client(sec_db):
    def override_get_db():
        try:
            yield sec_db
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()


# ---- 1. Authentication Tests ----

def test_login_success(sec_client):
    res = sec_client.post("/api/auth/login", json={
        "email": "developer@sentinel.internal",
        "password": "P@ssw0rd2026!Secure",
    })
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["role"] == "developer"
    assert data["user"]["email"] == "developer@sentinel.internal"
    # Verify HttpOnly cookie was set
    assert "sentinel_token" in res.cookies


def test_login_invalid_password_rejected(sec_client):
    res = sec_client.post("/api/auth/login", json={
        "email": "developer@sentinel.internal",
        "password": "WrongPassword123!",
    })
    assert res.status_code == 401
    assert "Invalid email or password" in res.json()["detail"]


def test_login_nonexistent_user_rejected(sec_client):
    res = sec_client.post("/api/auth/login", json={
        "email": "hacker@evil.com",
        "password": "P@ssw0rd2026!Secure",
    })
    assert res.status_code == 401


def test_get_current_profile_authenticated(sec_client):
    # First sign in to obtain token
    res_login = sec_client.post("/api/auth/login", json={
        "email": "auditor@sentinel.internal",
        "password": "P@ssw0rd2026!Secure",
    })
    token = res_login.json()["access_token"]

    # Call /api/auth/me with Bearer token
    res_me = sec_client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res_me.status_code == 200
    assert res_me.json()["email"] == "auditor@sentinel.internal"
    assert res_me.json()["role"] == "auditor"


def test_request_without_credentials_rejected(sec_client):
    # Unauthenticated call to protected endpoint must return 401
    res = sec_client.get("/api/auth/me")
    assert res.status_code == 401
    assert "Authentication required" in res.json()["detail"]


def test_expired_token_rejected(sec_db, sec_client):
    user = sec_db.query(models.User).filter(models.User.email == "developer@sentinel.internal").first()
    # Generate token already expired 1 hour ago
    expired_token = create_access_token(user, expires_delta=timedelta(hours=-1))

    res = sec_client.get("/api/projects", headers={"Authorization": f"Bearer {expired_token}"})
    assert res.status_code == 401
    assert "expired" in res.json()["detail"].lower()


def test_algorithm_none_rejected(sec_db, sec_client):
    user = sec_db.query(models.User).filter(models.User.email == "developer@sentinel.internal").first()
    # Construct an unverified token with alg: none
    fake_payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": "super_admin",
        "tenant_id": user.tenant_id,
        "iss": TOKEN_ISSUER,
        "exp": int((datetime.now(timezone.utc) + timedelta(hours=1)).timestamp()),
    }
    forged_token = jwt.encode(fake_payload, key="", algorithm="none")

    res = sec_client.get("/api/projects", headers={"Authorization": f"Bearer {forged_token}"})
    assert res.status_code == 401


# ---- 2. Tenant Isolation & Authorization Tests ----

def test_tenant_isolation_projects(sec_db, sec_client):
    # Create user in Tenant A
    user_a = models.User(
        id=str(uuid.uuid4()),
        email="operator_a@tenant-a.com",
        hashed_password=hash_password("Password123!"),
        role=models.UserRole.DEVELOPER,
        tenant_id="tenant-alpha-001",
        is_active=True,
    )
    # Create user in Tenant B
    user_b = models.User(
        id=str(uuid.uuid4()),
        email="operator_b@tenant-b.com",
        hashed_password=hash_password("Password123!"),
        role=models.UserRole.DEVELOPER,
        tenant_id="tenant-beta-002",
        is_active=True,
    )
    sec_db.add(user_a)
    sec_db.add(user_b)

    # Project belonging to Tenant A
    proj_a = models.Project(
        id=str(uuid.uuid4()),
        name="Tenant A Secret Project",
        repository_path="./repo-a",
        tenant_id="tenant-alpha-001",
        owner_user_id=user_a.id,
    )
    sec_db.add(proj_a)
    sec_db.commit()

    token_b = create_access_token(user_b)

    # Tenant B tries to view Tenant A's project -> Must be 403 Forbidden
    res = sec_client.get(f"/api/projects/{proj_a.id}", headers={"Authorization": f"Bearer {token_b}"})
    assert res.status_code == 403
    assert "Cross-tenant" in res.json()["detail"]

    # Tenant A views own project -> 200 OK
    token_a = create_access_token(user_a)
    res_a = sec_client.get(f"/api/projects/{proj_a.id}", headers={"Authorization": f"Bearer {token_a}"})
    assert res_a.status_code == 200
    assert res_a.json()["name"] == "Tenant A Secret Project"


# ---- 3. SSRF Protection on DAST Targets & Scans ----

def test_ssrf_protection_blocks_loopback(sec_client):
    res_login = sec_client.post("/api/auth/login", json={
        "email": "ciso@sentinel.internal",
        "password": "P@ssw0rd2026!Secure",
    })
    token = res_login.json()["access_token"]

    # Target targeting 127.0.0.1 loopback
    res = sec_client.post(
        "/api/dast/targets",
        headers={"Authorization": f"Bearer {token}"},
        json={"targetUrl": "http://127.0.0.1:8080/admin"},
    )
    assert res.status_code == 400
    assert "Loopback" in res.json()["detail"] or "SSRF" in res.json()["detail"]


def test_ssrf_protection_blocks_cloud_metadata(sec_client):
    res_login = sec_client.post("/api/auth/login", json={
        "email": "ciso@sentinel.internal",
        "password": "P@ssw0rd2026!Secure",
    })
    token = res_login.json()["access_token"]

    # Target targeting AWS/GCP/Azure link-local metadata 169.254.169.254
    res = sec_client.post(
        "/api/dast/targets",
        headers={"Authorization": f"Bearer {token}"},
        json={"targetUrl": "http://169.254.169.254/latest/meta-data/"},
    )
    assert res.status_code == 400
    assert "Link-local" in res.json()["detail"] or "cloud-metadata" in res.json()["detail"]


def test_ssrf_protection_blocks_private_subnet(sec_client):
    res_login = sec_client.post("/api/auth/login", json={
        "email": "ciso@sentinel.internal",
        "password": "P@ssw0rd2026!Secure",
    })
    token = res_login.json()["access_token"]

    # Target targeting 10.0.0.5 private network IP
    res = sec_client.post(
        "/api/dast/targets",
        headers={"Authorization": f"Bearer {token}"},
        json={"targetUrl": "http://10.0.0.5/internal-api"},
    )
    assert res.status_code == 400
    assert "Private subnet" in res.json()["detail"] or "SSRF" in res.json()["detail"]


# ---- 4. Production Configuration Validation ----

def test_production_mode_rejects_sqlite():
    prod_settings = Settings(
        proofstack_env="production",
        database_url="sqlite:///./prod.db",
        secret_key="a-sufficiently-long-secret-key-of-32-chars-ok",
    )
    errors = prod_settings.validate_for_production()
    assert any("SQLite is prohibited in production" in e for e in errors)


def test_production_mode_rejects_weak_secret():
    prod_settings = Settings(
        proofstack_env="production",
        database_url="postgresql://postgres:secret@localhost:5432/proofstack",
        secret_key="change-me-in-production",
    )
    errors = prod_settings.validate_for_production()
    assert any("Insecure or short secret_key" in e for e in errors)


def test_production_mode_rejects_wildcard_cors():
    prod_settings = Settings(
        proofstack_env="production",
        database_url="postgresql://postgres:secret@localhost:5432/proofstack",
        secret_key="a-very-secure-random-secret-key-that-is-at-least-32-chars-long",
        cors_origins="http://localhost:3000,*",
    )
    errors = prod_settings.validate_for_production()
    assert any("CORS origins cannot contain wildcard '*'" in e for e in errors)
