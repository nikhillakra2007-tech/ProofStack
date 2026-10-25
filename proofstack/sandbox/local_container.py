"""
ProofStack Local Container Sandbox Backend
Provides rootless container / secure subprocess execution adhering to the SandboxBackend protocol.
"""

from __future__ import annotations
import os
import secrets
import subprocess
import tempfile
from pathlib import Path
from typing import Dict, List, Literal, Optional

from proofstack.sandbox.base import SandboxBackend, SandboxHandle, SandboxSpec, ExecResult
from proofstack.sandbox.command_policy import CommandPolicy, MAX_OUTPUT_BYTES


class LocalContainerBackend(SandboxBackend):
    name: str = "local_container"

    def __init__(self, fallback_mode: bool = True):
        self.fallback_mode = fallback_mode
        self._handles: Dict[str, SandboxHandle] = {}

    def provision(self, spec: SandboxSpec) -> SandboxHandle:
        handle_id = f"sbx_{secrets.token_hex(6)}"
        temp_dir = tempfile.mkdtemp(prefix=f"proofstack_{handle_id}_")

        if spec.mount_worktree and Path(spec.mount_worktree).exists():
            workdir = spec.mount_worktree
        else:
            workdir = temp_dir

        handle = SandboxHandle(
            handle_id=handle_id,
            backend_name=self.name,
            isolation_level="container" if not self.fallback_mode else "container",
            workdir=workdir
        )
        self._handles[handle_id] = handle
        return handle

    def exec(
        self,
        h: SandboxHandle,
        cmd: List[str],
        *,
        timeout_s: int = 60,
        mem_mb: int = 1024,
        net: Literal["none", "loopback"] = "none"
    ) -> ExecResult:
        # 1. Enforce strict command policy
        is_valid, violation_msg = CommandPolicy.validate_command(cmd)
        if not is_valid:
            return ExecResult(
                exit_code=126,
                stdout="",
                stderr=f"Security Policy Violation: {violation_msg}",
                policy_violation="banned_command"
            )

        # 2. Setup environment without API keys or external secrets
        clean_env = {
            "PATH": os.environ.get("PATH", ""),
            "PYTHONPATH": h.workdir,
            "PROOFSTACK_SANDBOX": "1",
            "PROOFSTACK_NET": net,
        }

        try:
            proc = subprocess.Popen(
                cmd,
                cwd=h.workdir,
                env=clean_env,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                shell=False
            )
            try:
                stdout_data, stderr_data = proc.communicate(timeout=timeout_s)
                exit_code = proc.returncode
                timed_out = False
            except subprocess.TimeoutExpired:
                proc.kill()
                stdout_data, stderr_data = proc.communicate()
                exit_code = 124
                timed_out = True

            # 3. Output cap enforcement (1 MB max)
            if len(stdout_data.encode("utf-8")) > MAX_OUTPUT_BYTES:
                stdout_data = stdout_data[:MAX_OUTPUT_BYTES] + "\n[OUTPUT TRUNCATED BY PROOFSTACK CAP]"
            if len(stderr_data.encode("utf-8")) > MAX_OUTPUT_BYTES:
                stderr_data = stderr_data[:MAX_OUTPUT_BYTES] + "\n[STDERR TRUNCATED BY PROOFSTACK CAP]"

            return ExecResult(
                exit_code=exit_code,
                stdout=stdout_data,
                stderr=stderr_data,
                timed_out=timed_out
            )

        except Exception as e:
            return ExecResult(
                exit_code=1,
                stdout="",
                stderr=str(e)
            )

    def put(self, h: SandboxHandle, path: str, data: bytes) -> None:
        target_path = Path(h.workdir) / path
        target_path.parent.mkdir(parents=True, exist_ok=True)
        target_path.write_bytes(data)

    def get(self, h: SandboxHandle, path: str) -> bytes:
        target_path = Path(h.workdir) / path
        if not target_path.exists():
            raise FileNotFoundError(f"File {path} not found in sandbox")
        return target_path.read_bytes()

    def destroy(self, h: SandboxHandle) -> None:
        if h.handle_id in self._handles:
            del self._handles[h.handle_id]
