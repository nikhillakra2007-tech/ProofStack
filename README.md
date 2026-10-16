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
| `GET` | `/api/projects` | Protected | List all registered projects |
| `POST` | `/api/projects` | Protected | Register a new project |
| `PATCH` | `/api/projects/{id}` | Protected | Update project (with `expected_version`) |
| `POST` | `/api/tasks` | Protected | Create benchmark/audit task intake |
| `PATCH` | `/api/tasks/{id}` | Protected | Update task parameters |
| `POST` | `/api/runs` | Protected | Dispatch a verification run |
| `GET` | `/api/runs/{id}` | Protected | Fetch run status and progress |
| `POST` | `/api/runs/{id}/cancel` | Protected | Abort active run |
| `POST` | `/api/runs/{id}/reports` | Protected | Generate Markdown/JSON report |
| `GET` | `/api/runs/{id}/reports/{id}` | Protected | Retrieve generated report |
| `GET` | `/api/runs/{id}/ledger/verify` | Protected | Validate SHA-256 ledger integrity |
| `GET` | `/api/runs/{id}/events` | Protected | Server-Sent Events (SSE) live updates |

---

## 7. Verification & Test Suite

### Full Automated Pytest Suite
Run the complete backend test suite:
```bash
python -m pytest tests/ -v
```

Current test matrix:
- **Collected**: 43 tests
- **Passed**: 42 passed
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

## 8. Security Disclosures & Platform Boundaries

- **Sandbox Egress & Isolation**: On Windows hosts, low-level Linux cgroups and memory quotas (`resource.RLIMIT_AS`) are substituted with process timeouts. Production sandbox execution relies on isolated container runners or Nebius GPU instances.
- **Ledger Verification**: The SHA-256 hash-chain provides tamper-evident auditability. External anchoring or immutable storage can be attached via remote checkpoints.

---

## 9. License

Apache-2.0 License.
