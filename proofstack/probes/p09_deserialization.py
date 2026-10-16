"""P09 - insecure deserialization & command injection, proven with a benign canary (mkdir in a temp dir).

params.channels = [{"fn": "load_config", "kind": "pickle|yaml|shell|eval"}, ...]
The payload only ever creates an empty directory; its existence proves attacker-controlled execution.
"""
import os
import pickle
import tempfile

from proofstack.probes._kit import run_cli, verdict


class Canary:
    def __init__(self, path):
        self.path = path

    def __reduce__(self):
        return (os.mkdir, (self.path,))


def payload(kind, path):
    return {"pickle": lambda: pickle.dumps(Canary(path)),
            "yaml": lambda: f"!!python/object/apply:os.mkdir ['{path}']",
            "shell": lambda: f"proofstack; mkdir {path}",
            "eval": lambda: f"__import__('os').mkdir({path!r})"}[kind]()


def detect(mod, p):
    hits = []
    with tempfile.TemporaryDirectory() as tmp:
        for i, ch in enumerate(p["channels"]):
            path = os.path.join(tmp, f"canary_{i}")
            try:
                getattr(mod, ch["fn"])(payload(ch["kind"], path))
            except Exception:
                pass
            if os.path.isdir(path):
                hits.append(ch)
    return verdict("P09", bool(hits), ["SEC"], {"channels_tested": len(p["channels"])},
                   {"executed": hits}, *[h["fn"] for h in hits])


if __name__ == "__main__":
    run_cli("P09", detect)
