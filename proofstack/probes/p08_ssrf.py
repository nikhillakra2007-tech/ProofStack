"""P08 - server-side request forgery in URL fetchers. Target: fetch_url(url:str) -> Any.

A decoy listener on loopback emulates the cloud metadata service. ANY inbound request is SSRF proven.
Vectors: loopback spellings (decimal, hex, short, 0.0.0.0, userinfo, IPv6, v4-mapped) and a DNS-rebinding
host that resolves public on the first lookup and loopback afterwards (validate-then-fetch bugs).
"""
import http.server
import socket
import threading

from proofstack.probes._kit import run_cli, verdict

CANARY = "PROOFSTACK_METADATA_CANARY"
HITS: list[str] = []


class Decoy(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        HITS.append(self.path)
        if self.path.startswith("/redir"):
            self.send_response(302)
            self.send_header("Location", f"http://127.0.0.1:{self.server.server_port}/latest/meta-data/")
            self.end_headers()
            return
        body = CANARY.encode()
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *a):
        pass


class V6(http.server.ThreadingHTTPServer):
    address_family = socket.AF_INET6


def serve(cls, host):
    try:
        srv = cls((host, 0), Decoy)
    except OSError:
        return None
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    return srv


def patch_dns():
    real_gai, real_ghbn, n = socket.getaddrinfo, socket.gethostbyname, {"c": 0}

    def ip_for():
        n["c"] += 1
        return "93.184.216.34" if n["c"] == 1 else "127.0.0.1"          # public first, loopback after

    def gai(host, port, *a, **k):
        if host == "rebind.test":
            return [(socket.AF_INET, socket.SOCK_STREAM, 6, "", (ip_for(), int(port or 0)))]
        return real_gai(host, port, *a, **k)

    socket.getaddrinfo = gai
    socket.gethostbyname = lambda h: ip_for() if h == "rebind.test" else real_ghbn(h)
    return n


def detect(fetch, p):
    v4, v6 = serve(http.server.ThreadingHTTPServer, "127.0.0.1"), serve(V6, "::1")
    p4, counter = v4.server_port, patch_dns()
    vectors = {
        "loopback": f"http://127.0.0.1:{p4}/latest/meta-data/iam/security-credentials/",
        "localhost": f"http://localhost:{p4}/latest/meta-data/",
        "decimal": f"http://2130706433:{p4}/", "hex": f"http://0x7f.0.0.1:{p4}/",
        "short": f"http://127.1:{p4}/", "zero": f"http://0.0.0.0:{p4}/",
        "userinfo": f"http://example.com@127.0.0.1:{p4}/", "v4mapped": f"http://[::ffff:127.0.0.1]:{p4}/",
        "rebind": f"http://rebind.test:{p4}/redir",
    }
    if v6:
        vectors["ipv6"] = f"http://[::1]:{v6.server_port}/"
    hit_by, leaked = {}, []
    for name, url in vectors.items():
        before, box, counter["c"] = len(HITS), {}, 0

        def go():
            try:
                box["body"] = fetch(url)
            except Exception:
                pass
        th = threading.Thread(target=go, daemon=True)
        th.start()
        th.join(6)
        if len(HITS) > before:
            hit_by[name] = len(HITS) - before
        if CANARY in str(box.get("body", "")):
            leaked.append(name)
    found = bool(hit_by or leaked)
    return verdict("P08", found, ["SEC"], {"vectors_tested": len(vectors), "decoy_hits": len(HITS)},
                   {"vectors_hit": sorted(hit_by), "body_leaked": leaked}, *sorted(hit_by))


if __name__ == "__main__":
    run_cli("P08", detect)
