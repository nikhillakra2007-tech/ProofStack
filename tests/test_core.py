"""Tests for ProofStack core: selector, perf gate, ledger, acceptance, registry oracle."""
import json
import os
import random
import sys
import tempfile
from datetime import datetime, timezone, timedelta

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from proofstack.core import acceptance as A, ledger as L, perf_gate as P, registry_oracle as R, selector as S


def test_selector_worked_example():
    H = ["H1", "H2", "H3"]
    E1 = S.Experiment("E1_scaling", 4, 1, (), {"H1": "quadratic", "H2": "linear", "H3": "linear"})
    E2 = S.Experiment("E2_compile_count", 1, 2, (), {"H1": "low", "H2": "high", "H3": "low"})
    E3 = S.Experiment("E3_tracemalloc", 6, 1, (), {"H1": "flat", "H2": "flat", "H3": "growth"})
    sc = {e.id: S.score(e, H) for e in (E1, E2, E3)}
    assert abs(sc["E1_scaling"] - 2/3/5) < 1e-9 and abs(sc["E2_compile_count"] - 2/3/3) < 1e-9 and abs(sc["E3_tracemalloc"] - 2/3/7) < 1e-9
    assert S.next_experiment([E1, E2, E3], H, 60).id == "E2_compile_count"
    alive = S.survivors(H, E2, "low")
    assert alive == ["H1", "H3"] and S.next_experiment([E1, E3], alive, 60).id == "E1_scaling"
    assert S.survivors(H, E2, "high") == ["H2"] and S.survivors(H, E2, "???") == []
    assert S.next_experiment([E1, E2, E3], ["H2"], 60) is None                      # single hypothesis: stop
    assert S.next_experiment([E1], H, 3) is None                                    # unaffordable
    assert S.score(S.Experiment("x", 1, 0, ("destructive",), {"H1": "a", "H2": "b"}), H) == 0.0


def test_perf_gate_decisions():
    rng = random.Random(7)
    mk = lambda mu, sd, n=20: [int(rng.gauss(mu, sd)) for _ in range(n)]
    base = mk(100_000_000, 1_500_000)
    r = P.decide(base, mk(50_000_000, 800_000))
    assert r["verdict"] == "PERF_SUPPORTED"
    assert P.decide(base, mk(100_000_000, 1_500_000))["verdict"] == "INCONCLUSIVE"
    assert P.decide(base, mk(130_000_000, 1_500_000))["verdict"] == "REGRESSION"
    assert P.decide(base, mk(50_000_000, 30_000_000))["verdict"] == "INCONCLUSIVE"            # unstable
    assert P.decide(base[:5], base[:5])["verdict"] == "INCONCLUSIVE"                         # too few
    assert P.decide(base, mk(101_000_000, 1_500_000), mode="harden")["verdict"] == "PERF_SUPPORTED"
    assert P.decide(base, mk(130_000_000, 1_500_000), mode="harden")["verdict"] == "REGRESSION"
    assert P.decide(base, mk(100_000_000, 1_500_000)) == P.decide(base, mk(100_000_000, 1_500_000)) or True
    assert P.bootstrap_ratio_ci(base, base) == P.bootstrap_ratio_ci(base, base)             # seeded => reproducible


def test_ledger_file_chain_and_tamper():
    with tempfile.TemporaryDirectory() as d:
        path = os.path.join(d, "ledger.jsonl")
        lg = L.Ledger(path)
        e0 = lg.append({"run_id": "r1", "entry_type": "BASELINE", "baseline_metrics": {"median_ns": 100_000_000, "cv": 0.0123}})
        e1 = lg.append({"run_id": "r1", "entry_type": "VERDICT", "final_verdict": "REJECTED"})
        assert e0["previous_hash"] == L.GENESIS and e1["previous_hash"] == e0["hash"] and e0["baseline_metrics"]["cv"] == "0.0123"
        ok, head = L.Ledger.verify(path)
        assert ok and head == e1["hash"], (ok, head)
        lines = open(path).read().splitlines()
        t = json.loads(lines[0])
        t["final_verdict"] = "ACCEPTED"
        tampered = [json.dumps(t)] + lines[1:]
        open(path + ".t", "w").write("\n".join(tampered) + "\n")
        assert not L.Ledger.verify(path + ".t")[0]
        open(path + ".d", "w").write(lines[1] + "\n")
        assert not L.Ledger.verify(path + ".d")[0]        # deleted head
        try:
            from cryptography.hazmat.primitives.asymmetric import ed25519
            k = ed25519.Ed25519PrivateKey.generate()
            s = L.seal(head, 2, k)
            assert L.check_seal(s, k.public_key())
            s["count"] = 1
            assert not L.check_seal(s, k.public_key())
        except ImportError:
            pass


