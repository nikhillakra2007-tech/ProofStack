"""
Phase 3 Test Suite: Hardware Fingerprinting, Defensible Benchmarking,
Statistical Summaries, Comparability Gates, and Zero-Compromise Security Enforcement.
"""
import pytest
import math
import statistics
from unittest.mock import patch

from proofstack.core.fingerprint import (
    EnvironmentFingerprint,
    get_cpu_info,
    detect_nvidia_gpus,
    get_dependency_fingerprint,
)
from proofstack.core.benchmark import (
    BenchmarkHarness,
    SampleObservation,
    compute_rel_mad,
    calculate_percentile,
    summarize_measurements,
)
from proofstack.core.comparison import compare_benchmarks, ComparisonResult
from proofstack.core.acceptance import Gate, decide as acceptance_decide
from proofstack.benchmark.workloads import (
    SearchLookupWorkload,
    AlgorithmicRegressionWorkload,
    IdorSecurityBenchmark,
)
from proofstack.core.ledger import entry_hash, canonical, GENESIS


# =========================================================================
# 1. Hardware & Environment Fingerprint Tests
# =========================================================================

def test_cpu_info_structure():
    cpu = get_cpu_info()
    assert "architecture" in cpu
    assert "logical_cpus" in cpu
    assert cpu["logical_cpus"] >= 1
    assert "python_version" in cpu
    assert "system" in cpu


def test_nvidia_gpu_detection_real_or_fallback():
    gpu = detect_nvidia_gpus()
    assert "gpu_available" in gpu
    assert "detection_method" in gpu
    assert "devices" in gpu
    if gpu["gpu_available"]:
        assert gpu["gpu_count"] >= 1
        dev = gpu["devices"][0]
        assert "name" in dev
        assert "memory_total_bytes" in dev
        assert "compute_capability" in dev
    else:
        assert gpu["gpu_count"] == 0
        assert gpu["devices"] == []
        assert "reason" in gpu


def test_nvidia_gpu_unavailable_mock():
    with patch("proofstack.core.fingerprint._detect_via_nvml", return_value=None), \
         patch("proofstack.core.fingerprint._detect_via_nvidia_smi", return_value=None):
        gpu = detect_nvidia_gpus()
        assert gpu["gpu_available"] is False
        assert gpu["gpu_count"] == 0
        assert gpu["devices"] == []
        assert gpu["reason"] == "NO_NVIDIA_DEVICE_OR_NVML_UNAVAILABLE"


def test_fingerprint_deterministic_serialization():
    fp1 = EnvironmentFingerprint("workload_test_1")
    fp2 = EnvironmentFingerprint("workload_test_1")
    # Digests must be strictly identical for the same workload and environment
    assert fp1.digest() == fp2.digest()
    assert fp1.canonical_json() == fp2.canonical_json()

    # Different workload produces different digest
    fp3 = EnvironmentFingerprint("workload_test_2")
    assert fp1.digest() != fp3.digest()


# =========================================================================
# 2. Benchmark Measurement & Statistical Formula Tests
# =========================================================================

def test_percentile_linear_interpolation():
    data = [10, 20, 30, 40, 50]
    # Median / 50th percentile
    assert calculate_percentile(data, 50.0) == 30.0
    # 0th and 100th
    assert calculate_percentile(data, 0.0) == 10.0
    assert calculate_percentile(data, 100.0) == 50.0
    # Boundary: empty and single element
    assert calculate_percentile([], 95.0) == 0.0
    assert calculate_percentile([42], 95.0) == 42.0


def test_rel_mad_calculation():
    # Identical samples should have rel_MAD = 0
    assert compute_rel_mad([100, 100, 100, 100]) == 0.0
    # Empty or zero median
    assert compute_rel_mad([]) == float("inf")
    assert compute_rel_mad([0, 0, 0]) == float("inf")

    # Sample with known variance
    samples = [100, 102, 98, 101, 99]
    rmad = compute_rel_mad(samples)
    assert 0.0 < rmad < 0.05


