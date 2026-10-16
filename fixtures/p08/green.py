import http.client
import ipaddress
import socket
from urllib.parse import urlsplit


def _global_ip(ip: str) -> str:
    a = ipaddress.ip_address(ip)
    if isinstance(a, ipaddress.IPv6Address) and a.ipv4_mapped:
        a = a.ipv4_mapped                                  # unwrap ::ffff:127.0.0.1
    if not a.is_global:
        raise ValueError(f"blocked address {a}")
    return str(a)


def fetch_url(url, timeout=2.0):
    u = urlsplit(url)
    if u.scheme != "http" or not u.hostname:               # https: connect to the pinned IP, keep SNI = hostname
        raise ValueError("unsupported url")
    port = u.port or 80
    infos = socket.getaddrinfo(u.hostname, port, type=socket.SOCK_STREAM)    # resolve exactly once
    ip = sorted({_global_ip(i[4][0]) for i in infos})[0]                      # every answer must be global
    conn = http.client.HTTPConnection(ip, port, timeout=timeout)              # connect to the PINNED ip
    conn.request("GET", (u.path or "/") + (f"?{u.query}" if u.query else ""), headers={"Host": u.netloc})
    r = conn.getresponse()
    if 300 <= r.status < 400:
        raise ValueError("redirects are not followed")
    return r.read(1_000_000)
