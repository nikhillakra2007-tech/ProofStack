# PROOFSTACK / PERFPROOF — PHASE 4A CONNECTION AUDIT REPORT
## Main-Branch Preservation, Full Connection Audit, and End-to-End Release Verification

---

## 1. Executive Summary & Baseline Protection

- **Audit Date**: 17 October 2026
- **Starting Commit (`HEAD` on `main`)**: `b156b954c5c8396157cf42a2a0ca8fe4cf96bd53`
- **Local Backup Branch**: `backup/pre-connection-audit-20261017-0033`
- **Annotated Backup Tag**: `v0.4.0-baseline-b156b95`
- **Remote Backup Status**: **VERIFIED** — Successfully pushed to `origin/backup/pre-connection-audit-20261017-0033` and `origin/refs/tags/v0.4.0-baseline-b156b95`.
- **Main Branch Integrity**: `main` remains frozen at `b156b954c5c8396157cf42a2a0ca8fe4cf96bd53`. Zero commits or merges have been made to `main`.
- **Active Audit Branch**: `chore/phase4-connection-audit`

---

## 2. Discovered Architecture & Connection Inventory

| Component | Source / Entry Point | Expected Dependency | Audit Verification Method | Status Label | Evidence / Notes |
|---|---|---|---|---|---|
| **Next.js Frontend Cockpit** | `frontend/app/page.tsx`, `frontend/app/runs/[runId]/page.tsx` | Node.js v24.18.1, Next.js 14.2.35 | `npm run start` / `npm run dev` HTTP requests to port 3000 | **`PASS — LIVE`** | Served `/`, `/projects`, `/runs/demo-run-idor-2026` with HTTP 200. |
| **FastAPI Backend Engine** | `backend/server.py`, `backend/orchestrator.py` | Python 3.12.10, Uvicorn, SQLAlchemy | `GET http://127.0.0.1:8765/api/health` | **`PASS — LIVE`** | Responded with `{"status":"ok","version":"0.1.0"}`. |
| **Frontend-to-Backend Proxy** | `frontend/next.config.js` (`rewrites()`) | Backend HTTP on port 8765 | `GET http://localhost:3000/api/health` | **`PASS — LIVE`** | Reverse proxy correctly routed and returned HTTP 200 from backend. |
| **Database Connection & CRUD** | `backend/database.py`, SQLite `proofstack.db` | SQLite engine, SQLAlchemy session | Live connection, table inspection, isolated write, read-back, and delete | **`PASS — LIVE`** | Verified 16 tables, write read-back confirmed, clean delete without residue. |
| **Alembic Schema Migrations** | `alembic/versions/` (001, 004) | SQLite DB | `alembic current` & `alembic heads` | **`PASS — LIVE`** | Database schema is at `004_final_remediation (head)`. |
| **Run Orchestration Lifecycle** | `backend/orchestrator.py` | Task and Run state machines | Live 12-step execution via frontend proxy | **`PASS — LIVE`** | Run `ed249f7a...` transitioned `CREATED` &rarr; `VALIDATING` &rarr; `COMPLETED`. |
| **SSE Event Streaming** | `backend/server.py` (`/api/runs/{id}/events`) | `backend/event_bus.py` | Streaming client connection via proxy | **`PASS — LIVE`** | Responded `200 text/event-stream` with immediate `: connected` header flush. |
| **Evidence Ledger** | `backend/ledger_service.py`, `proofstack/core/ledger.py` | SQLite `ledger_entries` | SHA-256 hash chaining & verification | **`PASS — LIVE`** | 32 chained entries verified (`valid=True`, `chain_broken=False`). |
| **Report Generation & Retrieval** | `backend/report_service.py` | Persisted decision & evidence | `POST /runs/{id}/reports`, `GET /runs/{id}/reports/{id}` | **`PASS — LIVE`** | Markdown report (1701 bytes) generated and retrieved successfully. |
| **NVIDIA Hardware Detection** | `proofstack/core/fingerprint.py` | Physical GPU, `nvml.dll` ctypes | Direct native NVML call & `nvidia-smi` | **`PASS — LIVE`** | Detected `RTX 3050 6GB Laptop GPU`, `Driver 596.08`, `CUDA 13.2`, 6144MB VRAM. |
| **Workload Benchmark Execution** | `proofstack/benchmark/workloads.py` | Host CPU runtime | Monotonic timing harness | **`PASS — LOCAL`** | Workloads execute on host CPU (Intel i5-13450HX), NOT on GPU compute kernels. |
| **PSEC Probe Kit (P01–P19)** | `proofstack/probes/` (`_kit.py`, `kit.py`) | Python standard library | `python tests/selftest.py P03` | **`PASS — LOCAL`** | P03 IDOR probe detects exploit on red (1428x speedup) and clean on green. |
| **Verification Gates (G0–G7)** | `backend/orchestrator.py`, `proofstack/core/acceptance.py` | Run evidence & findings | Live gate evaluation & Zero-Compromise test | **`PASS — LOCAL`** | G0–G7 evaluated; G4 Security FAIL vetoed 433x speedup to REJECTED. |
| **Nebius Remote Model Inference** | `proofstack/llm/client.py` | `NEBIUS_API_KEY`, Token Factory | Configuration and credential inspection | **`BLOCKED — CREDENTIALS`** | `NEBIUS_API_KEY` is unset. Local deterministic fallback engine is active. |
| **POSIX Sandbox Limits** | `proofstack/sandbox/guest_runner.py` | Linux `resource.setrlimit` | Subprocess test on Windows | **`BLOCKED — ENVIRONMENT`** | Windows lacks POSIX `resource` module; test gracefully skipped. |

---

## 3. Discovered Defects & Fixes