def test_benchmark_harness_warmup_and_samples():
    calls = []
    def dummy():
        calls.append(1)

    harness = BenchmarkHarness("test_harness", warmup_iterations=4, measurement_iterations=10)
    obs, summary = harness.run(dummy)

    # 4 warmups + 10 measurements = 14 total calls
    assert len(calls) == 14
    assert len(obs) == 10
    assert summary.sample_count == 10
    assert summary.valid_sample_count == 10
    assert summary.failed_sample_count == 0
    assert summary.min_ns > 0
    assert summary.throughput_ops_per_sec > 0


def test_benchmark_harness_captures_errors_non_destructively():
    attempt = 0
    def flaky():
        nonlocal attempt
        attempt += 1
        if attempt % 3 == 0:
            raise RuntimeError("Synthetic timeout or crash")

    harness = BenchmarkHarness("flaky_harness", warmup_iterations=0, measurement_iterations=9)
    obs, summary = harness.run(flaky)

    assert summary.sample_count == 9
    assert summary.failed_sample_count == 3
    assert summary.valid_sample_count == 6
    failed_obs = [o for o in obs if o.status == "ERROR"]
    assert len(failed_obs) == 3
    assert "Synthetic timeout" in (failed_obs[0].error_message or "")


# =========================================================================
# 3. Comparability & Performance Gate Tests
# =========================================================================

def test_comparison_insufficient_samples():
    base = [1000, 1010, 990]  # only 3 samples
    cand = [500, 510, 490]
    res = compare_benchmarks("test_workload", base, cand, min_samples=10)
    assert res.comparable is False
    assert res.verdict == "INCONCLUSIVE"
    assert "Insufficient sample count" in res.reasons[0]


def test_comparison_zero_baseline():
    base = [0] * 12
    cand = [100] * 12
    res = compare_benchmarks("test_workload", base, cand, min_samples=10)
    assert res.comparable is False
    assert res.verdict == "INCONCLUSIVE"
    assert "Invalid median" in res.reasons[0]


def test_comparison_unstable_noise_rel_mad():
    # Extremely noisy baseline (> 10% rel_MAD)
    base = [100, 500, 200, 800, 150, 900, 120, 600, 110, 750]
    cand = [100] * 10
    res = compare_benchmarks("test_workload", base, cand, noise_max_rel_mad=0.10)
    assert res.comparable is False
    assert res.verdict == "INCONCLUSIVE"
    assert "Unstable measurements" in res.reasons[0]


def test_comparison_supported_optimization():
    # Stable baseline ~1000ns, stable candidate ~200ns (5x speedup)
    import random
    rng = random.Random(42)
    base = [int(1000 + rng.gauss(0, 10)) for _ in range(15)]
    cand = [int(200 + rng.gauss(0, 3)) for _ in range(15)]
    res = compare_benchmarks("test_workload", base, cand, mode="optimize", tau_noise=0.05)
    assert res.comparable is True
    assert res.verdict == "PERF_SUPPORTED"
    assert res.speedup > 4.5
    assert res.ci_low > 1.05


def test_comparison_performance_regression():
    # Baseline ~200ns, Candidate ~1000ns (5x slowdown)
    import random
    rng = random.Random(42)
    base = [int(200 + rng.gauss(0, 3)) for _ in range(15)]
    cand = [int(1000 + rng.gauss(0, 10)) for _ in range(15)]
    res = compare_benchmarks("test_workload", base, cand, mode="optimize", budget=0.05)
    assert res.comparable is True
    assert res.verdict == "REGRESSION"
    assert res.speedup < 0.3


# =========================================================================
# 4. Zero-Compromise Security Veto Enforcement
# =========================================================================

def test_zero_compromise_security_veto_overrides_massive_speedup():
    """
    Core invariant: A candidate with 50x speedup MUST be REJECTED
    if a mandatory security or correctness gate fails.
    """
    gates = [
        Gate("G0_integrity", "INTEGRITY", "PASS", True),
        Gate("G1_supply_chain", "SEC", "PASS", True),
        Gate("G2_security_idor", "SEC", "FAIL", True),  # Security Exploit Detected!
        Gate("G3_correctness", "CORR", "PASS", True),
        Gate("G4_concurrency", "CONC", "NOT_APPLICABLE", False),
        Gate("G5_resources", "PERF", "PASS", False),
        Gate("G6_environment", "INTEGRITY", "PASS", True),
        Gate("G7_performance", "PERF", "PASS", True),   # 50x speedup PASS!
    ]

    verdict, summary, reasons = acceptance_decide("optimize", gates)
    assert verdict == "REJECTED"
    assert summary["SEC"] == "FAIL"
    assert any("SEC:G2_security_idor FAIL" in r for r in reasons)


