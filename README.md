# ProofStack (PerfProof) — Autonomous Verification & Forensic Audit Engine

> **Zero-Compromise Performance & Security Verification Gauntlet with Cryptographic Evidence Ledger**
> *Engineered for High-Assurance AI Patch Evaluation and Live-Target DAST Remediation.*

```
Deterministic Code Decides; The LLM Only Proposes
```

---

## 1. Architectural Overview

ProofStack is an evidence-driven verification engine designed to scientifically evaluate software
performance optimizations and candidate security patches. It bridges the gap between generative AI
proposals and mission-critical production environments by enforcing a fundamental invariant:

> **Deterministic Code Decides; The LLM Only Proposes**

Verdicts are strictly derived from hardware-isolated empirical measurements, static/dynamic security
probes, and invariant checks — never from an agent's narrative.

```
   [ Intake & Task Validation ]
                |
                v
   [ Reproducible Context & Baseline Probe ] ----> (_RunComplete early exit if unstable)
                |
                v
   [ Hypotheses & Experimentation ]
                |
                v
   [ Isolated Candidate Execution & DAST ]
                |
                v
   [ Verification Gates (G0 - G7) ]
   |-- G0: Integrity & Diff Constraints
   |-- G1: Supply Chain & Secret Leakage
   |-- G2: Pre-Gate Security Probes
   |-- G3: Correctness & Identity Preservation
   |-- G4: Security Exploit Oracles
   |-- G5: Concurrency Safety
   |-- G6: Complexity / Scaling Invariants
   |-- G7: Empirical Performance Speedup
                |
                v
   [ Canonical Decision Service (PASS / FAIL / INCONCLUSIVE) ]
                |
                v
   [ Tamper-Evident SHA-256 Hash-Chain Ledger & Versioned Reports ]
```

---

## 2. Core Components & Forensic Remediation

### Critical Architectural Invariants

1. **Orchestrator Terminal State Machine (`_RunComplete`)** — handled at the top-level orchestration
   boundary. An unstable baseline terminates cleanly as `COMPLETED` with an `INCONCLUSIVE` verdict
   rather than crashing as `FAILED`.
2. **Atomic Optimistic Concurrency Control** — `Project`, `Task`, and `Run` entities maintain integer
   `version` columns. All `PATCH` write operations require `expected_version` and return
   `409 Conflict` on stale updates.
3. **Mass-Assignment Defense** — strict Pydantic v2 schemas (`extra="forbid"`) reject unauthorized
   mutations to server-managed fields, hashes, timestamps, and foreign keys.
4. **Cryptographic SHA-256 Ledger** — every state transition, gate evaluation, and verdict is
   committed to an append-only hash chain:

   ```
   entry_hash = SHA256(bytes.fromhex(prev_hash) + canonical_json(body))
   ```

   Tampered records, altered hashes, or broken links are detected immediately during verification.

---

## 3. Quick Start & Local Setup

### Prerequisites

- Python 3.11 or 3.12
- Node.js 18+ (for the web portal)
- SQLite (local development) or PostgreSQL (production)

### Installation

```bash
# Clone the repository
git clone https://github.com/nikhillakra2007-tech/something.git
cd something
git checkout main

# Create and activate virtual environment
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate

# Install backend dependencies
pip install -r requirements.txt
pip install -e .
```

### Environment Configuration

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

```bash
python -m alembic current      # Check current migration revision
python -m alembic upgrade head  # Upgrade database to latest head
python -m alembic history      # Inspect migration history
```

Schema highlights:

- `projects`, `tasks`, and `runs` with atomic `version` columns.
- `decisions` and `reports` with cascade delete semantics (`ondelete="CASCADE"`).
- `ledger_entries`, `baselines`, `gates`, `findings`, and `artifacts`.

---

## 5. Running the Backend Server

```bash
python server.py
# or
python -m uvicorn backend.server:app --host 0.0.0.0 --port 8000 --reload
```

