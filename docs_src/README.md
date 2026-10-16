---
title: "ProofStack Specification Suite: Index and Build Guide"
subtitle: "Single Source of Truth for humans and coding agents (Cursor, Claude Code, Anti-Gravity)"
version: "1.0"
date: "13 October 2026"
---

# ProofStack specification suite

ProofStack (working name in the checklist: PerfProof) accepts an AI-written patch only when performance, security, correctness and concurrency evidence all agree, measured in an isolated Nebius sandbox and recorded in a hash-chained ledger. This suite is the deterministic specification; every code block in it is the tested reference implementation, not pseudocode.

| Order | File | Section | Purpose |
|---|---|---|---|
| 0 | `00_STRATEGIC_AUDIT.md` | 1 | Competitive moat, Zero-Compromise invariant, judging alignment |
| 1 | `PRD.md` | 2 | Scope, personas, requirements FR-01..22, guardrails, release criteria |
| 2 | `ARCHITECTURE.md` | 3 | Lifecycle, isolation boundaries, sandbox harness, truth hierarchy, scoring, gates, ledger |
| 3 | `VERIFICATION_CATALOG.md` | 4 | All 19 problems: mechanics, red probe, prompt context, green gate |
| 4 | `API_SPEC.md` | 5 | JSON Schemas, live examples, CLI contract |
| 5 | `UI_UX_DESIGN_SYSTEM.md` | 6 | Evidence cockpit, design tokens, four viewports, 2:50 demo script |
| 6 | `AI_PIPELINE.md` | 7 | Token Factory client, model routing, prompts, safety |
| 7 | `EXECUTION_PLAN.md` | 8 | Days 1 to 10 checklists with owners |
| all | `PROOFSTACK_MASTER_SPEC.md` | 1 to 8 | The same content in one file for PDF compilation |

## How an engineer or agent uses it

1. Read PRD.md, then ARCHITECTURE.md sections 3.1 to 3.4.
2. Unpack the reference kit and run the four test scripts (all must pass before any integration work).
3. Follow EXECUTION_PLAN.md day by day; each task names its requirement, its file, and its exit gate.
4. For any defect class, VERIFICATION_CATALOG.md is the contract: the probe is the definition of the Red State and the green-state gate is the definition of done.

```bash
unzip proofstack-reference-kit.zip && cd proofstack-reference-kit
python tests/selftest.py                 # 19 probes x red/green fixtures (about 1 minute)
python tests/test_core.py && python tests/test_sandbox.py && python tests/test_llm.py
python tests/gen_examples.py             # regenerates examples/ and validates every schema
python tools/build_docs.py build/docs    # re-expands the include directives in docs_src/
```

## Building the PDF

```bash
pandoc PROOFSTACK_MASTER_SPEC.md -o PROOFSTACK_MASTER_SPEC.pdf --pdf-engine=xelatex \
  --toc --toc-depth=2 -V geometry:margin=0.85in -V fontsize=10pt -V colorlinks=true \
  -V mainfont="DejaVu Serif" -V monofont="DejaVu Sans Mono" --highlight-style=tango \
  --include-in-header=pdf-header.tex
```

`pdf-header.tex` enables line breaking inside code blocks and compact tables. Diagrams are ASCII so no diagram filter is needed.
