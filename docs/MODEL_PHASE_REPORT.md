# PROOFSTACK / PERFPROOF — PHASE MODEL REPORT
## Production-Grade AI Model Integration, Evidence-Grounded Engineering Intelligence, Security Enforcement, Full Verification, and Safe Git Branch Delivery

**Delivery Branch:** `model`  
**Protected Baseline:** `b156b954c5c8396157cf42a2a0ca8fe4cf96bd53` (`main`)  
**Status:** `READY FOR REVIEW ON MODEL BRANCH`  
**Date:** October 17, 2026  

---

## 1. Executive Summary & Purpose

The objective of Phase Model was to make ProofStack's AI/model layer genuinely useful, operationally integrated, testable, and defensible—avoiding superficial "AI theater." 

Prior to this phase:
- A client existed in `proofstack.llm.client` targeting Nebius Token Factory and NVIDIA Nemotron models, but it raised unhandled `KeyError` exceptions when `NEBIUS_API_KEY` was missing, and was not integrated into the backend run lifecycle or API routes.
- The backend orchestrator hardcoded `model_metadata={"source": "deterministic_stub"}` and had no model service abstraction.
- The Web Cockpit displayed `Proposed by Nemotron` regardless of whether inference occurred or a local rule stub executed.
- No HTTP endpoints existed for requesting on-demand model-assisted run diagnosis or code-remediation patch generation.

In this phase, we implemented:
1. **Model Service Abstraction (`backend/model_service.py`)**: A production-grade service that coordinates live Nebius Token Factory inference with strict server-side JSON schema validation and honest deterministic fallback.
2. **Evidence-Grounded Prompting**: Delimits all untrusted inputs (source code, logs, user input) inside content-hashed `<untrusted-{hash}>` blocks via `proofstack.llm.render.fence`, preventing prompt injection.
3. **Strict Structured Schema Validation**: Validates all model hypotheses against `schemas/hypothesis-set.v1.json` rules server-side before persisting or displaying.
4. **Security Veto & Boundaries on Patch Proposals**: Model-proposed patches undergo path restriction audits (`tests/**`, `alembic/**`, `.env`, and traversal patterns are strictly forbidden), line budgets, and are labeled `AWAITING_VERIFICATION`—they cannot override deterministic gates or falsify acceptance verdicts.
5. **Cryptographic Ledger Integration**: Model calls and generated proposals are appended to the hash-chained HMAC-SHA256 evidence ledger as `MODEL_CALL`, `HYPOTHESES`, and `PATCH` events.
6. **Cockpit UI Provenance Transparency**: The UI explicitly distinguishes `Live AI Inference (NVIDIA Nemotron)` from `Deterministic Rule Engine (Local Fallback)` with provenance notes and interactive diagnosis/remediation triggers.
7. **Comprehensive Test Suite**: Added 13 new tests across `tests/test_model_service.py` and `tests/test_model_api.py`, bringing total regression test coverage to 76 passed, 1 skipped.

---

## 2. Git Safety & Branch Lineage

- **Protected Branch (`main`)**: Completely untouched at commit `b156b954c5c8396157cf42a2a0ca8fe4cf96bd53`. Zero commits made to `main`, no rebase, no merge, no push.
- **Friend's Branch (`origin/nitin/engine-cockpit-dast`)**: Preserved untouched at commit `75a5647`.
- **Target Implementation Branch (`model`)**: Safely created from baseline `b156b95`, incorporating cherry-picked Phase 4A connection audit fixes (`2789ffc`), and delivering the complete model architecture.
- **Branch Cleanup**: Zero branches were deleted. All existing branches were inventoried and safely preserved.

### Branch Inventory & Safety Table

| Branch | Classification | Commit | Ownership / Rationale | Action Taken |
|---|---|---|---|---|
| `main` | `PROTECTED_MAIN` | `b156b95` | Primary protected baseline | Preserved untouched |
| `origin/nitin/engine-cockpit-dast` | `PROTECTED_FRIEND_BRANCH` | `75a5647` | Authored by Nitin | Preserved untouched |
| `origin/backend` | `KEEP` | `87d614e` | Ancestral lineage, remote HEAD target | Preserved untouched |
| `origin/backup/pre-connection-audit-20261017-0033` | `KEEP` | `b156b95` | Explicit backup of baseline | Preserved untouched |
| `origin/chore/phase4-connection-audit` | `KEEP` | `e050e1b` | Phase 4A connection audit branch | Preserved untouched |
| `origin/phase4a-verified` | `KEEP` | `e050e1b` | Phase 4A verified reference | Preserved untouched |
| `model` | `REQUIRED_MODEL_BRANCH` | (active) | Phase Model implementation deliverable | Active delivery branch |

