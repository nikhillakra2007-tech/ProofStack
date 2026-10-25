"""
ProofStack Task State Machine
Strict state transition validation per Locked Decision D6.
"""

from __future__ import annotations
from enum import Enum
from typing import Set, Dict, Optional


class TaskState(str, Enum):
    # Core Engine States
    CREATED = "CREATED"
    WORKTREE_READY = "WORKTREE_READY"
    BASELINED = "BASELINED"
    PREGATED = "PREGATED"
    HYPOTHESIZED = "HYPOTHESIZED"
    EXPERIMENTING = "EXPERIMENTING"
    PATCHING = "PATCHING"
    GAUNTLET = "GAUNTLET"
    REPAIRING = "REPAIRING"
    VERDICT = "VERDICT"
    REPORTED = "REPORTED"

    # Terminal / Error States
    CANCELLED = "CANCELLED"
    FAILED = "FAILED"
    BUDGET_EXHAUSTED = "BUDGET_EXHAUSTED"

    # Module M8 DAST States
    DAST_SCANNING = "DAST_SCANNING"
    DAST_FINDINGS_READY = "DAST_FINDINGS_READY"
    REMEDIATING = "REMEDIATING"


class InvalidStateTransitionError(Exception):
    def __init__(self, current_state: TaskState, next_state: TaskState):
        super().__init__(f"Illegal transition from {current_state.value} to {next_state.value}")
        self.current_state = current_state
        self.next_state = next_state


class TaskStateMachine:
    # Authoritative allowed transitions
    ALLOWED_TRANSITIONS: Dict[TaskState, Set[TaskState]] = {
        TaskState.CREATED: {TaskState.WORKTREE_READY, TaskState.DAST_SCANNING, TaskState.CANCELLED, TaskState.FAILED},
        TaskState.WORKTREE_READY: {TaskState.BASELINED, TaskState.CANCELLED, TaskState.FAILED},
        TaskState.BASELINED: {TaskState.PREGATED, TaskState.CANCELLED, TaskState.FAILED},
        TaskState.PREGATED: {TaskState.HYPOTHESIZED, TaskState.VERDICT, TaskState.CANCELLED, TaskState.FAILED},
        TaskState.HYPOTHESIZED: {TaskState.EXPERIMENTING, TaskState.PATCHING, TaskState.CANCELLED, TaskState.FAILED, TaskState.BUDGET_EXHAUSTED},
        TaskState.EXPERIMENTING: {TaskState.PATCHING, TaskState.HYPOTHESIZED, TaskState.CANCELLED, TaskState.FAILED, TaskState.BUDGET_EXHAUSTED},
        TaskState.PATCHING: {TaskState.GAUNTLET, TaskState.CANCELLED, TaskState.FAILED, TaskState.BUDGET_EXHAUSTED},
        TaskState.GAUNTLET: {TaskState.VERDICT, TaskState.REPAIRING, TaskState.CANCELLED, TaskState.FAILED},
        TaskState.REPAIRING: {TaskState.GAUNTLET, TaskState.VERDICT, TaskState.CANCELLED, TaskState.FAILED, TaskState.BUDGET_EXHAUSTED},
        TaskState.VERDICT: {TaskState.REPORTED, TaskState.CANCELLED, TaskState.FAILED},
        TaskState.REPORTED: set(),

        # DAST Module M8 lifecycle
        TaskState.DAST_SCANNING: {TaskState.DAST_FINDINGS_READY, TaskState.CANCELLED, TaskState.FAILED},
        TaskState.DAST_FINDINGS_READY: {TaskState.REMEDIATING, TaskState.REPORTED, TaskState.CANCELLED},
        TaskState.REMEDIATING: {TaskState.VERDICT, TaskState.REPORTED, TaskState.CANCELLED, TaskState.FAILED, TaskState.BUDGET_EXHAUSTED},

        # Terminals
        TaskState.CANCELLED: set(),
        TaskState.FAILED: set(),
        TaskState.BUDGET_EXHAUSTED: {TaskState.VERDICT, TaskState.REPORTED, TaskState.FAILED},
    }

    def __init__(self, initial_state: TaskState = TaskState.CREATED):
        self.current_state = initial_state
        self.history: list[TaskState] = [initial_state]

    def transition_to(self, new_state: TaskState) -> TaskState:
        allowed = self.ALLOWED_TRANSITIONS.get(self.current_state, set())
        if new_state not in allowed:
            raise InvalidStateTransitionError(self.current_state, new_state)
        self.current_state = new_state
        self.history.append(new_state)
        return self.current_state
