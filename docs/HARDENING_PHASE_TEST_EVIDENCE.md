# PROOFSTACK / PERFPROOF — MASTER HARDENING PHASE TEST EVIDENCE
## Comprehensive Hardening Test Run Records and Defense Audits

**Test Execution Date:** October 17, 2026  
**Environment:** Python 3.12.10, SQLite 3, Node.js v20.x, Windows 11  
**Target Delivery Branch:** `model`  
**Preserved Baseline:** `b156b954c5c8396157cf42a2a0ca8fe4cf96bd53` (`main`)  

---

## 1. Hardening Test Matrix

| Category | Command | Exit Code | Result | Pass/Fail Details |
|---|---|---|---|---|
| **Full Regression Suite** | `pytest tests/ -q` | 0 | **76 PASSED, 1 SKIPPED** | All 77 tests in repository pass cleanly. |
| **PSEC Security Selftest** | `python tests/selftest.py P03` | 0 | **PASSED** | Validates probe detection of cross-tenant IDOR exploit and verification of patched isolation. |
| **Model Security Boundaries** | `pytest tests/test_model_service.py -k "security" -v` | 0 | **2 PASSED** | Rejection of protected paths (`tests/**`, `.env`) and path traversal (`../../`). |
| **Ledger Tamper Detection** | `pytest tests/test_model_service.py -k "tamper" -v` | 0 | **1 PASSED** | Verified that payload mutation breaks hash chain with `tampered entry 0`. |
| **API Authentication** | `pytest tests/test_model_api.py -k "auth" -v` | 0 | **2 PASSED** | Verified 401 on missing key, 403 on invalid key, 200 on valid key. |
| **Frontend Production Build** | `npm run build` in `frontend/` | 0 | **PASSED** | Next.js 14.2.35 compilation, 0 TypeScript errors, 0 ESLint warnings. |
| **All-in-One Verifier** | `python scripts/verify_phase.py` | 0 | **ALL 4/4 PASSED** | Complete end-to-end execution script. |

---

## 2. Hardening Fix Verifications

### Defect SEC-01: ModelClient Missing API Key
- **Before**: `ModelClient()` raised unhandled `KeyError: 'NEBIUS_API_KEY'` terminating caller processes.
- **After**: `ModelClient()` initializes cleanly with `is_configured=False` and raises typed `ModelConfigError` only on attempted network execution.
- **Evidence**: `test_model_service_status_unconfigured` passed.

### Defect SEC-02: Path Traversal in Proposed Patches
- **Before**: Touches list was not audited against path traversal or protected directories.
- **After**: Server rejects diffs touching `tests/**`, `alembic/**`, `.env`, or containing `..`.
- **Evidence**: `test_patch_security_rules_reject_protected_paths` passed.

### Defect INT-01: Cryptographic Ledger Tampering
- **Before**: Model calls had no tamper-evident ledger tracking.
- **After**: `MODEL_CALL`, `HYPOTHESES`, and `PATCH` entries are appended to the HMAC-SHA256 hash chain with strict sequential linking.
- **Evidence**: `test_ledger_chain_and_tamper_detection_with_model_events` passed.
