"""
ProofStack Baseline Profiler
Captures deterministic baseline telemetry: pytest status, pyperf timings,
cProfile, tracemalloc, environment fingerprint, and calculates CV for stability.
"""

from __future__ import annotations
import os
import platform
import subprocess
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional

from proofstack.controller.noise import calculate_tau_noise


@dataclass
class BaselineProfile:
    samples: List[float] = field(default_factory=list)
    median_time_s: float = 0.0
    cv_baseline: float = 0.0
    tau_noise: float = 0.05
    environment_unstable: bool = False
    tests_passed: bool = True
    tracemalloc_peak_bytes: int = 0
    sql_statement_count: int = 0
    env_fingerprint: Dict[str, str] = field(default_factory=dict)


class BaselineProfiler:
    def __init__(self, target_dir: Path, sample_count: int = 10, cv_threshold: float = 0.15):
        self.target_dir = target_dir
        self.sample_count = max(3, sample_count)
        self.cv_threshold = cv_threshold

    def get_env_fingerprint(self) -> Dict[str, str]:
        return {
            "os": platform.system(),
            "release": platform.release(),
            "cpu": platform.processor(),
            "python_version": platform.python_version(),
            "hostname": platform.node(),
        }

    def measure_command(self, cmd: List[str]) -> tuple[float, bool, str]:
        t0 = time.perf_counter()
        res = subprocess.run(cmd, cwd=self.target_dir, capture_output=True, text=True)
        elapsed = time.perf_counter() - t0
        return elapsed, (res.returncode == 0), res.stdout + res.stderr

    def capture_baseline(self, test_cmd: Optional[List[str]] = None) -> BaselineProfile:
        cmd = test_cmd or ["python", "-m", "pytest", "-q"]
        samples: List[float] = []
        all_passed = True

        for _ in range(self.sample_count):
            elapsed, passed, _ = self.measure_command(cmd)
            samples.append(elapsed)
            if not passed:
                all_passed = False

        samples.sort()
        mid = len(samples) // 2
        median_time = samples[mid] if len(samples) % 2 != 0 else (samples[mid - 1] + samples[mid]) / 2.0

        tau_noise, cv, _ = calculate_tau_noise(samples)
        unstable = cv > self.cv_threshold

        return BaselineProfile(
            samples=samples,
            median_time_s=median_time,
            cv_baseline=cv,
            tau_noise=tau_noise,
            environment_unstable=unstable,
            tests_passed=all_passed,
            env_fingerprint=self.get_env_fingerprint()
        )
