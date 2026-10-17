# PROOFSTACK / PERFPROOF — MASTER HARDENING PHASE REPORT
## Security, Reliability, AI Quality, Product Completeness, Reproducibility, and Competition Readiness

**Target Branch:** `model`  
**Protected Baseline:** `b156b954c5c8396157cf42a2a0ca8fe4cf96bd53` (`main`)  
**Status:** `READY FOR TECHNICAL DEMONSTRATION`  
**Date:** October 17, 2026  

---

## 1. Executive Summary

This phase performed a rigorous, multi-discipline audit and engineering hardening of the ProofStack / PerfProof autonomous verification platform. The focus was on application security, evidence integrity, deterministic acceptance guarantees, benchmark credibility, and operational reliability.

All improvements were implemented with zero modifications to `main`, complete preservation of the friend's branch (`origin/nitin/engine-cockpit-dast`), and verified through reproducible automated test suites.

---

## 2. Architecture & Risk Audit Register

| Finding ID | Component | Severity | Description | Evidence / Reproduction | Fix Implemented | Verification Status |
|---|---|---|---|---|---|---|
| **SEC-01** | `proofstack/llm/client.py` | High | Unhandled crash on missing `NEBIUS_API_KEY` (`KeyError: 'NEBIUS_API_KEY'`), leaking environment stack traces. | Calling `ModelClient()` without env var raised unhandled exception. | Safe `os.environ.get()` with `is_configured` property and typed `ModelConfigError`. | **VERIFIED (PASS)** |
| **SEC-02** | `backend/server.py` | High | Lack of input path restrictions and directory traversal defense on model patch touch lists. | Model-generated patches could theoretically specify `../../etc/passwd` or overwrite `tests/test_api.py`. | Strict path normalization and allowlist validation rejecting parent directory traversal and protected path modifications (`tests/**`, `alembic/**`, `.env`). | **VERIFIED (PASS)** |
| **AI-01** | `frontend/components/HypothesisView.tsx` | Medium | Misleading AI provenance: UI unconditionally displayed "Proposed by Nemotron" even when deterministic local stubs executed. | Static label in React component header. | Dynamic provenance badge: `Live AI Inference (NVIDIA Nemotron)` vs `Deterministic Rule Engine (Local Fallback)` with provenance notes. | **VERIFIED (PASS)** |
| **REL-01** | `pyproject.toml` | Medium | Default `pytest` collection captured test fixtures inside `fixtures/p16`, causing collection errors unless specific paths were provided. | Running `pytest` from repo root failed collection on `fixtures/p16/weak/test_shop.py`. | Added `[tool.pytest.ini_options]` with `testpaths = ["tests"]`, `asyncio_mode = "strict"`, and `asyncio_default_fixture_loop_scope = "function"`. | **VERIFIED (PASS)** |
| **SEC-03** | `backend/server.py` | High | New model status and analysis endpoints required authentication to prevent unauthorized tenant scanning. | Verified that `/api/model/status`, `/api/runs/{run_id}/analyze`, and `/api/runs/{run_id}/propose-patch` enforce `verify_api_key`. | Enforced `Depends(verify_api_key)` with 401/403 rejection. | **VERIFIED (PASS)** |
| **INT-01** | `backend/model_service.py` | Critical | Tamper-evident audit trail for AI actions: model calls must be cryptographically chained in the evidence ledger. | Need auditable proof of model parameters, response digests, and validation results. | Appended `MODEL_CALL` blocks into the HMAC-SHA256 hash chain with payload mutation tamper detection. | **VERIFIED (PASS)** |

---

## 3. Security Results & Trust Boundaries

### 3.1 Secret Management
- `NEBIUS_API_KEY` is strictly server-side.
- `/api/model/status` only exposes a truncated 4-character prefix preview (`neb_****`) and never returns the secret.
- No secrets appear in HTTP response bodies, SSE event streams, or the SQLite database.
- Unit test `test_model_service_status_configured` verifies `assert "secret_key_12345" not in json.dumps(status)`.

### 3.2 Deterministic Acceptance Authority
- ProofStack strictly prevents the AI model from deciding code safety or acceptance.
- The verdict is synthesized exclusively by `proofstack.core.acceptance.decide` based on independent gate evaluations (G0–G7).
- Even if an LLM strongly recommends accepting a patch, a failure in Gate G4 (P03 IDOR security probe) or Gate G3 (Correctness) deterministically forces a `REJECTED` verdict.

### 3.3 Patch Sandboxing & Boundary Restrictions
- Patches cannot modify test fixtures or security harnesses to artificially pass gates.
- Directory traversal patterns (`..`) are detected and rejected server-side with `REJECTED_SECURITY`.
- Line changes and file counts are strictly bounded to the task budget.

---

## 4. Benchmark Credibility & NVIDIA Hardware Provenance

- **Host Device Detection**: Physical `NVIDIA GeForce RTX 3050 6GB Laptop GPU` detected via native `nvml.dll` ctypes probe (Driver `596.08`, CUDA `13.2`, Compute Capability `8.6`).
- **Honest Provenance**: The platform explicitly documents that synthetic latency microbenchmarks execute on the host CPU (`13th Gen Intel Core i5-13450HX`), rather than fabricating GPU tensor core computation.
- **Statistical Defensibility**: Noise assessment uses Relative Median Absolute Deviation (`rel_mad`). If `rel_mad > tau_noise` (e.g. > 10%), the benchmark is deterministically classified as `UNSTABLE`, forcing an `INCONCLUSIVE` verdict rather than claiming a false speedup.

---

## 5. Ledger Integrity & Tamper Detection

- Every run maintains an append-only cryptographic ledger.
- Each block contains: `run_id`, `sequence_number`, `event_type`, `timestamp`, `payload`, `previous_hash`, `entry_hash`.
- Validated via `LedgerService.verify_chain(run_id)`.
- Verified by unit tests: any mutation to a persisted payload immediately causes `verify_chain` to fail with `tampered entry <N>`.

---

## 6. Disclosed Limitations

1. **Remote Cloud Inference**: Live calls to `nvidia/nemotron-3-super-120b` require setting `NEBIUS_API_KEY` in `.env`. When unset, the system operates in verified deterministic fallback mode.
2. **GPU Workload Execution**: While NVIDIA hardware detection is verified live via NVML ctypes, benchmark workloads in the current demo showcase run on the host CPU.
3. **Single-Node Execution**: Current database backend uses SQLite 3 with WAL mode; production multi-tenant deployment would migrate to PostgreSQL via existing Alembic tooling.
