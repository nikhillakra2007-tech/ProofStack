"""P18 - multi-service contract drift. Class B probe (JSON Schema, $ref pre-resolved).

CLI: python -m proofstack.probes.p18_contract_drift --old old.json --new new.json --mode FULL
         [--examples-old DIR --examples-new DIR]
BACKWARD: payloads written under OLD must validate under NEW (new readers, old writers).
FORWARD : payloads written under NEW must validate under OLD (old readers, new writers).
FULL    : both. Structural rules are checked first, then recorded example payloads are cross-validated.
"""
import argparse
import glob
import json
import os

from proofstack.probes._kit import emit, inconclusive, require_sandbox, verdict


def types_of(s):
    t = s.get("type")
    return None if t is None else set(t if isinstance(t, list) else [t])


def compat(w, r, path="$"):
    """Violations if data written under schema w would not validate under reader schema r."""
    out, tw, tr = [], types_of(w), types_of(r)
    if tw and tr and not tw <= tr and not (tw == {"integer"} and "number" in tr):
        out.append((path, f"type {sorted(tw)} not accepted by reader {sorted(tr)}"))
    if "enum" in r and ("enum" not in w or not {json.dumps(x) for x in w["enum"]} <= {json.dumps(x) for x in r["enum"]}):
        out.append((path, "writer may emit enum values the reader rejects"))
    wp, rp = w.get("properties", {}), r.get("properties", {})
    for name in r.get("required", []):
        if name not in w.get("required", []):
            out.append((f"{path}.{name}", "required by reader but not guaranteed by writer"))
    if r.get("additionalProperties") is False:
        out += [(f"{path}.{n}", "writer emits a property the reader forbids") for n in wp if n not in rp]
    for name in wp.keys() & rp.keys():
        out += compat(wp[name], rp[name], f"{path}.{name}")
    if "items" in w and "items" in r:
        out += compat(w["items"], r["items"], path + "[]")
    return out


PY = {"string": str, "integer": int, "number": (int, float), "boolean": bool, "array": list, "object": dict, "null": type(None)}


def valid(s, v):
    t = types_of(s)
    if t and not any(isinstance(v, PY[x]) and not (x in ("integer", "number") and isinstance(v, bool)) for x in t):
        return False
    if "enum" in s and v not in s["enum"]:
        return False
    if isinstance(v, dict):
        props = s.get("properties", {})
        if any(k not in v for k in s.get("required", [])):
            return False
        if s.get("additionalProperties") is False and any(k not in props for k in v):
            return False
        return all(valid(props[k], x) for k, x in v.items() if k in props)
    if isinstance(v, list) and "items" in s:
        return all(valid(s["items"], x) for x in v)
    return True


def load_dir(d):
    return [(os.path.basename(f), json.load(open(f))) for f in sorted(glob.glob(os.path.join(d, "*.json")))] if d else []


def main():
    ap = argparse.ArgumentParser(prog="P18")
    ap.add_argument("--old", required=True)
    ap.add_argument("--new", required=True)
    ap.add_argument("--mode", default="FULL", choices=["BACKWARD", "FORWARD", "FULL"])
    ap.add_argument("--examples-old")
    ap.add_argument("--examples-new")
    a = ap.parse_args()
    require_sandbox()
    try:
        old, new = json.load(open(a.old)), json.load(open(a.new))
        viol = []
        if a.mode in ("BACKWARD", "FULL"):
            viol += [("BACKWARD", *v) for v in compat(old, new)]
        if a.mode in ("FORWARD", "FULL"):
            viol += [("FORWARD", *v) for v in compat(new, old)]
        bad = []
        if a.mode in ("BACKWARD", "FULL"):
            bad += [("BACKWARD", n) for n, ex in load_dir(a.examples_old) if not valid(new, ex)]
        if a.mode in ("FORWARD", "FULL"):
            bad += [("FORWARD", n) for n, ex in load_dir(a.examples_new) if not valid(old, ex)]
        emit(verdict("P18", bool(viol or bad), ["CORR"], {"structural_violations": len(viol), "example_failures": len(bad)},
                     {"violations": viol[:10], "examples_rejected": bad[:10]}, *[v[:3] for v in viol], *bad))
    except Exception as exc:
        emit(inconclusive("P18", f"harness_error: {exc!r}"))


if __name__ == "__main__":
    main()