---

## 3. Architecture & Model Subsystem Integration

### 3.1 Provider Client Enhancements (`proofstack/llm/client.py`)
- Added typed error hierarchy: `ModelConfigError`, `ModelAuthError`, `ModelRateLimitError`, `ModelProviderError`, `ModelTimeoutError`, `ModelValidationError`.
- Replaced unhandled `os.environ["NEBIUS_API_KEY"]` crash with `self.key = api_key or os.environ.get("NEBIUS_API_KEY", "")` and an `is_configured` property.
- Mapped HTTP 401/403 to `ModelAuthError`, HTTP 429 to `ModelRateLimitError`, HTTP 500–504 to `ModelProviderError`.
- Redacted credentials in exception strings and headers.

### 3.2 Model Service (`backend/model_service.py`)
- Provides `get_status()`, `generate_hypotheses_for_run()`, and `propose_patch_for_run()`.
- Incorporates real runtime context: baseline wall-clock latency, noise rel_mad, reproduced PSEC findings (P01–P19).
- Evaluates live Token Factory inference when credentials exist, with automatic graceful fallback to the deterministic rule engine upon missing key or provider failure.
- Strictly validates outputs server-side; if an LLM returns malformed JSON or ungrounded categories, it safely falls back to grounded findings.

### 3.3 Orchestrator Integration (`backend/orchestrator.py`)
- Refactored `_do_hypothesizing` to invoke `ModelService.generate_hypotheses_for_run`.
- Refactored `_do_patching` to invoke `ModelService.propose_patch_for_run`.
- All outputs are recorded in database tables (`models.Hypothesis`, `models.Patch`) and chained in the cryptographic evidence ledger (`backend.ledger_service.LedgerService`).

### 3.4 API Layer (`backend/server.py` & `backend/schemas.py`)
- `GET /api/model/status`: Returns provider configuration, supported models, and redacted key preview (`neb_****`). Protected by `X-API-Key`.
- `POST /api/runs/{run_id}/analyze`: Triggers evidence-grounded hypothesis generation.
- `POST /api/runs/{run_id}/propose-patch`: Proposes structured unified-diff patch candidate.

### 3.5 Web Cockpit UX (`frontend/`)
- `HypothesisView.tsx`: Displays provenance badge (`Live AI Inference (NVIDIA Nemotron)` vs `Deterministic Rule Engine (Local Fallback)`).
- `PatchView.tsx`: Displays candidate patch diff with clear `AWAITING_VERIFICATION` review status and on-demand patch generation.
- `RunDetailPage`: Added reactive action buttons for triggering analysis and patch proposals.

---

## 4. Verification Summary

| Test Suite | Tests Run | Result | Evidence File Reference |
|---|---|---|---|
| Complete Backend Test Suite | 77 items (76 passed, 1 skipped) | **PASS** | `docs/MODEL_PHASE_TEST_EVIDENCE.md` |
| PSEC IDOR Self-Test (`tests/selftest.py P03`) | Red/Green exploit cycle | **PASS** | `docs/MODEL_PHASE_TEST_EVIDENCE.md` |
| Model Subsystem Unit Tests (`test_model_service.py`) | 8 passed (0 failed) | **PASS** | `docs/MODEL_PHASE_TEST_EVIDENCE.md` |
| Model API Integration Tests (`test_model_api.py`) | 5 passed (0 failed) | **PASS** | `docs/MODEL_PHASE_TEST_EVIDENCE.md` |
| Frontend Production Build (`npm run build`) | Next.js 14.2.35 compilation & typecheck | **PASS (0 errors)** | `docs/MODEL_PHASE_TEST_EVIDENCE.md` |
| Verification Engine (`scripts/verify_phase.py`) | 4/4 stages passed | **PASS (100% GREEN)** | `docs/MODEL_PHASE_TEST_EVIDENCE.md` |

---

## 5. Provider Status & Operational Truthfulness

- **Status**: `LOCAL FALLBACK VERIFIED — LIVE PROVIDER BLOCKED`
- **Reason**: `NEBIUS_API_KEY` is not present in the local environment.
- **Evidence**: Live inference was thoroughly tested using high-fidelity local mock servers simulating Token Factory's OpenAI-compatible completions API, backoff jitter, and repair loops. In the local development environment without credentials, the deterministic rule engine safely takes over, logging clear provenance (`deterministic_fallback`) and never impersonating live inference.
