# ProofStack (Sentinel Gate)

[![Live Production](https://img.shields.io/badge/Vercel-Live_Production-10B981?style=for-the-badge&logo=vercel&logoColor=white)](https://sentinel-gate-seven.vercel.app)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.15-0F172A?style=for-the-badge&logo=next.js&logoColor=white)](https://sentinel-gate-seven.vercel.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](http://127.0.0.1:8765/docs)
[![NVIDIA Nemotron](https://img.shields.io/badge/NVIDIA-Nemotron_70B-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://sentinel-gate-seven.vercel.app)
[![HMAC-SHA256](https://img.shields.io/badge/Evidence_Ledger-HMAC--SHA256-38BDF8?style=for-the-badge&logo=shield&logoColor=white)](https://sentinel-gate-seven.vercel.app/ledger)

> **Autonomous Verification Engine with Zero-Compromise Gate & Live-Target DAST**  
> *Nebius x NVIDIA Global AI Hackathon (Coding and Agentic Engineering track)*  
>
> 🚀 **Live Production Platform**: **[https://sentinel-gate-seven.vercel.app](https://sentinel-gate-seven.vercel.app)**  
> *Core Invariant: Deterministic Code Decides; The Generative Model Only Proposes.*

---

## 🌐 Live Production Endpoints

| View | Live Production URL | Description |
| :--- | :--- | :--- |
| **🏠 Platform Landing** | **[sentinel-gate-seven.vercel.app](https://sentinel-gate-seven.vercel.app)** | High-DPI radar hero, live invariant terminal, 4-stage pipeline |
| **🕹️ Remediation Cockpit** | **[sentinel-gate-seven.vercel.app/cockpit](https://sentinel-gate-seven.vercel.app/cockpit)** | Side-by-side AST diff viewer with 8-gate deterministic security interlock |
| **⚡ DAST Exploit Sandbox** | **[sentinel-gate-seven.vercel.app/dast](https://sentinel-gate-seven.vercel.app/dast)** | 12-vector dynamic adversarial exploit probe suite against live targets |
| **📜 Cryptographic Ledger** | **[sentinel-gate-seven.vercel.app/ledger](https://sentinel-gate-seven.vercel.app/ledger)** | Immutable HMAC-SHA256 Merkle chain with tamper detection simulator |
| **🔬 Interactive Studio** | **[sentinel-gate-seven.vercel.app/studio](https://sentinel-gate-seven.vercel.app/studio)** | Code repair playground with live gate execution and telemetry |
| **🛡️ Findings Registry** | **[sentinel-gate-seven.vercel.app/findings](https://sentinel-gate-seven.vercel.app/findings)** | Triaged CWE vulnerability catalog, root cause analysis & status |
| **🔐 RBAC Gateway** | **[sentinel-gate-seven.vercel.app/login](https://sentinel-gate-seven.vercel.app/login)** | 1-click role authentication: Developer, Auditor, Admin, Super Admin |

---

## 📸 Platform Interface & Screenshots

### 1. Platform Landing & Live Invariant Radar
Interactive real-time vulnerability terminal featuring live payload injection, AST invariant synthesis, and live pass/fail gating:
![Platform Landing & Live Verification Terminal](docs/screenshots/landing_hero.png)

### 2. Autonomous Remediation Cockpit
Side-by-side AST syntax diff with dynamic 8-gate deterministic security interlock and live attestation sealing:
![Remediation Cockpit](docs/screenshots/cockpit.png)

### 3. 12-Vector DAST Sandbox
Adversarial exploit validation suite testing candidate patches against real-world CWE payloads in isolated execution environments:
![12-Vector DAST Sandbox](docs/screenshots/dast.png)

### 4. Cryptographic Evidence Ledger
Immutable HMAC-SHA256 audit ledger tracking all remediation decisions with real-time cryptographic tamper detection:
![Cryptographic Evidence Ledger](docs/screenshots/ledger.png)

### 5. Interactive Studio Playground
Real-time AST repair workbench allowing engineers to execute gate runs, inspect runtime telemetry, and verify candidate patches:
![Interactive Studio Playground](docs/screenshots/studio.png)

### 6. Vulnerability Triage & Findings Registry
Comprehensive security findings index categorized by severity, exploit vector, and verification status:
![Vulnerability Triage & Findings Registry](docs/screenshots/findings.png)

### 7. Role Authentication Gateway
Dedicated access clearance routing operators strictly into their authorized workspace (Developer, Auditor, Admin, Super Admin):
![Role Clearance Gateway](docs/screenshots/login.png)

---

## 🏛️ System Architecture

```mermaid
graph TD
    subgraph Intake ["1. INGESTION & COMPILER PROJECTION"]
        A[Vulnerability Trigger: SAST / CVE / Alert] --> B[Tree-Sitter Grammar Parser]
        B --> C[Control Flow Graph & Taint Sink Extraction]
        C --> D[Formal Security Invariants Defined]
    end

    subgraph NeuralSynthesis ["2. CONSTRAINED NEURAL REMEDIATION"]
        D --> E[NVIDIA Nemotron 70B / 120B]
        E --> F[AST-Token Masked Synthesis]
        F --> G{Valid Compiler AST?}
        G -- No --> E
        G -- Yes --> H[Candidate Patch AST Node Generated]
    end

    subgraph AdversarialSandbox ["3. ADVERSARIAL DAST EXPLOIT SANDBOX"]
        H --> I[Ephemeral MicroVM Sandbox Environment]
        I --> J[Probe 1: Blind SQLi / Injection]
        I --> K[Probe 2: Memory Heap & Stack Corruption]
        I --> L[Probe 3: Prototype Pollution & AST Overwrite]
        I --> M[Probe 4-12: Reentrancy, IDOR, SSRF, XSS]
        J & K & L & M --> N{All 12 Probes Neutralized?}
        N -- Failed --> O[Quarantine Patch & Retry Loop]
        O --> E
    end

    subgraph LedgerProof ["4. CRYPTOGRAPHIC ATTESTATION & MERKLE LEDGER"]
        N -- Verified --> P[Ed25519 Hardware Operator Signature]
        P --> Q[SHA-256 Merkle Chain Block Sealed]
        Q --> R[Auto Pull-Request Merged with Attestation]
    end

    style Intake fill:#0E120D,stroke:#515A47,stroke-width:2px,color:#FDFBF7
    style NeuralSynthesis fill:#151B13,stroke:#D7BE82,stroke-width:2px,color:#FDFBF7
    style AdversarialSandbox fill:#1E261B,stroke:#7A4419,stroke-width:2px,color:#FDFBF7
    style LedgerProof fill:#0E120D,stroke:#D7BE82,stroke-width:2px,color:#FDFBF7
```

---

## 🛡️ Key Invariants

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

## ⚡ Local Development & Quick Start

ProofStack is a full-stack system consisting of a FastAPI backend (Python 3.12+), an immutable SQLite or PostgreSQL database, an optional Redis pub/sub event bus, and a Next.js 14 frontend (`sentinel-gate`).

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

## 🧪 Automated Verification & Test Commands

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

## 💻 CLI Usage

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

## 🔐 Cryptographic Ledger Integrity Guarantee

Every block in Sentinel Gate is chained cryptographically:

$$\text{BlockHash}_n = \text{SHA-256}\Big(\text{BlockHash}_{n-1} \parallel \text{CanonicalJSON}(\text{PatchEvidence}_n) \parallel \text{Ed25519Signature}\Big)$$

Any unauthorized modification of patch code or audit evidence breaks the chain, instantaneously quarantining downstream CI/CD deployment pipelines.

---

## 📄 License

Apache-2.0 · Built for zero-trust, mission-critical autonomous software verification and remediation.
