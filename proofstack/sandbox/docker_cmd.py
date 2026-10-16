"""Fallback isolation: hardened `docker run` argv builder (never a bare subprocess). Pure function => unit-testable."""
from __future__ import annotations


def docker_argv(image: str, argv: list[str], *, workdir_host: str, ro_mounts: dict | None = None, timeout_s: int = 60,
                mem: str = "1g", pids: int = 128, cpus: str = "1", network: bool = False, env: dict | None = None):
    cmd = ["docker", "run", "--rm", "--read-only", "--cap-drop", "ALL", "--security-opt", "no-new-privileges",
           "--pids-limit", str(pids), "--memory", mem, "--memory-swap", mem, "--cpus", cpus, "--user", "65534:65534",
           "--tmpfs", "/tmp:rw,noexec,nosuid,size=256m", "--stop-timeout", "1"]
    cmd += ["--network", "bridge" if network else "none"]
    cmd += ["-v", f"{workdir_host}:/work:rw", "-w", "/work"]
    for host, guest in (ro_mounts or {}).items():                  # tests / benchmarks / policy: read-only
        cmd += ["-v", f"{host}:{guest}:ro"]
    for k, v in {"PROOFSTACK_SANDBOX": "1", "PYTHONDONTWRITEBYTECODE": "1", **(env or {})}.items():
        cmd += ["-e", f"{k}={v}"]
    return ["timeout", "--signal=KILL", str(timeout_s + 5), *cmd, image, *argv]
