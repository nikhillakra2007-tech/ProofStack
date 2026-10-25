"""
ProofStack Gate G0: Pre-Gate
Static AST scan, import allowlist vs lockfile (slopsquatting), secret scanning
(entropy >= 4.0 + regex), and banned unsafe constructs (shell=True, pickle.loads, yaml.load).
"""

from __future__ import annotations
import ast
import math
import re
from typing import Dict, List, Optional, Set, Tuple


def calculate_entropy(s: str) -> float:
    if not s:
        return 0.0
    prob = [float(s.count(c)) / len(s) for c in dict.fromkeys(list(s))]
    return -sum(p * math.log(p) / math.log(2.0) for p in prob)


class G0PreGateScanner:
    BANNED_IMPORTS: Set[str] = {"pickle", "shelve", "telnetlib"}
    BANNED_FUNCTIONS: Set[str] = {"eval", "exec"}

    SECRET_PATTERNS = [
        re.compile(r"AKIA[0-9A-Z]{16}"),                                    # AWS
        re.compile(r"gh[pousr]_[A-Za-z0-9_]{36,}"),                        # GitHub
        re.compile(r"xox[baprs]-[0-9A-Za-z]{10,}"),                        # Slack
        re.compile(r"sk_(?:live|test)_[0-9a-zA-Z]{24,}"),                  # Stripe
        re.compile(r"-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----")  # Private keys
    ]

    def __init__(self, allowed_packages: Optional[Set[str]] = None):
        self.allowed_packages = allowed_packages or set()

    def scan_diff_or_source(self, source_code: str, file_path: str = "patch.py") -> Tuple[bool, List[str]]:
        violations: List[str] = []

        # 1. Secret Scanning
        for pattern in self.SECRET_PATTERNS:
            if pattern.search(source_code):
                violations.append("Hard-coded secret token detected matching known credential pattern")

        # Check for high-entropy string literals
        for match in re.finditer(r"['\"]([A-Za-z0-9+/=_\-]{20,})['\"]", source_code):
            literal = match.group(1)
            if calculate_entropy(literal) >= 4.0 and not literal.startswith("sha256"):
                violations.append(f"High-entropy literal detected (entropy={calculate_entropy(literal):.2f})")

        # 2. AST Banned Constructs
        try:
            tree = ast.parse(source_code)
            for node in ast.walk(tree):
                # Banned imports
                if isinstance(node, ast.Import):
                    for alias in node.names:
                        mod = alias.name.split(".")[0]
                        if mod in self.BANNED_IMPORTS:
                            violations.append(f"Banned import: {alias.name}")
                        elif self.allowed_packages and mod not in self.allowed_packages:
                            violations.append(f"Unapproved external dependency (slopsquatting risk): {mod}")
                elif isinstance(node, ast.ImportFrom):
                    mod = (node.module or "").split(".")[0]
                    if mod in self.BANNED_IMPORTS:
                        violations.append(f"Banned from-import: {node.module}")
                    elif self.allowed_packages and mod not in self.allowed_packages:
                        violations.append(f"Unapproved external dependency: {mod}")

                # Banned function calls (eval, exec)
                elif isinstance(node, ast.Call):
                    if isinstance(node.func, ast.Name) and node.func.id in self.BANNED_FUNCTIONS:
                        violations.append(f"Banned unsafe built-in call: {node.func.id}()")

                    # subprocess with shell=True
                    if isinstance(node.func, ast.Attribute) and node.func.attr in ("run", "Popen", "call", "check_output"):
                        for kw in node.keywords:
                            if kw.arg == "shell" and isinstance(kw.value, ast.Constant) and kw.value.value is True:
                                violations.append("Banned dangerous parameter: shell=True in subprocess")

                    # yaml.load without SafeLoader
                    if isinstance(node.func, ast.Attribute) and node.func.attr == "load":
                        if isinstance(node.func.value, ast.Name) and node.func.value.id == "yaml":
                            has_loader = any(kw.arg == "Loader" for kw in node.keywords)
                            if not has_loader and len(node.args) < 2:
                                violations.append("Insecure yaml.load() call without SafeLoader")

        except SyntaxError:
            # If it's a unified diff, line prefixes may fail AST parse, fall back to regex scan
            if "shell=True" in source_code:
                violations.append("Banned dangerous parameter: shell=True in diff")
            if "pickle.loads" in source_code or "pickle.load" in source_code:
                violations.append("Banned unsafe deserialization: pickle.load")
            if "yaml.load(" in source_code and "SafeLoader" not in source_code:
                violations.append("Insecure yaml.load() without SafeLoader")

        return (len(violations) == 0), violations
