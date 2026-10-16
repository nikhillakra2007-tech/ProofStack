"""P13 - slopsquatting & hardcoded-secret pre-gate (sandbox half). Class B probe: static only.

CLI: python -m proofstack.probes.p13_supply_chain --root DIR --files app.py requirements.txt pyproject.toml
No network, no code executed. Emits third-party imports and declared dependencies for the controller's
RegistryOracle (the only component allowed to query the package index), plus secret findings.
Secret values are never emitted: only file, line, kind and a digest prefix.
"""
import argparse
import ast
import hashlib
import math
import os
import re
import sys
import tomllib
from collections import Counter

from proofstack.probes._kit import emit, inconclusive, require_sandbox, verdict

SECRET_NAME = re.compile(r"(?i)(secret|token|passwd|password|api[_-]?key|credential|private[_-]?key)")
SIGNATURES = {"aws_access_key_id": r"AKIA[0-9A-Z]{16}", "github_token": r"gh[pousr]_[A-Za-z0-9]{36,}",
              "slack_token": r"xox[baprs]-[A-Za-z0-9-]{10,}", "google_api_key": r"AIza[0-9A-Za-z_\-]{35}",
              "stripe_live_key": r"sk_live_[0-9a-zA-Z]{24,}", "private_key_block": r"-----BEGIN [A-Z ]*PRIVATE KEY-----"}
PLACEHOLDER = re.compile(r"(?i)(example|changeme|your[_-]|xxxx|<.*>|\$\{|dummy|placeholder)")
LOG_FUNCS = {"debug", "info", "warning", "warn", "error", "exception", "critical", "log", "print"}


def entropy(s: str) -> float:
    c, n = Counter(s), len(s)
    return -sum(v / n * math.log2(v / n) for v in c.values())


def suspicious(v: str) -> bool:
    return len(v) >= 12 and not re.search(r"\s", v) and entropy(v) >= 3.0 and not PLACEHOLDER.search(v)


def norm(n: str) -> str:
    return re.sub(r"[-_.]+", "-", n).lower()


def scan_py(rel, src, local):
    imports, secrets, logged = set(), [], []
    tree = ast.parse(src)

    def flag(node, kind, value=""):
        secrets.append({"file": rel, "line": node.lineno, "kind": kind,
                        "digest": hashlib.sha256(value.encode()).hexdigest()[:8]})
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            imports.update(a.name.split(".")[0] for a in node.names)
        elif isinstance(node, ast.ImportFrom) and node.level == 0 and node.module:
            imports.add(node.module.split(".")[0])
        elif isinstance(node, ast.Constant) and isinstance(node.value, str):
            for kind, rx in SIGNATURES.items():
                if re.search(rx, node.value):
                    flag(node, kind, node.value)
        elif isinstance(node, (ast.Assign, ast.AnnAssign)):
            val = node.value
            names = [t.id if isinstance(t, ast.Name) else getattr(t, "attr", "")
                     for t in (node.targets if isinstance(node, ast.Assign) else [node.target])]
            if isinstance(val, ast.Constant) and isinstance(val.value, str) and suspicious(val.value) \
                    and any(SECRET_NAME.search(n) for n in names):
                flag(node, "high_entropy_secret_assignment", val.value)
        elif isinstance(node, ast.keyword) and node.arg and SECRET_NAME.search(node.arg):
            if isinstance(node.value, ast.Constant) and isinstance(node.value.value, str) and suspicious(node.value.value):
                flag(node.value, "secret_keyword_argument", node.value.value)
        elif isinstance(node, ast.Call):
            f = node.func
            name = f.attr if isinstance(f, ast.Attribute) else getattr(f, "id", "")
            if name in LOG_FUNCS:
                for sub in (n for a in [*node.args, *[k.value for k in node.keywords]] for n in ast.walk(a)):
                    ident = sub.id if isinstance(sub, ast.Name) else getattr(sub, "attr", "") if isinstance(sub, ast.Attribute) else ""
                    if ident and SECRET_NAME.search(ident):
                        logged.append({"file": rel, "line": node.lineno, "name": ident})
    return imports - set(sys.stdlib_module_names) - local - {"__future__"}, secrets, logged


def scan_deps(rel, text):
    if rel.endswith("pyproject.toml"):
        d = tomllib.loads(text)
        deps = list(d.get("project", {}).get("dependencies", []))
        deps += [x for v in d.get("project", {}).get("optional-dependencies", {}).values() for x in v]
        deps += [k for k in d.get("tool", {}).get("poetry", {}).get("dependencies", {}) if k.lower() != "python"]
    else:
        deps = [ln.strip() for ln in text.splitlines() if ln.strip() and not ln.lstrip().startswith(("#", "-"))]
    return {norm(m.group(0)) for x in deps if (m := re.match(r"[A-Za-z0-9][A-Za-z0-9._\-]*", x))}


def main():
    ap = argparse.ArgumentParser(prog="P13")
    ap.add_argument("--root", required=True)
    ap.add_argument("--files", nargs="+", required=True)
    ap.add_argument("--local-roots", nargs="*", default=None)
    a = ap.parse_args()
    require_sandbox()
    try:
        local = set()
        for r in a.local_roots or [a.root]:
            for e in os.listdir(r):
                local.add(e[:-3] if e.endswith(".py") else e)
        imports, secrets, logged, declared = set(), [], [], set()
        for rel in a.files:
            text = open(os.path.join(a.root, rel), encoding="utf-8").read()
            if rel.endswith(".py"):
                i, s, lg = scan_py(rel, text, local)
                imports |= i
                secrets += s
                logged += lg
            elif rel.endswith(("requirements.txt", "pyproject.toml")) or "requirements" in rel:
                declared |= scan_deps(rel, text)
        ev = {"third_party_imports": sorted(imports), "declared_dependencies": sorted(declared),
              "secrets": secrets, "secrets_logged": logged, "needs_registry_check": True}
        emit(verdict("P13", bool(secrets or logged), ["SEC"], {"imports": len(imports), "declared": len(declared)},
                     ev, *[(s["file"], s["line"], s["kind"]) for s in secrets], *[(x["file"], x["line"]) for x in logged]))
    except Exception as exc:
        emit(inconclusive("P13", f"harness_error: {exc!r}"))


if __name__ == "__main__":
    main()