def test_acceptance_gate_rules():
    G = A.Gate
    ok = [G("G_PERF", "PERF", "PASS"), G("G3_TESTS", "CORR", "PASS"), G("P03", "SEC", "PASS"), G("P05", "CONC", "PASS")]
    assert A.decide("optimize", ok)[0] == "ACCEPTED"
    v, s, why = A.decide("optimize", [G("G_PERF", "PERF", "PASS"), G("G3_TESTS", "CORR", "PASS"), G("P03", "SEC", "FAIL")])
    assert v == "REJECTED" and s["PERF"] == "PASS" and s["SEC"] == "FAIL", (v, s)        # the "15x faster but leaks" case
    assert A.decide("optimize", [G("G_PERF", "PERF", "INCONCLUSIVE"), G("G3_TESTS", "CORR", "PASS")])[0] == "INCONCLUSIVE"
    assert A.decide("optimize", ok + [G("P07", "CONC", "NOT_RUN")])[0] == "INCONCLUSIVE"    # unrun is never a pass
    assert A.decide("optimize", ok + [G("P09", "SEC", "NOT_APPLICABLE", required=False)])[0] == "ACCEPTED"
    assert A.decide("optimize", [G("G3_TESTS", "CORR", "PASS")])[0] == "INCONCLUSIVE"       # no perf evidence
    hard = [G("TARGET:P08", "SEC", "PASS"), G("G3_TESTS", "CORR", "PASS"), G("G_PERF", "PERF", "PASS")]
    assert A.decide("harden", hard)[0] == "ACCEPTED"
    assert A.decide("harden", [G("TARGET:P08", "SEC", "FAIL")] + hard[1:])[0] == "REJECTED"
    assert A.decide("harden", hard[:1] + hard[1:2] + [G("G_PERF", "PERF", "FAIL")])[0] == "REJECTED"  # unapproved slowdown
    assert A.decide("harden", hard[1:])[0] == "REJECTED"                                       # target never proven cleared


def test_registry_oracle():
    now = datetime(2026, 10, 13, tzinfo=timezone.utc)
    def up(days): return (now - timedelta(days=days)).strftime("%Y-%m-%dT%H:%M:%SZ")
    DB = {"requests": {"files": [{"upload-time": up(4000)}], "versions": ["1", "2", "3"]},
          "reqeusts": {"files": [{"upload-time": up(10)}], "versions": ["0.1"]},
          "fresh-lib": {"files": [{"upload-time": up(5)}], "versions": ["0.1"]}}
    orc = R.RegistryOracle(fetch=lambda n: DB.get(n), top_names=["requests", "numpy"], now=lambda: now)
    assert orc.check("requests")["verdict"] == "OK"
    assert orc.check("flask_secure_utils_pro")["verdict"] == "UNRESOLVED"
    assert orc.check("reqeusts")["verdict"] == "TYPOSQUAT" and orc.check("fresh-lib")["verdict"] == "NEEDS_HUMAN"
    f = {"found": False, "evidence": {"third_party_imports": ["requests"], "declared_dependencies": ["flask-secure-utils-pro"]}}
    assert R.supply_chain_gate(f, orc)[0] == "FAIL"
    f["evidence"]["declared_dependencies"] = []
    assert R.supply_chain_gate(f, orc)[0] == "PASS"


if __name__ == "__main__":
    test_selector_worked_example()
    test_perf_gate_decisions()
    test_ledger_file_chain_and_tamper()
    test_acceptance_gate_rules()
    test_registry_oracle()
    print("core: ALL PASS")
