"""
ProofStack DAST Scan Capture Telemetry
Data structure representing headless DevTools capture: DOM, headers, cookies,
network logs, storage, forms, and console errors.
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ScanCookie:
    name: str
    value: str
    secure: bool = False
    http_only: bool = False
    same_site: Optional[str] = None  # "Strict" | "Lax" | "None" | None


@dataclass
class NetworkEntry:
    url: str
    method: str
    status: int
    headers: Dict[str, str]
    body: str = ""


@dataclass
class FormInfo:
    action: str
    method: str
    has_csrf_token: bool
    inputs: List[Dict[str, str]] = field(default_factory=list)


@dataclass
class ScanCapture:
    target_url: str
    final_url: str
    status_code: int
    dom_html: str
    response_headers: Dict[str, str] = field(default_factory=dict)
    cookies: List[ScanCookie] = field(default_factory=list)
    network_requests: List[NetworkEntry] = field(default_factory=list)
    local_storage: Dict[str, str] = field(default_factory=dict)
    session_storage: Dict[str, str] = field(default_factory=dict)
    console_logs: List[Dict[str, str]] = field(default_factory=list)
    loaded_scripts: List[Dict[str, str]] = field(default_factory=list)
    forms: List[FormInfo] = field(default_factory=list)
    canary_hits: List[str] = field(default_factory=list)

    def get_header(self, name: str) -> Optional[str]:
        target_lower = name.lower()
        for k, v in self.response_headers.items():
            if k.lower() == target_lower:
                return v
        return None