def test_zero_compromise_correctness_veto():
    """If candidate breaks functional equivalence, overall decision is REJECTED."""
    gates = [
        Gate("G0_integrity", "INTEGRITY", "PASS", True),
        Gate("G2_security", "SEC", "PASS", True),
        Gate("G3_correctness", "CORR", "FAIL", True),   # Functional test failed!
        Gate("G7_performance", "PERF", "PASS", True),   # Speedup passed
    ]
    verdict, summary, reasons = acceptance_decide("optimize", gates)
    assert verdict == "REJECTED"
    assert summary["CORR"] == "FAIL"


def test_zero_compromise_all_pass_yields_accepted():
    """All required gates pass -> ACCEPTED."""
    gates = [
        Gate("G0_integrity", "INTEGRITY", "PASS", True),
        Gate("G1_supply_chain", "SEC", "PASS", True),
        Gate("G2_security", "SEC", "PASS", True),
        Gate("G3_correctness", "CORR", "PASS", True),
        Gate("G6_environment", "INTEGRITY", "PASS", True),
        Gate("G7_performance", "PERF", "PASS", True),
    ]
    verdict, summary, reasons = acceptance_decide("optimize", gates)
    assert verdict == "ACCEPTED"
    assert reasons == ["all required gates satisfied"]


# =========================================================================
# 5. Real Local Workloads & Regression Scenarios
# =========================================================================

def test_workload_search_lookup_differential_equivalence():
    w = SearchLookupWorkload(size=500)
    assert w.verify_differential_equivalence() is True


def test_workload_idor_security_scenario():
    bench = IdorSecurityBenchmark()

    # 1. Test baseline: Alice can access invoice 1, Bob is rejected
    alice_doc = bench.baseline_fetch("alice", 1)
    assert alice_doc["owner"] == "alice"
    with pytest.raises(PermissionError):
        bench.baseline_fetch("bob", 1)

    # 2. Test candidate vulnerable (Naive Cache): Bob leaks Alice's invoice!
    leaked, ev = bench.run_security_exploit_test(bench.candidate_vulnerable_fetch)
    assert leaked is True
    assert "CWE-639" in ev["vulnerability"]
    assert ev["leakage"]["owner"] == "alice"

    # 3. Test candidate fixed (Partitioned Cache): Bob is rejected with PermissionError
    fixed_leaked, fixed_ev = bench.run_security_exploit_test(bench.candidate_fixed_fetch)
    assert fixed_leaked is False
    assert fixed_ev["vulnerability"] == "NONE"


# =========================================================================
# 6. Ledger Cryptographic Tampering Detection Tests
# =========================================================================

def test_ledger_tampering_payload_mutation():
    """Prove that altering even 1 byte in a ledger entry's payload breaks SHA-256 verification."""
    payload1 = {"run_id": "run-test", "metric": "latency", "val": 12.5}
    entry1 = {**payload1, "seq": 0, "previous_hash": GENESIS}
    h1 = entry_hash(entry1)
    entry1["hash"] = h1

    # Next entry in chain
    payload2 = {"run_id": "run-test", "gate": "G7", "status": "PASS"}
    entry2 = {**payload2, "seq": 1, "previous_hash": h1}
    h2 = entry_hash(entry2)
    entry2["hash"] = h2

    # Tamper with entry 1: change val from 12.5 to 10.0
    tampered_entry1 = dict(entry1)
    tampered_entry1["val"] = 10.0
    # Recomputing hash shows mismatch against sealed hash
    assert entry_hash(tampered_entry1) != entry1["hash"]

    # Tamper with previous_hash in entry 2
    tampered_entry2 = dict(entry2)
    tampered_entry2["previous_hash"] = "a" * 64
    assert entry_hash(tampered_entry2) != entry2["hash"]
