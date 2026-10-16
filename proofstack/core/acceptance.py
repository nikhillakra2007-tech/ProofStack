"""Zero-Compromise acceptance gate: a pure function over gate results (no I/O, no model calls).

ACCEPT  <=>  every required gate PASSes or is NOT_APPLICABLE (router proved its trigger absent), and:
  optimize: the PERF family has a PASS (ΔPerf > tau_noise);   harden: the TARGET exploit gate PASSes
  (finding cleared) and no PERF gate FAILs beyond the approved budget.
Any FAIL => REJECTED. Otherwise any INCONCLUSIVE / NOT_RUN required gate => INCONCLUSIVE. NOT_RUN is never PASS.
"""
from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date

PASS, FAIL, INCONCLUSIVE, NOT_RUN, NA = "PASS", "FAIL", "INCONCLUSIVE", "NOT_RUN", "NOT_APPLICABLE"
FAMILIES = ("PERF", "SEC", "CORR", "CONC")
VALID_MODES = ("optimize", "harden", "audit")

NON_WAIVABLE_FAMILIES = {"INTEGRITY", "CORR"}


@dataclass(frozen=True)
class Gate:
    id: str
    family: str                  # PERF | SEC | CORR | CONC | INTEGRITY
    status: str
    required: bool = True


@dataclass(frozen=True)
class Waiver:
    id: str
    gate_id: str                 # scope: which gate or policy this waiver applies to
    family: str                  # which family the waived gate belongs to
    approved_by: str
    approved_at: date
    expires: date | None = None
    reason: str = ""
    revoked: bool = False

    def is_valid(self, as_of: date | None = None) -> bool:
        if self.revoked:
            return False
        if self.expires is not None:
            check_date = as_of or date.today()
            if check_date > self.expires:
                return False
        return True

    def applies_to(self, gate: Gate) -> bool:
        return self.gate_id == gate.id and self.family == gate.family


def decide(mode: str, gates: list[Gate], waivers: list[Waiver] | None = None,
           policy_version: str | None = None, as_of: date | None = None):
    if mode not in VALID_MODES:
        raise ValueError(f"invalid mode: {mode!r}; must be one of {VALID_MODES}")

    waivers = waivers or []
    valid_waivers = [w for w in waivers if w.is_valid(as_of)]

    effective_gates = []
    for g in gates:
        if not g.required:
            effective_gates.append(g)
            continue
        waiver = next((w for w in valid_waivers if w.applies_to(g)), None)
        if waiver:
            if g.family in NON_WAIVABLE_FAMILIES:
                effective_gates.append(g)
            else:
                effective_gates.append(Gate(g.id, g.family, NOT_RUN, g.required))
        else:
            effective_gates.append(g)

    fails = [g for g in effective_gates if g.required and g.status == FAIL]
    open_ = [g for g in effective_gates if g.required and g.status in (INCONCLUSIVE, NOT_RUN)]
    summary = {f: _family(effective_gates, f) for f in (*FAMILIES, "INTEGRITY")}
    reasons = [f"{g.family}:{g.id} FAIL" for g in fails]

    if mode == "harden":
        target = [g for g in effective_gates if g.id.startswith("TARGET:")]
        if not target or any(g.status != PASS for g in target):
            reasons.append("TARGET exploit not proven cleared")
            fails = fails or target or [Gate("TARGET", "SEC", FAIL)]
    elif mode == "optimize":
        if not any(g.family == "PERF" and g.status == PASS for g in effective_gates):
            open_ = open_ or [Gate("PERF_EVIDENCE", "PERF", NOT_RUN)]
            reasons.append("no PASS performance evidence (optimize mode)")
    elif mode == "audit":
        if any(g.status == FAIL for g in effective_gates if g.required):
            pass

    if fails:
        return "REJECTED", summary, reasons
    if open_:
        return "INCONCLUSIVE", summary, reasons + [f"{g.family}:{g.id} {g.status}" for g in open_]
    return "ACCEPTED", summary, ["all required gates satisfied"]


def _family(gates, fam):
    xs = [g.status for g in gates if g.family == fam and g.required]
    if not xs:
        return NA
    return FAIL if FAIL in xs else (NOT_RUN if NOT_RUN in xs else INCONCLUSIVE if INCONCLUSIVE in xs else PASS)
