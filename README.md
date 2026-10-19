# ProofStack (PerfProof) — Autonomous Verification & Forensic Audit Engine

> **Zero-Compromise Performance & Security Verification Gauntlet with Cryptographic Evidence Ledger**  
> *Engineered for High-Assurance AI Patch Evaluation and Live-Target DAST Remediation.*

---

## 1. Architectural Overview

ProofStack (PerfProof) is an evidence-driven verification engine designed to scientifically evaluate software performance optimizations and candidate security patches. It bridges the gap between generative AI proposals and mission-critical production environments by enforcing a fundamental invariant:

$$\textbf{Deterministic Code Decides; The LLM Only Proposes}$$

Verdicts are strictly derived from hardware-isolated empirical measurements, static/dynamic security probes, and invariant checks—never from an agent's narrative.

```
   [ Intake & Task Validation ]
                │
                ▼
   [ Reproducible Context & Baseline Probe ] ────► (_RunComplete early exit if unstable)
                │
                ▼
   [ Hypotheses & Experimentation ]
                │
                ▼
   [ Isolated Candidate Execution & DAST ]
                │
                ▼
   [ Verification Gates (G0 – G7) ]
   ├── G0: Integrity & Diff Constraints
   ├── G1: Supply Chain & Secret Leakage
   ├── G2: Pre-Gate Security Probes
   ├── G3: Correctness & Identity Preservation
   ├── G4: Security Exploit Oracles
   ├── G5: Concurrency Safety
   ├── G6: Complexity / Scaling Invariants
   └── G7: Empirical Performance Speedup
                │
                ▼
   [ Canonical Decision Service (PASS / FAIL / INCONCLUSIVE) ]
                │
                ▼
   [ Tamper-Evident SHA-256 Hash-Chain Ledger & Versioned Reports ]
```

---

## 2. Core Components & Forensic Remediation

### Critical Architectural Invariants
1. **Orchestrator Terminal State Machine (`_RunComplete`)**: Handled at the top-level orchestration boundary. An unstable baseline terminates cleanly as `COMPLETED` with an `INCONCLUSIVE` verdict rather than crashing as `FAILED`.
2. **Atomic Optimistic Concurrency Control**: `Project`, `Task`, and `Run` entities maintain integer `version` columns. All `PATCH` write operations require `expected_version` and return `409 Conflict` on stale updates.
3. **Mass-Assignment Defense**: Strict Pydantic v2 schemas (`extra="forbid"`) reject unauthorized mutations to server-managed fields, hashes, timestamps, and foreign keys.
4. **Cryptographic SHA-256 Ledger**: Every state transition, gate evaluation, and verdict is committed to an append-only hash chain:
   $$\text{entry\_hash} = \text{SHA256}(\text{bytes.fromhex}(\text{prev\_hash}) + \text{canonical\_json}(\text{body}))$$
   Tampered records, altered hashes, or broken links are detected immediately during verification.

---

## 3. Quick Start & Local Setup

### Prerequisites
- Python 3.11 or 3.12
- SQLite (local development) or PostgreSQL (production)

### Installation
```bash
# Clone the repository
git clone https://github.com/nikhillakra2007-tech/something.git
cd something
git checkout main

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -e .
```

### Environment Configuration
Copy the template configuration file:
```bash
cp .env.example .env
```
Key configuration parameters in `.env`:
```ini
PROOFSTACK_ENV=development
DATABASE_URL=sqlite:///./proofstack.db
SECRET_KEY=dev-secret-key-change-in-production
API_KEY=dev-secret-key-change-in-production
ALLOW_ORIGINS=*
```

---

## 4. Database Migrations (Alembic)

ProofStack uses Alembic to manage database schema evolutions.

```bash
# Check current migration revision
python -m alembic current

# Upgrade database to latest head (including 004_final_remediation)
python -m alembic upgrade head

# Inspect migration history
python -m alembic history
```

The database schema includes:
- `projects`, `tasks`, and `runs` tables with atomic `version` columns.
- `decisions` and `reports` tables with cascade delete semantics (`ondelete="CASCADE"`).
- `ledger_entries`, `baselines`, `gates`, `findings`, and `artifacts`.

---

## 5. Running the Backend Server

Start the FastAPI application using Uvicorn:

