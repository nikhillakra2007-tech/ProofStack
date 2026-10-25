"""
ProofStack Gate G4: Concurrency Gate
Detects race conditions, lost updates, deadlocks, and event-loop blocking.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import List, Optional, Tuple


@dataclass
class ConcurrencyTelemetry:
    max_event_loop_lag_ms: float = 0.0
    deadlock_detected: bool = False
    lost_updates_count: int = 0
    session_leaked: bool = False


class G4ConcurrencyGate:
    MAX_ALLOWED_LOOP_LAG_MS = 50.0

    @staticmethod
    def evaluate(telemetry: ConcurrencyTelemetry) -> Tuple[bool, List[str]]:
        violations: List[str] = []

        if telemetry.deadlock_detected:
            violations.append("Database deadlock cycle detected during concurrent stress execution")

        if telemetry.lost_updates_count > 0:
            violations.append(f"Detected {telemetry.lost_updates_count} lost updates (TOCTOU / race condition)")

        if telemetry.max_event_loop_lag_ms > G4ConcurrencyGate.MAX_ALLOWED_LOOP_LAG_MS:
            violations.append(f"Event-loop freeze: max lag {telemetry.max_event_loop_lag_ms:.1f}ms exceeds 50ms limit")

        if telemetry.session_leaked:
            violations.append("Session or database connection leaked across concurrent worker threads")

        return (len(violations) == 0), violations
