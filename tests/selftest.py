"""Run every probe against its red and green fixtures. Usage: python tests/selftest.py [P01 P02 ...]"""
import json
import os
import subprocess
import sys
import time

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
J = json.dumps
CASES = []   # (probe, module, label, expected_found, argv-after-module)


def case(pid, mod, label, expect, *argv):
    CASES.append((pid, mod, label, expect, list(argv)))


def tgt(path, sym="", params=None):
    return ["--target", path + (f"::{sym}" if sym else ""), "--params", J(params or {})]


exec(open(os.path.join(ROOT, "tests", "make_fixtures.py")).read())
exec(open(os.path.join(ROOT, "tests", "cases.py")).read())

only = set(sys.argv[1:])
fails = 0
for pid, mod, label, expect, argv in CASES:
    if only and pid not in only:
        continue
    env = dict(os.environ, PROOFSTACK_SANDBOX="1", PYTHONPATH=ROOT, PYTHONDONTWRITEBYTECODE="1")
    t0 = time.time()
    try:
        wrap = [sys.executable, "-m", "proofstack.sandbox.guest_runner"] if os.environ.get("PS_WRAP") == "1" else []
        r = subprocess.run([*wrap, sys.executable, "-m", f"proofstack.probes.{mod}", *argv], cwd=ROOT, env=env,
                           capture_output=True, text=True, timeout=90)
        line = next((l for l in r.stdout.splitlines() if l.startswith("PROOFSTACK_FINDING ")), None)
        f = json.loads(line.split(" ", 1)[1]) if line else None
    except subprocess.TimeoutExpired:
        f, r = None, None
    ok = f is not None and f["found"] == expect and f["status"] != "INCONCLUSIVE"
    fails += not ok
    detail = (f"found={f['found']} {json.dumps(f['metrics'])[:110]}" if f else
              f"NO FINDING stderr={(r.stderr if r else 'timeout')[-300:]}")
    print(f"{'PASS' if ok else 'FAIL'} {pid} {label:<14} {time.time()-t0:5.1f}s  {detail}")
    if f and os.environ.get("PS_VERBOSE") == "1":
        print("      METRICS", json.dumps(f["metrics"], sort_keys=True)[:700]); print("      EVIDENCE", json.dumps(f["evidence"], sort_keys=True)[:700])
    if f and f["status"] == "INCONCLUSIVE":
        print("      ", f["evidence"])
print("selftest:", "ALL PASS" if not fails else f"{fails} FAILED")
sys.exit(1 if fails else 0)
