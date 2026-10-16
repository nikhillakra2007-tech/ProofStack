"""P14 - swallowed exceptions & mutable default arguments (silent state corruption).

params: {"inject": "dep.fetch", "call": {"fn": "process", "args": [...]},
         "defaults": {"fn": "collect", "args_a": [...], "args_b": [...]}}
Failure injection replaces a dependency with a function raising ConnectionError(MARK); the injected
failure must reach the caller (directly or via __cause__/__context__). Defaults are snapshotted and
compared after two calls: any mutation proves state leaking across calls.
"""
import copy
import inspect

from proofstack.probes._kit import run_cli, verdict

MARK = "PS_INJECTED_FAILURE"


def chain(e):
    out = []
    while e is not None and e not in out:
        out.append(e)
        e = e.__cause__ or e.__context__
    return out


def detect(mod, p):
    flags, ev = [], {}
    if "inject" in p:
        *path, attr = p["inject"].split(".")
        obj = mod
        for n in path:
            obj = getattr(obj, n)
        real = getattr(obj, attr)

        def boom(*a, **k):
            raise ConnectionError(MARK)
        setattr(obj, attr, boom)
        try:
            getattr(mod, p["call"]["fn"])(*p["call"].get("args", []))
            flags.append("exception_swallowed")
        except Exception as e:
            if not any(MARK in str(x) for x in chain(e)):
                flags.append("cause_lost")
        finally:
            setattr(obj, attr, real)
    if "defaults" in p:
        fn = getattr(mod, p["defaults"]["fn"])

        def live():
            return {n: q.default for n, q in inspect.signature(fn).parameters.items()
                    if q.default is not inspect.Parameter.empty}
        snapshot = copy.deepcopy(live())
        fn(*p["defaults"]["args_a"])
        fn(*p["defaults"]["args_b"])
        mutated = [n for n, v in live().items() if v != snapshot[n]]
        ev["mutable_defaults"] = [n for n, v in live().items() if isinstance(v, (list, dict, set, bytearray))]
        if mutated:
            flags.append("default_state_retained")
            ev["mutated_defaults"] = mutated
    return verdict("P14", bool(flags), ["CORR"], {"checks": len(flags)}, {"flags": flags, **ev}, *flags)


if __name__ == "__main__":
    run_cli("P14", detect)
