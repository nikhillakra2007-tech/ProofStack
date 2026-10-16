"""Nebius Token Factory Sandboxes (Contree) adapter. REST contract per docs.tokenfactory.nebius.com:
POST /v1/files (octet-stream) -> uuid ; POST /v1/instances -> 201 {uuid} ; GET /v1/operations/{uuid} until
SUCCESS | FAILED | CANCELLED. Auth: 'Authorization: Bearer <NEBIUS_API_KEY>' + 'Project: <NEBIUS_PROJECT_ID>'.
Network is OFF unless asked; credentials never enter the guest; a failed POST is never retried automatically.
"""
from __future__ import annotations

import base64
import json
import os
import time
import urllib.request

from proofstack.sandbox.backend import BASE_ENV, ExecResult, SandboxError, SubmissionUncertain

DEFAULT_BASE = "https://api.tokenfactory.nebius.com/sandboxes"
PENDING = {"PENDING", "ASSIGNED", "EXECUTING"}


def _text(stream: dict | None) -> tuple[str, bool]:
    if not stream:
        return "", False
    raw = stream.get("value", "")
    if stream.get("encoding") == "base64":
        raw = base64.b64decode(raw).decode("utf-8", "replace")
    return raw, bool(stream.get("truncated"))


class NebiusSandbox:
    name = "nebius-sandboxes"

    def __init__(self, base_url=None, api_key=None, project=None, sleep=time.sleep):
        self.base = (base_url or os.environ.get("CONTREE_BASE_URL") or DEFAULT_BASE).rstrip("/")
        self.headers = {"Authorization": f"Bearer {api_key or os.environ['NEBIUS_API_KEY']}",
                        "Project": project or os.environ["NEBIUS_PROJECT_ID"]}
        self.sleep = sleep

    def _call(self, method, path, body=None, ctype="application/json", timeout=15):
        data = body if isinstance(body, bytes) else (json.dumps(body).encode() if body is not None else None)
        headers = {**self.headers, **({"Content-Type": ctype} if data is not None else {})}
        req = urllib.request.Request(f"{self.base}/{path}", data=data, method=method, headers=headers)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            return r.status, json.loads(r.read() or b"null"), r.headers

    def upload(self, data: bytes) -> str:
        status, body, _ = self._call("POST", "v1/files", data, "application/octet-stream", timeout=60)
        if status != 201:
            raise SandboxError(f"file upload returned {status}")
        return body["uuid"]

    def run(self, image, argv=None, *, shell=None, timeout_s=60, network=False, env=None, files=None,
            retain=False, cwd=None, truncate_at=1_048_576, poll_deadline_s=None):
        """Exactly one of `argv` (direct exec; env is explicit) or `shell` (fixed, trusted text only)."""
        if (argv is None) == (shell is None):
            raise ValueError("pass exactly one of argv or shell")
        body = {"image": image, "timeout": int(timeout_s), "disposable": not retain,
                "networking": {"enabled": bool(network)}, "truncate_output_at": truncate_at}
        body.update({"command": shell, "shell": True} if shell is not None else
                    {"command": argv[0], "args": list(argv[1:]), "shell": False, "env": {**BASE_ENV, **(env or {})}})
        if cwd:
            body["cwd"] = cwd
        if files:
            body["files"] = {path: {"uuid": self.upload(data), "mode": "0644"} for path, data in files.items()}
        try:
            status, created, _ = self._call("POST", "v1/instances", body)
        except Exception as e:                                   # transit failure: outcome unknown
            raise SubmissionUncertain(f"POST /v1/instances failed in transit: {e!r}") from e
        if status != 201:
            raise SandboxError(f"spawn returned {status}")
        op, t0 = created["uuid"], time.monotonic()
        deadline = t0 + (poll_deadline_s or timeout_s + 120)
        while True:
            if time.monotonic() > deadline:
                raise SandboxError(f"polling deadline passed; inspect operation {op} before resubmitting")
            _, o, hdr = self._call("GET", f"v1/operations/{op}")
            if o["status"] in PENDING:
                ra = hdr.get("Retry-After", "1")
                self.sleep(min(max(1, int(ra)) if ra.isdecimal() else 1, 5))
                continue
            break
        if o["status"] != "SUCCESS":
            raise SandboxError(f"operation {op} ended as {o['status']}: {o.get('error')}")
        res = o["metadata"]["result"]
        st, rs = res.get("state", {}), res.get("resources", {})
        out, t1 = _text(res.get("stdout"))
        err, t2 = _text(res.get("stderr"))
        return ExecResult(self.name, op, image, o.get("result_image_uuid"), st.get("exit_code"), st.get("signal"),
                          bool(st.get("timed_out")), out, err, t1 or t2, rs.get("elapsed_time"), rs.get("max_rss"),
                          rs.get("user_cpu_time"), rs.get("system_cpu_time"))