- **Swagger UI** — `http://localhost:8000/docs`
- **ReDoc** — `http://localhost:8000/redoc`

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

## 7. Web Portal — Design System & Architecture (`web/`)

The web portal is a **Next.js 14 App Router** application. It ships a custom, token-driven design
system with zero runtime UI-library dependencies beyond `framer-motion` and `lenis`.

### Quick Start

```bash
cd web
npm install
npm run dev        # http://localhost:3000
```

| Script | Purpose |
|---|---|
| `npm run dev` | Development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

### Design System

The portal uses a single **warm-ink** palette driven entirely by CSS custom properties in
`web/src/styles/tokens.css`. No component hardcodes a colour.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#e9e5da` | `#0a0a09` | Page background |
| `--surface` | `#f4f1e8` | `#121210` | Card / panel surface |
| `--line` | `#cdc7b8` | `#2a2825` | Hairline borders |
| `--ink` | `#14130f` | `#e9e5da` | Primary text |
| `--ink2` | `#5c584e` | `#9c978b` | Secondary text |
| `--ink3` | `#8a857a` | `#7a766c` | Tertiary / meta text |
| `--accent` | `#8e5a36` | `#8e5a36` | Burnt-umber accent |
| `--pass` / `--fail` / `--warn` | — | — | Verdict status colours |

Twelve palettes ship in total (`warm-ink`, `cobalt-ledger`, `sage-walnut`, `blush-jet`,
`black-magenta`, `charcoal-silver`, `jet-amethyst-cyan`, `beige-forest-citrus`,
`white-charcoal-taupe`, `ivory-scarlet`, `trueblue-jade`, `cyan-ink`). The active palette and
density are persisted to `localStorage` and applied as `data-palette` / `data-theme` attributes on
`<html>`.

### Layout & Motion Primitives

| Concern | Implementation |
|---|---|
| Responsive unit system | `--u: clamp(1px, calc(100vw / 1280), 3px)` — every dimension scales with the viewport |
| Editorial grid | `.sec` — a `476u` label column beside a fluid body column, separated by a hairline rule |
| Smooth scrolling | `lenis` via `components/scroll-provider/ScrollProvider` (`duration 1.2s`, exponential ease-out) |
| Scroll reveal | `IntersectionObserver` adds `.is-in` to `[data-rv]` nodes; `contentFadeUp` keyframe, 16px Y-offset, 1s |
| Mask-reveal type | `.ln` / `.mk` wrappers slide their inner span up from `calc(100% + .3em)`, staggered 110ms per line |
| Route transitions | `framer-motion` keyed on `usePathname()` — 280ms fade + 10px rise |
| Easing | `--ease: cubic-bezier(.2, .7, .1, 1)` |

### Routes

| Route | Purpose |
|---|---|
| `/home` | Public marketing site — hero, pipeline, gates, detector catalogue, integrations, pricing |
| `/login` | 4-tier RBAC sign-in with tenant-boundary resolution |
| `/` | Role-aware operations dashboard (KPI row, active task, gate strip, findings feed) |
| `/studio` | Interactive studio — per-benchmark diff, Nemotron synthesis, G0–G7 gauntlet, repair loop |
| `/cockpit/[taskId]` | 6-tab forensic cockpit — baseline, hypotheses, diff, gates, terminal, DAST |
| `/ledger` | SHA-256 hash-chain browser with live tamper simulation and chain re-verification |
| `/findings` | Filterable findings table with per-record naive/safe verdict drawer |
| `/dast` | Live website DAST scanner — 12 OWASP checks, ownership-gated dispatch |
| `/catalog` | 19-class problem specification catalogue with tier + domain filters |
| `/library` | Full problem library with bug / naive / safe / proof tabs |
| `/control-plane` | Governance console — token budgets, sandbox telemetry, member quotas |
| `/settings` | API keys, appearance, profile, keyboard map, sandbox policy |
| `/admin` | Redirects to `/control-plane` |

### Component Architecture

Every component lives in its own directory. Two files maximum per directory.

