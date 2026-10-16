---
title: "ProofStack: Product Requirements Document (PRD.md)"
subtitle: "Document 01 of the ProofStack specification suite"
version: "1.0"
date: "13 October 2026"
---

# 2. Product requirements

## 2.1 Scope and target runtime

| Item | Requirement |
|---|---|
| Product | `proofstack`: a CLI and CI gate that investigates, patches and verifies Python code changes under the Zero-Compromise policy, plus a web cockpit that shows the evidence |
| Language and runtime | Python 3.11+ (3.12 recommended; probes use atomic regex groups and `tarfile` extraction filters). Linux. |
| Test and measurement tooling | pytest, pyperf, cProfile, tracemalloc, git worktrees |
| Model | NVIDIA Nemotron family through Nebius Token Factory (OpenAI-compatible API). Model IDs are resolved against the live catalog at start-up (AI_PIPELINE.md 7.1) |
| Execution | Nebius Token Factory Sandboxes (Contree) for the submitted path; hardened container fallback (ARCHITECTURE.md 3.3) |
| Cockpit | Next.js, Tailwind CSS, Monaco, Tremor (UI_UX_DESIGN_SYSTEM.md) |
| License and repository | Public repository, OSI-approved license file at the root, setup instructions, no credentials committed |

## 2.2 Non-goals for v0.1

- No multi-language support (Python only).
- No unverified auto-merge. ProofStack never pushes, merges or deploys; it emits a verdict, a diff and a report.
- No custom profiler or statistics library (use cProfile, tracemalloc, pyperf, stdlib `random` for the seeded bootstrap).
- No distributed load testing, GPU work, or production traffic replay.
- No claim of universal correctness: "no counterexample found" is never reported as "proven correct".

## 2.3 Personas and execution modes

| | Developer Mode (CLI) | Enterprise Gate (CI/CD) |
|---|---|---|
| User | Engineer with a slow path, a suspicious AI patch, or a pre-existing risk | Reviewer or platform team gating pull requests |
| Entry | `proofstack scan`, then `proofstack verify` | `proofstack verify --task task.json --fail-on rejected,inconclusive` |
| Behaviour | Local-first: baseline, profile, hypotheses, experiments, patch synthesis, verdict, report | Evaluates the PR diff as the candidate; no synthesis unless `--synthesize` |
| Output | Terminal summary, `report.md`, `report.json`, ledger | Exit code, PR comment (Markdown), SARIF, immutable ledger artifact |
| Side effects | None outside the working directory | None; never auto-merges |

CLI exit codes: `0` ACCEPTED, `10` REJECTED, `20` INCONCLUSIVE, `2` usage or schema error, `3` environment, eligibility or sandbox error, `4` ledger verification failure.

## 2.4 Functional requirements

| ID | Requirement | Acceptance test |
|---|---|---|
| FR-01 | Validate every task against `TaskIntakeSchema` | Invalid task exits 2 with the JSON pointer of the first error |
| FR-02 | Snapshot baseline and candidate in disposable git worktrees from clean revisions | Worktree diff against the named commit is empty |
| FR-03 | Reproduce the baseline: tests plus at least `samples` benchmark runs, instability flag | Unstable or non-reproducible baseline yields INCONCLUSIVE, no model call made |
| FR-04 | Capture cProfile and tracemalloc artifacts with SHA-256 | Artifact paths and digests present in the BASELINE ledger entry |
| FR-05 | Pre-existing audit (`scan`): AST triggers select probes P01-P19 and run them on the baseline | Seeded red fixtures are found; green fixtures are not |
| FR-06 | Generate at most 3 competing hypotheses as schema-valid JSON | Invalid output is repaired at most twice, then INCONCLUSIVE |
| FR-07 | Select experiments by the deterministic score; stop when hypotheses are indistinguishable or the budget is exhausted | Worked example in ARCHITECTURE.md 3.5 passes as a unit test |
| FR-08 | Execute experiments only as allowlisted argv inside a sandbox | A non-allowlisted command is refused and recorded |
| FR-09 | Synthesize one minimal unified diff per cycle (default at most 40 changed lines, 2 files) | Oversized or out-of-scope patches are rejected by G0 |
| FR-10 | Run the gauntlet in cost order, failing fast (ARCHITECTURE.md 3.8) | Benchmarks never run when an earlier required gate failed |
| FR-11 | Every probe prints exactly one `PROOFSTACK_FINDING` line (ProbeFinding schema) | `proofstack selftest` passes 19/19 on red and green fixtures |
| FR-12 | Compute the verdict with the pure acceptance function | Table-driven tests in `tests/test_core.py` |
| FR-13 | Repair loop of at most 3 cycles with typed counterexample feedback | Cycle 4 is never started |
| FR-14 | Append-only hash-chained ledger; `ledger verify` detects edits, deletions and reordering | Tamper tests fail verification (exit 4) |
| FR-15 | `report` exports Markdown, JSON, SARIF 2.1.0 and a PR comment | Output validates against the schema or SARIF structure |
| FR-16 | Route sandbox backend with fallback; `require_backend` fails closed | Ledger records `backend` for every operation |
| FR-17 | Model credentials never enter the sandbox; secret values never enter the ledger | Conformance check `no_credentials`; P13 evidence carries digests only |
| FR-18 | Cockpit streams a live run and replays a recorded ledger deterministically | Replay of the demo ledger reproduces the same badges |
| FR-19 | Enforce time, token and iteration budgets; exhaustion yields INCONCLUSIVE with a reason | Budget-exhaustion test |
| FR-20 | Model client preflights the catalog and validates every response against its schema | Unknown model ID exits 3 listing close matches |
| FR-21 | `doctor` verifies model access, sandbox access and isolation conformance | `doctor` output is archived with the demo evidence |
| FR-22 | Waivers: signed (approver, expiry, scope) and applied only to named probes | Expired waiver is ignored |

