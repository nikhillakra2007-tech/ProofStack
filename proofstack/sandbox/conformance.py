"""Isolation conformance checks. Run INSIDE a freshly provisioned sandbox: `proofstack doctor --check sandbox`.
Exit 0 only if every applicable check passes; prints one JSON line per check."""
import json
import os
import resource
import socket
import sys
import threading


def check_network_off():
    ifaces = [i for i in os.listdir("/sys/class/net")] if os.path.isdir("/sys/class/net") else []
    return ifaces == ["lo"], f"interfaces={ifaces}"


def check_egress_blocked():
    try:
        socket.create_connection(("1.1.1.1", 53), timeout=3).close()
        return False, "outbound TCP succeeded"
    except OSError as e:
        return True, f"blocked: {e.__class__.__name__}"


def check_no_credentials():
    bad = [k for k in os.environ if any(s in k.upper() for s in ("API_KEY", "TOKEN", "SECRET", "PASSWORD", "NEBIUS"))]
    return not bad, f"credential-like env vars={bad}"


def check_rlimits():
    as_soft = resource.getrlimit(resource.RLIMIT_AS)[0]
    nproc = resource.getrlimit(resource.RLIMIT_NPROC)[0]
    return 0 < as_soft <= (1 << 30) and 0 < nproc <= 128, f"AS={as_soft} NPROC={nproc}"


def check_readonly_mount(path="/proofstack/ro"):
    if not os.path.isdir(path):
        return True, "no read-only mount configured (skipped)"
    try:
        open(os.path.join(path, ".probe"), "w").close()
        return False, "write to read-only mount succeeded"
    except OSError:
        return True, "write refused"


def check_thread_bomb_capped():
    stop, started = threading.Event(), 0
    try:
        for _ in range(400):
            threading.Thread(target=stop.wait, daemon=True).start()
            started += 1
    except RuntimeError:
        pass
    finally:
        stop.set()
    return started < 400, f"threads started before refusal={started}"


def main():
    skip = set(sys.argv[1:])
    ok_all = True
    for name, fn in [("network_off", check_network_off), ("egress_blocked", check_egress_blocked),
                     ("no_credentials", check_no_credentials), ("rlimits", check_rlimits),
                     ("readonly_mount", check_readonly_mount), ("process_cap", check_thread_bomb_capped)]:
        if name in skip:
            continue
        ok, detail = fn()
        ok_all &= ok
        print(json.dumps({"check": name, "ok": ok, "detail": detail}))
    sys.exit(0 if ok_all else 1)


if __name__ == "__main__":
    main()
