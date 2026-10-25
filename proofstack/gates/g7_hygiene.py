"""
ProofStack Gate G7: Patch Hygiene Gate
Enforces diff scope:
- Only files in declared writable_paths may be edited.
- Strictly rejects any edit to tests/, benchmarks/, probes/, or checker configs.
- Rejects any new dependencies without explicit human approval record.
"""

from __future__ import annotations
import re
from typing import List, Optional, Set, Tuple


class G7PatchHygieneGate:
    PROTECTED_PREFIXES = ("tests/", "benchmarks/", "probes/", "config/", ".github/")

    @staticmethod
    def evaluate(
        diff_text: str,
        writable_paths: Optional[List[str]] = None,
        lockfile_changed: bool = False,
        human_approval_present: bool = False
    ) -> Tuple[bool, List[str]]:
        violations: List[str] = []

        # 1. Dependency check
        if lockfile_changed and not human_approval_present:
            violations.append("Undeclared dependency modification: lockfile altered without recorded human approval")

        # 2. Extract changed files from unified diff
        changed_files = re.findall(r"^\+\+\+ [b/]*(.*?)(?:\t.*)?$", diff_text, flags=re.MULTILINE)

        for file_path in changed_files:
            file_clean = file_path.strip()

            # Protected directories check
            for prefix in G7PatchHygieneGate.PROTECTED_PREFIXES:
                if file_clean.startswith(prefix):
                    violations.append(f"Forbidden modification of protected test/benchmark/config file: {file_clean}")

            # Writable paths constraint check
            if writable_paths:
                is_writable = any(file_clean.startswith(w) or file_clean == w for w in writable_paths)
                if not is_writable:
                    violations.append(f"Out-of-scope patch: file '{file_clean}' is outside allowed writable paths")

        return (len(violations) == 0), violations