```
web/src/
├── app/                          # App Router routes (one directory per route)
│   ├── home/                     # Public marketing site
│   ├── login/                    # RBAC sign-in
│   ├── studio/                   # Interactive studio
│   ├── cockpit/[taskId]/         # Forensic cockpit
│   ├── ledger/  findings/  dast/ # Security surfaces
│   ├── catalog/  library/        # Problem catalogue
│   ├── control-plane/  settings/ # Administration
│   ├── api/                      # Route handlers (proxy to FastAPI)
│   ├── globals.css               # Design system + marketing primitives
│   └── layout.tsx                # Root layout, Lenis + AppShell providers
├── components/                   # One folder per component
│   ├── app-shell/AppShell.tsx    # Shell composition, hotkeys, route transitions
│   ├── sidebar/Sidebar.tsx       # Primary navigation
│   ├── topbar/Topbar.tsx         # Command palette trigger, search, profile
│   ├── footer/Footer.tsx         # Ledger status bar
│   ├── copilot/CopilotFab.tsx    # Floating AI orb
│   ├── copilot/AICopilotDrawer.tsx
│   ├── command-palette/CommandPalette.tsx
│   ├── ingest-modal/IngestModal.tsx
│   ├── chatbot/Chatbot.tsx       # Public-site assistant
│   ├── flowchart/Flowchart.tsx   # Pipeline + gate flow diagrams
│   ├── animations/Reveal.tsx     # Stagger wrappers
│   ├── animations/ScrollReveal.tsx
│   ├── scroll-provider/ScrollProvider.tsx
│   ├── editor/MonacoCodeEditor.tsx
│   ├── editor/MonacoDiffViewer.tsx
│   └── terminal/TerminalView.tsx
├── context/AuthContext.tsx       # Session, role, tenant resolution
├── lib/
│   ├── theme.tsx                 # Palette / theme / density provider
│   ├── roles.ts                  # 4-tier RBAC definitions
│   ├── mockData.ts               # Shared fixtures (single source of truth)
│   ├── types.ts                  # Shared type contracts
│   ├── apiClient.ts              # Resilient backend client
│   └── auth.ts
└── styles/
    ├── tokens.css                # Palette definitions
    └── app-components.css        # Application component system
```

### Shared Data Contract

`web/src/lib/mockData.ts` is the single source of truth for all frontend fixtures. Pages import
from it rather than redeclaring local copies, which prevents the drift that previously let the
ledger, cockpit, and DAST views disagree with each other.

| Export | Shape | Consumers |
|---|---|---|
| `MOCK_CATALOG` | 19 × `CatalogProblem` | catalog, library, studio, findings |
| `MOCK_GATES` | 8 × `GateStatus` | studio, cockpit |
| `MOCK_HYPOTHESES` | 3 × `NemotronHypothesis` | cockpit |
| `MOCK_IDENTITY_CHECKS` | 5 × `IdentityCheck` | cockpit |
| `MOCK_DAST_FINDINGS` | 6 × `DastFindingItem` | dast, cockpit |
| `MOCK_LEDGER_CHAIN` | 6 × `LedgerBlock` | ledger, studio, cockpit |

### Keyboard Shortcuts

| Keys | Action |
|---|---|
| `Ctrl/Cmd + K` | Open the command palette |
| `Ctrl/Cmd + /` | Toggle the AI co-pilot drawer |
| `G` then `D` | Go to the dashboard |
| `G` then `S` | Go to the studio |
| `G` then `L` | Go to the ledger |
| `1`–`6` | Switch cockpit tabs (inside `/cockpit`) |
| `Esc` | Close the active modal, drawer, or palette |

### Security Model of the Portal

- **Route middleware** — `web/src/middleware.ts` gates every non-public route behind the
  `proofstack_role` cookie and redirects unauthenticated visitors to `/login`.
