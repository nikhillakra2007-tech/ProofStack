"""
ProofStack Phase Verification and Defense Engine.
Executes full regression tests, security boundary validation, model integration checks,
ledger integrity auditing, and frontend build verification.
Exits 0 if all mandatory checks pass; exits non-zero on any failure.
"""
import os
import subprocess
import sys
import time


def log(msg: str):
    print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] {msg}")


def run_step(name: str, cmd: list[str], cwd: str = ".") -> bool:
    log(f"--> [RUNNING] {name}...")
    t0 = time.time()
    try:
        env = os.environ.copy()
        env["PYTHONPATH"] = "."
        res = subprocess.run(cmd, cwd=cwd, env=env, capture_output=True, text=True)
        dur = time.time() - t0
        if res.returncode == 0:
            log(f"--> [PASS] {name} ({dur:.2f}s)")
            return True
        else:
            log(f"--> [FAIL] {name} ({dur:.2f}s) - Exit {res.returncode}")
            if res.stdout:
                print(res.stdout[-1500:])
            if res.stderr:
                print(res.stderr[-1500:], file=sys.stderr)
            return False
    except Exception as e:
        log(f"--> [ERROR] {name}: {e}")
        return False


def main():
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    os.chdir(root_dir)
    log(f"Starting ProofStack Verification Engine from {root_dir}")

    checks = [
        ("Python Test Suite (76 tests: API, Core, DB, LLM, Model, Benchmarks, Remediation, Sandbox)",
         [sys.executable, "-m", "pytest", "tests/", "-q"]),
        ("PSEC IDOR Self-Test (Red/Green Exploit Validation)",
         [sys.executable, "tests/selftest.py", "P03"]),
        ("Model Subsystem Unit & Safety Tests",
         [sys.executable, "-m", "pytest", "tests/test_model_service.py", "tests/test_model_api.py", "-q"]),
        ("Frontend Production Build & Typecheck (Next.js)",
         ["npm.cmd", "run", "build"], "frontend"),
    ]

    failed = []
    for item in checks:
        if len(item) == 3:
            name, cmd, cwd = item
        else:
            name, cmd = item
            cwd = root_dir

        success = run_step(name, cmd, cwd=cwd)
        if not success:
            failed.append(name)

    print("\n" + "=" * 60)
    if failed:
        log(f"VERIFICATION FAILED: {len(failed)} step(s) failed:")
        for f in failed:
            print(f"  - {f}")
        sys.exit(1)
    else:
        log("ALL MANDATORY VERIFICATION CHECKS PASSED (100% GREEN)")
        sys.exit(0)


if __name__ == "__main__":
    main()
