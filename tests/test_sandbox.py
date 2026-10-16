"""Tests for ProofStack sandbox adapter, docker arguments, and guest runner."""
import base64
import http.server
import json
import os
import subprocess
import sys
import threading
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from proofstack.sandbox.backend import SandboxError, SubmissionUncertain
from proofstack.sandbox.nebius import NebiusSandbox
from proofstack.sandbox.docker_cmd import docker_argv

b64 = lambda s: base64.b64encode(s.encode()).decode()


def test_nebius_adapter():
    REQS, POLLS, MODE = [], {"n": 0}, {"kind": "ok"}

    class H(http.server.BaseHTTPRequestHandler):
        def _send(self, code, obj, hdr=None):
            b = json.dumps(obj).encode()
            self.send_response(code)
            self.send_header("Content-Length", str(len(b)))
            for k, v in (hdr or {}).items():
                self.send_header(k, v)
            self.end_headers()
            self.wfile.write(b)

        def do_POST(self):
            body = self.rfile.read(int(self.headers.get("Content-Length", 0)))
            REQS.append((self.path, dict(self.headers), body))
            if self.path == "/sandboxes/v1/files":
                return self._send(201, {"uuid": "file-1", "sha256": "0" * 64, "size": len(body)})
            if self.path == "/sandboxes/v1/instances":
                POLLS["n"] = 0
                return self._send(201, {"uuid": "op-1"}, {"Location": "/v1/operations/op-1"})
            self._send(404, {"error": "no"})

        def do_GET(self):
            REQS.append((self.path, dict(self.headers), b""))
            POLLS["n"] += 1
            if POLLS["n"] == 1:
                return self._send(200, {"uuid": "op-1", "status": "EXECUTING"}, {"Retry-After": "1"})
            k = MODE["kind"]
            if k == "failed":
                return self._send(200, {"uuid": "op-1", "status": "FAILED", "error": "capacity"})
            state = {"exit_code": 0, "signal": -1, "timed_out": False} if k == "ok" else {"exit_code": -1, "signal": 9, "timed_out": True}
            res = {"state": state, "stdout": {"value": b64('PROOFSTACK_FINDING {"found": false}\n'), "encoding": "base64", "truncated": False},
                   "stderr": {"value": "", "encoding": "ascii"}, "resources": {"elapsed_time": 1.5, "max_rss": 20480, "user_cpu_time": 0.4, "system_cpu_time": 0.1}}
            self._send(200, {"uuid": "op-1", "status": "SUCCESS", "result_image_uuid": None, "metadata": {"result": res}})

        def log_message(self, *a):
            pass

    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), H)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    try:
        sb = NebiusSandbox(f"http://127.0.0.1:{srv.server_port}/sandboxes", "test-key", "proj-1", sleep=lambda s: None)
        r = sb.run("img-uuid", ["python3", "-m", "proofstack.probes.p01_redos", "--target", "x.py"], timeout_s=30, files={"/work/a.txt": b"hi"})
        assert r.ok and r.stdout.startswith("PROOFSTACK_FINDING") and r.max_rss_kb == 20480 and r.wall_s == 1.5, r
        posts = [x for x in REQS if x[0].endswith("/instances")]
        body = json.loads(posts[0][2])
        assert posts[0][1]["Authorization"] == "Bearer test-key" and posts[0][1]["Project"] == "proj-1"
        assert body["networking"] == {"enabled": False} and body["disposable"] is True and body["shell"] is False
        assert body["env"]["PROOFSTACK_SANDBOX"] == "1" and "NEBIUS_API_KEY" not in body["env"]
        assert body["files"]["/work/a.txt"]["uuid"] == "file-1" and body["timeout"] == 30
        MODE["kind"] = "timeout"
        r = sb.run("img", shell="sleep 99", timeout_s=1)
        assert r.timed_out and not r.ok
        MODE["kind"] = "failed"
        with pytest.raises(SandboxError, match="FAILED"):
            sb.run("img", ["true"])
        dead = NebiusSandbox("http://127.0.0.1:9/sandboxes", "k", "p")
        with pytest.raises(SubmissionUncertain):
            dead.run("img", ["true"])
        with pytest.raises(ValueError):
            sb.run("img")
    finally:
        srv.shutdown()


def test_docker_argv():
    d = docker_argv("python:3.12-slim", ["python", "-m", "x"], workdir_host="/tmp/w", ro_mounts={"/tmp/tests": "/tests"})
    for flag in ("--network", "none", "--read-only", "--cap-drop", "ALL", "no-new-privileges", "--pids-limit", "/tests:ro"):
        assert flag in " ".join(d) or flag in d, flag
    assert d[d.index("--network") + 1] == "none" and d[0] == "timeout"


def test_guest_runner():
    resource = pytest.importorskip("resource", reason="resource module required (Unix-only)")
    root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    env = dict(os.environ, NEBIUS_API_KEY="leak-me", PROOFSTACK_SANDBOX="1", PYTHONPATH=root)
    g = [sys.executable, "-m", "proofstack.sandbox.guest_runner"]
    out = subprocess.run(
        g + [sys.executable, "-c", "import os,resource;print(sorted(k for k in os.environ if 'NEBIUS' in k), resource.getrlimit(resource.RLIMIT_AS)[0])"],
        env=env, capture_output=True, text=True, cwd=root
    )
    assert out.stdout.startswith("[] 1073741824")
    mem = subprocess.run(g + [sys.executable, "-c", "x = bytearray(2 << 30)"], env=env, capture_output=True, text=True, cwd=root)
    assert mem.returncode != 0 and "MemoryError" in mem.stderr
    c = subprocess.run(g + [sys.executable, "-m", "proofstack.sandbox.conformance", "network_off"], env=dict(os.environ, PYTHONPATH=root), capture_output=True, text=True, cwd=root)
    assert c.returncode == 0 or c.returncode == 1


if __name__ == "__main__":
    test_nebius_adapter()
    test_docker_argv()
    try:
        test_guest_runner()
    except pytest.skip.Exception:
        print("guest_runner skipped on this platform")
    print("ALL SANDBOX TESTS PASS")
