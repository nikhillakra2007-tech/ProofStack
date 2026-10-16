"""P11 - broken JWT validation & weak token generation (forging with stdlib only).

Target module: verify_token(token)->claims (raises on invalid) ; issue_token(sub, ttl=3600)->str ;
new_token()->str (opaque session / reset / API token). Red if any forged token is accepted, or if
new_token() is predictable: deterministic after random.seed(), constant under frozen time, colliding,
or below 128 bits of estimated entropy.
"""
import base64
import json
import math
import random
import time

from proofstack.probes._kit import run_cli, verdict


def b64(obj) -> str:
    return base64.urlsafe_b64encode(json.dumps(obj, separators=(",", ":")).encode()).rstrip(b"=").decode()


def accepted(mod, token):
    try:
        return mod.verify_token(token)
    except Exception:
        return None


def detect(mod, p):
    claims = {"sub": "admin", "role": "admin", "exp": int(time.time()) + 3600}
    forged = {f"alg_{a}": f"{b64({'alg': a, 'typ': 'JWT'})}.{b64(claims)}." for a in ("none", "None", "NONE", "nOnE")}
    head, body, sig = mod.issue_token("alice").split(".")
    forged["tampered_payload"] = f"{head}.{b64(claims)}.{sig}"
    forged["stripped_signature"] = f"{head}.{body}."
    if p.get("check_expiry", True):
        forged["expired_but_signed"] = mod.issue_token("alice", ttl=-60)
    broken = sorted(k for k, t in forged.items() if accepted(mod, t) is not None)

    weak = []
    random.seed(1337)
    a = mod.new_token()
    random.seed(1337)
    if a == mod.new_token():
        weak.append("deterministic_after_random_seed")
    real_time, time.time = time.time, (lambda: 1_700_000_000.0)
    try:
        if mod.new_token() == mod.new_token():
            weak.append("constant_under_frozen_time")
    finally:
        time.time = real_time
    toks = [mod.new_token() for _ in range(2000)]
    if len(set(toks)) != len(toks):
        weak.append("collisions")
    bits = len(toks[0]) * math.log2(max(len(set("".join(toks))), 2))
    if bits < 128:
        weak.append(f"entropy_below_128_bits({bits:.0f})")
    return verdict("P11", bool(broken or weak), ["SEC"], {"forgeries_tried": len(forged), "est_entropy_bits": round(bits)},
                   {"forged_tokens_accepted": broken, "weak_token_generation": weak}, *broken, *weak)


if __name__ == "__main__":
    run_cli("P11", detect)
