import base64
import hashlib
import hmac
import json
import secrets
import time

SECRET = b"fixture-signing-key"
ALLOWED_ALGS = ("HS256",)                                     # pinned: never read from the token


def _e(b):
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()


def _d(s):
    return base64.urlsafe_b64decode(s + "=" * (-len(s) % 4))


def _sign(msg):
    return _e(hmac.new(SECRET, msg.encode(), hashlib.sha256).digest())


def issue_token(sub, ttl=3600):
    h = _e(json.dumps({"alg": "HS256", "typ": "JWT"}).encode())
    p = _e(json.dumps({"sub": sub, "exp": int(time.time()) + ttl}).encode())
    return f"{h}.{p}.{_sign(h + '.' + p)}"


def verify_token(token):
    h, p, s = token.split(".")
    if json.loads(_d(h)).get("alg") not in ALLOWED_ALGS:
        raise ValueError("algorithm not allowed")
    if not hmac.compare_digest(s, _sign(h + "." + p)):
        raise ValueError("bad signature")
    claims = json.loads(_d(p))
    if claims.get("exp", 0) <= time.time():
        raise ValueError("expired")
    return claims


def new_token():
    return secrets.token_urlsafe(24)                          # CSPRNG, 192 bits
