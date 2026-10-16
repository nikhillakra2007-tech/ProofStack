"""In-guest launcher (runs INSIDE the sandbox VM/container). Applies resource ceilings the Sandboxes spawn API does
not expose (address space, processes, file size, core, fds, CPU seconds), scrubs the environment, then execs.
Usage: python guest_runner.py <argv...>   (limits overridable via PS_LIMIT_<NAME> for conformance tests only)
"""
import os
import resource
import sys

LIMITS = {"AS": 1 << 30, "NPROC": 128, "FSIZE": 64 << 20, "CORE": 0, "NOFILE": 256, "CPU": 120}
ALLOWED_ENV = {"PATH", "HOME", "LANG", "TZ", "PYTHONHASHSEED", "PYTHONDONTWRITEBYTECODE", "PYTHONPATH",
               "PROOFSTACK_SANDBOX"}


def main() -> None:
    for name, hard in LIMITS.items():
        resource.setrlimit(getattr(resource, f"RLIMIT_{name}"), (hard, hard))
    env = {k: v for k, v in os.environ.items() if k in ALLOWED_ENV}
    os.execvpe(sys.argv[1], sys.argv[1:], env)


if __name__ == "__main__":
    main()
