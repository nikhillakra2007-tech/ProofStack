# ProofStack (PerfProof / Sentinel Gate)

> **Autonomous Verification Engine with Zero-Compromise Gate & Live-Target DAST**  
> *Nebius x NVIDIA Global AI Hackathon (Coding and Agentic Engineering track)*

---

## Overview

ProofStack is an autonomous performance-verification and security-remediation platform:
1. **Proves a defect is real (RED)** using deterministic probes and empirical profiling.
2. **Has NVIDIA Nemotron synthesize minimal, defensive patches** (`nvidia/nemotron-3-super-120b` for diagnosis, `nvidia/nemotron-3.5-lightning` for patches).
3. **Proves the fix works (GREEN)** while a strict **Zero-Compromise Gate (G0 to G7)** rejects any candidate that trades one defect for another.
4. **Performs Dynamic Application Security Testing (DAST - Module M8)** against live deployed endpoints, mapping findings back to source code and autonomously repairing them with sandbox verification (**Gates R0 to R6**).
5. **Enforces HMAC-SHA256 Cryptographic Evidence Ledger** recording every baseline measurement, hypothesis, patch diff, and gate verdict into an immutable Merkle hash-chain.

---

## Key Invariants

1. **Deterministic Code Decides; LLM Proposes**: Model outputs never manufacture measurements, verdicts, or ledger entries.
2. **Zero-Compromise Invariant**:
   $$\text{Verdict} = \text{ACCEPT} \iff \Delta\text{Perf} > \tau_{\text{noise}} \land \text{Security\_regress} = \emptyset \land \text{Correctness\_regress} = \emptyset \land \text{Concurrency\_safe} = \text{True}$$
3. **Truth Hierarchy (Rank 1 to 6)**:
   - Rank 1: Exact Counts (SQL queries, stub hits)
   - Rank 2: Empirical Scaling Ratios (Log-log slope)
   - Rank 3: Allocation Bytes (tracemalloc peak)
   - Rank 4: Invariant Counters
   - Rank 5: Exploit Outcome Oracles
   - Rank 6: Wall-Clock Medians (Confirmation only)
4. **Identity Preservation Guard (G3 / R4)**: No patch may drop `user_id`, `tenant_id`, session parameters, or auth decorators.
5. **Cryptographic Evidence Ledger**: Append-only SHA-256 hash-chain over canonical JSON:
   $$\text{entry\_hash} = \text{SHA256}(\text{bytes.fromhex}(\text{prev\_hash}) + \text{canonical\_json}(\text{body}))$$

---

## Local Development & Quick Start

ProofStack is a full-stack system consisting of a FastAPI backend (Python 3.12+), an immutable SQLite or PostgreSQL database, an optional Redis pub/sub event bus, and a Next.js 14 frontend.

### 1. Prerequisites
- Python 3.12+
- Node.js 18+ (Node 20+ or 24 recommended) & npm
- (Optional) Docker & Docker Compose for PostgreSQL 16 & Redis 7

### 2. Environment Setup
```bash
# Clone the repository
git clone https://github.com/nikhillakra2007-tech/something.git
cd something

# Copy backend environment template
cp .env.example .env

# Install backend Python dependencies
pip install -r requirements.txt
pip install -e .
```

### 3. Database Migrations & Demo Seeding
```bash
# Run Alembic migrations to apply latest schema (including users, roles, DAST targets)
python -m alembic upgrade head

# Seed default role-based accounts and deterministic IDOR demo fixture
python scripts/seed_demo.py
```

#### Pre-seeded RBAC Accounts:
| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Developer** | `developer@sentinel.internal` | `P@ssw0rd2026!Secure` | Code repair, tasks, run triggers |
| **Auditor** | `auditor@sentinel.internal` | `P@ssw0rd2026!Secure` | Evidence audit, ledger verification |
| **Admin** | `admin@sentinel.internal` | `P@ssw0rd2026!Secure` | Runner pools, DAST configuration |
| **Super Admin (CISO)** | `ciso@sentinel.internal` | `P@ssw0rd2026!Secure` | Tenant management, global policies |

---

### 4. Running the Servers Locally

#### Terminal 1 — Backend API Server (Port 8765):
```bash
python -m uvicorn backend.server:app --host 127.0.0.1 --port 8765 --reload
```
Health check: `http://127.0.0.1:8765/api/health`

#### Terminal 2 — Frontend Next.js Client (Port 3000):
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```
Open your browser at `http://localhost:3000`.

---

### 5. Running with Docker Compose (PostgreSQL 16 + Redis 7)
If you prefer running production-grade PostgreSQL and Redis locally:
```bash
# Start PostgreSQL and Redis containers with health checks
docker compose up -d

# Configure backend to connect to Postgres & Redis
export DATABASE_URL="postgresql://proofstack:proofstack_dev_password@localhost:5432/proofstack"
export REDIS_URL="redis://localhost:6379/0"

# Apply migrations and seed database
python -m alembic upgrade head
python scripts/seed_demo.py

# Start backend
python -m uvicorn backend.server:app --port 8765 --reload
```

---

## Automated Verification & Test Commands

### Run Full Test Suite (114 tests)
```bash
python -m pytest tests/ -v
```

### Run 24-Step End-to-End Local Lifecycle Validation
```bash
python scripts/verify_e2e.py
```

### Run Full Phase Verification Engine (Tests + DAST + Build)
```bash
python scripts/verify_phase.py
```

### Build & Typecheck Frontend
```bash
cd frontend
npm run build
```

---

## CLI Usage

```bash
# Scan a repository target and establish baseline
proofstack scan ./repo --target app.routes:get_orders --class performance

# Evaluate candidate patch through the Zero-Compromise Gauntlet
proofstack verify --task TASK1234 --iterations 3

# Export cryptographic audit report
proofstack report --task TASK1234 --format md

# Verify integrity of the evidence ledger
proofstack ledger verify --task-id TASK1234

# Check active NVIDIA Nemotron models
proofstack models check

# Scan live target for OWASP DAST vulnerabilities (D-01 to D-12)
proofstack dast scan --url https://staging.example.com

# Autonomous agentic remediation with sandbox verification
proofstack remediate --url https://staging.example.com --repo ./repo --yes
```

---

## License

Apache-2.0
