"""P16 - green-but-dead tests (test theatre) by mutation. Class B probe.

CLI: python -m proofstack.probes.p16_mutation --src shop.py --cwd DIR --test-cmd '["python3","-m","unittest","-q"]'
Applies ONE AST mutation at a time in a throw-away copy of --cwd and reruns the tests. A mutant is
killed when the tests fail or time out. Red: kill rate NOT above --kill-min (default 0.80) over >= --min-mutants.
"""
import argparse
import ast
import copy
import json
import os
import random
import shutil
import subprocess
import tempfile

from proofstack.probes._kit import emit, inconclusive, require_sandbox, verdict

SWAP = {ast.Eq: ast.NotEq, ast.NotEq: ast.Eq, ast.Lt: ast.LtE, ast.LtE: ast.Lt, ast.Gt: ast.GtE, ast.GtE: ast.Gt,
        ast.Is: ast.IsNot, ast.IsNot: ast.Is, ast.In: ast.NotIn, ast.NotIn: ast.In,
        ast.Add: ast.Sub, ast.Sub: ast.Add, ast.Mult: ast.Add, ast.And: ast.Or, ast.Or: ast.And}


class Mut(ast.NodeTransformer):
    """k = index of the single mutation site to apply (-1 = count sites only)."""

    def __init__(self, k=-1):
        self.k, self.n, self.desc = k, 0, ""

    def hit(self, node, what):
        i, self.n = self.n, self.n + 1
        if i == self.k:
            self.desc = f"line {node.lineno}: {what}"
        return i == self.k

    def visit_Compare(self, node):
        self.generic_visit(node)
        for j, op in enumerate(node.ops):
            new = SWAP.get(type(op))
            if new and self.hit(node, f"{type(op).__name__}->{new.__name__}"):
                node.ops[j] = new()
        return node

    def visit_BinOp(self, node):
        self.generic_visit(node)
        new = SWAP.get(type(node.op))
        if new and self.hit(node, f"{type(node.op).__name__}->{new.__name__}"):
            node.op = new()
        return node

    def visit_BoolOp(self, node):
        self.generic_visit(node)
        new = SWAP.get(type(node.op))
        if new and self.hit(node, f"{type(node.op).__name__}->{new.__name__}"):
            node.op = new()
        return node

    def visit_Constant(self, node):
        if isinstance(node.value, bool):
            return ast.Constant(not node.value) if self.hit(node, "bool flip") else node
        if isinstance(node.value, int):
            return ast.Constant(node.value + 1) if self.hit(node, "int+1") else node
        return node

    def visit_Return(self, node):
        self.generic_visit(node)
        v = node.value
        if v is not None and not (isinstance(v, ast.Constant) and v.value is None) and self.hit(node, "return->None"):
            node.value = ast.Constant(None)
        return node

    def visit_If(self, node):
        self.generic_visit(node)
        if self.hit(node, "negate condition"):
            node.test = ast.UnaryOp(ast.Not(), node.test)
        return node


def passes(cwd, cmd, timeout):
    try:
        return subprocess.run(cmd, cwd=cwd, capture_output=True, timeout=timeout).returncode == 0
    except subprocess.TimeoutExpired:
        return False


def main():
    ap = argparse.ArgumentParser(prog="P16")
    ap.add_argument("--src", required=True, help="source file relative to --cwd")
    ap.add_argument("--cwd", required=True)
    ap.add_argument("--test-cmd", required=True, help="JSON argv list")
    ap.add_argument("--max-mutants", type=int, default=40)
    ap.add_argument("--min-mutants", type=int, default=10)
    ap.add_argument("--kill-min", type=float, default=0.80)
    ap.add_argument("--timeout", type=int, default=30)
    a = ap.parse_args()
    require_sandbox()
    try:
        cmd = json.loads(a.test_cmd)
        if not passes(a.cwd, cmd, a.timeout):
            emit(inconclusive("P16", "baseline tests do not pass; mutation score is undefined"))
        tree = ast.parse(open(os.path.join(a.cwd, a.src)).read())
        counter = Mut(-1)
        counter.visit(copy.deepcopy(tree))
        sites = list(range(counter.n))
        if len(sites) < a.min_mutants:
            emit(inconclusive("P16", f"only {len(sites)} mutation sites (< {a.min_mutants})"))
        random.Random(1337).shuffle(sites)
        survived, killed = [], 0
        for k in sorted(sites[:a.max_mutants]):
            m = Mut(k)
            src = ast.unparse(ast.fix_missing_locations(m.visit(copy.deepcopy(tree))))
            with tempfile.TemporaryDirectory() as tmp:
                work = os.path.join(tmp, "w")
                shutil.copytree(a.cwd, work, ignore=shutil.ignore_patterns("__pycache__"))
                with open(os.path.join(work, a.src), "w") as f:
                    f.write(src)
                if passes(work, cmd, a.timeout):
                    survived.append(m.desc)
                else:
                    killed += 1
        total = killed + len(survived)
        rate = killed / total
        emit(verdict("P16", rate <= a.kill_min, ["CORR"],
                     {"mutants": total, "killed": killed, "kill_rate": round(rate, 3)},
                     {"survivors": survived[:10]}, "hollow_tests"))
    except Exception as exc:
        emit(inconclusive("P16", f"harness_error: {exc!r}"))


if __name__ == "__main__":
    main()
