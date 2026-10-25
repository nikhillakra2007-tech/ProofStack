"""
ProofStack Probe Harness Kit
Provides standardized probe utilities: target loader, log-log slope calculation,
timeout enforcement, and ProbeResult dataclass per AI Agents Brief Day 1.6.
"""

from __future__ import annotations
import importlib
import math
import os
import sys
import threading
import time
from dataclasses import dataclass, field
from typing import Any, Callable, Dict, List, Optional, Tuple


@dataclass
class ProbeResult:
    probe_id: str
    passed: bool
    state: str  # "RED", "GREEN", "ERROR", "NOT_REPRODUCED"
    execution_time_s: float
    measurements: Dict[str, Any] = field(default_factory=dict)
    error_message: Optional[str] = None


def load_target(symbol_spec: Optional[str] = None) -> Any:
    """
    Loads target symbol formatted as 'module.path:callable_name'.
    If omitted, reads from PROOFSTACK_TARGET environment variable.
    """
    spec = symbol_spec or os.environ.get("PROOFSTACK_TARGET")
    if not spec:
        raise ValueError("No target symbol specified and PROOFSTACK_TARGET env var is unset")

    if ":" not in spec:
        raise ValueError(f"Invalid symbol spec '{spec}'. Must be in 'module.path:symbol' format.")

    mod_name, attr_name = spec.split(":", 1)
    if mod_name not in sys.modules:
        mod = importlib.import_module(mod_name)
    else:
        mod = sys.modules[mod_name]

    return getattr(mod, attr_name)


def loglog_slope(xs: List[float], ys: List[float]) -> float:
    """
    Calculates the empirical scaling exponent (log-log slope) via linear regression.
    A linear algorithm O(n) yields slope approx 1.0.
    A quadratic algorithm O(n^2) yields slope approx 2.0.
    """
    if len(xs) != len(ys) or len(xs) < 2:
        raise ValueError("Need at least 2 coordinate pairs to compute slope")

    log_x = [math.log(x) for x in xs]
    log_y = [math.log(max(y, 1e-9)) for y in ys]

    n = len(log_x)
    mean_x = sum(log_x) / n
    mean_y = sum(log_y) / n

    denom = sum((x - mean_x) ** 2 for x in log_x)
    if denom == 0:
        return 1.0

    numer = sum((x - mean_x) * (y - mean_y) for x, y in zip(log_x, log_y))
    return numer / denom


def run_with_timeout(fn: Callable[[], Any], timeout_s: float = 5.0) -> Tuple[bool, Any, Optional[str]]:
    """
    Runs a callable with strict wall-clock timeout.
    Returns (success, result, error_msg).
    """
    res: List[Any] = []
    err: List[Exception] = []

    def target():
        try:
            r = fn()
            res.append(r)
        except Exception as e:
            err.append(e)

    thread = threading.Thread(target=target)
    thread.daemon = True
    thread.start()
    thread.join(timeout=timeout_s)

    if thread.is_alive():
        return False, None, f"Execution timed out after {timeout_s}s"

    if err:
        return False, None, str(err[0])

    return True, (res[0] if res else None), None


def best_of(fn: Callable[[], float], runs: int = 5) -> float:
    times = []
    for _ in range(max(1, runs)):
        t0 = time.perf_counter()
        fn()
        times.append(time.perf_counter() - t0)
    return min(times)
