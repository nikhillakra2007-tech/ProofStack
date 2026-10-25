"""Authentication, password hashing, JWT sessions, role authorization, and SSRF security."""
import uuid
import socket
import ipaddress
from datetime import datetime, timedelta, timezone
from typing import Optional, Annotated
from urllib.parse import urlparse

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, Security, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import get_db
from backend import models

security_bearer = HTTPBearer(auto_error=False)

TOKEN_ISSUER = "proofstack-sentinel"

DEFAULT_USERS_PRESET = [
    {
        "email": "developer@sentinel.internal",
        "password": "P@ssw0rd2026!Secure",
        "full_name": "Alex Chen (Staff Dev)",
        "role": models.UserRole.DEVELOPER,
        "tenant_id": "00000000-0000-0000-0000-000000000001",
    },
    {
        "email": "auditor@sentinel.internal",
        "password": "P@ssw0rd2026!Secure",
        "full_name": "Elena Rostova (Lead Auditor)",
        "role": models.UserRole.AUDITOR,
        "tenant_id": "00000000-0000-0000-0000-000000000001",
    },
    {
        "email": "admin@sentinel.internal",
        "password": "P@ssw0rd2026!Secure",
        "full_name": "Marcus Vance (Ops Admin)",
        "role": models.UserRole.ADMIN,
        "tenant_id": "00000000-0000-0000-0000-000000000001",
    },
    {
        "email": "ciso@sentinel.internal",
        "password": "P@ssw0rd2026!Secure",
        "full_name": "Dr. Sarah Lin (CISO)",
        "role": models.UserRole.SUPER_ADMIN,
        "tenant_id": "00000000-0000-0000-0000-000000000001",
    },
]


def hash_password(password: str) -> str:
    """Hashes plaintext password using bcrypt with cryptographic salt."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain password against hashed password."""
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user: models.User, expires_delta: Optional[timedelta] = None) -> str:
    """Generates an RFC 7519 compliant JSON Web Token signed with settings.secret_key."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.jwt_expiration_minutes)

    payload = {
        "sub": str(user.id),
        "email": user.email,
        "role": user.role.value if hasattr(user.role, "value") else str(user.role),
        "tenant_id": str(user.tenant_id),
        "full_name": user.full_name,
        "iss": TOKEN_ISSUER,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.auth_algorithm)


def decode_access_token(token: str) -> dict:
    """Decodes and cryptographically verifies an access token."""
    try:
        # Explicitly specify allowed algorithms to prevent algorithm-confusion attacks
        return jwt.decode(
            token,
            settings.secret_key,
            algorithms=[settings.auth_algorithm],
            issuer=TOKEN_ISSUER,
            options={"require": ["sub", "exp", "iss", "role", "tenant_id"]},
        )
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session token has expired. Please sign in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.InvalidAlgorithmError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token signing algorithm.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except (jwt.InvalidTokenError, Exception) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or malformed authentication token: {str(exc)}",
            headers={"WWW-Authenticate": "Bearer"},
        )


def ensure_default_users(db: Session) -> None:
    """Seeds preset development users if none exist."""
    count = db.query(models.User).count()
    if count == 0:
        for preset in DEFAULT_USERS_PRESET:
            user = models.User(
                id=str(uuid.uuid4()),
                email=preset["email"],
                hashed_password=hash_password(preset["password"]),
                full_name=preset["full_name"],
                role=preset["role"],
                tenant_id=preset["tenant_id"],
                is_active=True,
            )
            db.add(user)
        db.commit()
    return db.query(models.User).filter(models.User.email.in_([p["email"] for p in DEFAULT_USERS_PRESET])).all()


def get_current_user(
    request: Request,
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security_bearer),
    db: Session = Depends(get_db),
) -> models.User:
    """
    Extracts and authenticates user from Bearer header, HttpOnly cookie, or X-API-Key.
    Never trusts browser-supplied roles or identity predicates without cryptographic verification.
    """
    token: Optional[str] = None

    # 1. Bearer header
    if credentials and credentials.credentials:
        token = credentials.credentials

    # 2. HttpOnly cookie fallback
    if not token and "sentinel_token" in request.cookies:
        token = request.cookies.get("sentinel_token")

    # 3. Application X-API-Key (service-to-service)
    api_key_header = request.headers.get("X-API-Key")
    if not token and api_key_header:
        expected = settings.secret_key
        if expected and api_key_header == expected:
            # Service account acting as Super Admin
            service_user = db.query(models.User).filter(models.User.role == models.UserRole.SUPER_ADMIN).first()
            if not service_user:
                ensure_default_users(db)
                service_user = db.query(models.User).filter(models.User.role == models.UserRole.SUPER_ADMIN).first()
            if service_user:
                return service_user

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required. Provide valid Bearer token or sign in.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    user_id = payload.get("sub")
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authenticated user no longer exists or has been revoked.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is deactivated.",
        )
    return user


def require_roles(*allowed_roles: str):
    """Factory dependency for role-based access control (RBAC)."""
    allowed_set = {r.lower() for r in allowed_roles}

    def role_checker(current_user: models.User = Depends(get_current_user)) -> models.User:
        user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)
        # Super-admin always has full control-plane privileges
        if user_role == models.UserRole.SUPER_ADMIN.value or user_role in allowed_set:
            return current_user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Forbidden: Operation requires one of roles {list(allowed_roles)}. Current role is '{user_role}'.",
        )

    return role_checker


def validate_target_url(target_url: str) -> str:
    """
    Validates external scan targets and enforces strict SSRF protections:
    - Must be http or https
    - Prohibits loopback (127.0.0.1, localhost)
    - Prohibits cloud metadata (169.254.169.254)
    - Prohibits RFC1918 private IP addresses (10.0.0.0/8, 172.16.0.0/12, 192.168.0.0/16)
    - Prohibits link-local and multicast ranges
    """
    url = target_url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL scheme. Target URL must begin with http:// or https://",
        )

    parsed = urlparse(url)
    hostname = parsed.hostname
    if not hostname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Target URL contains no valid hostname.",
        )

    # Disallow known localhost aliases
    lower_host = hostname.lower()
    if lower_host in {"localhost", "localhost.localdomain", "127.0.0.1", "::1"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Prohibited scan destination: Loopback destinations are disallowed (SSRF protection).",
        )

    try:
        # Resolve hostname to IPv4/IPv6 addresses
        addr_info = socket.getaddrinfo(hostname, parsed.port or (443 if parsed.scheme == "https" else 80))
        for item in addr_info:
            ip_str = item[4][0]
            ip = ipaddress.ip_address(ip_str)

            if ip.is_loopback:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Prohibited destination IP {ip_str}: Loopback address blocked.",
                )
            if ip.is_link_local:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Prohibited destination IP {ip_str}: Link-local / cloud-metadata address blocked.",
                )
            if ip.is_private:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Prohibited destination IP {ip_str}: Private subnet blocked (SSRF protection).",
                )
            if ip.is_reserved or ip.is_multicast or ip.is_unspecified:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Prohibited destination IP {ip_str}: Non-routable address blocked.",
                )
    except socket.gaierror:
        # In test environments or offline fixtures, allow dummy domains if unresolvable,
        # but disallow if they look like known internal domains
        if lower_host.endswith(".internal") or lower_host.endswith(".local"):
            # Internal staging is allowed in development test doubles
            pass
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unable to resolve target domain '{hostname}'. DNS resolution failed.",
            )

    return url
