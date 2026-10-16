"""P10 - missing HTTP timeouts and runaway retry loops. Target: call_service(url) -> Any (outbound HTTP).

Stubs on loopback: a black hole (accepts TCP, never answers) and an always-503 server that timestamps
every attempt. params: budget_s (default 5), max_attempts (default 5).
Red: runs past budget_s, retries more than max_attempts, or hot-loops (>= 4 attempts, all gaps < 10 ms).
"""
import http.server
import socket
import threading
import time

from proofstack.probes._kit import run_cli, verdict

STAMPS: list[float] = []


def blackhole():
    s = socket.socket()
    s.bind(("127.0.0.1", 0))
    s.listen(128)
    held = []

    def loop():
        while True:
            held.append(s.accept()[0])
    threading.Thread(target=loop, daemon=True).start()
    return s.getsockname()[1]


class Flaky(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        STAMPS.append(time.monotonic())
        self.send_response(503)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def log_message(self, *a):
        pass


def run(fn, url, wait_s):
    box = {}

    def go():
        t = time.monotonic()
        try:
            box["ret"] = fn(url)
        except Exception as e:
            box["exc"] = repr(e)
        box["elapsed"] = time.monotonic() - t
    th = threading.Thread(target=go, daemon=True)
    th.start()
    th.join(wait_s)
    return th.is_alive(), box.get("elapsed", wait_s)


def detect(fn, p):
    budget, max_attempts = p.get("budget_s", 5.0), p.get("max_attempts", 5)
    hung_bh, el_bh = run(fn, f"http://127.0.0.1:{blackhole()}/", budget + 2)
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Flaky)
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    hung_f, el_f = run(fn, f"http://127.0.0.1:{srv.server_port}/", budget + 2)
    stamps = list(STAMPS)
    gaps = [b - a for a, b in zip(stamps, stamps[1:])]
    over_budget = hung_bh or hung_f or el_bh > budget or el_f > budget
    storm = len(stamps) > max_attempts
    hot = len(stamps) >= 4 and max(gaps, default=1.0) < 0.01
    return verdict("P10", over_budget or storm or hot, ["CONC", "SEC"],
                   {"blackhole_s": round(el_bh, 2), "flaky_s": round(el_f, 2), "attempts_on_503": len(stamps),
                    "max_gap_ms": round(max(gaps, default=0.0) * 1e3, 1)},
                   {"over_budget": over_budget, "retry_storm": storm, "hot_loop": hot}, over_budget, storm, hot)


if __name__ == "__main__":
    run_cli("P10", detect)
