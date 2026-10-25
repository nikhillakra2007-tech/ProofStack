"""
ProofStack DAST Verification Gates R0 to R6
Implements Section K.6 (page 27):
Validates that defensive remediation patches fix the target vulnerability (R1)
without introducing regressions, new findings (R2), breaking behaviour (R3),
or dropping identity/auth controls (R4).
"""

from __future__ import annotations
from dataclasses import dataclass, field
from typing import Dict, List, Optional, Tuple

from proofstack.controller.verdict import VerdictResult, RemediationGateResults, calculate_remediation_verdict
from proofstack.gates.g0_pregate import G0PreGateScanner
from proofstack.gates.g3_identity import G3IdentityGate
from proofstack.gates.g7_hygiene import G7PatchHygieneGate
from proofstack.schemas import GateStatusMap


class RemediationVerifier:
    def __init__(self, writable_paths: Optional[List[str]] = None):
        self.writable_paths = writable_paths
        self.pregate_scanner = G0PreGateScanner()

    def verify_remediation(
        self,
        diff_text: str,
        baseline_code: str,
        patched_code: str,
        pre_patch_findings: List[str],
        post_patch_findings: List[str],
        target_check_id: str,
        tests_passed: bool,
        smoke_passed: bool,
        perf_regression: bool = False
    ) -> Tuple[VerdictResult, GateStatusMap, List[str]]:
        gate_status = {
            "R0": "NOT_RUN",
            "R1": "NOT_RUN",
            "R2": "NOT_RUN",
            "R3": "NOT_RUN",
            "R4": "NOT_RUN",
            "R5": "NOT_RUN",
            "R6": "NOT_RUN"
        }
        failing_reasons: List[str] = []

        # Gate R0: Pre-gate on diff (no secrets, no banned constructs)
        r0_clean, r0_violations = self.pregate_scanner.scan_diff_or_source(diff_text)
        if not r0_clean:
            gate_status["R0"] = "FAIL"
            failing_reasons.extend(r0_violations)
        else:
            gate_status["R0"] = "PASS"

        # Gate R6: Scope and hygiene (writable paths only, no test tampering)
        r6_clean, r6_violations = G7PatchHygieneGate.evaluate(diff_text, writable_paths=self.writable_paths)
        if not r6_clean:
            gate_status["R6"] = "FAIL"
            failing_reasons.extend(r6_violations)
        else:
            gate_status["R6"] = "PASS"

        # Gate R4: Identity Guard
        r4_clean, r4_violations = G3IdentityGate.inspect_diff_and_ast(baseline_code, patched_code, diff_text)
        if not r4_clean:
            gate_status["R4"] = "FAIL"
            failing_reasons.extend(r4_violations)
        else:
            gate_status["R4"] = "PASS"

        # Gate R1: Target finding flips (must not be present in post-patch scan)
        target_still_present = any(target_check_id in f for f in post_patch_findings)
        if target_still_present:
            gate_status["R1"] = "FAIL"
            failing_reasons.append(f"Target finding {target_check_id} was not resolved")
        else:
            gate_status["R1"] = "PASS"

        # Gate R2: No new findings introduced
        new_findings = [f for f in post_patch_findings if f not in pre_patch_findings]
        if new_findings:
            gate_status["R2"] = "FAIL"
            failing_reasons.append(f"Remediation introduced {len(new_findings)} new findings: {new_findings}")
        else:
            gate_status["R2"] = "PASS"

        # Gate R3: Behaviour preserved (tests pass + smoke returns 2xx)
        if not (tests_passed and smoke_passed):
            gate_status["R3"] = "FAIL"
            failing_reasons.append("Functional regression: test suite or smoke check failed on patched application")
        else:
            gate_status["R3"] = "PASS"

        # Gate R5: Performance regression check
        if perf_regression:
            gate_status["R5"] = "FAIL"
            failing_reasons.append("Performance regression: document load time exceeded tau_noise threshold")
        else:
            gate_status["R5"] = "PASS"

        # Assemble result for verdict engine
        r_results = RemediationGateResults(
            reproduced_locally=True,
            R1_target_green=(gate_status["R1"] == "PASS"),
            R2_new_findings=(gate_status["R2"] == "FAIL"),
            R3_behaviour_regressed=(gate_status["R3"] == "FAIL"),
            R4_identity_dropped=(gate_status["R4"] == "FAIL"),
            R5_regression_above_noise=(gate_status["R5"] == "FAIL"),
            R6_scope_violation=(gate_status["R6"] == "FAIL"),
            failed=failing_reasons
        )

        verdict_obj = calculate_remediation_verdict(r_results)
        map_model = GateStatusMap(**gate_status)
        return verdict_obj, map_model, failing_reasons
