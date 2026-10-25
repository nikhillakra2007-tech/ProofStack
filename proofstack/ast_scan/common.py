"""
ProofStack AST Scanner Detectors
Static syntax tree analysis for defect patterns across Tier 1, 2, and 3.
"""

from __future__ import annotations
import ast
import re
from dataclasses import dataclass
from typing import List, Optional


@dataclass
class AstFinding:
    rule_id: str
    message: str
    line_number: int
    severity: str = "Medium"


def scan_redos_patterns(source_code: str) -> List[AstFinding]:
    findings = []
    # Nested quantifiers: (a+)+, (.*)*, ([0-9]+)+
    nested_re = re.compile(r"(\([^\)]*[\+\*]\)[^\)]*[\+\*])|(\([^\)]*\|[^\)]*\)[\+\*])")
    for lineno, line in enumerate(source_code.splitlines(), start=1):
        if "re.compile" in line or "re.match" in line or "re.search" in line:
            if nested_re.search(line):
                findings.append(AstFinding("T1-1", "Potential ReDoS: nested quantifier or overlapping alternation", lineno, "High"))
    return findings


def scan_n_plus_one(source_code: str) -> List[AstFinding]:
    findings = []
    try:
        tree = ast.parse(source_code)
        for node in ast.walk(tree):
            if isinstance(node, (ast.For, ast.While)):
                for sub in ast.walk(node):
                    if isinstance(sub, ast.Call):
                        # Detect queries inside loops
                        call_repr = ast.unparse(sub.func) if hasattr(ast, "unparse") else ""
                        if any(term in call_repr.lower() for term in ["query", "execute", "filter_by", "find_by"]):
                            findings.append(AstFinding("T1-2", f"N+1 query pattern: DB call '{call_repr}' inside loop", getattr(sub, "lineno", 1), "High"))
    except SyntaxError:
        pass
    return findings


def scan_quadratic_patterns(source_code: str) -> List[AstFinding]:
    findings = []
    try:
        tree = ast.parse(source_code)
        for node in ast.walk(tree):
            if isinstance(node, ast.For):
                for sub in ast.walk(node):
                    if isinstance(sub, ast.For) and sub != node:
                        findings.append(AstFinding("T1-4", "Nested loop detected: potential O(n^2) quadratic scaling", getattr(sub, "lineno", 1), "Medium"))
                    elif isinstance(sub, ast.Compare):
                        for op in sub.ops:
                            if isinstance(op, ast.In):
                                findings.append(AstFinding("T1-4", "Linear scan 'in' check inside loop: quadratic complexity risk", getattr(sub, "lineno", 1), "Medium"))
    except SyntaxError:
        pass
    return findings


def scan_async_blocking(source_code: str) -> List[AstFinding]:
    findings = []
    try:
        tree = ast.parse(source_code)
        for node in ast.walk(tree):
            if isinstance(node, ast.AsyncFunctionDef):
                for sub in ast.walk(node):
                    if isinstance(sub, ast.Call):
                        name = ast.unparse(sub.func) if hasattr(ast, "unparse") else ""
                        if "time.sleep" in name:
                            findings.append(AstFinding("T1-5", "Synchronous time.sleep() inside async def freezes event loop", getattr(sub, "lineno", 1), "High"))
                        elif "requests." in name or "urllib." in name:
                            findings.append(AstFinding("T1-5", f"Synchronous HTTP call '{name}' inside async def", getattr(sub, "lineno", 1), "High"))
    except SyntaxError:
        pass
    return findings


def scan_toctou(source_code: str) -> List[AstFinding]:
    findings = []
    # Heuristic: variable read in an `if` condition followed by subtraction/assignment without locking
    if re.search(r"if\s+.*balance\s*>=.*:\s*\n.*balance\s*-=", source_code):
        findings.append(AstFinding("T1-7", "TOCTOU race condition: check balance then update without atomic lock", 1, "High"))
    return findings


def scan_ssrf(source_code: str) -> List[AstFinding]:
    findings = []
    try:
        tree = ast.parse(source_code)
        for node in ast.walk(tree):
            if isinstance(node, ast.Call):
                name = ast.unparse(sub.func) if hasattr(ast, "unparse") and hasattr(node, "func") else ""
                if any(client in name for client in ["requests.get", "requests.post", "httpx.get", "urlopen"]):
                    # Check if first arg is dynamic
                    if node.args and not isinstance(node.args[0], ast.Constant):
                        findings.append(AstFinding("T1-8", "Outbound HTTP fetch using unsanitized dynamic URL (SSRF risk)", getattr(node, "lineno", 1), "High"))
    except Exception:
        pass
    return findings


def scan_deserialization_and_cmdi(source_code: str) -> List[AstFinding]:
    findings = []
    if "pickle.loads(" in source_code or "pickle.load(" in source_code:
        findings.append(AstFinding("T2-1", "Insecure deserialization: pickle.load", 1, "Critical"))
    if "shell=True" in source_code:
        findings.append(AstFinding("T2-1", "Command injection vulnerability: subprocess with shell=True", 1, "Critical"))
    if "yaml.load(" in source_code and "SafeLoader" not in source_code:
        findings.append(AstFinding("T2-1", "Insecure deserialization: yaml.load without SafeLoader", 1, "High"))
    return findings


def scan_money_arithmetic(source_code: str) -> List[AstFinding]:
    findings = []
    for lineno, line in enumerate(source_code.splitlines(), start=1):
        if any(term in line.lower() for term in ["price", "fee", "balance", "amount", "total"]):
            if "float(" in line or re.search(r"\b0\.\d+\b", line):
                findings.append(AstFinding("T3-4", "Float-based money arithmetic: rounding drift hazard", lineno, "Medium"))
    return findings
