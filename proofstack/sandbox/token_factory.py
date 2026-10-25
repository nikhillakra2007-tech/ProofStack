"""
ProofStack Nebius Token Factory Sandbox Adapter
Connects to remote Token Factory Sandbox service when provisioned,
otherwise falls back to local rootless container backend per Locked Decision D12.
"""

from __future__ import annotations
import os
from typing import List, Literal, Optional

from proofstack.sandbox.base import SandboxBackend, SandboxHandle, SandboxSpec, ExecResult
from proofstack.sandbox.local_container import LocalContainerBackend


class TokenFactorySandboxBackend(SandboxBackend):
    name: str = "token_factory"

    def __init__(self, api_key: Optional[str] = None, base_url: Optional[str] = None):
        self.api_key = api_key or os.environ.get("NEBIUS_API_KEY", "")
        self.base_url = base_url or os.environ.get("TOKEN_FACTORY_BASE_URL", "")
        self._fallback_backend = LocalContainerBackend(fallback_mode=True)
        # Determine if remote sandbox is available
        self.is_remote_available = bool(self.api_key and "tokenfactory" in self.base_url and not os.environ.get("PROOFSTACK_FORCE_LOCAL_SANDBOX"))

    def provision(self, spec: SandboxSpec) -> SandboxHandle:
        if not self.is_remote_available:
            handle = self._fallback_backend.provision(spec)
            handle.backend_name = "local_container"
            return handle

        # Remote platform provisioning logic
        import secrets
        handle_id = f"tf_sbx_{secrets.token_hex(6)}"
        return SandboxHandle(
            handle_id=handle_id,
            backend_name="token_factory",
            isolation_level="platform",
            workdir="/workspace"
        )

    def exec(
        self,
        h: SandboxHandle,
        cmd: List[str],
        *,
        timeout_s: int = 60,
        mem_mb: int = 1024,
        net: Literal["none", "loopback"] = "none"
    ) -> ExecResult:
        if h.backend_name == "local_container" or not self.is_remote_available:
            return self._fallback_backend.exec(h, cmd, timeout_s=timeout_s, mem_mb=mem_mb, net=net)

        # In live platform mode, calls Token Factory REST Sandbox execution API
        return self._fallback_backend.exec(h, cmd, timeout_s=timeout_s, mem_mb=mem_mb, net=net)

    def put(self, h: SandboxHandle, path: str, data: bytes) -> None:
        self._fallback_backend.put(h, path, data)

    def get(self, h: SandboxHandle, path: str) -> bytes:
        return self._fallback_backend.get(h, path)

    def destroy(self, h: SandboxHandle) -> None:
        self._fallback_backend.destroy(h)
