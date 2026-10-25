"""
ProofStack Target Ownership Verifier
Enforces Section K.3 (page 25) and Locked Decision D16:
No scan without an authorized target that passed ownership proof.
Loopback addresses and test fixtures (vuln_web, clean_web) are pre-authorised.
Unverified external targets are strictly REFUSED with zero outbound scanner traffic.
"""

from __future__ import annotations
import socket
from datetime import datetime, timezone
from typing import Optional, Tuple
from urllib.parse import urlparse

import httpx

from proofstack.schemas import DastTargetSchema


class TargetNotAuthorisedError(Exception):
    def __init__(self, message: str = "Target not authorised. Ownership verification required."):
        super().__init__(message)
        self.exit_code = 12


class OwnershipVerifier:
    PREAUTHORISED_HOSTS = {"127.0.0.1", "localhost", "0.0.0.0", "vuln_web", "clean_web"}

    @classmethod
    def is_preauthorised(cls, url: str) -> bool:
        hostname = (urlparse(url).hostname or "").lower()
        if hostname in cls.PREAUTHORISED_HOSTS:
            return True
        # Check IPv4 loopback
        try:
            ip = socket.gethostbyname(hostname)
            if ip.startswith("127."):
                return True
        except Exception:
            pass
        return False

    @classmethod
    def verify_target(
        cls,
        target: DastTargetSchema,
        expected_token: str,
        method: str = "well_known"
    ) -> Tuple[bool, Optional[str]]:
        """
        Validates target ownership.
        Returns: (is_verified, reason_or_error)
        """
        if cls.is_preauthorised(target.url):
            target.status = "VERIFIED"
            target.proof.method = "loopback_fixture"
            target.proof.verified_at = datetime.now(timezone.utc)
            return True, None

        hostname = urlparse(target.url).hostname or ""
        if method == "well_known":
            well_known_url = f"{target.url.rstrip('/')}/.well-known/proofstack.txt"
            try:
                with httpx.Client(timeout=10.0, follow_redirects=False) as client:
                    resp = client.get(well_known_url)
                    if resp.status_code == 200 and expected_token.strip() in resp.text:
                        target.status = "VERIFIED"
                        target.proof.method = "well_known"
                        target.proof.verified_at = datetime.now(timezone.utc)
                        return True, None
                    return False, f"Token mismatch or HTTP {resp.status_code} at {well_known_url}"
            except Exception as e:
                return False, f"Failed to contact {well_known_url}: {str(e)}"

        elif method == "dns_txt":
            # DNS TXT verification check
            return False, "DNS TXT lookup requires live DNS resolver"

        target.status = "REFUSED"
        return False, "Ownership verification refused"

    @classmethod
    def ensure_authorised_for_scan(cls, target: DastTargetSchema) -> None:
        """
        Enforced in code, not in prompts (Locked Decision D16).
        Raises TargetNotAuthorisedError (exit code 12) if unverified.
        """
        if cls.is_preauthorised(target.url):
            return
        if target.status != "VERIFIED":
            raise TargetNotAuthorisedError(
                f"Target {target.url} has status '{target.status}'. External targets require verified ownership before scanning."
            )
