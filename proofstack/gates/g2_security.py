"""
ProofStack Gate G2: Security Gate
Re-runs every applicable security red-probe on candidate (must flip to GREEN)
and verifies green-probes across untouched security categories remain GREEN.
"""

from __future__ import annotations
from dataclasses import dataclass
from typing import Dict, List, Literal, Tuple


@dataclass
class ProbeOutcome:
    probe_id: str
    target_flaw: str
    baseline_state: Literal["RED", "GREEN", "ERROR"]
    candidate_state: Literal["RED", "GREEN", "ERROR"]


class G2SecurityGate:
    @staticmethod
    def evaluate(
        target_flaw: str,
        probes: List[ProbeOutcome]
    ) -> Tuple[bool, List[str]]:
        failures: List[str] = []

        for p in probes:
            if p.target_flaw == target_flaw:
                # The probe targeted at the flaw being fixed MUST be GREEN on candidate
                if p.candidate_state != "GREEN":
                    failures.append(f"Security probe '{p.probe_id}' failed: flaw '{target_flaw}' remains vulnerable (state={p.candidate_state})")
            else:
                # Untouched category probes must NOT regress to RED
                if p.baseline_state == "GREEN" and p.candidate_state == "RED":
                    failures.append(f"Security regression in untouched category '{p.target_flaw}': probe '{p.probe_id}' became RED")

        return (len(failures) == 0), failures
