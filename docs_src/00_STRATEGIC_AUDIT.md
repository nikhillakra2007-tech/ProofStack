---
title: "ProofStack: Strategic Audit and the Zero-Compromise Thesis"
subtitle: "Document 00 of the ProofStack specification suite (working name in the checklist: PerfProof)"
version: "1.0"
date: "13 October 2026"
---

# 1. Strategic audit

## 1.1 Thesis

AI coding agents are graded by the tests they can see. Production fails on what those tests cannot see: a regex that freezes a core, a cache that serves another tenant's invoice, an event loop blocked by one synchronous call, a retry loop with no timeout. ProofStack accepts a patch only when four independent families of measured evidence agree (performance, security, correctness, concurrency). Each family can veto the others. Measurements and decisions are made by deterministic code; the language model only proposes hypotheses and patches.

> **Definition.** *Zero-Compromise*: no domain may buy its win with another domain's regression. A faster patch that leaks data is rejected. A safer patch that is quadratic is rejected. A fix that blocks the event loop is rejected.

## 1.2 Competitive moat analysis

Sources: Research Deliverable 02 (11 Oct 2026), which inspected public repositories and papers. Statements about other projects are public claims as read on that date, not independent replications, and may have changed.

| Project | Publicly described focus | Overlap with ProofStack | ProofStack position |
|---|---|---|---|
| ARCHON | Sandbox-verified repair and AI-stack migration on Nebius Token Factory and Nemotron: reproduce a failure in a sandbox, patch, test on a sandbox fork, report a verified diff and terminal trace | Model, sandbox, repair loop, verified diff | Unit of work is a *defect class with a falsifiable probe* plus a cross-domain veto, not issue-to-patch |
| FixLoop | Issue-to-fix: reproducing test, patch, independent deterministic verifier in a fresh sandbox; rejects test/config tampering and newly failing tests | Reproduction-first, tamper rejection | Tamper rejection is gate G0 here; verification extends to exploit proofs and statistical benchmarks |
| CounterPatch | Adversarial regression tests (pytest, Hypothesis, differential testing) with minimal counterexamples | Differential checking, counterexamples | Counterexamples become typed evidence fed back to repair; security, concurrency and performance probes included |
| Ratchet | Multi-stage patch gauntlet: cheat checks, hidden tests, regressions, types, lint, diff hygiene | Gauntlet, anti-gaming | Gauntlet gates are *measured* (exploit probes, bootstrap benchmark decision), not only static or test-based |
| AutoSD (paper) | LLM proposes hypothesis and executable experiment, runs it, observes, then patches | Hypothesis, experiment, patch loop | Loop reused; adds a transparent cost-aware experiment score and an acceptance policy |
| Counterexample-guided repair (AAAI 2025) | Counterexamples, fault localization, iterative repair | Counterexample feedback | Used in the feedback prompt (AI_PIPELINE.md, section 7.4) |
| SWE-Perf and the 2026 reliability audit | 140-task performance benchmark; agents trail expert patches; rankings depend on measurement stability | Performance acceptance | Noise-aware gate; "inconclusive" is a first-class verdict |

| Capability | ARCHON | FixLoop | CounterPatch | Ratchet | AutoSD | ProofStack |
|---|---|---|---|---|---|---|
| Isolated sandbox execution | D | D | - | - | - | S |
| Reproduction-first | D | D | - | - | - | S |
| Adversarial / differential checks | - | - | D | - | - | S |
| Multi-stage gauntlet, tamper rejection | - | D | - | D | - | S |
| Hypothesis-to-experiment loop | - | - | - | - | D | S |
| Cost-aware experiment selection | - | - | - | - | - | S |
| Noise-aware performance acceptance | - | - | - | - | - | S |
| Exploit-proven security red/green (19 classes) | - | - | - | - | - | S |
| Cross-domain veto (perf x sec x corr x conc) | - | - | - | - | - | S |
| Hash-chained evidence ledger | - | - | - | - | - | S |

`D` = described in the sources reviewed. `-` = *not described in those sources* (not a claim of absence). `S` = specified in this suite.

### The six architectural commitments (the moat)

None of these is individually new; the defensible claim is the combination applied to the acceptance of AI-written patches.

1. **M1. Four-family conjunction.** Acceptance is an AND over families, never a weighted score (section 1.3).
2. **M2. Exploit-proven red/green.** Each of the 19 defect classes has a sandboxed probe that *reproduces* the defect on the baseline (Red State) and must *fail to reproduce* on the candidate (Green State). Static warnings are only triggers (VERIFICATION_CATALOG.md).
3. **M3. Deterministic truth hierarchy.** Counters (SQL statements, growth exponents, bytes) outrank wall-clock; wall-clock only confirms (ARCHITECTURE.md, section 3.4).
4. **M4. The model has no authority.** It proposes JSON. Measurements, probes and the verdict are produced by code. Benchmarks, tests and policy live in protected paths the patch cannot touch.
5. **M5. Tamper-evident evidence.** A SHA-256 hash chain over canonical JSON records every baseline, experiment, patch, gate and verdict, with the environment fingerprint and sandbox operation IDs.
6. **M6. Real isolation.** Verification runs in Nebius Sandboxes (VM-level isolation) with the guest network interface disabled; candidates are branches from one immutable baseline image. The fallback is a hardened container, never a bare subprocess, and the backend used is recorded in the ledger.

