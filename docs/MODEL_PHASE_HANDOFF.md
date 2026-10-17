# PROOFSTACK / PERFPROOF — PHASE MODEL HANDOFF
## Operational Runbook, Git Integrity Status, and Integration Guide

**Handoff Date:** October 17, 2026  
**Active Branch:** `model`  
**Preserved Baseline:** `b156b954c5c8396157cf42a2a0ca8fe4cf96bd53` (`main`)  
**Status:** `READY FOR REVIEW ON MODEL BRANCH`  

---

## 1. Git Safety Verification

| Safety Invariant | Status | Verification Reference |
|---|---|---|
| **Main Branch Integrity** | **UNTOUCHED / FROZEN** | `git rev-parse main` -> `b156b954c5c8396157cf42a2a0ca8fe4cf96bd53` |
| **Friend's Branch (`origin/nitin/engine-cockpit-dast`)** | **PRESERVED** | Points to `75a5647` (zero modification, no deletion) |
| **All Existing Branches** | **100% PRESERVED** | Zero branches deleted; strict safety policy maintained |
| **Delivery Branch** | **ISOLATED (`model`)** | All commits made exclusively on `model` |

---

## 2. Environment Configuration

To configure the live Nebius Token Factory integration:

1. Create or edit `.env` in the repository root:
```env
# Server secret for backend API authentication (required)
SECRET_KEY=test-secret-key-12345

# Nebius Token Factory Credentials (optional, activates live LLM inference)
NEBIUS_API_KEY=your_nebius_api_key_here
NEBIUS_BASE_URL=https://api.tokenfactory.nebius.com/v1

# Models
MODEL_DIAGNOSIS=nvidia/nemotron-3-super-120b
MODEL_PATCH=nvidia/nemotron-3.5-lightning
```

2. If `NEBIUS_API_KEY` is omitted, ProofStack operates in **honest local fallback mode**:
   - The engine automatically routes to its deterministic rule engine.
   - The Web Cockpit displays `Deterministic Rule Engine (Local Fallback)` with provenance notes.
   - All security gates, benchmarks, and ledger chains operate normally.

---

## 3. Operational Runbook

### A. Run Verification Engine
```powershell
python scripts/verify_phase.py
```
This runs the full test suite (76 passed, 1 skipped), PSEC IDOR probe selftest, model subsystem tests, and frontend production build.

### B. Run Backend API Server
```powershell
cd c:\Users\nikhi\OneDrive\Desktop\coding\NVIDIA\backend
python server.py
# Server listens on http://127.0.0.1:8765
```

### C. Run Frontend Cockpit
```powershell
cd c:\Users\nikhi\OneDrive\Desktop\coding\NVIDIA\frontend
npm run dev
# Cockpit accessible at http://localhost:3000
```

### D. On-Demand Model Endpoints
```powershell
# Check model readiness (redacts secret key)
curl -H "X-API-Key: test-secret-key-12345" http://localhost:3000/api/model/status

# Trigger evidence-grounded diagnosis for a run
curl -X POST -H "X-API-Key: test-secret-key-12345" http://localhost:3000/api/runs/<RUN_ID>/analyze

# Trigger candidate patch proposal for a run
curl -X POST -H "X-API-Key: test-secret-key-12345" http://localhost:3000/api/runs/<RUN_ID>/propose-patch
```

---

## 4. Key Security Boundaries Enforced

1. **Model Output Is Not Authority**:
   - The final acceptance verdict is produced strictly by `proofstack.core.acceptance.decide` based on independent gate evidence (G0–G7).
   - A model cannot override a failed security gate (e.g., P03 IDOR breach) or force an `ACCEPTED` verdict.
2. **Patch Isolation**:
   - Proposed patches are marked `AWAITING_VERIFICATION` and cannot modify protected paths (`tests/**`, `alembic/**`, `.env`, configuration files).
   - Patches exceeding file count or line budgets are rejected server-side.
3. **Cryptographic Tamper-Evidence**:
   - Every model interaction is recorded in the HMAC-SHA256 evidence ledger.
   - Modifying any attribute of a persisted model record invalidates the ledger chain.
