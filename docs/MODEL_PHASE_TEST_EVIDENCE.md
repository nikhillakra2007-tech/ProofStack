# PROOFSTACK / PERFPROOF — PHASE MODEL TEST EVIDENCE
## Reproducible Test Execution Records and Cryptographic Evidence

**Execution Timestamp:** October 17, 2026  
**Environment:** Python 3.12.10 (win32), Node.js v20.x, SQLite 3  
**Target Branch:** `model`  
**Baseline Commit:** `b156b954c5c8396157cf42a2a0ca8fe4cf96bd53`  

---

## 1. Automated Test Execution Matrix

| Timestamp (UTC+5:30) | Exact Command | Exit Code | Result | Scope / Classification | Details |
|---|---|---|---|---|---|
| `2026-10-17 16:35:43` | `pytest tests/ -v` | 0 | **76 PASSED, 1 SKIPPED** | Full Regression (Local) | Covers API, Core, DB, LLM, Model Service, Benchmarks, Remediation, Sandbox. |
| `2026-10-17 16:33:51` | `pytest tests/test_model_service.py -v` | 0 | **8 PASSED** | Unit & Security (Local + Mock) | Tests unconfigured status, configured status, deterministic fallback, live inference mock, provider failure fallback, patch boundaries, path traversal prevention, ledger tamper detection. |
| `2026-10-17 16:35:22` | `pytest tests/test_model_api.py -v` | 0 | **5 PASSED** | API Contract & Auth (Local) | Tests auth requirement, status readout, run analysis endpoint, patch proposal endpoint, 404 handling. |
| `2026-10-17 16:40:03` | `python tests/selftest.py P03` | 0 | **PASSED** | PSEC Probe (Local) | Verified Red exploit reproduction (1428x growth) and Green clean run under tenant isolation. |
| `2026-10-17 16:40:31` | `npm run build` (in `frontend/`) | 0 | **PASSED** | Frontend Build (Local) | Next.js 14.2.35 compilation, linting, typechecking (0 errors, 5 static/dynamic routes generated). |
| `2026-10-17 16:40:31` | `python scripts/verify_phase.py` | 0 | **ALL 4/4 PASSED** | Release Verifier (Automated) | Complete end-to-end multi-tier test harness. |

---

## 2. Model Subsystem Test Breakdown (`tests/test_model_service.py`)

1. `test_model_service_status_unconfigured`:
   - Validates that without `NEBIUS_API_KEY`, status reports `configured=False`, `provenance_mode="deterministic_fallback"`, `key_preview=None`.
2. `test_model_service_status_configured`:
   - Validates that when key is present, preview is redacted (`neb_****`) and never leaks the full secret.
3. `test_deterministic_fallback_hypothesis_generation`:
   - Runs hypothesis generation on an unconfigured client.
   - Confirms provenance is `deterministic_fallback`, `provider="local_rules"`.
   - Confirms grounded finding: P03 IDOR finding correctly generates `IDOR_CACHE` hypothesis.
   - Confirms database persistence and cryptographic ledger chaining (`MODEL_CALL`, `HYPOTHESES`).
4. `test_live_inference_mock_hypothesis_generation`:
   - Spins up an HTTP server emulating Nebius Token Factory OpenAI-compatible API.
   - Sends real JSON completions response with usage tokens and structured schema.
   - Confirms engine extracts `provenance="live_inference"`, `provider="nebius"`, records `tokens_in=250`, `tokens_out=120`, and SHA-256 digest of response payload.
5. `test_live_inference_failure_graceful_fallback`:
   - Emulates an external provider HTTP 500 outage.
   - Verifies engine does not crash or corrupt state, but seamlessly falls back to local rules with clear provenance notation.
6. `test_patch_proposal_security_boundary_enforcement`:
   - Generates patch proposal for target `app/invoices.py`.
   - Confirms patch is marked `review_status="AWAITING_VERIFICATION"` and `application_outcome="PROPOSED"`.
7. `test_patch_security_rules_reject_protected_paths`:
   - Tests adversarial patches attempting to modify `tests/test_api.py` or `../../etc/passwd`.
   - Confirms server-side security rejection (`REJECTED_SECURITY`) with zero modifications allowed to protected paths.
8. `test_ledger_chain_and_tamper_detection_with_model_events`:
   - Appends `MODEL_CALL` block to evidence ledger.
   - Verifies chain integrity (`valid=True`).
   - Mutates a single attribute in payload; verifies `verify_chain` detects tamper (`tampered entry 0`).
   - Restores payload; verifies chain integrity is restored.

---

## 3. Python Test Output Log Excerpt