## 2.5 Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-01 Determinism | Same inputs, seeds and recorded samples produce the same verdict. Bootstrap seed `20261013`; probe fuzz seed `1337`; schedules seeded. |
| NFR-02 Reproducibility | A report can be reproduced from a fresh checkout plus the ledger; every command, version and input is recorded. |
| NFR-03 Safety | No network during verification; no credentials in the guest; no auto-push. Repository text, logs and model output are untrusted. |
| NFR-04 Honesty of states | The UI and report never show a single "verified" badge unless every required gate passed; unrun checks display as NOT RUN. |
| NFR-05 Overhead | Controller overhead excluding sandbox time stays under 5% of a run's wall clock. |
| NFR-06 Portability | Probes are stdlib-only; Linux and Python 3.11+. |
| NFR-07 Accessibility | Cockpit meets WCAG 2.2 AA. |

## 2.6 Operational guardrails and resource limits

| Control | Limit | Enforced by |
|---|---|---|
| Wall clock per experiment | 60 s (hard), account maximum read from `GET /sandboxes/v1/whoami` | `timeout` field of the spawn request |
| Memory ceiling | 1 GiB address space | `guest_runner.py` sets `RLIMIT_AS` (the spawn API exposes only `max_layer_bytes`); verified afterwards from `resources.max_rss` |
| Processes | 128 | `RLIMIT_NPROC` in the guest |
| Output | 1 MiB per stream recorded by default (platform maximum 10 MiB); truncation makes the result not-ok | `truncate_output_at`; `ExecResult.ok` |
| Network | Disabled for every verification operation | `"networking": {"enabled": false}`; setup operations only may enable it |
| Concurrency | At most 8 simultaneous operations (platform Beta limit is 50 per account) | Controller semaphore |
| Credentials | Held by the controller only | Guest env allowlist; `preserve_env` never set |
| Writes | Task workspace only; tests, benchmarks and policy mounted or hashed read-only | Protected-path hashes (G0) |

## 2.7 Inference budgets

At most 3 hypotheses per task; at most 3 repair cycles; at most 60,000 model tokens per task (configurable); reasoning only on the diagnosis route; JSON-schema-constrained output with local validation (AI_PIPELINE.md). Budget exhaustion ends the run as INCONCLUSIVE.

## 2.8 Success metrics

Measured on a frozen task set that includes every red fixture as a deliberately unsafe candidate. These are release gates for the evaluation, not claims of results.

| Metric | Gate |
|---|---|
| Acceptance false positives (unsafe candidate accepted) | 0 |
| Probe self-test (red found, green clean) | 19 of 19 probes, all fixtures |
| Correct-optimization rate, median speedup, correctness-regression rate | Reported with raw counts per task |
| Fraction of claims linked to a measurement | 100% |
| Report reproducibility from a fresh checkout | Verdict identical |
| Inconclusive handling | Noisy-environment tasks end INCONCLUSIVE |

## 2.9 Status taxonomy

Stage badges (what has been established) and the final verdict are separate. Stored as enums; displayed in sentence case.

| Enum | Meaning |
|---|---|
| `BASELINE_REPRODUCED` | Baseline measured and stable, or defect reproduced |
| `EXPLOIT_PROVEN` | A probe reproduced a defect or exploit in the sandbox (Red State) |
| `HYPOTHESIS_TESTED` | An experiment ran and its observation is recorded |
| `CORRECTNESS_PASS`, `SECURITY_CLEAR`, `CONCURRENCY_CLEAR`, `PERF_SUPPORTED` | The corresponding family passed |
| `REGRESSION_DETECTED` | A family failed on the candidate |
| `ACCEPTED`, `REJECTED`, `INCONCLUSIVE` | Final verdicts |

## 2.10 Release criteria for v0.1

- [ ] `proofstack doctor` passes against the real Token Factory account and Sandboxes.
- [ ] `proofstack selftest` passes 19 of 19 probes on red and green fixtures inside the sandbox.
- [ ] Zero acceptance false positives on the frozen evaluation set.
- [ ] `ledger verify` passes on every archived run and fails on tampered copies.
- [ ] Demo run reproducible from the recorded ledger.
- [ ] Public repository, license, setup instructions, no secrets in history.

\newpage
