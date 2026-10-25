"""
ProofStack Zero-Compromise Verdict Engine
Authoritative implementation of Section G and Section K.6.
No override flag exists for any role (Locked Decision D3).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import List, Optional, Literal

VerdictType = Literal["ACCEPT", "REJECT", "INCONCLUSIVE"]


@dataclass
class VerdictResult:
    verdict: VerdictType
    failing_gates: List[str] = field(default_factory=list)
    reason: Optional[str] = None

    def is_accept(self) -> bool:
        return self.verdict == "ACCEPT"


@dataclass
class GateResults:
    task_class: Literal["performance", "security", "correctness"]
    environment_unstable: bool = False
    budget_exhausted: bool = False
    any_gate_not_run: bool = False
    any_required_gate_error: bool = False
    inconclusive_reason: Optional[str] = None
    security_regress: bool = False
    correctness_regress: bool = False
    identity_violations: bool = False
    concurrency_safe: bool = True
    delta_perf: float = 0.0
    delta_perf_measured: bool = False
    tau_noise: float = 0.05
    slowdown: float = 1.0  # ratio for T3-4 decimal checks
    decimal_slowdown_cap: float = 3.0
    failed: List[str] = field(default_factory=list)


def calculate_verdict(g: GateResults) -> VerdictResult:
    """
    Locked Decision D2 & D3:
    ACCEPT if and only if:
      DeltaPerf > tau_noise AND Security_regress = empty AND
      Correctness_regress = empty AND Concurrency_safe = True.
    A gate that did not run is NOT_RUN and forces INCONCLUSIVE.
    """
    if (
        g.environment_unstable
        or g.budget_exhausted
        or g.any_gate_not_run
        or g.any_required_gate_error
    ):
        reason = g.inconclusive_reason or "incomplete_or_unstable_run"
        return VerdictResult("INCONCLUSIVE", reason=reason)

    if (
        g.security_regress
        or g.correctness_regress
        or g.identity_violations
        or not g.concurrency_safe
    ):
        return VerdictResult("REJECT", failing_gates=g.failed or ["regression_or_insecurity"])

    if g.task_class == "performance" and not (g.delta_perf > g.tau_noise):
        if g.delta_perf_measured:
            return VerdictResult("REJECT", failing_gates=["perf_below_noise"])
        return VerdictResult("INCONCLUSIVE", reason="effect_within_noise")

    if g.task_class == "security" and g.delta_perf < -g.tau_noise:
        return VerdictResult("REJECT", failing_gates=["unapproved_perf_regression"])

    if g.task_class == "correctness" and g.slowdown > g.decimal_slowdown_cap:
        return VerdictResult("REJECT", failing_gates=["unapproved_perf_regression"])

    return VerdictResult("ACCEPT")


@dataclass
class RemediationGateResults:
    reproduced_locally: bool
    any_gate_not_run: bool = False
    environment_unstable: bool = False
    budget_exhausted: bool = False
    reason: Optional[str] = None
    R1_target_green: bool = False
    R2_new_findings: bool = False
    R3_behaviour_regressed: bool = False
    R4_identity_dropped: bool = False
    R5_regression_above_noise: bool = False
    R6_scope_violation: bool = False
    failed: List[str] = field(default_factory=list)


def calculate_remediation_verdict(r: RemediationGateResults) -> VerdictResult:
    """
    Locked Decision Section K.6:
    Remediation verdict logic.
    """
    if (
        not r.reproduced_locally
        or r.any_gate_not_run
        or r.environment_unstable
        or r.budget_exhausted
    ):
        return VerdictResult("INCONCLUSIVE", reason=r.reason or "local_rebuild_or_run_incomplete")

    if (
        r.R4_identity_dropped
        or r.R6_scope_violation
        or r.R2_new_findings
        or r.R3_behaviour_regressed
    ):
        return VerdictResult("REJECT", failing_gates=r.failed or ["safety_or_integrity_violation"])

    if not r.R1_target_green:
        return VerdictResult("REJECT", failing_gates=["R1_not_fixed"])

    if r.R5_regression_above_noise:
        return VerdictResult("REJECT", failing_gates=["R5_regression"])

    return VerdictResult("ACCEPT")
