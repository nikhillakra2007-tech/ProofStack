# PROOFSTACK / PERFPROOF — DEMO REHEARSAL & TECHNICAL NARRATIVE
## Live Competition Demonstration Runbook for Technical Evaluators and Judges

**Showcase Scenario:** High-Assurance AI Patch Evaluation & Zero-Compromise Security Veto  
**Demonstrated Defenses:** P03 IDOR Cache Vulnerability, NVIDIA Hardware Detection, Statistical Noise Gating, HMAC-SHA256 Evidence Ledger, and Model Integration with Honest Fallback.  
**Demonstration Time:** 5–7 minutes  

---

## 1. Demonstration Setup & Prerequisites

1. **Terminal 1 (Backend API)**:
```powershell
cd c:\Users\nikhi\OneDrive\Desktop\coding\NVIDIA\backend
python server.py
# Listening on http://127.0.0.1:8765
```

2. **Terminal 2 (Frontend Cockpit)**:
```powershell
cd c:\Users\nikhi\OneDrive\Desktop\coding\NVIDIA\frontend
npm run dev
# Open browser at http://localhost:3000
```

3. **Terminal 3 (Presenter Terminal)**:
Keep open in repository root for CLI verification commands.

---

## 2. Technical Script & Walkthrough

### Act 1: The Core Problem — "The 1000x Speedup That Leaks Customer Data"
- **Presenter says**:
  > *"Modern AI coding assistants often suggest patches that dramatically accelerate database or cache lookups. But without deterministic security verification, an optimization can introduce catastrophic vulnerabilities like Insecure Direct Object References (IDOR). ProofStack is an autonomous verification engine that refuses to compromise security for speed."*
- **Action in UI**:
  - Open `http://localhost:3000/`.
  - Click on the pre-seeded **"Invoice Cache Lookups"** project, or click **"Load Demo Fixture"**.
  - Navigate to the Run Detail view.

### Act 2: Hardware Provenance & Baseline Stability
- **Presenter says**:
  > *"ProofStack inspects the real host environment using native NVML ctypes probes. We detect the physical NVIDIA GeForce RTX 3050 GPU, but we maintain honest provenance: our microbenchmarks execute on the host CPU, and we never claim fake GPU acceleration."*
- **Visual in UI**:
  - Point to **Viewport 1 (Baseline Telemetry)**:
  - Show the median latency (`1,000,000 ns`) and the Relative Median Absolute Deviation (`rel_mad = 0.03`).
  - Explain that if noise exceeded `tau_noise` (0.10), the run would halt as `INCONCLUSIVE` instead of guessing.

### Act 3: Evidence-Grounded Model Assistance
- **Presenter says**:
  > *"ProofStack connects to NVIDIA Nemotron models via Nebius Token Factory. If cloud credentials are set, it queries live inference. When unconfigured, it operates honestly in local fallback mode—our UI clearly labels the diagnosis as 'Deterministic Rule Engine' rather than faking AI inference."*
- **Visual in UI**:
  - Point to **Viewport 2 (Hypotheses & Experimentation)**:
  - Show Hypothesis **H1 (IDOR_CACHE)** with provenance badge.
  - Show the falsifiable prediction: *"Missing principal in invoice cache key permits cross-tenant data access."*
  - Show the executed discriminating experiment **E1**.

### Act 4: The Security Veto — "Why the Model's Word is Never Proof"
- **Presenter says**:
  > *"The candidate patch achieves a massive speedup by caching invoice lookups in memory. But in Viewport 3, our DAST probe P03 reproduces the exploit: attacker 'Bob' accessed invoice #42 owned by 'Alice'."*
- **Visual in UI**:
  - Point to **Viewport 3 (Patch & Exploit Inspector)**:
  - Show candidate patch diff. Note the `AWAITING_VERIFICATION` review status badge.
  - Show the red breach alert: `DAST Exploit Proven in Candidate Patch`.
  - Point to **Viewport 4 (Gate Table)** and the **Interlock Gauge**:
  - Performance Gate (G7) = **PASS** (1.42x speedup).
  - Security Gate (G4) = **FAIL** (`IDOR vulnerability reproduced: Bob accessed Alice's invoice`).
  - Canonical Verdict = **REJECTED**.

### Act 5: The Cryptographic Evidence Ledger
- **Presenter says**:
  > *"Every single step—task intake, baseline samples, audit findings, model calls, patch diffs, and gate results—is cryptographically hashed into an append-only HMAC-SHA256 ledger. Let's verify it live."*
- **Action in UI**:
  - Switch to the **"Cryptographic Evidence Ledger"** tab.
  - Show the 32 chained blocks.
  - Click **"Verify Ledger Chain"**.
  - Show the green verification banner: `Valid: True | Head Hash: a9b4... | Blocks: 32`.

### Act 6: Live Tamper Detection (Terminal Proof)
- **Presenter says**:
  > *"What happens if an attacker or rogue process modifies a database record after the fact? ProofStack's chain immediately flags it."*
- **Action in Terminal 3**:
```powershell
python -m pytest tests/test_model_service.py -k "tamper" -v
```
- **Result**: Displays `test_ledger_chain_and_tamper_detection_with_model_events PASSED`.

---

## 3. Contingency & Troubleshooting Runbook

| Failure Mode | Immediate Fix / Contingency Action |
|---|---|
| **Demo Run Incomplete or Unseeded** | Click **"Reset & Re-seed Demo"** button on the overview page, or run `curl -X POST -H "X-API-Key: change-me-in-production" http://localhost:3000/api/demo/seed?force=true`. |
| **Port 8765 Already in Use** | Kill existing python process with `Get-Process -Name python \| Stop-Process -Force` in PowerShell and restart `python server.py`. |
| **No Internet / Nebius API Key Unset** | Explain to the judge: *"ProofStack is designed to fail safe. Without external credentials, it uses the local deterministic rule engine, logging explicit fallback provenance in the ledger."* |
