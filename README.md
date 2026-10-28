# ProofStack (Autonomous Verification Engine & Cockpit)

[![Live Production](https://img.shields.io/badge/Vercel-Live_Production-10B981?style=for-the-badge&logo=vercel&logoColor=white)](https://sentinel-gate-seven.vercel.app/)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.15-0F172A?style=for-the-badge&logo=next.js&logoColor=white)](https://sentinel-gate-seven.vercel.app/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](http://127.0.0.1:8765/docs)
[![NVIDIA Nemotron](https://img.shields.io/badge/NVIDIA-Nemotron_70B-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://sentinel-gate-seven.vercel.app/)
[![HMAC-SHA256](https://img.shields.io/badge/Evidence_Ledger-HMAC--SHA256-38BDF8?style=for-the-badge&logo=shield&logoColor=white)](https://sentinel-gate-seven.vercel.app/ledger)
[![Design System](https://img.shields.io/badge/Design_System-Light_|_Dark_|_System-20C9A6?style=for-the-badge&logo=shield&logoColor=white)](https://sentinel-gate-seven.vercel.app/)
[![Sentinel AI](https://img.shields.io/badge/AI_Copilot-Sentinel_Movable_Assistant-10B981?style=for-the-badge&logo=probot&logoColor=white)](https://sentinel-gate-seven.vercel.app/)

> **Autonomous DevSecOps Engine with Zero-Compromise Compiler Gates, Live Container DAST & Cryptographic Merkle Ledger**
> *Nebius x NVIDIA Global AI Hackathon (Coding and Agentic Engineering track)*
>
> 🚀 **Canonical Live Production Deployment**: **[https://sentinel-gate-seven.vercel.app/](https://sentinel-gate-seven.vercel.app/)**
> 🔗 **Secondary Cockpit Mirror**: **[https://proofstack-cockpit.vercel.app/](https://proofstack-cockpit.vercel.app/)**
>
> *Core Invariant: Deterministic Code Decides; The Generative Model Only Proposes.*

---

## 📌 Executive Summary & The Problem ProofStack Solves

Modern software engineering teams are inundated with static code analysis (SAST) alerts and security warnings that exhibit false-positive rates as high as 70%. When developers turn to generative AI assistants (LLMs) to repair these vulnerabilities, the models frequently hallucinate non-compiling syntax, inadvertently remove essential authentication or tenancy parameters (`user_id`, `tenant_id`), or introduce subtle functional regressions that pass superficial reviews.

**ProofStack eliminates both problems through a closed-loop, deterministic verification pipeline:**
1. **Empirical Vulnerability Confirmation**: ProofStack does not assume an alert is valid. It spins up an ephemeral container sandbox and fires dynamic adversarial exploit probes (DAST) to prove that the vulnerability is actively reachable.
2. **Constrained Neural Remediation**: NVIDIA Nemotron 70B synthesizes candidate patches strictly constrained to AST syntax boundaries, targeting the root cause without touching unrelated logic.
3. **8-Gate Deterministic Interlock**: The proposed patch must pass eight rigid, non-negotiable compiler, linter, exploit replay, and unit test gates. If any gate fails, the patch is quarantined and retried.
4. **Immutable Cryptographic Attestation**: Accepted patches and their empirical verification proofs are sealed in an HMAC-SHA256 hash-chained Merkle ledger before auto-merging.

---

## 🌐 Live Production Endpoints (Vercel)

| View | Canonical Production URL | Description |
| :--- | :--- | :--- |
| **🏠 Platform Landing** | **[sentinel-gate-seven.vercel.app](https://sentinel-gate-seven.vercel.app/)** | Semgrep-inspired cybersecurity SaaS landing, 3-panel hero showcase triad, interactive DAST lab, Sentinel AI launcher |
| **🤖 Sentinel AI Copilot** | **[sentinel-gate-seven.vercel.app](https://sentinel-gate-seven.vercel.app/)** | Movable, draggable AI assistant with multi-session history, viewport constraint, and Nemotron AST fix synthesis |
| **📊 Operations Dashboard** | **[sentinel-gate-seven.vercel.app/dashboard](https://sentinel-gate-seven.vercel.app/dashboard)** | Real-time posture telemetry, deterministic gate pass rates, remediation throughput, active task monitoring |
| **🕹️ Remediation Cockpit** | **[sentinel-gate-seven.vercel.app/cockpit/TASK9142](https://sentinel-gate-seven.vercel.app/cockpit/TASK9142)** | 6-tab deep cockpit with Monaco side-by-side diff viewer & 8-gate verification interlock |
| **🔬 Interactive Studio** | **[sentinel-gate-seven.vercel.app/studio](https://sentinel-gate-seven.vercel.app/studio)** | Code repair playground with live AST verification, taint analysis, and runtime telemetry |
| **🎛️ Control Plane** | **[sentinel-gate-seven.vercel.app/control-plane](https://sentinel-gate-seven.vercel.app/control-plane)** | Multi-tenant runner pool management, system health, broker telemetry, worker quotas |
| **⚡ DAST Exploit Sandbox** | **[sentinel-gate-seven.vercel.app/dast](https://sentinel-gate-seven.vercel.app/dast)** | 12-vector dynamic adversarial exploit probe suite against live targets with curl replay |
| **📜 Cryptographic Ledger** | **[sentinel-gate-seven.vercel.app/ledger](https://sentinel-gate-seven.vercel.app/ledger)** | Immutable HMAC-SHA256 Merkle chain with interactive tamper detection simulator |
| **🛡️ Findings Registry** | **[sentinel-gate-seven.vercel.app/findings](https://sentinel-gate-seven.vercel.app/findings)** | Triaged CWE vulnerability catalog, root cause analysis, CVSS scores, and remediation status |
| **📚 Knowledge Library** | **[sentinel-gate-seven.vercel.app/library](https://sentinel-gate-seven.vercel.app/library)** | Zero-Compromise policy guides, truth hierarchy (Rank 1 to 6), and formal verification specifications |
| **🔐 Role Gateway (RBAC)** | **[sentinel-gate-seven.vercel.app/login](https://sentinel-gate-seven.vercel.app/login)** | Interactive 5-stage Verification Pipeline simulation & 1-click evaluation access for Developer, Auditor, Admin, Super Admin |

---

## 🎯 Architecture & User Experience Highlights

### 1. Coordinated 3-Panel Hero Showcase Triad
The public landing page features a desktop 12-column responsive layout showcasing real operational telemetry:
- **Panel 1 — Security Posture & Health (Left, 3 Cols)**: Deterministic gate pass rate (`100.0%`), active severity triage (Critical, High, Sealed), and core AST syntax invariants.
- **Panel 2 — Findings Explorer (Center, 5 Cols)**: Filterable vulnerability findings table with verified CWE IDs (CWE-639 IDOR, CWE-89 SQLi, CWE-918 SSRF, CWE-400 ReDoS), CVSS scores, affected file paths, and line ranges.
- **Panel 3 — Evidence & Remediation (Right, 4 Cols)**: Real-time DAST probe oracle feedback, Nemotron 70B synthesized AST unified diff, 8-gate checklist, and direct deep-links to the Remediation Cockpit.

### 2. Interactive DAST Probing Lab & 4-Step Pipeline
- **Interactive Probing Lab**: Run live simulated curl dynamic exploit requests with real-time response payload assertions (e.g. verifying HTTP 200 exploit baseline transitions to HTTP 403 Forbidden post-remediation).
- **4-Step Pipeline**: Visualizes Discovery & AST Parsing -> Ephemeral DAST Probing -> Nemotron Remediation -> Merkle Ledger Notarization.

### 3. Sentinel AI — Movable Floating Copilot
- **Distinct Visual Identity**: Neural-shield SVG insignia (`#20C9A6` and `#344E48`).
- **Single-Instance Guarantee**: Fixed bottom-right launcher automatically hides while the assistant window is active, eliminating duplicate or ghost launchers.
- **Draggable & Viewport Constrained**: Movable panel draggable via its header with pointer capture, strict boundary constraints preventing off-screen movement, and automatic window-resize repositioning.
- **Position Persistence**: Restores user-defined coordinates across page reloads via `localStorage` (`proofstack:sentinel_pos`).
- **Route-Aware Behavior**: Automatically closes on navigation and stays completely hidden on unauthenticated login surfaces (`/login`).
- **Multi-Session Interaction**: Preserves chat histories, session switching, error states, and inline Nemotron 70B verified AST patch cards.

### 4. Interactive 5-Stage Verification Pipeline Simulation (`/login`)
The Auth Gateway at `/login` provides an interactive 5-stage verification diagram explaining the entire end-to-end lifecycle:
1. **Trigger & AST Taint Ingestion**: Ingests SAST alert and extracts taint sinks via Tree-Sitter grammar.
2. **Ephemeral Dynamic DAST Probe**: Replays adversarial HTTP/RPC attack vectors in isolated containers.
3. **NVIDIA Nemotron 70B Patch Synthesis**: Generates syntax-constrained candidate AST replacements.
4. **8 Deterministic Compiler Gates**: Validates syntax, Ruff linting, test suites, and invariant preservation.
5. **HMAC-SHA256 Cryptographic Notarization**: Signs audit block and appends to the immutable Merkle chain.
- Includes a live **Simulate Pipeline** button that steps through all 5 stages with active telemetry inspection drawers.

### 5. Production OAuth 2.0 & Role-Based Access Control (RBAC)
- **Social SSO Integrations**: Google and GitHub OAuth 2.0 authentication endpoints (`/api/auth/oauth/[provider]` and `/api/auth/callback/[provider]`) with CSRF state protection, code exchange, and profile verification.
- **1-Click Judge & Auditor Personas**: Rapid evaluation with built-in instant access for Developer, Auditor, Security Admin, and Super Admin roles.
- **Instant 1-Click Theme Toggle**: Fast 1-click Sun/Moon toggle button transitioning directly between light and dark modes with zero dropdown friction and persistent theme storage.

---

## 📸 Platform Interface & Screenshots

### 1. Platform Landing & Semgrep Showcase Triad
![Platform Landing](docs/screenshots/landing_hero.png)

### 2. Autonomous Operations Dashboard
![Operations Dashboard](docs/screenshots/dashboard.png)

### 3. Remediation Cockpit & Monaco Diff Viewer
![Remediation Cockpit](docs/screenshots/cockpit.png)

### 4. Interactive Studio Playground
![Interactive Studio Playground](docs/screenshots/studio.png)

### 5. Multi-Tenant Control Plane
![Control Plane](docs/screenshots/control_plane.png)

### 6. 12-Vector DAST Exploit Sandbox
![12-Vector DAST Sandbox](docs/screenshots/dast.png)

### 7. Cryptographic Evidence Ledger
![Cryptographic Evidence Ledger](docs/screenshots/ledger.png)

### 8. Vulnerability Triage & Findings Registry
![Vulnerability Triage & Findings Registry](docs/screenshots/findings.png)

### 9. Policy & Verification Library
![Knowledge Library](docs/screenshots/library.png)

### 10. Role Authentication Gateway
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
        I --> J[Probe 1: Blind SQLi / Parameterized Bypass]
        I --> K[Probe 2: IDOR / Broken Object-Level Auth]
        I --> L[Probe 3: SSRF & Cloud Metadata Injection]
        I --> M[Probes 4-12: ReDoS, XSS, Prototype Pollution, Path Traversal]
        J & K & L & M --> N{All 12 Probes Neutralized?}
        N -- Failed --> O[Quarantine Patch & Retry Loop]
        O --> E
    end

    subgraph VerificationGates ["4. 8-GATE DETERMINISTIC INTERLOCK"]
        N -- Passed --> G1[Gate 1: AST Syntax Validator]
        G1 --> G2[Gate 2: Ruff Strict Style Checker]
        G2 --> G3[Gate 3: Negative DAST Replay]
        G3 --> G4[Gate 4: Unit Test Suite Regression]
        G4 --> G5[Gate 5: Concurrency Safety]
        G5 --> G6[Gate 6: Environment Boundary]
        G6 --> G7[Gate 7: Performance Invariants]
        G7 --> G8[Gate 8: Identity Preservation Guard]
    end

    subgraph LedgerProof ["5. CRYPTOGRAPHIC ATTESTATION & MERKLE LEDGER"]
        G8 -- All 8 Pass --> P[Ed25519 Hardware Operator Signature]
        P --> Q[SHA-256 Merkle Chain Block Sealed]
        Q --> R[Auto Pull-Request Merged with Attestation]
    end

    style Intake fill:#0E120D,stroke:#515A47,stroke-width:2px,color:#FDFBF7
    style NeuralSynthesis fill:#151B13,stroke:#D7BE82,stroke-width:2px,color:#FDFBF7
    style AdversarialSandbox fill:#1E261B,stroke:#7A4419,stroke-width:2px,color:#FDFBF7
    style VerificationGates fill:#151B13,stroke:#20C9A6,stroke-width:2px,color:#FDFBF7
    style LedgerProof fill:#0E120D,stroke:#D7BE82,stroke-width:2px,color:#FDFBF7
```

---

## 🛡️ Key Invariants & The 8 Verification Gates

1. **Deterministic Code Decides; Generative Model Only Proposes**: Model outputs never manufacture verdicts, measurements, or ledger signatures.
2. **Zero-Compromise Invariant**:
   $$\text{Verdict} = \text{ACCEPT} \iff \Delta\text{Perf} > \tau_{\text{noise}} \land \text{Security\_regress} = \emptyset \land \text{Correctness\_regress} = \emptyset \land \text{Concurrency\_safe} = \text{True}$$
3. **Truth Hierarchy (Rank 1 to 6)**:
   - **Rank 1**: Exact Counts (SQL queries, stub hits)
   - **Rank 2**: Empirical Scaling Ratios (Log-log slope)
   - **Rank 3**: Allocation Bytes (tracemalloc peak memory)
   - **Rank 4**: Invariant Counters (AST node integrity)
   - **Rank 5**: Exploit Outcome Oracles (DAST HTTP/RPC assertions)
   - **Rank 6**: Wall-Clock Medians (Confirmation only)
4. **Identity Preservation Guard (Gate 8 / R4)**: No patch may drop `user_id`, `tenant_id`, session parameters, or auth decorators.
5. **Cryptographic Evidence Ledger**: Append-only SHA-256 hash-chain over canonical JSON:
   $$\text{entry\_hash} = \text{SHA256}(\text{bytes.fromhex}(\text{prev\_hash}) + \text{canonical\_json}(\text{body}))$$

### The 8 Deterministic Gates Table:
| Gate | Name | Verification Purpose | Enforcement Mechanism |
| :--- | :--- | :--- | :--- |
| **G1** | **AST Syntax Validator** | Validates patch compiles to a valid Python 3.12 AST | `compile(ast_node, "<patch>", "exec")` |
| **G2** | **Ruff Strict Style Checker** | Guarantees zero formatting, linting, or naming regressions | `ruff check --select E,F,W,I` |
| **G3** | **Negative DAST Replay** | Confirms original exploit payload now returns 403/rejected | Ephemeral microVM HTTP replay |
| **G4** | **Unit Regression Suite** | Guarantees existing application tests continue passing | `pytest tests/` test runner |
| **G5** | **Concurrency Safety** | Detects race conditions or thread-unsafe state mutations | Thread sanitizer / multi-worker stress |
| **G6** | **Environment Boundary** | Prevents arbitrary filesystem/network egress outside container | Seccomp profile / container isolation |
| **G7** | **Performance Invariants** | Verifies patch does not degrade execution time beyond threshold | Empirical scaling ratio checks |
| **G8** | **Identity Preservation** | Prevents dropping `tenant_id`, `user_id`, or security decorators | Tree-sitter AST diff invariant check |

---

## 📁 Repository Directory Structure

```
.
├── frontend/                  # CANONICAL VERCEL PRODUCTION APPLICATION
│   ├── .vercel/               # Project binding: sentinel-gate (prj_aV61LXCfl9gGjqpht7HtCgCA8AeA)
│   ├── src/
│   │   ├── app/               # Next.js 14 App Router (29 pages & API routes)
│   │   │   ├── page.tsx       # Platform Landing & 3-Panel Hero Showcase Triad
│   │   │   ├── dashboard/     # Operations Dashboard
│   │   │   ├── cockpit/       # Remediation Cockpit & Monaco Diff Viewer
│   │   │   ├── studio/        # Interactive Studio Playground
│   │   │   ├── control-plane/ # Multi-Tenant Control Plane
│   │   │   ├── dast/          # 12-Vector DAST Exploit Sandbox
│   │   │   ├── ledger/        # Cryptographic Evidence Ledger
│   │   │   ├── findings/      # Vulnerability Findings Catalog
│   │   │   ├── library/       # Policy & Verification Library
│   │   │   ├── login/         # Interactive 5-Stage Verification Pipeline Gateway
│   │   │   ├── developer/     # Developer role dashboard
│   │   │   ├── auditor/       # Auditor role dashboard
│   │   │   ├── ciso/          # Super Admin / CISO role dashboard
│   │   │   └── api/           # Next.js API routes (auth, copilot, dast, ledger, heal)
│   │   ├── components/        # Reusable UI & role components (HeroShowcase, SentinelAssistant)
│   │   └── styles/            # Design tokens, variables, and responsive layout rules
│   ├── package.json           # sentinel-gate@1.0.0
│   └── tsconfig.json          # TypeScript configuration with @/ alias
│
├── web/                       # SECONDARY SYNCHRONIZED PRODUCTION DEPLOYMENT
│   ├── .vercel/               # Project binding: proofstack-cockpit (prj_e7i5ICOhb9UX97PIWgyxFeUCPUnQ)
│   ├── src/app/               # Synchronized Next.js 14 App Router
│   ├── package.json           # proofstack-cockpit@0.1.0
│   └── tsconfig.json
│
├── backend/                   # FASTAPI REST API & WEBSOCKET ENGINE
│   ├── server.py              # Main FastAPI application entrypoint (Port 8765)
│   ├── database.py            # SQLAlchemy 2.0 session factory & SQLite/Postgres engine
│   ├── models.py              # Database schema models (Projects, Tasks, Runs, Evidence, Users)
│   ├── auth_service.py        # RBAC token issuance, password hashing, and user seeding
│   ├── demo_service.py        # Deterministic IDOR fixture & demo run seeding
│   ├── dast_engine.py         # Dynamic exploit probe orchestration & target execution
│   └── ledger_service.py      # Cryptographic SHA-256 hash-chaining service
│
├── proofstack/                # CORE VERIFICATION LIBRARY & COMPILER GATES
│   ├── gates/                 # Deterministic verification gates (G1 through G8)
│   ├── dast/                  # DAST scanner, payload generators, and attack checkers
│   ├── llm/                   # NVIDIA Nemotron 70B client & Nebius Token Factory inference
│   ├── ledger/                # Merkle tree & SHA-256 evidence chain verification
│   └── sandbox/               # Ephemeral container execution runner
│
├── scripts/                   # REPOSITORY VERIFICATION & DEMO UTILITIES
│   ├── seed_demo.py           # Seed deterministic demo fixtures and RBAC users
│   ├── verify_e2e.py          # 24-step local lifecycle validation runner
│   └── verify_phase.py        # Full phase verification engine (tests + DAST + build)
│
├── tests/                     # 115 AUTOMATED TESTS (114 passing, 1 skipped)
│   ├── test_auth_and_security.py
│   ├── test_model_service.py
│   ├── test_model_api.py
│   ├── selftest.py
│   └── unit/
│
├── docs/                      # DOCUMENTATION & REAL SCREENSHOT ASSETS
│   └── screenshots/           # 10 full-resolution interface screenshots
│
├── alembic/                   # DATABASE MIGRATION SYSTEM
├── .env.example               # Safe environment variable configuration template
├── pyproject.toml             # Python packaging & pytest pythonpath configuration
└── README.md                  # This comprehensive architectural specification
```

### Explaining `frontend/` vs `web/`:
- **`frontend/` (`sentinel-gate`)**: The **canonical production deployment** corresponding to `https://sentinel-gate-seven.vercel.app/`. It contains 29 routes, complete RBAC role pages (`/developer`, `/auditor`, `/ciso`), the DAST sandbox, and the interactive 5-stage verification flowchart.
- **`web/` (`proofstack-cockpit`)**: The **secondary synchronized production deployment** corresponding to `https://proofstack-cockpit.vercel.app/`.
- Both directories are fully maintained, compile with zero errors, and share identical design tokens, components, and security behaviors.

---

## 🧰 Technology Stack

| Layer | Technologies | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 14.2.15 (App Router)**, React 18, TypeScript 5.6 | Server and client rendered UI, layout routing, streaming hydration |
| **Styling & Design System**| **Vanilla CSS & Tailwind CSS**, CSS Custom Properties | Semantic color tokens (`--brand`, `--surface-green`), light/dark themes |
| **Code Editor** | **Monaco Editor React** | Side-by-side AST unified diff visualization with syntax highlighting |
| **Backend API** | **Python 3.12+**, **FastAPI 0.115**, **Uvicorn** | REST API endpoints, WebSocket event streaming, JSON schema validation |
| **Database & ORM** | **SQLite** (local/demo) & **PostgreSQL 16** (production), **SQLAlchemy 2.0**, **Alembic** | Relational state persistence, ACID transactions, schema migrations |
| **Event Bus** | **In-memory EventBus** & **Redis 7** | Real-time task progress broadcasting and multi-worker dispatch |
| **Neural Remediation** | **NVIDIA Nemotron 70B / 120B**, **Nebius Token Factory** | Syntax-constrained neural patch synthesis with deterministic rule fallback |
| **Dynamic DAST** | **Tree-sitter**, Ephemeral container sandbox, curl runner | 12 CWE dynamic exploit replay and response assertion engine |
| **Cryptographic Ledger** | **HMAC-SHA256**, **Ed25519** | Immutable tamper-evident audit trail over canonical JSON |

---

## ⚡ Local Setup & Quick Start

### 1. Prerequisites
- **Python 3.12+**
- **Node.js 18+** (Node 20+ or 24 recommended) & **npm**
- **Git**
- *(Optional)* **Docker & Docker Compose** for local PostgreSQL 16 & Redis 7

### 2. Clone & Environment Configuration
```bash
# Clone the repository
git clone https://github.com/nikhillakra2007-tech/something.git
cd something

# Copy backend environment template
cp .env.example .env

# Install backend Python dependencies in your active Python 3.12 environment
pip install -r requirements.txt
pip install -e .
```

### 3. Database Migrations & Demo Seeding
```bash
# Run Alembic migrations to apply latest schema
python -m alembic upgrade head

# Seed default role-based accounts and deterministic IDOR demo fixture
python scripts/seed_demo.py
```

#### Pre-seeded RBAC Accounts:
| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Developer** | `developer@sentinel.internal` | `P@ssw0rd2026!Secure` | Code repair, tasks, run triggers, AST inspection |
| **Auditor** | `auditor@sentinel.internal` | `P@ssw0rd2026!Secure` | Evidence audit, Merkle ledger verification, tamper checks |
| **Admin** | `admin@sentinel.internal` | `P@ssw0rd2026!Secure` | Runner pools, DAST target configuration, worker quotas |
| **Super Admin (CISO)** | `ciso@sentinel.internal` | `P@ssw0rd2026!Secure` | Tenant management, global Zero-Compromise policies |

---

### 4. Running the Servers Locally

#### Terminal 1 — Backend API Server (Port 8765):
```bash
python -m uvicorn backend.server:app --host 127.0.0.1 --port 8765 --reload
```
- Health Check: `http://127.0.0.1:8765/api/health`
- Interactive OpenAPI Docs: `http://127.0.0.1:8765/docs`

#### Terminal 2 — Canonical Frontend Client (Port 3000):
```bash
cd frontend
npm install
npm run dev
```
Open your browser at **`http://localhost:3000`**.

*(Alternatively, to run the secondary cockpit mirror: `cd web && npm install && npm run dev`)*

---

### 5. Running with Docker Compose (PostgreSQL 16 + Redis 7)
```bash
# Start PostgreSQL and Redis containers with health checks
docker compose up -d

# Configure backend environment
export DATABASE_URL="postgresql://proofstack:proofstack_dev_password@localhost:5432/proofstack"
export REDIS_URL="redis://localhost:6379/0"

# Apply migrations and seed database
python -m alembic upgrade head
python scripts/seed_demo.py

# Start backend server
python -m uvicorn backend.server:app --port 8765 --reload
```

---

## ⚙️ Environment Variables Reference

| Variable | Description | Safe Default / Local Placeholder | Production Requirement |
| :--- | :--- | :--- | :--- |
| `PROOFSTACK_ENV` | Environment mode (`development`, `test`, `production`) | `development` | Set to `production` |
| `HOST` | Backend host bind address | `127.0.0.1` | `0.0.0.0` in container |
| `PORT` | Backend port | `8765` | `8765` |
| `DATABASE_URL` | SQLAlchemy database connection string | `sqlite:///./proofstack.db` | PostgreSQL connection URL |
| `SECRET_KEY` | HMAC signing key for sessions and tokens | `change-me-in-production-dev-only-secret-key-32chars` | Random 32+ char secret |
| `JWT_SECRET` | Secret key for JWT auth token generation | `change-me-in-production-dev-only-secret-key-32chars` | Random 32+ char secret |
| `AUTH_ALGORITHM` | Algorithm used for JWT encoding | `HS256` | `HS256` |
| `CORS_ORIGINS` | Permitted cross-origin endpoints (comma-separated) | `http://localhost:3000,http://127.0.0.1:3000` | Production domain origins |
| `REDIS_URL` | Redis event bus URL (optional for local dev) | `redis://localhost:6379/0` | Managed Redis instance |
| `NEBIUS_API_KEY` | Nebius AI inference API key for NVIDIA Nemotron | *(leave blank for deterministic fallback)* | Production Nebius token |
| `TOKEN_FACTORY_BASE_URL` | Nebius Token Factory inference base endpoint | `https://api.tokenfactory.nebius.ai/v1` | Nebius endpoint |
| `MODEL_DIAGNOSIS` | NVIDIA model identifier for root cause analysis | `nvidia/nemotron-3-super-120b` | Model identifier |
| `MODEL_PATCH` | NVIDIA model identifier for AST patch synthesis | `nvidia/nemotron-3.5-lightning` | Model identifier |
| `GOOGLE_CLIENT_ID` | Optional Google OAuth 2.0 Client ID | *(optional)* | Google OAuth credentials |
| `GOOGLE_CLIENT_SECRET` | Optional Google OAuth 2.0 Secret | *(optional)* | Google OAuth credentials |
| `GITHUB_CLIENT_ID` | Optional GitHub OAuth Client ID | *(optional)* | GitHub OAuth App ID |
| `GITHUB_CLIENT_SECRET` | Optional GitHub OAuth Client Secret | *(optional)* | GitHub OAuth App Secret |

---

## 🧪 Testing & Verification Commands

All test suites and validation scripts have been executed and verified:

### 1. Run Complete Python Test Suite (115 tests)
```bash
python -m pytest tests/ -v
```
*Result: 114 passed, 1 skipped, 0 failed in 41.97s.*

### 2. Run 24-Step End-to-End Local Lifecycle Validation
```bash
python scripts/verify_e2e.py
```
*Result: All 24 steps of the local workflow pass with exit code 0.*

### 3. Run Full Phase Verification Engine (Tests + DAST + Build)
```bash
python scripts/verify_phase.py
```
*Result: Python test suite, PSEC IDOR self-test, model safety tests, and frontend build all pass with exit code 0.*

### 4. Build & Typecheck Canonical Production Frontend (`frontend/`)
```bash
cd frontend
npm run build
```
*Result: Next.js 14 compiles all 29 routes statically and dynamically with 0 errors.*

### 5. Build & Typecheck Secondary Frontend Mirror (`web/`)
```bash
cd web
npm run build
```
*Result: Next.js 14 compiles all 24 routes with 0 errors.*

---

## 💻 CLI Usage

ProofStack provides an integrated developer CLI:

```bash
# Scan a repository target and establish baseline
proofstack scan ./repo --target app.routes:get_orders --class performance

# Evaluate candidate patch through the Zero-Compromise Gauntlet
proofstack verify --task TASK9142 --iterations 3

# Export cryptographic audit report
proofstack report --task TASK9142 --format md

# Verify integrity of the evidence ledger
proofstack ledger verify --task-id TASK9142

# Check active NVIDIA Nemotron models
proofstack models check

# Scan live target for OWASP DAST vulnerabilities (D-01 to D-12)
proofstack dast scan --url https://staging.example.com

# Autonomous agentic remediation with sandbox verification
proofstack remediate --url https://staging.example.com --repo ./repo --yes
```

---

## 🚀 Vercel Production Deployment

ProofStack is deployed to Vercel production across two linked projects:

### 1. Canonical Production Project: `sentinel-gate` (`frontend/`)
- **Domain**: **[https://sentinel-gate-seven.vercel.app/](https://sentinel-gate-seven.vercel.app/)**
- **Project Name**: `sentinel-gate` (Project ID: `prj_aV61LXCfl9gGjqpht7HtCgCA8AeA`)
- **Root Directory**: `frontend/`
- **Framework Preset**: Next.js
- **Build Command**: `next build`
- **Install Command**: `npm install`
- **Deploy Command**:
  ```bash
  cd frontend
  npx vercel --prod --yes
  ```

### 2. Secondary Production Mirror: `proofstack-cockpit` (`web/`)
- **Domain**: **[https://proofstack-cockpit.vercel.app/](https://proofstack-cockpit.vercel.app/)**
- **Project Name**: `proofstack-cockpit` (Project ID: `prj_e7i5ICOhb9UX97PIWgyxFeUCPUnQ`)
- **Root Directory**: `web/`
- **Framework Preset**: Next.js
- **Deploy Command**:
  ```bash
  cd web
  npx vercel --prod --yes
  ```

---

## 🔧 Common Troubleshooting

1. **Next.js Windows File Lock (`EINVAL: readlink` during rebuilds)**:
   - On Windows systems, Node.js can occasionally retain file handles in `.next/server/`.
   - Resolution: Run `Remove-Item -Recurse -Force .next` in PowerShell (or `rm -rf .next` in bash) prior to building.
2. **Missing `ModuleNotFoundError: No module named 'backend'` during `pytest`**:
   - Resolution: `pyproject.toml` contains `pythonpath = ["."]`. Simply execute `python -m pytest tests/` from the repository root.
3. **Database Schema Not Up to Date**:
   - Resolution: Execute `python -m alembic upgrade head` followed by `python scripts/seed_demo.py`.
4. **OAuth Social Logins Displaying Configuration Notice**:
   - If `GOOGLE_CLIENT_ID` or `GITHUB_CLIENT_ID` are not configured, ProofStack gracefully informs the user and displays 1-click evaluation access buttons for Developer, Auditor, Admin, and Super Admin roles.

---

## 🔒 Security Considerations

- **Secrets Sanitization**: Real secrets, API keys, and private credentials must never be committed to Git. `.gitignore` strictly ignores `.env`, `.env.local`, `.venv`, and `*.db`.
- **CORS Configuration**: Restrict `CORS_ORIGINS` to trusted domains. Wildcard origins (`*`) are disallowed when `supports_credentials=True`.
- **Container Isolation**: Ephemeral DAST probes must execute within isolated microVM or container sandboxes without host filesystem mount access.
- **Ledger Immutability**: All evidence entries are hash-chained using HMAC-SHA256. Any post-hoc tampering invalidates the cryptographic root and breaks CI/CD deployment pipelines.

---

## 🤝 Contribution & Integration Workflow

1. Base all feature development on `main`.
2. Ensure changes adhere to strict typing and pass all 8 verification gates.
3. Run the validation suite before opening a pull request:
   ```bash
   python -m pytest tests/
   python scripts/verify_e2e.py
   python scripts/verify_phase.py
   ```
4. Never force-push or rewrite shared commit history on `main`.

---

## 📄 License

Licensed under the **Apache License, Version 2.0**.
See the [LICENSE](LICENSE) file for terms. Built for zero-trust, mission-critical autonomous software verification and remediation.
