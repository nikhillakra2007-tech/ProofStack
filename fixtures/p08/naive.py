import ipaddress
import socket
import urllib.request
from urllib.parse import urlsplit


def fetch_url(url):                                        # "AI fix": validate, then let the client re-resolve
    ip = ipaddress.ip_address(socket.gethostbyname(urlsplit(url).hostname))
    if not ip.is_global:
        raise ValueError("blocked")
    return urllib.request.urlopen(url, timeout=2).read()