- **Role-scoped navigation** — the sidebar renders only the workspaces the active role may enter.
- **Auditor lockdown** — the auditor persona runs read-only: code execution and DAST dispatch are
  disabled at the UI layer, and cross-tenant access resolves as HTTP 404 per Locked Decision D13.

---

## 8. Hackathon Demonstration Modes

### Path A — Live Local Execution

1. Open the portal at `http://localhost:3000`.
2. Sign in and select a target project and task.
3. Launch the verification run and watch the orchestrator progress through `BASELINING` ->
   `AUDITING` -> `HYPOTHESIZING` -> `EXPERIMENTING` -> `PATCHING` -> `VERIFYING` -> `FINALIZING`.
4. Inspect the resulting gates, ledger entries, and final verdict.

### Path B — Seeded Deterministic Walkthrough

```bash
python scripts/seed_demo.py --force   # seed the fixture
python scripts/seed_demo.py --reset   # tear it down
```

- **Scenario** — an AI-proposed caching optimisation delivers a large speedup on
  `app/invoices.py` but omits the tenant principal from the cache key.
- **Zero-Compromise Interlock** — performance seats green, security breaches red with the P03
  IDOR leak proven. The verdict is strictly **REJECTED**.
- **Cryptographic Audit** — every state transition is SHA-256 hash-chained and can be verified
  from the `/ledger` view with the tamper toggle.

---

## 9. Verification & Test Suite

### Backend

```bash
python -m pytest tests/ -v
```

- **Collected** — 45 tests
- **Passed** — 44
- **Skipped** — 1 (`test_guest_runner` requires the Unix `resource` subsystem; skipped on Windows)

### End-to-End Forensic Workflow

```bash
python scripts/verify_e2e.py
```

Exercises disposable test database creation and migration, health and readiness endpoints,
authentication enforcement (401 missing / 403 invalid), project and task intake validation,
deterministic orchestrator execution, checkpoint and gate persistence, canonical decision
generation, ledger append and hash-chain validation, `_RunComplete` handling for unstable
baselines, report generation and cross-run isolation, optimistic concurrency control (409 on stale
writes), SSE route configuration, and automated teardown.

### Frontend

```bash
cd web
npx tsc --noEmit   # strict type check
npm run build      # production compile
```

---

## 10. Security Disclosures & Platform Boundaries

- **Sandbox Egress & Isolation** — on Windows hosts, Linux cgroups and memory quotas
  (`resource.RLIMIT_AS`) are substituted with process timeouts. Production sandbox execution relies
  on isolated container runners or Nebius GPU instances.
- **Ledger Verification** — the SHA-256 hash chain provides tamper-evident auditability. External
  anchoring or immutable storage can be attached via remote checkpoints.
- **Zero Data Retention** — customer code is wiped on sandbox teardown; only cryptographic hashes
  persist in the ledger.

---

## 11. Repository Layout

```
.
├── alembic/          # Database migrations
├── backend/          # FastAPI application
├── docs/             # Specification documents
├── docs_src/         # Documentation sources
├── examples/         # Example integrations
├── fixtures/         # Vulnerable + hardened code fixtures (p01-p19)
├── frontend/         # Secondary operational UI (port 3001)
├── proofstack/       # Core engine package
│   ├── api/          # Server routes
│   ├── benchmark/    # Workload definitions
│   ├── core/         # Ledger, acceptance, comparison, gates
│   ├── dast/         # Live scanner
│   ├── llm/          # Nemotron client + prompt rendering
│   ├── model/        # Nemotron model service
│   ├── probes/       # Security + correctness probes
│   ├── sandbox/      # MicroVM, Docker, Nebius runners
│   └── gates/        # G0-G7 implementations
├── schemas/          # JSON Schema contracts
├── scripts/          # Seed + E2E verification scripts
├── tests/            # Pytest suite
├── tools/            # Documentation tooling
├── web/              # Next.js web portal (port 3000)
├── server.py         # Uvicorn entry point
├── alembic.ini
├── pyproject.toml
└── requirements.txt
```

---

## 12. License

Apache-2.0 License.
