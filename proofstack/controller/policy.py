"""
ProofStack Policy Loader
Loads and validates policy configuration parameters.
"""

from __future__ import annotations
from pathlib import Path
from typing import Any, Dict, Optional
import yaml
from pydantic import BaseModel, Field


class SandboxPolicy(BaseModel):
    timeout_s: int = Field(default=60, le=60)
    memory_mb: int = Field(default=1024, le=1024)
    max_processes: int = Field(default=64, le=64)
    max_output_bytes: int = Field(default=1048576, le=1048576)
    network: str = Field(default="none")


class PolicyConfig(BaseModel):
    name: str = "default"
    tau_min: float = 0.05
    k: float = 2.0
    decimal_slowdown_cap: float = 3.0
    token_budget: int = 120000
    max_patch_iterations: int = 3
    cv_baseline_threshold: float = 0.15
    sandbox: SandboxPolicy = Field(default_factory=SandboxPolicy)
    gates: Dict[str, bool] = Field(default_factory=lambda: {f"g{i}_required": True for i in range(8)})


class PolicyManager:
    def __init__(self, policy_path: Optional[Path] = None):
        self.policy_path = policy_path or Path("config/policy.default.yaml")
        self.policy = self._load()

    def _load(self) -> PolicyConfig:
        if self.policy_path.exists():
            data = yaml.safe_load(self.policy_path.read_text(encoding="utf-8"))
            if "policy" in data:
                return PolicyConfig(**data["policy"])
            return PolicyConfig(**data)
        return PolicyConfig()
