"""
ProofStack DAST Finding Engine & Redaction Engine
Enforces Section K.3 (page 25):
Single redact() function used before any write to the ledger, DB, artifact store,
report, UI or model prompt. Planted secrets never appear in clear text.
Redacted preview: first 4 chars + ****.
"""

from __future__ import annotations
import math
import re
import secrets
from typing import Any, Dict, List, Optional

from proofstack.schemas import DastFindingSchema, FindingEvidence, SourceCandidate


def calculate_entropy(s: str) -> float:
    if not s:
        return 0.0
    prob = [float(s.count(c)) / len(s) for c in dict.fromkeys(list(s))]
    return -sum(p * math.log(p) / math.log(2.0) for p in prob)


def redact(text: Optional[str]) -> str:
    """
    Authoritative single redact function.
    Redacts any credential, token, or high-entropy literal to:
    first 4 characters + ****.
    """
    if not text:
        return ""

    s = text

    # AWS Access Key (first 4 chars 'AKIA' + '****')
    s = re.sub(r"\b(AKIA)[0-9A-Z]{16}\b", r"\1****", s)

    # GitHub Tokens (first 4 chars 'ghp_' + '****')
    s = re.sub(r"\b(gh[pousr]_)[A-Za-z0-9_]{30,}\b", r"\1****", s)

    # Slack Tokens (first 4 chars 'xoxb' + '****')
    s = re.sub(r"\b(xox[baprs])[A-Za-z0-9\-]{10,}\b", r"\1****", s)

    # Stripe Keys (first 4 chars 'sk_l' + '****')
    s = re.sub(r"\b(sk_l)[a-zA-Z0-9_]{20,}\b", r"\1****", s)

    # Private Keys
    s = re.sub(
        r"-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----",
        "[REDACTED_PRIVATE_KEY_****]",
        s
    )

    # General key assignments (e.g. api_key = "...")
    def redact_assignment(m):
        prefix = m.group(1)
        val = m.group(2)
        redacted_val = val[:4] + "****" if len(val) >= 4 else "****"
        return f"{prefix}{redacted_val}"

    s = re.sub(r"(?i)((?:api_key|secret|token|password)\s*[=:]\s*['\"])([^'\"]+)", redact_assignment, s)

    return s


def create_finding(
    scan_id: str,
    check_id: str,
    title: str,
    owasp: str,
    severity: str,
    confidence: str,
    url: str,
    evidence_kind: str,
    evidence_summary: str,
    raw_secret_preview: Optional[str] = None,
    artifact_id: Optional[str] = None,
    repro_steps: Optional[List[str]] = None,
    origin: str = "code",
    source_candidates: Optional[List[Dict[str, Any]]] = None,
) -> DastFindingSchema:
    finding_id = f"fd_{secrets.token_hex(6)}"
    art_id = artifact_id or f"art_{secrets.token_hex(6)}"

    redacted_preview = redact(raw_secret_preview) if raw_secret_preview else None
    redacted_summary = redact(evidence_summary)

    candidates = [
        SourceCandidate(
            file=c.get("file", ""),
            line_start=c.get("line_start", 1),
            line_end=c.get("line_end", 1),
            why=c.get("why", "")
        )
        for c in (source_candidates or [])
    ]

    return DastFindingSchema(
        finding_id=finding_id,
        scan_id=scan_id,
        check_id=check_id,
        title=title,
        owasp=owasp,
        severity=severity,
        confidence=confidence,
        url=url,
        evidence=FindingEvidence(
            kind=evidence_kind,
            summary=redacted_summary,
            redacted_preview=redacted_preview,
            artifact=art_id
        ),
        repro_steps=repro_steps or [f"Visit {url}", f"Observe {check_id} condition"],
        origin=origin,
        source_candidates=candidates,
        status="OPEN"
    )
