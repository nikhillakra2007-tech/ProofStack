"""
ProofStack Budget Tracker
Enforces token budgets, wall-clock limits, and iteration counts.
Locked Decision D8: 120,000 tokens per task, max 3 patch iterations by default.
"""

from __future__ import annotations
import time
from typing import Optional


class BudgetExhaustedError(Exception):
    def __init__(self, reason: str):
        super().__init__(reason)
        self.reason = reason


class BudgetTracker:
    def __init__(
        self,
        max_tokens: int = 120000,
        max_wall_seconds: int = 600,
        max_patch_iterations: int = 3
    ):
        self.max_tokens = min(max_tokens, 120000)
        self.max_wall_seconds = min(max_wall_seconds, 600)
        self.max_patch_iterations = max(1, min(max_patch_iterations, 5))

        self.tokens_used: int = 0
        self.start_time: float = time.time()
        self.iterations_performed: int = 0

    @property
    def elapsed_seconds(self) -> float:
        return time.time() - self.start_time

    @property
    def remaining_tokens(self) -> int:
        return max(0, self.max_tokens - self.tokens_used)

    def record_token_usage(self, prompt_tokens: int, completion_tokens: int) -> None:
        total = prompt_tokens + completion_tokens
        if self.tokens_used + total > self.max_tokens:
            self.tokens_used += total
            raise BudgetExhaustedError("token_budget_exceeded")
        self.tokens_used += total

    def check_time(self) -> None:
        if self.elapsed_seconds > self.max_wall_seconds:
            raise BudgetExhaustedError("wall_time_exceeded")

    def increment_iteration(self) -> None:
        self.iterations_performed += 1
        if self.iterations_performed > self.max_patch_iterations:
            raise BudgetExhaustedError("max_patch_iterations_exceeded")

    def check_all(self) -> None:
        self.check_time()
        if self.tokens_used >= self.max_tokens:
            raise BudgetExhaustedError("token_budget_exceeded")
        if self.iterations_performed >= self.max_patch_iterations:
            raise BudgetExhaustedError("max_patch_iterations_exceeded")