```text
============================= test session starts =============================
platform win32 -- Python 3.12.10, pytest-8.2.2, pluggy-1.6.0
rootdir: C:\Users\nikhi\OneDrive\Desktop\coding\NVIDIA
configfile: pyproject.toml
testpaths: tests
plugins: anyio-4.14.2, Faker-30.1.0, asyncio-0.24.0, cov-5.0.0
asyncio: mode=Mode.STRICT, default_loop_scope=function
collected 77 items

tests/test_api.py::test_health PASSED
tests/test_api.py::test_create_project PASSED
tests/test_api.py::test_list_projects PASSED
tests/test_api.py::test_get_project_not_found PASSED
tests/test_api.py::test_create_task PASSED
tests/test_api.py::test_create_task_invalid PASSED
tests/test_api.py::test_create_run PASSED
tests/test_api.py::test_get_run_not_found PASSED
tests/test_api.py::test_list_runs PASSED
tests/test_api.py::test_cancel_run PASSED
tests/test_api.py::test_ledger_verify_empty PASSED
tests/test_api.py::test_decision_endpoint_not_found PASSED
tests/test_api.py::test_demo_seed_and_lifecycle PASSED
tests/test_core.py::test_selector_worked_example PASSED
tests/test_core.py::test_perf_gate_decisions PASSED
tests/test_core.py::test_ledger_file_chain_and_tamper PASSED
tests/test_core.py::test_acceptance_gate_rules PASSED
tests/test_core.py::test_registry_oracle PASSED
tests/test_db.py::test_create_project PASSED
tests/test_db.py::test_project_task_relationship PASSED
tests/test_db.py::test_run_creation PASSED
tests/test_db.py::test_ledger_append_and_verify PASSED
tests/test_db.py::test_ledger_tamper_detection PASSED
tests/test_db.py::test_baseline_samples PASSED
tests/test_db.py::test_unique_event_sequence PASSED
tests/test_db.py::test_artifact_path_traversal_protection PASSED
tests/test_llm.py::test_resolve_model PASSED
tests/test_llm.py::test_model_client_backoff_and_repairs PASSED
tests/test_llm.py::test_prompt_rendering PASSED
tests/test_model_api.py::test_model_status_requires_auth PASSED
tests/test_model_api.py::test_model_status_authenticated PASSED
tests/test_model_api.py::test_analyze_run_endpoint PASSED
tests/test_model_api.py::test_propose_patch_endpoint PASSED
tests/test_model_api.py::test_analyze_run_not_found PASSED
tests/test_model_service.py::test_model_service_status_unconfigured PASSED
tests/test_model_service.py::test_model_service_status_configured PASSED
tests/test_model_service.py::test_deterministic_fallback_hypothesis_generation PASSED
tests/test_model_service.py::test_live_inference_mock_hypothesis_generation PASSED
tests/test_model_service.py::test_live_inference_failure_graceful_fallback PASSED
tests/test_model_service.py::test_patch_proposal_security_boundary_enforcement PASSED
tests/test_model_service.py::test_patch_security_rules_reject_protected_paths PASSED
tests/test_model_service.py::test_ledger_chain_and_tamper_detection_with_model_events PASSED
tests/test_phase3_benchmarks.py::test_cpu_info_structure PASSED
tests/test_phase3_benchmarks.py::test_nvidia_gpu_detection_real_or_fallback PASSED
tests/test_phase3_benchmarks.py::test_nvidia_gpu_unavailable_mock PASSED
tests/test_phase3_benchmarks.py::test_fingerprint_deterministic_serialization PASSED
tests/test_phase3_benchmarks.py::test_percentile_linear_interpolation PASSED
tests/test_phase3_benchmarks.py::test_rel_mad_calculation PASSED
tests/test_phase3_benchmarks.py::test_benchmark_harness_warmup_and_samples PASSED
tests/test_phase3_benchmarks.py::test_benchmark_harness_captures_errors_non_destructively PASSED
tests/test_phase3_benchmarks.py::test_comparison_insufficient_samples PASSED
tests/test_phase3_benchmarks.py::test_comparison_zero_baseline PASSED
tests/test_phase3_benchmarks.py::test_comparison_unstable_noise_rel_mad PASSED
tests/test_phase3_benchmarks.py::test_comparison_supported_optimization PASSED
tests/test_phase3_benchmarks.py::test_comparison_performance_regression PASSED
tests/test_phase3_benchmarks.py::test_zero_compromise_security_veto_overrides_massive_speedup PASSED
tests/test_phase3_benchmarks.py::test_zero_compromise_correctness_veto PASSED
tests/test_phase3_benchmarks.py::test_zero_compromise_all_pass_yields_accepted PASSED
tests/test_phase3_benchmarks.py::test_workload_search_lookup_differential_equivalence PASSED
tests/test_phase3_benchmarks.py::test_workload_idor_security_scenario PASSED
tests/test_phase3_benchmarks.py::test_ledger_tampering_payload_mutation PASSED
tests/test_remediation.py::test_orchestrator_unstable_baseline_inconclusive_verdict PASSED
tests/test_remediation.py::test_orchestrator_stable_baseline_completes_full_pipeline PASSED
tests/test_remediation.py::test_orchestrator_unexpected_exception_marks_failed PASSED
tests/test_remediation.py::test_orchestrator_cancellation_honored PASSED
tests/test_remediation.py::test_database_schema_and_version_columns PASSED
tests/test_remediation.py::test_cascade_delete_run_cleans_decisions_and_reports PASSED
tests/test_remediation.py::test_auth_public_endpoints PASSED
tests/test_remediation.py::test_auth_missing_and_invalid_key_rejected PASSED
tests/test_remediation.py::test_optimistic_locking_project PASSED
tests/test_remediation.py::test_optimistic_locking_task_and_run PASSED
tests/test_remediation.py::test_mass_assignment_protection PASSED
tests/test_remediation.py::test_report_generation_and_cross_run_isolation PASSED
tests/test_remediation.py::test_ledger_chain_and_tamper_detection PASSED
tests/test_sandbox.py::test_nebius_adapter PASSED
tests/test_sandbox.py::test_docker_argv PASSED
tests/test_sandbox.py::test_guest_runner SKIPPED

======================== 76 passed, 1 skipped in 8.65s ========================
```
