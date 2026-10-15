"""
ProofStack Sandbox Protocol
Defines the SandboxBackend interface per AI Agents Brief Section E (page 9).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Literal, Optional, Protocol, runtime_checkable


@dataclass
class SandboxSpec:
    image: str = "proofstack/sandbox:v1"
    env: Dict[str, str] = field(default_factory=dict)
    mount_worktree: Optional[str] = None
    network: Literal["none", "loopback"] = "none"


@dataclass
class SandboxHandle:
    handle_id: str
    backend_name: str
    isolation_level: Literal["platform", "container"]
    workdir: str


@dataclass
class ExecResult:
    exit_code: int
    stdout: str
    stderr: str
    timed_out: bool = False
    oom_killed: bool = False
    policy_violation: Optional[str] = None


@runtime_checkable
class SandboxBackend(Protocol):
    name: str  # "token_factory" | "local_container"

    def provision(self, spec: SandboxSpec) -> SandboxHandle:
        ...

    def exec(
        self,
        h: SandboxHandle,
        cmd: List[str],
        *,
        timeout_s: int = 60,
        mem_mb: int = 1024,
        net: Literal["none", "loopback"] = "none"
    ) -> ExecResult:
        ...

    def put(self, h: SandboxHandle, path: str, data: bytes) -> None:
        ...

    def get(self, h: SandboxHandle, path: str) -> bytes:
        ...

    def destroy(self, h: SandboxHandle) -> None:
        ...
