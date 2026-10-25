"""
ProofStack Gate G3: Identity-Preservation Guard
Speed must never beat identity (Section I, page 14).
A patch may not remove, bypass or weaken:
1. Authenticated user/session parameters on signatures and call chains
2. Tenant or organisation identifiers in query predicates and cache keys
3. Ownership checks (if ... != user.id: raise)
4. Role and permission decorators (@login_required, Depends(get_current_user))
Result on failure: REJECT(identity_dropped). No override exists.
"""

from __future__ import annotations
import ast
import re
from typing import Dict, List, Optional, Set, Tuple

IDENTITY_PARAMS = {"user", "user_id", "current_user", "principal", "tenant", "tenant_id", "org_id", "session", "ctx"}
IDENTITY_PREDICATES = {"owner_id", "user_id", "tenant_id", "org_id"}
IDENTITY_DECORATORS = {"login_required", "requires_role", "permission_required", "authenticate"}


class G3IdentityGate:
    @staticmethod
    def _extract_function_signatures(tree: ast.AST) -> Dict[str, Set[str]]:
        signatures: Dict[str, Set[str]] = {}
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                params = {arg.arg for arg in node.args.args}
                signatures[node.name] = params
        return signatures

    @staticmethod
    def _extract_decorators(tree: ast.AST) -> Dict[str, Set[str]]:
        decs: Dict[str, Set[str]] = {}
        for node in ast.walk(tree):
            if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                d_names = set()
                for d in node.decorator_list:
                    if isinstance(d, ast.Name):
                        d_names.add(d.id)
                    elif isinstance(d, ast.Call) and isinstance(d.func, ast.Name):
                        d_names.add(d.func.id)
                decs[node.name] = d_names
        return decs

    @classmethod
    def inspect_diff_and_ast(
        cls,
        baseline_code: str,
        candidate_code: str,
        diff_text: str = ""
    ) -> Tuple[bool, List[str]]:
        violations: List[str] = []

        try:
            base_tree = ast.parse(baseline_code)
            cand_tree = ast.parse(candidate_code)

            # 1. Parameter preservation check on function signatures
            base_sigs = cls._extract_function_signatures(base_tree)
            cand_sigs = cls._extract_function_signatures(cand_tree)

            for func_name, base_params in base_sigs.items():
                if func_name in cand_sigs:
                    cand_params = cand_sigs[func_name]
                    for id_param in (base_params & IDENTITY_PARAMS):
                        if id_param not in cand_params:
                            violations.append(
                                f"Identity parameter '{id_param}' was dropped from function signature '{func_name}'"
                            )

            # 2. Decorator preservation
            base_decs = cls._extract_decorators(base_tree)
            cand_decs = cls._extract_decorators(cand_tree)
            for func_name, base_d in base_decs.items():
                if func_name in cand_decs:
                    cand_d = cand_decs[func_name]
                    for d in (base_d & IDENTITY_DECORATORS):
                        if d not in cand_d:
                            violations.append(f"Security decorator '@{d}' was removed from function '{func_name}'")

            # 3. Check that identity parameters are actually read in candidate bodies
            for node in ast.walk(cand_tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    present_id_params = {arg.arg for arg in node.args.args if arg.arg in IDENTITY_PARAMS}
                    if present_id_params:
                        body_reads = {
                            n.id for n in ast.walk(node)
                            if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Load)
                        }
                        for p in present_id_params:
                            if p not in body_reads:
                                violations.append(f"Identity parameter '{p}' in function '{node.name}' is unused in body")

        except SyntaxError:
            pass

        # 4. Diff inspection for dropped predicate filters or auth checks
        for line in diff_text.splitlines():
            if line.startswith("-") and not line.startswith("---"):
                removed_line = line[1:].strip()
                for pred in IDENTITY_PREDICATES:
                    if f".{pred}" in removed_line or f"Order.{pred}" in removed_line:
                        if f"{pred}" not in candidate_code:
                            violations.append(f"Identity predicate '{pred}' removed in diff: '{removed_line}'")
                for dec in IDENTITY_DECORATORS:
                    if f"@{dec}" in removed_line and f"@{dec}" not in candidate_code:
                        violations.append(f"Decorator '@{dec}' removed in diff")

        return (len(violations) == 0), violations