## 1.3 The Zero-Compromise invariant

$$\text{Verdict} = \text{ACCEPT} \iff \Delta\text{Perf} > \tau_{\text{noise}} \;\land\; \text{Security}_{\text{regress}} = \emptyset \;\land\; \text{Correctness}_{\text{regress}} = \emptyset \;\land\; \text{Concurrency}_{\text{safe}} = \text{True}$$

| Term | Deterministic definition |
|---|---|
| $\Delta\text{Perf}$ | $S-1$ where $S=\text{median}(\text{base})/\text{median}(\text{cand})$; the term holds only if the lower bound of the 95% seeded-bootstrap interval of $S$ exceeds $1+\tau_{\text{noise}}$ (default $\tau_{\text{noise}}=0.05$) |
| $\text{Security}_{\text{regress}}$ | $F_{\text{SEC}}(\text{cand})\setminus F_{\text{SEC}}(\text{base})$, where $F$ is the set of probe fingerprints reproduced; in *harden* mode also the target finding must be absent from the candidate |
| $\text{Correctness}_{\text{regress}}$ | Tests failing on the candidate but not on the baseline, plus differential-equivalence mismatches, plus findings of the correctness-family probes |
| $\text{Concurrency}_{\text{safe}}$ | No probe of the concurrency and resilience family (P05, P06, P07, P10, P15, P17) reproduces on the candidate |

Rules that make it deterministic:

- **Unrun is not passed.** A required gate that did not run is `NOT_RUN` and yields `INCONCLUSIVE`.
- **Not applicable is proven.** A probe is `NOT_APPLICABLE` only when the router's AST trigger demonstrably did not fire (stored in the ledger).
- **Task modes.** *Optimize*: the formula as written. *Harden* (security or correctness fix): the performance term becomes $\Delta\text{Perf}\ge-\rho$ with regression budget $\rho$ (default 0.05) unless an approved, unexpired waiver exists, and the target probe must clear. This implements the checklist rule that a security fix is rejected when it causes an unapproved performance regression.
- **Noise.** If measurements are unstable (relative MAD above 0.10) or samples are too few, the performance term is `INCONCLUSIVE`, never `PASS`.

### Deterministic rejection mechanics for false wins

| Scenario | What the AI changed | Why the unit tests stay green | Rejecting evidence | Gate | Result |
|---|---|---|---|---|---|
| Optimization introduces an authorization bypass (IDOR) | Added a cache keyed by object id only | Tests call with the owner, who always passes | Two-principal session: the second principal receives the first principal's object | P03, family SEC | REJECT; performance family still reads PASS, which is shown in the verdict console |
| ORM refactor opens an injection sink | Replaced a per-row query loop with an f-string `IN (...)` and string-built filter | Query count is flat and results match on benign input | Hostile `status` value appears in the SQL text and returns rows it should not | P02 (injection part), SEC | REJECT |
| Security patch degrades complexity or blocks the loop | Ownership check by list scan; or a synchronous HTTP call to an authorization service inside `async def` | Functional tests use 5 rows and one request | Growth exponent at or above 1.6 (P04); 8 concurrent calls take more than 3 times one call (P05) | P04 / P05 under *harden* | REJECT unless a signed waiver exists |

## 1.4 Hackathon judging alignment

Four equally weighted criteria (official rules, as summarised in Research Deliverable 02, section 2.1; recheck the rules page before submission).

| Criterion | What ProofStack shows | Evidence artifact | Where specified | Demo moment |
|---|---|---|---|---|
| Technological implementation | Nemotron through Token Factory for hypotheses and patches; Sandboxes for every experiment with networking disabled during verification; deterministic controller | Ledger entries with model IDs, token counts, sandbox operation IDs | ARCHITECTURE.md 3.1-3.3, AI_PIPELINE.md | Act I, command output with backend and operation IDs |
| Design | Evidence cockpit: baseline, hypotheses, exploit inspector, verdict console that shows *which family blocked* | Four-viewport UI with measured data only | UI_UX_DESIGN_SYSTEM.md | Act II verdict console |
| Potential impact | Defect classes behind real outages and runaway cloud bills (the checklist's \$50k to \$75k class of retry and leak incidents) are caught before merge, in CI | CI exit codes, SARIF and PR-comment export | PRD.md 2.3, API_SPEC.md 5.5 | Act III export |
| Quality of idea | Zero-Compromise: a faster patch that leaks is rejected, with proof | Red/green probe pairs and the false-win table | Section 1.3, VERIFICATION_CATALOG.md | Act II climax |

\newpage