### Defect 1: SSE Reverse Proxy Buffering & Timeout
- **Symptom**: Client connections to `/api/runs/{run_id}/events` via the Next.js rewrite proxy (`http://localhost:3000/api/...`) hung indefinitely and timed out after 10 seconds.
- **Root Cause**: `StreamingResponse` in Starlette/FastAPI does not flush HTTP response headers until the generator yields its first byte. Because `event_bus.subscribe()` waited up to 30 seconds for an initial event, the proxy never received headers and timed out.
- **Fix Applied on Audit Branch**:
  1. Updated `stream_events` in `backend/server.py` to immediately `yield ": connected\n\n"` upon client connection, forcing immediate header transmission.
  2. Reduced `event_bus.py` heartbeat timeout from 30.0s to 5.0s.
- **Verification**: `python -c "import http.client; ..."` confirmed HTTP 200 with `Content-Type: text/event-stream` received in < 50ms through port 3000.

---

## 4. End-to-End Application Workflow Exercised

A complete, live end-to-end workflow was executed strictly through the Next.js frontend proxy (`http://localhost:3000/api`):

1. **Proxy Health Check**: `GET /api/health` &rarr; `HTTP 200 {"status":"ok","version":"0.1.0"}`
2. **Project Creation**: `POST /api/projects` &rarr; Persisted `Project ID: 9edc8f48-b37f-48b4-b859-9e844b65ee17`
3. **Task Intake Validation**: `POST /api/tasks` &rarr; Validated against schema, persisted `Task ID: f83f1549-cbdf-45ad-aa15-d46af0a2daa1`
4. **Run Registration**: `POST /api/runs` &rarr; Created `Run ID: ed249f7a-6f0d-4805-9a21-5147d93d753c` (Status: `CREATED`)
5. **Asynchronous Run Execution**: `POST /api/runs/{id}/start` &rarr; Background orchestrator progressed through stages
6. **Live Event Stream**: `GET /api/runs/{id}/events` &rarr; Connected and received SSE data chunks
7. **Terminal State**: `GET /api/runs/{id}` &rarr; Status `COMPLETED`, Final Verdict `REJECTED`
8. **Gate Inspections**: `GET /api/runs/{id}/gates` &rarr; 8 gates evaluated (`G0_integrity`, `G1_supply_chain`, `G2_pre_gates`, `G3_correctness`, `G4_security`, `G5_concurrency`, `G6_environment`, `G7_performance`)
9. **Decision Inspection**: `GET /api/runs/{id}/decision` &rarr; Authoritative verdict `REJECTED` (`SEC:G4_security FAIL`)
10. **Hardware Provenance**: `GET /api/runs/{id}/baseline` &rarr; Verified host CPU (`Intel i5-13450HX`, 16 cores), GPU (`RTX 3050 6GB`), and SHA-256 environment digest
11. **Ledger Integrity**: `POST /api/runs/{id}/ledger/verify` &rarr; 32 chained entries verified (`valid=True`, `chain_broken=False`)
12. **Report Generation & Retrieval**: `POST /api/runs/{id}/reports`, `GET /api/runs/{id}/reports/{report_id}` &rarr; Markdown report generated and retrieved (1701 bytes)

---

## 5. Comprehensive Test Matrix

| Test Suite | Command | Exit Code | Passed | Failed | Skipped | Classification |
|---|---|---|---|---|---|---|
| **Backend Unit & Integration Tests** | `pytest tests/ -v` | 0 | 63 | 0 | 1 | `PASS — LOCAL` |
| **Phase 3 Benchmarks & Security Tests** | `pytest tests/test_phase3_benchmarks.py -v` | 0 | 19 | 0 | 0 | `PASS — LOCAL` |
| **End-to-End 24-Step Harness** | `python scripts/verify_e2e.py` | 0 | 24 | 0 | 0 | `PASS — LOCAL` |
| **Probe Self-Test (P03 IDOR)** | `python tests/selftest.py P03` | 0 | 2 | 0 | 0 | `PASS — LOCAL` |
| **Next.js Production Build** | `cd frontend && npm run build` | 0 | All Routes | 0 | 0 | `PASS — LOCAL` |
| **Live Frontend HTTP Proxy** | `curl.exe http://localhost:3000/api/health` | 0 | 1 | 0 | 0 | `PASS — LIVE` |
| **Live SSE Streaming** | `curl.exe http://localhost:3000/api/runs/{id}/events` | 0 | 1 | 0 | 0 | `PASS — LIVE` |
| **Alembic Migration Verification** | `python -m alembic current` | 0 | Head | 0 | 0 | `PASS — LIVE` |

---

## 6. Go / No-Go Assessment

### **`CONDITIONAL GO — LOCAL DEVELOPMENT SAFE, SPECIFIC INTEGRATIONS STILL BLOCKED`**

- **Safe to Demonstrate & Develop Locally**:
  - Full local Web Cockpit (`localhost:3000`) and FastAPI backend (`localhost:8765`).
  - Real SQLite persistence, optimistic locking, and Alembic migrations.
  - Live SSE streaming through frontend reverse proxy.
  - Native NVIDIA NVML GPU hardware interrogation and environment fingerprinting.
  - Reproducible benchmark harness with `rel_MAD` dispersion gating.
  - Zero-Compromise security veto (P03 IDOR scenario).
  - Cryptographic SHA-256 evidence ledger and report generation.
- **Explicit Blockers to Acknowledge**:
  - `NEBIUS_API_KEY` is not configured: live remote LLM calls (`nvidia/nemotron-3-super-120b`) cannot be made; the system operates on deterministic local rule engines.
  - Benchmarks execute on the **Host CPU**, not as GPU CUDA compute kernels.
