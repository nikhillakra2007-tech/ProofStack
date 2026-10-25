"""
ProofStack Gate G6: Resources Gate
Validates memory boundaries (tracemalloc growth), file descriptor leaks (FD delta < 5),
and database connection pool releases.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Tuple


@dataclass
class ResourceTelemetry:
    tracemalloc_peak_bytes: int
    tracemalloc_growth_bytes: int
    open_fd_delta: int
    connection_pool_checked_out: int


class G6ResourcesGate:
    MAX_FD_DELTA = 5
    MAX_ALLOWED_LEAK_BYTES = 20 * 1024 * 1024  # 20 MB

    @staticmethod
    def evaluate(telemetry: ResourceTelemetry) -> Tuple[bool, List[str]]:
        violations: List[str] = []

        if telemetry.open_fd_delta >= G6ResourcesGate.MAX_FD_DELTA:
            violations.append(f"File descriptor leak detected: open FD delta {telemetry.open_fd_delta} >= 5")

        if telemetry.connection_pool_checked_out > 0:
            violations.append(
                f"Connection pool exhaustion: {telemetry.connection_pool_checked_out} connections unreleased after error"
            )

        if telemetry.tracemalloc_growth_bytes > G6ResourcesGate.MAX_ALLOWED_LEAK_BYTES:
            violations.append(
                f"Unbounded memory growth: {telemetry.tracemalloc_growth_bytes / 1024 / 1024:.2f} MB exceeds 20 MB ceiling"
            )

        return (len(violations) == 0), violations
