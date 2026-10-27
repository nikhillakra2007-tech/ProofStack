# ProofStack (Autonomous Verification Engine & Cockpit)

[![Live Production](https://img.shields.io/badge/Vercel-Live_Production-10B981?style=for-the-badge&logo=vercel&logoColor=white)](https://proofstack-cockpit.vercel.app)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2.15-0F172A?style=for-the-badge&logo=next.js&logoColor=white)](https://proofstack-cockpit.vercel.app)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)](http://127.0.0.1:8765/docs)
[![NVIDIA Nemotron](https://img.shields.io/badge/NVIDIA-Nemotron_70B-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://proofstack-cockpit.vercel.app)
[![HMAC-SHA256](https://img.shields.io/badge/Evidence_Ledger-HMAC--SHA256-38BDF8?style=for-the-badge&logo=shield&logoColor=white)](https://proofstack-cockpit.vercel.app/ledger)
[![Design System](https://img.shields.io/badge/Design_System-Light_|_Dark_|_System-20C9A6?style=for-the-badge&logo=shield&logoColor=white)](https://proofstack-cockpit.vercel.app)
[![Sentinel AI](https://img.shields.io/badge/AI_Copilot-Sentinel_Movable_Assistant-10B981?style=for-the-badge&logo=probot&logoColor=white)](https://proofstack-cockpit.vercel.app)

> **Autonomous Verification Engine with Zero-Compromise Gate, Live-Target DAST & Merkle Ledger**  
> *Nebius x NVIDIA Global AI Hackathon (Coding and Agentic Engineering track)*  
>
> 🚀 **Live Production Platform**: **[https://proofstack-cockpit.vercel.app](https://proofstack-cockpit.vercel.app)**  
> *Core Invariant: Deterministic Code Decides; The Generative Model Only Proposes.*

---

## 🌐 Live Production Endpoints (Vercel)

| View | Live Production URL | Description |
| :--- | :--- | :--- |
| **🏠 Platform Landing** | **[proofstack-cockpit.vercel.app](https://proofstack-cockpit.vercel.app)** | Concise cybersecurity SaaS landing, 3-panel hero triad, interactive DAST lab, Sentinel AI launcher |
| **🤖 Sentinel AI Copilot** | **[proofstack-cockpit.vercel.app](https://proofstack-cockpit.vercel.app)** | Movable, draggable AI assistant with multi-session history & Nemotron AST fix synthesis |
| **📊 Operations Dashboard** | **[proofstack-cockpit.vercel.app/dashboard](https://proofstack-cockpit.vercel.app/dashboard)** | Real-time telemetry, remediation throughput, active task monitoring |
| **🕹️ Remediation Cockpit** | **[proofstack-cockpit.vercel.app/cockpit/TASK9142](https://proofstack-cockpit.vercel.app/cockpit/TASK9142)** | 6-tab deep cockpit with Monaco side-by-side diff & 8-gate interlock |
| **🔬 Interactive Studio** | **[proofstack-cockpit.vercel.app/studio](https://proofstack-cockpit.vercel.app/studio)** | Code repair playground with live AST verification and telemetry |
| **🎛️ Control Plane** | **[proofstack-cockpit.vercel.app/control-plane](https://proofstack-cockpit.vercel.app/control-plane)** | Multi-tenant runner pool management, system health, broker telemetry |
| **⚡ DAST Exploit Sandbox** | **[proofstack-cockpit.vercel.app/dast](https://proofstack-cockpit.vercel.app/dast)** | 12-vector dynamic adversarial exploit probe suite against live targets |
| **📜 Cryptographic Ledger** | **[proofstack-cockpit.vercel.app/ledger](https://proofstack-cockpit.vercel.app/ledger)** | Immutable HMAC-SHA256 Merkle chain with tamper detection simulator |
| **🛡️ Findings Registry** | **[proofstack-cockpit.vercel.app/findings](https://proofstack-cockpit.vercel.app/findings)** | Triaged CWE vulnerability catalog, root cause analysis & status |
| **📚 Knowledge Library** | **[proofstack-cockpit.vercel.app/library](https://proofstack-cockpit.vercel.app/library)** | Zero-Compromise policy guides, truth hierarchy, and audit specs |
| **🔐 Role Gateway (RBAC)** | **[proofstack-cockpit.vercel.app/login](https://proofstack-cockpit.vercel.app/login)** | Interactive 5-stage Verification Pipeline flowchart & 1-click evaluation access for Developer, Auditor, Admin, Super Admin |

---

## 🎯 Architecture & User Experience

ProofStack's public interface and cockpit are engineered for maximum signal, strict visual hierarchy, and instant comprehension:

### 1. Sentinel AI — Single-Instance Floating Assistant
- **Distinct Cybersecurity Identity**: Named **Sentinel AI** with an original neural-shield SVG insignia (`#20C9A6` and `#344E48`).
- **Single-Instance Guarantee**: Fixed bottom-right launcher automatically hides while the assistant window is active, eliminating duplicate or ghost launchers.
- **Draggable & Viewport Constrained**: Movable panel draggable via its header with pointer capture, strict boundary constraints preventing off-screen movement, and automatic window-resize repositioning.
- **Position Persistence**: Restores user-defined floating coordinates across page reloads via `localStorage` (`proofstack:sentinel_pos`).
- **Route-Aware Behavior**: Automatically closes on navigation and stays completely hidden on unauthenticated login surfaces (`/login`).
- **Real Multi-Session Interaction**: Preserves chat histories, session switching, error states, and inline Nemotron 70B verified AST patch cards.

### 2. Desktop Section Navigation, Streamlined Header & Flowchart Auth Gateway
- **Dedicated Desktop Header**: Full horizontal navigation with the product brand lockup and direct section links: `Overview` (`#overview`), `Product` (`#product`), `Capabilities` (`#capabilities`), `How it works` (`#workflow`), and `FAQ` (`#faq`).
- **Streamlined Call-to-Action**: Clean high-contrast `Sign in →` pill directly in the header, keeping the landing page distraction-free while guiding operators into the workspace.
- **Verification Pipeline Flowchart (`/login`)**: Connected 5-stage visual verification diagram explaining exactly how alerts pass through live DAST containers, Nemotron AST patching, 8 deterministic compiler gates, and HMAC cryptographic notarization before merging.
- **Instant 1-Click Theme Toggle**: Fast 1-click Sun/Moon toggle button transitioning directly between light and dark modes with zero dropdown friction and persistent theme storage.
- **Mobile Responsive Drawer**: Clean, animated slide-in drawer exclusively on screens under `860px`, leaving the desktop navigation bar completely unhindered.

### 3. Coordinated 3-Panel Hero Showcase Triad
- **Panel 1 — Security Overview (Left, ~28%)**: Fleeting posture rating (`98.4/100`), scan throughput, segmented severity distribution, 8-gate verification status (`8/8 PASS`), and cryptographic block height (`#142`).
- **Panel 2 — Findings Explorer (Center Primary Focal Point, ~42%)**: Clean, readable table displaying active vulnerability findings with verified CWE IDs (CWE-89, CWE-22, CWE-79, CWE-798), CVSS scores, affected files, line numbers, and live search/status filters.
- **Panel 3 — Evidence & AI Remediation (Right, ~30%)**: Displays live exploit oracle evidence, Nemotron 70B's synthesized AST unified diff with zero hallucinations, 8-gate deterministic checklist, and a deep link to the Cockpit.

### 4. Interactive DAST Probing Lab & 4-Step Pipeline
- **Interactive Probing Lab**: Run live simulated curl dynamic exploit requests with real-time response payload assertions.
- **4-Step Pipeline**: Explains Discovery & AST Parsing -> Dynamic Ephemeral DAST -> Nemotron Remediation -> Merkle Ledger Notarization in a tight, scannable format.

### 5. Interactive FAQ Accordion
- **Architecture & Security FAQs**: Pre-loaded with 5 core questions addressing deterministic verification, live DAST exploit testing, Sentinel AI capabilities, cryptographic evidence ledger integrity, and judge/developer authentication options.
- **Accessible & Animated**: Smooth height and chevron transitions with full keyboard navigability and ARIA state management.

### 6. Production OAuth 2.0 & Role-Based Access Control
- **Social SSO Integrations**: Official Google and GitHub OAuth 2.0 authentication endpoints (`/api/auth/oauth/[provider]` and `/api/auth/callback/[provider]`) with CSRF state protection, code exchange, and profile verification.
- **1-Click Judge & Auditor Personas**: Rapid local/demo testing with built-in instant access for Developer, Auditor, Security Admin, and Super Admin roles.

---

## 📸 Platform Interface & Screenshots

### 1. Platform Landing & Semgrep Showcase Triad
![Platform Landing & Story Engine](docs/screenshots/landing_hero.png)

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

ProofStack is a full-stack platform consisting of a FastAPI backend (Python 3.12+), an SQLite or PostgreSQL database, an optional Redis pub/sub event bus, and the Next.js 14 Cockpit client (`web/` or `frontend/`).

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

#### Terminal 2 — Frontend Cockpit Next.js Client (Port 3000):
```bash
cd web
npm install
npm run dev
```
Open your browser at `http://localhost:3000`.

---

### 5. Running with Docker Compose (PostgreSQL 16 + Redis 7)
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

### Optional: Social OAuth 2.0 Configuration
To enable live Google and GitHub social logins in the web cockpit, add the following to your environment (`.env.local` or Vercel Project Settings):

```bash
# Google OAuth 2.0 Credentials
GOOGLE_CLIENT_ID="your_google_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# GitHub OAuth App Credentials
GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

# Canonical Application Origin
NEXT_PUBLIC_APP_URL="https://proofstack-cockpit.vercel.app"
```

*Note: If OAuth credentials are not set, the login screen clearly informs the user and allows immediate 1-click authentication through the judge/auditor demo personas.*

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

### Build & Typecheck Frontend Cockpit
```bash
cd web
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

Every block in ProofStack is chained cryptographically:

$$\text{BlockHash}_n = \text{SHA-256}\Big(\text{BlockHash}_{n-1} \parallel \text{CanonicalJSON}(\text{PatchEvidence}_n) \parallel \text{Ed25519Signature}\Big)$$

Any unauthorized modification of patch code or audit evidence breaks the chain, instantaneously quarantining downstream CI/CD deployment pipelines.

---

## 📄 License

Apache-2.0 · Built for zero-trust, mission-critical autonomous software verification and remediation.
