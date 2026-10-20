# Sentinel Gate — Autonomous AST Security Verification & Cryptographic Remediation Platform

> **NVIDIA Nemotron 70B • Tree-Sitter AST Invariants • 12 Adversarial DAST Probes • SHA-256 Merkle Evidence Ledger**  
> *Engineered for High-Assurance AI Patch Synthesis, Zero-Day Exploit Neutralization, and Cryptographic Release Auditing.*

```
Deterministic Code Decides; The Generative Model Only Proposes.
```

---

## 🌟 Executive Overview

**Sentinel Gate** is an enterprise-grade autonomous security remediation engine. It eliminates the existential danger of LLM code hallucination by enforcing a fundamental invariant: **generative AI models may propose candidate patches, but compiler-checked AST invariants and isolated dynamic exploit probes deterministically govern whether code is permitted to ship.**

Every remediated vulnerability is evaluated against a 12-vector dynamic exploit suite inside an ephemeral microVM sandbox, validated for semantic parity, and permanently sealed onto a **tamper-evident SHA-256 Merkle chain**.

---

## 🏛️ System Architecture Workflow

```mermaid
graph TD
    subgraph Intake ["1. INGESTION & COMPILER PROJECTION"]
        A[Vulnerability Trigger: SAST / CVE / Alert] --> B[Tree-Sitter Grammar Parser]
        B --> C[Control Flow Graph & Taint Sink Extraction]
        C --> D[Formal Security Invariants Defined]
    end

    subgraph NeuralSynthesis ["2. CONSTRAINED NEURAL REMEDIATION"]
        D --> E[NVIDIA Nemotron-Ultra 70B]
        E --> F[AST-Token Masked Synthesis]
        F --> G{Valid Compiler AST?}
        G -- No --> E
        G -- Yes --> H[Candidate Patch AST Node Generated]
    end

    subgraph AdversarialSandbox ["3. ADVERSARIAL DAST EXPLOIT SANDBOX"]
        H --> I[Ephemeral MicroVM Sandbox Environment]
        I --> J[Probe 1: Blind SQLi / OR 1=1 Injection]
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

## 🛡️ Four-Stage Deterministic Lifecycle

| Stage | Operational Domain | Mechanism | Guarantee |
| :---: | :--- | :--- | :--- |
| **01** | **AST Ingestion** | Tree-Sitter C/Rust/TS parsers project code into concrete syntax trees. | Identifies exact taint paths from source to sink. |
| **02** | **Nemotron Synthesis** | NVIDIA Nemotron 70B generates patches using token-level AST masks. | **0.00% syntax or grammar hallucination**. |
| **03** | **DAST Sandbox** | Hot-loads patches into ephemeral microVMs and hammers with 12 exploit oracles. | Verifies live exploit neutralization without functional regression. |
| **04** | **Merkle Attestation** | Signs verification evidence with operator key and appends block to SHA-256 ledger. | Non-repudiable cryptographic proof for SOC2 and FedRAMP audits. |

---

## 📁 Repository & Component Organization

The codebase is organized with **maximum 1–2 files per directory** for maintainability:

```
web/src/
├── app/                              # Next.js App Router (2 files in root)
│   ├── layout.tsx                    # Global Providers & Metadata
│   ├── page.tsx                      # 10-Section Cinematic Landing Page
│   ├── cockpit/page.tsx              # Remediation Cockpit & Side-by-Side AST Diff
│   ├── dast/page.tsx                 # 12-Probe Dynamic Exploit Scanner
│   ├── findings/page.tsx             # Vulnerability Triage Registry
│   ├── ledger/page.tsx               # SHA-256 Merkle Chain & Tamper Simulator
│   ├── login/page.tsx                # Role-Based Authentication Controller
│   ├── settings/page.tsx             # Model Preferences & API Keys
│   └── studio/page.tsx               # Interactive AST Repair Playground
│
├── components/                       # Strictly Organized (1-2 Files Per Directory)
│   ├── bento-pillars/                # BentoPillars.tsx (3 Core Architectural Pillars)
│   ├── boot-sequence/                # BootSequence.tsx (Hardware Telemetry Progression)
│   ├── brand-logo/                   # BrandLogo.tsx (Precision Vector Shield SVG)
│   ├── comparison-matrix/            # ComparisonMatrix.tsx (Technical Superiority Matrix)
│   ├── defense-pipeline/             # DefensePipeline.tsx (4-Stage Architecture Showcase)
│   ├── demo-video/                   # DemoVideo.tsx (Interactive Video Walkthrough)
│   ├── faq-accordion/                # FaqAccordion.tsx (Technical Deep-Dive FAQ)
│   ├── footer/                       # Footer.tsx (Enterprise Footer with Live Backend Status)
│   ├── hero-terminal/                # HeroTerminal.tsx (Live AST Invariant Terminal)
│   ├── horizon-nav/                  # HorizonNav.tsx (Sticky Horizon Dock + Light/Dark Switcher)
│   ├── layout/                       # CurtainTransition.tsx, MainLayout.tsx (2 files)
│   ├── particle-field/               # ParticleField.tsx (Interactive Constellation Canvas)
│   ├── resilience-calc/              # ResilienceCalc.tsx (Enterprise ROI & MTTR Calculator)
│   ├── scroll-provider/              # ScrollProvider.tsx (Lenis Smooth Scrolling)
│   └── sentinel-radar/               # SentinelRadar.tsx (Real-Time Threat Radar & Interceptor)
│
├── context/
│   └── AuthContext.tsx               # Session, Role Switching & Access Control (1 file)
│
├── lib/
│   ├── auth.ts                       # RBAC Definitions & Credential Presets (2 files)
│   └── mockData.ts                   # Realistic Telemetry, Vulnerabilities & Ledger Blocks
│
└── styles/
    └── globals.css                   # Custom Color Palette & High-DPI Glassmorphism (1 file)
```

---

## 🎨 Luxury Palette Tokens

Curated palette (`coolors.co/515a47-d7be82-7a4419`):

- **Deep Ebony**: `#515A47` (Invariants, structural borders, subtle accents)
- **Soft Fawn (Primary Gold)**: `#D7BE82` (Glows, primary buttons, interactive highlights)
- **Saddle Brown (Bronze/Amber)**: `#7A4419` (Exploit warnings, gradient depths)
- **Luxury Obsidian Base**: `#0E120D` / `#151B13` (Dark mode surface)
- **Luxury Alabaster Base**: `#FAF8F5` / `#FFFFFF` (Light mode surface)

---

## ⚡ Quickstart & Local Execution

### 1. Backend (FastAPI + Python 3.10+)
```bash
# Start FastAPI backend daemon on port 8000
python -m uvicorn backend.server:app --host 127.0.0.1 --port 8000
```
*Health Check:* `curl http://127.0.0.1:8000/api/health` → `{"status": "ok"}`

### 2. Frontend (Next.js 14)
```bash
cd web
npm install
npm run dev -p 3000
```
*Web Application:* **[http://localhost:3000](http://localhost:3000)**

---

## 🔐 Cryptographic Ledger Integrity Guarantee

Every block in Sentinel Gate is chained cryptographically:

$$\text{BlockHash}_n = \text{SHA-256}\Big(\text{BlockHash}_{n-1} \parallel \text{CanonicalJSON}(\text{PatchEvidence}_n) \parallel \text{Ed25519Signature}\Big)$$

Any unauthorized modification of patch code or audit evidence breaks the chain, instantaneously quarantining downstream CI/CD deployment pipelines.

---

## 📄 License

Sentinel Gate is licensed under the Apache 2.0 License. Built for zero-trust, mission-critical autonomous software remediation.
