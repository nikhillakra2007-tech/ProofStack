"""Generates examples/ from REAL runs (probe output, perf gate, ledger chain) and validates them against schemas/."""
import difflib, json, os, statistics, subprocess, sys, time, importlib.util
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, R); sys.path.insert(0, os.path.join(R, "tests"))
from minischema import validate
from proofstack.core import ledger as L, perf_gate as P, acceptance as A
from proofstack.sandbox.backend import ExecResult, to_record

S = lambda n: json.load(open(os.path.join(R, "schemas", n)))
def check(name, inst, schema):
    errs = validate(inst, schema); assert not errs, (name, errs[:5]); print("schema OK:", name)
def load(path):
    spec = importlib.util.spec_from_file_location("m" + str(time.time_ns()), path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
def dump(name, obj): json.dump(obj, open(os.path.join(R, "examples", name), "w"), indent=2, sort_keys=False); return obj

task = dump("task.example.json", {
  "schema_version": "1.0", "task_id": "invoice-cache-idor", "mode": "optimize",
  "repository": {"path": "./examples/invoice-service", "baseline_commit": "3f9c2ab", "candidate_commit": None, "candidate_patch": None},
  "target": {"file": "app/invoices.py", "symbol": "get_object", "kind": "function",
             "probes": {"select": "auto", "exclude": ["P16"], "params": {"P03": {"owners": {"alice": 1, "bob": 2}}}}},
  "benchmark": {"command": ["python", "-m", "bench.invoice_read"], "workload_seed": 20261013, "warmups": 3, "samples": 20,
                "tau_noise": 0.05, "regression_budget": 0.05, "noise_max_rel_mad": 0.10},
  "correctness": {"test_command": ["python", "-m", "pytest", "-q", "tests/"], "protected_paths": ["tests/**", "bench/**", ".proofstack/**"]},
  "budgets": {"wall_clock_per_experiment_s": 60, "memory_mb": 1024, "max_processes": 128, "max_hypotheses": 3,
              "max_repair_cycles": 3, "max_model_tokens": 60000, "max_total_runtime_s": 1800, "max_diff_lines": 40, "max_files_changed": 2},
  "sandbox": {"backend": "nebius", "require_backend": "nebius", "image": "0b8f6c1e-5d2a-4c7e-9a31-6f0d2b7c8e14", "provision_timeout_s": 20},
  "waivers": []})
check("TaskIntake", task, S("task-intake.v1.json"))
bad = json.loads(json.dumps(task)); bad["benchmark"]["samples"] = 5; assert validate(bad, S("task-intake.v1.json"))
bad = json.loads(json.dumps(task)); bad["budgets"]["wall_clock_per_experiment_s"] = 600; assert validate(bad, S("task-intake.v1.json"))

hyp = dump("hypothesis-set.example.json", {"task_id": "invoice-cache-idor", "hypotheses": [
  {"hypothesis_id": "H1", "root_cause_category": "OTHER_PERF", "taxonomy": {"cwe": None, "perf": "PERF.IO.REPEATED_FETCH"},
   "statement": "get_object re-reads the same invoice row on every call; a cache would remove the 10 ms fetch.",
   "evidence_refs": [{"kind": "profile", "ref": "profile.pstats#_slow_fetch", "excerpt": "_slow_fetch: 99.2% cumulative"}],
   "falsifiable_prediction": "Second call for the same (principal, id) is >=10x faster once any cache is present."},
  {"hypothesis_id": "H2", "root_cause_category": "IDOR_CACHE", "taxonomy": {"cwe": "CWE-639", "perf": None},
   "statement": "A cache keyed only by object id would serve another principal's row from a warm entry.",
   "evidence_refs": [{"kind": "ast", "ref": "app/invoices.py:12", "excerpt": "ownership check sits after the fetch"}],
   "falsifiable_prediction": "bob requesting alice's invoice after alice warms the cache returns the row (leak)."}],
  "experiments": [
  {"experiment_id": "E1", "kind": "profile", "probe_id": None, "command": ["python", "-m", "cProfile", "-o", "profile.pstats", "bench/invoice_read.py"],
   "est_runtime_s": 3, "setup_s": 1, "risks": [], "predictions": {"H1": "fetch_dominates", "H2": "fetch_dominates"}},
  {"experiment_id": "E2", "kind": "probe", "probe_id": "P03", "command": ["proofstack-run", "P03", "--target", "app/invoices.py"],
   "est_runtime_s": 2, "setup_s": 0, "risks": [], "predictions": {"H1": "no_leak", "H2": "leak"}}]})
check("HypothesisSet", hyp, S("hypothesis-set.v1.json"))
from proofstack.core.selector import Experiment, next_experiment
ex = [Experiment(e["experiment_id"], e["est_runtime_s"], e["setup_s"], tuple(e["risks"]), e["predictions"]) for e in hyp["experiments"]]
assert next_experiment(ex, ["H1", "H2"], 60).id == "E2"              # only E2 separates the hypotheses

env = dict(os.environ, PROOFSTACK_SANDBOX="1", PYTHONPATH=R)
out = subprocess.run([sys.executable, "-m", "proofstack.probes.p03_idor_cache", "--target", "fixtures/p03/red.py"], cwd=R, env=env, capture_output=True, text=True).stdout
finding = json.loads(next(l for l in out.splitlines() if l.startswith("PROOFSTACK_FINDING ")).split(" ", 1)[1])
dump("probe-finding.example.json", finding); check("ProbeFinding", finding, S("probe-finding.v1.json"))

def samples(mod, n=20, warm=True):
    m = load(mod); xs = []
    if warm: m.get_object("alice", 1)
    for _ in range(n):
        t = time.perf_counter_ns(); m.get_object("alice", 1); xs.append(time.perf_counter_ns() - t)
    return xs
base_ns = samples(os.path.join(R, "fixtures/p03/baseline.py"), warm=False)
cand_ns = [x * 1 for x in samples(os.path.join(R, "fixtures/p03/red.py"))]
perf = P.decide(base_ns, cand_ns, "optimize")
print("perf:", perf["verdict"], round(perf["speedup"], 1), "x")
diff = "".join(difflib.unified_diff(open(os.path.join(R, "fixtures/p03/baseline.py")).read().splitlines(True),
               open(os.path.join(R, "fixtures/p03/red.py")).read().splitlines(True), "a/app/invoices.py", "b/app/invoices.py"))
gates = [A.Gate("G0_INTEGRITY", "INTEGRITY", "PASS"), A.Gate("G3_TESTS", "CORR", "PASS"), A.Gate("G_PERF", "PERF", perf["verdict"] == "PERF_SUPPORTED" and "PASS" or "INCONCLUSIVE"),
         A.Gate("P03", "SEC", "FAIL")]
verdict, summary, reasons = A.decide("optimize", gates)
assert verdict == "REJECTED" and summary["PERF"] == "PASS" and summary["SEC"] == "FAIL"

path = os.path.join(R, "examples", "demo_idor_run.ledger.jsonl")
if os.path.exists(path): os.remove(path)
lg = L.Ledger(path); rid, tid = "run-20261013-0001", "invoice-cache-idor"
lg.append(L.make_entry(rid, tid, "RUN_STARTED", environment={"python": "3.12.3", "sandbox": "nebius-sandboxes", "policy": "zero-compromise/1"}))
lg.append(L.make_entry(rid, tid, "BASELINE", baseline_metrics={"samples_ns": base_ns, "median_ns": int(statistics.median(base_ns)), "rel_mad": P.rel_mad(base_ns)}))
lg.append(L.make_entry(rid, tid, "PATCH_PROPOSED", diff_patch=diff, candidate_metrics={"samples_ns": cand_ns, "median_ns": int(statistics.median(cand_ns))},
                       model_calls=[{"route": "patch", "model_id": "nvidia/nemotron-3-super-120b-a12b", "tokens_in": 2140, "tokens_out": 311, "latency_ms": 4200}]))
lg.append(L.make_entry(rid, tid, "GATE_RESULT", gate_results=[
  {"gate_id": "G_PERF", "family": "PERF", "status": "PASS", "evidence": {"speedup": perf["speedup"], "ci_low": perf["ci_low"], "ci_high": perf["ci_high"]}},
  {"gate_id": "P03", "family": "SEC", "status": "FAIL", "probe_id": "P03", "fingerprints": [finding["fingerprint"]], "evidence": finding["evidence"]}]))
last = lg.append(L.make_entry(rid, tid, "FINAL_VERDICT", final_verdict=verdict, family_summary=summary, reasons=reasons))
ok, head = L.Ledger.verify(path); assert ok and head == last["hash"]
for line in open(path):
    check(f"LedgerEntry seq={json.loads(line)['seq']}", json.loads(line), S("evidence-ledger-entry.v1.json"))
bad = json.loads(open(path).readline()); del bad["previous_hash"]; assert validate(bad, S("evidence-ledger-entry.v1.json"))
print("ledger head:", head[:16], "| verdict:", verdict, "|", summary)

res = ExecResult("nebius-sandboxes", "7d1c3e52-8a4b-4f60-b2c9-1e5f0a9d3b47", task["sandbox"]["image"], None, 0, -1, False,
                 "PROOFSTACK_FINDING {...}\n", "", False, 1.84, 31744, 0.62, 0.11)
rec = to_record(res, rid, ["python3", "-m", "proofstack.probes.p03_idor_cache", "--target", "app/invoices.py"], False,
                {"wall_clock_s": 60, "memory_bytes": 1073741824, "processes": 128}, "2026-10-13T09:14:02.118+00:00",
                "2026-10-13T09:14:04.021+00:00", "artifacts/p03.stdout", "artifacts/p03.stderr",
                [{"path": "artifacts/p03.finding.json", "sha256": "a" * 64, "bytes": 612}])
dump("sandbox-execution-result.example.json", rec); check("SandboxExecutionResult", rec, S("sandbox-execution-result.v1.json"))
print("examples OK")