```bash
# Start server locally on port 8000
python server.py
# or directly via uvicorn
python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
```

The server binds to `http://localhost:8000`. Interactive documentation is available at:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

---

## 6. API Reference

All protected endpoints require the `X-API-Key` header matching `SECRET_KEY`.

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Service health status |
| `GET` | `/api/ready` | Public | Database readiness check |
| `POST` | `/api/run` | Public | MicroVM sandbox code runner & ReDoS/SQLi canary trace |
| `POST` | `/api/audit` | Public | Evaluate Zero-Compromise Gates G0 through G7 |
| `POST` | `/api/heal` | Public | Synthesize defensive patch via NVIDIA Nemotron |
| `GET` | `/api/ledger/verify` | Public | Global SHA-256 evidence chain verification |
| `POST` | `/api/dast/scans` | Public | Live DAST scanner execution with ownership verification |
| `POST` | `/api/dast/targets` | Public | Register web URL target for DAST telemetry |
| `GET` | `/api/projects` | Protected | List all registered projects |
| `POST` | `/api/projects` | Protected | Register a new project |
| `PATCH` | `/api/projects/{id}` | Protected | Update project (with `expected_version`) |
| `GET` | `/api/tasks` | Protected | List all benchmark & audit tasks |
| `POST` | `/api/tasks` | Protected | Create benchmark/audit task intake |
| `PATCH` | `/api/tasks/{id}` | Protected | Update task parameters |
| `POST` | `/api/runs` | Protected | Dispatch a verification run |
| `GET` | `/api/runs/{id}` | Protected | Fetch run status and progress |
| `POST` | `/api/runs/{id}/start` | Protected | Dispatch/execute run in orchestrator |
| `POST` | `/api/runs/{id}/cancel` | Protected | Abort active run |
| `GET` | `/api/runs/{id}/decision` | Protected | Fetch canonical decision record |
| `POST` | `/api/runs/{id}/reports` | Protected | Generate Markdown/JSON report |
| `GET` | `/api/runs/{id}/reports/{id}` | Protected | Retrieve generated report |
| `POST` | `/api/runs/{id}/ledger/verify` | Protected | Validate run SHA-256 ledger integrity |
| `GET` | `/api/runs/{id}/events` | Protected | Server-Sent Events (SSE) live updates |
| `GET` | `/api/model/status` | Protected | NVIDIA Nemotron model service configuration status |
| `POST` | `/api/runs/{id}/analyze` | Protected | Generate hypotheses using NVIDIA Nemotron |
| `POST` | `/api/runs/{id}/propose-patch` | Protected | Synthesize and validate candidate code patch |
| `POST` | `/api/demo/seed` | Protected | Seed deterministic IDOR showcase fixture |
| `POST` | `/api/demo/reset` | Protected | Reset demo fixture cleanly |
| `GET` | `/api/demo/status` | Protected | Check demo fixture state |

---

## 7. Interactive Studio & Forensic Cockpit (`web/`)

ProofStack includes a state-of-the-art **Enterprise Studio & Forensic Cockpit** built with **Next.js 14**, **Tailwind CSS**, and **Monaco Editor**, designed according to the `docs/ProofStack_Unified_UI_UX_Blueprint.pdf` specification.

### Quick Start: Launch the Web Portal
```bash
# Navigate to web directory
cd web

# Install dependencies (Next 14, Monaco, Lucide, Tailwind)
npm install

# Start development server on port 3000
npm run dev
```

Open **`http://localhost:3000`** in your browser.

### Key Interactive Workspaces
- **🚀 Interactive Studio (`/studio`)**: Dual-pane Monaco code editor with live syntax analysis, benchmark problem selector, NVIDIA Nemotron defensive candidate synthesis, interactive G0–G7 gauntlet gate animations, and self-healing repair cycle loops.
- **🎛️ 6-Tab Forensic Cockpit (`/cockpit/[taskId]`)**:
  - **Tab 1 — Baseline & Telemetry**: Empirical execution speedup, memory delta, and noise gauge.
  - **Tab 2 — Hypothesis Timeline**: Nemotron hypothesis ranking and experiment discriminator scores.
  - **Tab 3 — Monaco Diff & Exploit Inspector**: Side-by-side git diff viewer with highlighted exploit canaries.
  - **Tab 4 — Zero-Compromise Console**: Decision invariant table with cryptographic gate verdicts.
  - **Tab 5 — Live Sandbox Terminal**: MicroVM terminal stream with real-time probe logs.
  - **Tab 6 — Live DAST Scanner**: Web telemetry vulnerability scanner with OWASP Top-10 active probes.
