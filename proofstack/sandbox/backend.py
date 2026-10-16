"""Sandbox backend contract. Every experiment, probe and benchmark runs through this interface only."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol

BASE_ENV = {"PATH": "/usr/local/bin:/usr/bin:/bin", "LANG": "C.UTF-8", "PYTHONHASHSEED": "0",
            "PYTHONDONTWRITEBYTECODE": "1", "PROOFSTACK_SANDBOX": "1"}


class SandboxError(RuntimeError):
    """Operation FAILED / CANCELLED, or an unexpected API response."""


class SubmissionUncertain(SandboxError):
    """A POST failed in transit: the operation may exist. Inspect before any resubmission (never auto-retry)."""


@dataclass(frozen=True)
class ExecResult:
    backend: str
    operation_id: str
    image_id: str
    result_image: str | None
    exit_code: int | None
    signal: int | None
    timed_out: bool
    stdout: str
    stderr: str
    truncated: bool
    wall_s: float | None
    max_rss_kb: int | None
    cpu_user_s: float | None
    cpu_sys_s: float | None

    @property
    def ok(self) -> bool:
        return self.exit_code == 0 and not self.timed_out and self.signal in (None, -1) and not self.truncated


class SandboxBackend(Protocol):
    name: str

    def run(self, image: str, argv: list[str] | None = None, *, shell: str | None = None, timeout_s: int = 60,
            network: bool = False, env: dict | None = None, files: dict | None = None, retain: bool = False,
            cwd: str | None = None, truncate_at: int = 1_048_576) -> ExecResult: ...


def to_record(res: ExecResult, session_id: str, command: list, network: bool, limits: dict, started_at: str,
              finished_at: str, stdout_path: str, stderr_path: str, artifacts=()) -> dict:
    """ExecResult -> SandboxExecutionResult (schemas/sandbox-execution-result.v1.json)."""
    import hashlib
    ms = lambda s: None if s is None else int(round(s * 1000))
    return {"session_id": session_id, "operation_id": res.operation_id, "backend": res.backend, "image_id": res.image_id,
            "result_image": res.result_image, "command": command, "network_enabled": network, "exit_code": res.exit_code,
            "signal": res.signal, "timed_out": res.timed_out, "wall_clock_ms": ms(res.wall_s), "max_rss_kb": res.max_rss_kb,
            "cpu_user_ms": ms(res.cpu_user_s), "cpu_sys_ms": ms(res.cpu_sys_s), "truncated": res.truncated,
            "stdout_path": stdout_path, "stderr_path": stderr_path,
            "stdout_sha256": hashlib.sha256(res.stdout.encode()).hexdigest(),
            "stderr_sha256": hashlib.sha256(res.stderr.encode()).hexdigest(),
            "limits_applied": limits, "artifacts": list(artifacts), "started_at": started_at, "finished_at": finished_at}
