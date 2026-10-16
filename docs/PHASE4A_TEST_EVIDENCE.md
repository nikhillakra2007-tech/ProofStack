# PROOFSTACK / PERFPROOF — PHASE 4A TEST EVIDENCE LOG

This document records the empirical command executions, exit codes, and classifications gathered during the Phase 4A audit on branch `chore/phase4-connection-audit`.

---

## 1. Test Execution Evidence

| Timestamp (UTC) | Command Executed | Exit Code | Result | Classification | Details |
|---|---|---|---|---|---|
| `2026-10-16 19:02:32` | `git status --short --branch` | 0 | PASSED | `PASS — LIVE` | Working tree completely clean; on branch `main` at `b156b95`. |
| `2026-10-16 19:02:46` | `git branch backup/pre-connection-audit-20261017-0033` | 0 | PASSED | `PASS — LOCAL` | Created local backup branch pointing to `b156b954c5c8396157cf42a2a0ca8fe4cf96bd53`. |
| `2026-10-16 19:02:50` | `git tag -a v0.4.0-baseline-b156b95` | 0 | PASSED | `PASS — LOCAL` | Created annotated baseline tag on `b156b95`. |
| `2026-10-16 19:02:56` | `git push origin backup/pre-connection-audit-20261017-0033 v0.4.0-baseline-b156b95` | 0 | PASSED | `PASS — LIVE` | Successfully backed up baseline branch and tag to remote repository. |
| `2026-10-16 19:03:06` | `git checkout -b chore/phase4-connection-audit` | 0 | PASSED | `PASS — LOCAL` | Switched to isolated audit branch. `main` is untouched. |
| `2026-10-16 19:03:26` | `python --version; node --version; npm --version` | 0 | PASSED | `PASS — LIVE` | Python 3.12.10, Node.js v24.18.1, npm 12.1.0 detected. |
| `2026-10-16 19:03:47` | `python -m alembic heads` | 0 | PASSED | `PASS — LOCAL` | Head revision: `004_final_remediation (head)`. |
| `2026-10-16 19:03:55` | `python -m alembic current` | 0 | PASSED | `PASS — LIVE` | SQLite database `proofstack.db` verified at `004_final_remediation`. |
| `2026-10-16 19:04:38` | `Invoke-RestMethod http://127.0.0.1:8765/api/health` | 0 | PASSED | `PASS — LIVE` | Direct FastAPI backend returned `{"status":"ok","version":"0.1.0"}`. |
| `2026-10-16 19:04:39` | `Invoke-RestMethod http://localhost:3000/api/health` | 0 | PASSED | `PASS — LIVE` | Next.js rewrite proxy `/api/:path*` correctly forwarded to port 8765. |
| `2026-10-16 19:06:17` | `curl.exe http://localhost:3000/` | 0 | PASSED | `PASS — LIVE` | Next.js Cockpit root page served with HTTP 200. |
| `2026-10-16 19:06:17` | `curl.exe http://localhost:3000/projects` | 0 | PASSED | `PASS — LIVE` | Next.js Projects & Intake management served with HTTP 200. |
| `2026-10-16 19:06:17` | `curl.exe http://localhost:3000/runs/demo-run-idor-2026` | 0 | PASSED | `PASS — LIVE` | Case file detail viewport served with HTTP 200. |
| `2026-10-16 19:06:28` | `python -c "<database_crud_test>"` | 0 | PASSED | `PASS — LIVE` | Verified 16 tables, write, read-back, and isolated clean deletion. |
| `2026-10-16 19:07:05` | `python -c "<full_pipeline_test>"` | 0 | PASSED | `PASS — LIVE` | 12-step pipeline executed through frontend proxy to terminal report. |
| `2026-10-16 19:09:43` | `python -c "<sse_stream_test>"` | 0 | PASSED | `PASS — LIVE` | Verified `text/event-stream` headers & `: connected` chunk via proxy. |
| `2026-10-16 19:10:09` | `python -m pytest tests/ -v` | 0 | PASSED | `PASS — LOCAL` | 63 passed, 1 skipped (POSIX guest runner on Windows). |
| `2026-10-16 19:10:16` | `python scripts/verify_e2e.py` | 0 | PASSED | `PASS — LOCAL` | 24/24 end-to-end verification steps passed. |
| `2026-10-16 19:10:20` | `python tests/selftest.py P03` | 0 | PASSED | `PASS — LOCAL` | P03 IDOR probe self-test passed (red exploit found, green clean). |
| `2026-10-16 19:10:30` | `cd frontend && npm run build` | 0 | PASSED | `PASS — LOCAL` | Production build succeeded with 0 TypeScript/lint errors. |

---

## 2. Hardware and Environment Evidence

| Property | Value Observed | Verification Method |
|---|---|---|
| **Host GPU Model** | `NVIDIA GeForce RTX 3050 6GB Laptop GPU` | Direct native `nvml.dll` ctypes query (`nvmlDeviceGetName`) |
| **Driver Version** | `596.08` | `nvmlSystemGetDriverVersion` |
| **CUDA Driver Version** | `13.2` (`13020`) | `nvmlSystemGetCudaDriverVersion` |
| **VRAM Capacity** | `6,442,450,944 bytes` (6,144 MiB) | `nvmlDeviceGetMemoryInfo` |
| **Compute Capability** | `8.6` | `nvmlDeviceGetCudaComputeCapability` |
| **Host CPU Model** | `13th Gen Intel(R) Core(TM) i5-13450HX` | `platform.processor()` and Windows Registry query |
| **Logical CPU Cores** | `16` | `os.cpu_count()` |
| **Workload Device** | `Host CPU` | Execution profiling in `proofstack.benchmark.workloads` |