- **🛡️ Live DAST Scanner (`/dast`)**: Real-time website security telemetry with cryptographic ownership token validation and automated patch proposals.
- **🔗 Cryptographic Evidence Ledger (`/ledger`)**: SHA-256 hash-chain browser with an interactive tampering toggle to visually prove cryptographic seal violation.
- **📖 Public Architecture & Tour (`/home`)**: 14-section product storytelling page with an interactive feature walkthrough modal.

*(Note: The operational run-centric casefile view is also available under `frontend/` on port 3001 if multi-app concurrency is desired).*

---

## 8. Hackathon Demonstration Modes

ProofStack provides two explicit, distinguishable paths for technical review:

### Path A — Live Local Execution
1. Open Cockpit at `http://localhost:3000` and click **+ Dispatch Live Run** (or navigate to `/projects`).
2. Select target project and task, then click **Launch Verification Run**.
3. Watch the orchestrator progress live through stages (`BASELINING` &rarr; `AUDITING` &rarr; `HYPOTHESIZING` &rarr; `EXPERIMENTING` &rarr; `PATCHING` &rarr; `VERIFYING` &rarr; `FINALIZING`).
4. Inspect the resulting gates, ledger entries, and final verdict.

### Path B — Seeded Deterministic Walkthrough
When external GPU execution or Nebius credentials are unavailable, inspect the pre-packaged IDOR showcase:
```bash
# Seed via CLI
python scripts/seed_demo.py --force

# Or via UI: Click "⚡ Seed Demo Fixture" in the Cockpit navbar
```
- **Scenario**: AI-proposed caching optimization provides a **42,000x speedup** on `app/invoices.py`, but omits tenant principal in the cache key.
- **Zero-Compromise Interlock**: Performance seats (green), but Security breaches (red, P03 IDOR leak proven). Bolt remains retracted; final verdict is strictly **REJECTED**.
- **Cryptographic Audit**: All 5 state transitions are SHA-256 hash-chained and can be verified via the **Verify Hash-Chain Integrity** button.
- **Teardown**: Run `python scripts/seed_demo.py --reset` to remove fixture records without touching user data.

---

## 9. Verification & Test Suite

### Full Automated Pytest Suite
Run the complete backend test suite:
```bash
python -m pytest tests/ -v
```

Current test matrix:
- **Collected**: 45 tests
- **Passed**: 44 passed
- **Skipped**: 1 skipped (`test_guest_runner` requires Unix `resource` subsystem; skipped on Windows)

### 24-Step End-to-End Forensic Workflow
Execute the end-to-end integration verification script:
```bash
python scripts/verify_e2e.py
```
This script exercises:
1. Disposable test database creation and schema migration.
2. Health & readiness endpoints.
3. Authentication enforcement (401 on missing, 403 on invalid).
4. Project and Task intake validation.
5. Deterministic local orchestrator execution.
6. Checkpoint, baseline, hypothesis, experiment, patch, and gate persistence.
7. Verification gates (G0–G7) evaluation.
8. Canonical decision generation (`models.Decision`).
9. Ledger append and cryptographic hash-chain validation.
10. `_RunComplete` handling for unstable baselines (`COMPLETED` + `INCONCLUSIVE`).
11. Report generation, persistence, and cross-run isolation.
12. Optimistic concurrency control (409 Conflict on stale write).
13. Server-Sent Events (SSE) route configuration.
14. Automated resource teardown.

---

## 10. Security Disclosures & Platform Boundaries

- **Sandbox Egress & Isolation**: On Windows hosts, low-level Linux cgroups and memory quotas (`resource.RLIMIT_AS`) are substituted with process timeouts. Production sandbox execution relies on isolated container runners or Nebius GPU instances.
- **Ledger Verification**: The SHA-256 hash-chain provides tamper-evident auditability. External anchoring or immutable storage can be attached via remote checkpoints.

---

## 11. License

Apache-2.0 License.

