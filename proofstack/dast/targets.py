"""
ProofStack DAST Target Management
Handles target registration, URL normalization, and status tracking.
"""

from __future__ import annotations
import secrets
from typing import Dict, Optional
from urllib.parse import urlparse
from uuid import UUID

from proofstack.schemas import DastTargetSchema, DastProof, DastRepo


def normalize_target_url(url: str) -> str:
    parsed = urlparse(url)
    if not parsed.scheme or parsed.scheme not in ("http", "https"):
        raise ValueError(f"Invalid URL scheme in '{url}'. Must be http or https.")
    netloc = parsed.netloc.lower()
    return f"{parsed.scheme}://{netloc}"


class TargetRegistry:
    def __init__(self):
        self._targets: Dict[str, DastTargetSchema] = {}

    def register_target(
        self,
        tenant_id: UUID,
        url: str,
        repo_source: str = "local",
        repo_commit: str = "0" * 40,
        framework_hint: str = "unknown"
    ) -> tuple[DastTargetSchema, str]:
        norm_url = normalize_target_url(url)
        target_id = f"tg_{secrets.token_hex(6)}"
        verification_token = secrets.token_urlsafe(32)

        target = DastTargetSchema(
            target_id=target_id,
            tenant_id=tenant_id,
            url=norm_url,
            status="PENDING",
            proof=DastProof(method="dns_txt", verified_at=None),
            repo=DastRepo(source=repo_source, commit=repo_commit, framework_hint=framework_hint)
        )
        self._targets[target_id] = target
        return target, verification_token

    def get_target(self, target_id: str) -> Optional[DastTargetSchema]:
        return self._targets.get(target_id)
