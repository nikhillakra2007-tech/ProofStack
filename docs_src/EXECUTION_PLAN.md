---
title: "ProofStack: Sequential Execution Roadmap (EXECUTION_PLAN.md)"
subtitle: "Document 07 of the ProofStack specification suite"
version: "1.0"
date: "13 October 2026"
---

# 8. Execution roadmap, Days 1 to 10

Ownership tags used on every line:

- **[Lead Architect / Nitin]**: AI pipeline, prompt contracts, CLI, web cockpit frontend, demo video.
- **[Systems Engineer / Nikhil]**: sandbox isolation, profiler ingestion, statistical benchmark harness, gate verifiers, evidence ledger.
- **[Both]**: joint tasks (reviews, fresh-environment runs, submission).

The reference kit already contains tested implementations of the 19 probes, the selector, perf gate, acceptance gate, ledger, Nebius adapter, guest runner, model client and prompts. Day tasks integrate, extend and evaluate them. Each day ends with an exit gate: every box ticked and the listed commands green. Requirement IDs refer to PRD.md section 2.4.

## Day 1: Eligibility, repository, reference kit

- [ ] D1.1 **[Lead Architect / Nitin]** Create the public repository, OSI license file, `README.md` skeleton, `.env.example`, `pyproject.toml` (Python 3.11+), and commit the `docs/` suite. (FR-21 prerequisite)
- [ ] D1.2 **[Lead Architect / Nitin]** Token Factory access: list models (`GET /v1/models`), run `proofstack doctor --check models`, write `models.lock.json` with resolved IDs, supported `response_format` kinds, and accepted `extra_body` keys; save request and response metadata and latency to `docs/eligibility.md`. (FR-20)
- [ ] D1.3 **[Systems Engineer / Nikhil]** Sandboxes access: create the project API key, run a hello-world operation with `networking.enabled=false`, read `GET /v1/whoami` limits, and record them in `docs/eligibility.md`.
- [ ] D1.4 **[Systems Engineer / Nikhil]** Import the reference kit; run `python tests/selftest.py`, `tests/test_core.py`, `tests/test_sandbox.py`, `tests/test_llm.py` locally: all pass.
- [ ] D1.5 **[Systems Engineer / Nikhil]** Upload the kit to a sandbox image; run `conformance.py` and `selftest` through `NebiusSandbox` with `guest_runner.py`; archive the output as the eligibility evidence. (FR-11, FR-21)
- [ ] D1.6 **[Systems Engineer / Nikhil]** Build the baseline image (setup operation with dependencies, retained `result_image_uuid`) and store its UUID in the task template.
- **Exit gate D1:** `proofstack doctor` passes (model call, sandbox call, conformance); selftest 19/19 on host and in the sandbox; eligibility document committed.

## Day 2: Baseline engine and statistics

- [ ] D2.1 **[Systems Engineer / Nikhil]** `worktree.py`: baseline and candidate git worktrees from clean revisions; tarball to image; diff against the named commit is empty. (FR-02)
- [ ] D2.2 **[Systems Engineer / Nikhil]** `baseline.py` and the pyperf runner inside the sandbox: warm-ups, at least 20 samples, workload seed, raw sample JSON, environment fingerprint. (FR-03)
- [ ] D2.3 **[Systems Engineer / Nikhil]** `profile_parse.py`: cProfile `pstats` to JSON (top functions, call tree), `tracemalloc` top allocators; digests stored. (FR-04)
- [ ] D2.4 **[Systems Engineer / Nikhil]** Seeded tasks 001 to 005 (repeated list scan, invoice cache, N+1, ReDoS validator, async handler) each with tests, benchmark, and expected behaviour; run each baseline 5 times and confirm the instability flag fires under injected CPU load.
- [ ] D2.5 **[Lead Architect / Nitin]** `llm/routes.py` and schema generation from `schemas/hypothesis-set.v1.json`; run the diagnosis route on tasks 001 to 005 and validate every output; store prompts and responses as artifacts. (FR-06)
- [ ] D2.6 **[Lead Architect / Nitin]** Selector integration: run fixed-order versus score-ranked experiment selection on the five tasks and record steps to a surviving hypothesis in `evals/selector_ablation.json`. (FR-07)
- [ ] D2.7 **[Systems Engineer / Nikhil]** Wire `Ledger` for `RUN_STARTED` and `BASELINE`; validate entries against `evidence-ledger-entry.v1.json`; `ledger verify` passes. (FR-14)
- **Exit gate D2:** five baselines reproduced with ledger entries; hypothesis outputs schema-valid; `docs/day-2-results.md` records raw numbers (no interpretation).

## Day 3: Probe runner, router, and `scan`

- [ ] D3.1 **[Systems Engineer / Nikhil]** Probe runner: execute probes through `SandboxBackend` via `guest_runner`, parse the single `PROOFSTACK_FINDING` line, validate against `probe-finding.v1.json`, write `SandboxExecutionResult` records and artifacts. (FR-08, FR-11)
- [ ] D3.2 **[Systems Engineer / Nikhil]** `router.py`: AST trigger detectors for all 19 probes (ARCHITECTURE.md 3.7), each with one positive and one negative sample test. (FR-05)
- [ ] D3.3 **[Systems Engineer / Nikhil]** Argv allowlist enforcement and refusal recording. (FR-08)
- [ ] D3.4 **[Lead Architect / Nitin]** CLI skeleton with `scan`, `doctor`, `selftest`; JSON and SARIF output. (FR-05, FR-15, FR-21)
- [ ] D3.5 **[Lead Architect / Nitin]** Markdown and JSON report generator from the ledger. (FR-15)
- **Exit gate D3:** `proofstack scan fixtures/ --require-backend nebius` reports every red fixture and no green fixture; ledger verified; SARIF validates structurally.

## Day 4: Vertical slice of `verify`

- [ ] D4.1 **[Systems Engineer / Nikhil]** Gate G0 integrity: patch applies, allowed files only, protected-path hashes before and after, line and file limits. (FR-09)
- [ ] D4.2 **[Systems Engineer / Nikhil]** Gate G3: pytest in the sandbox with baseline failures recorded separately; differential equivalence harness (seeded fuzz against the baseline callable). (FR-10)
- [ ] D4.3 **[Systems Engineer / Nikhil]** Gauntlet runner: cost-ordered gates, fail-fast, `NOT_RUN` handling, acceptance gate wired, `GATE_RESULT` and `FINAL_VERDICT` entries. (FR-10, FR-12)
- [ ] D4.4 **[Lead Architect / Nitin]** Patch route: context-pack assembly, patch prompt, diff extraction, `git apply --check`. (FR-09)
- [ ] D4.5 **[Lead Architect / Nitin]** Feedback route: counterexample builder, feedback prompt, at most 3 cycles, budget accounting. (FR-13, FR-19)
- [ ] D4.6 **[Lead Architect / Nitin]** `verify` command for one task end to end, exit codes 0, 10, 20, 2, 3, 4. (FR-01)
- **Exit gate D4:** one seeded task runs baseline, hypotheses, experiment, patch, gauntlet, verdict, report; the unsafe candidate is `REJECTED` (exit 10) and the safe one `ACCEPTED` (exit 0).

## Day 5: Tier 1 coverage (P01 to P08)

- [ ] D5.1 **[Systems Engineer / Nikhil]** Integrate P01 to P08 into G4, G5, G6 with per-task `probes.params`; run each red fixture as a candidate and confirm `REJECTED`; run each green fixture and confirm no probe fails. (FR-11, FR-12)
- [ ] D5.2 **[Systems Engineer / Nikhil]** Performance gate G7 with pyperf samples from the sandbox: optimize and harden modes, noise injection yields `INCONCLUSIVE`. (FR-10)
- [ ] D5.3 **[Systems Engineer / Nikhil]** False-win acceptance tests: IDOR cache (perf PASS, security FAIL), f-string batching, security patch that blocks the loop; each ends `REJECTED` with the correct family. (PRD 2.8)
- [ ] D5.4 **[Lead Architect / Nitin]** Context packs P01 to P08 in prompt assembly; run baselines B1 (one-shot) and the full loop on three tasks and store raw results.
- [ ] D5.5 **[Lead Architect / Nitin]** Probe parameter synthesis for P01 (attack templates from the regex AST) and P03/P04 factories.
- **Exit gate D5:** zero unsafe candidates accepted across all Tier 1 fixtures; green fixtures accepted only when performance is supported or the task is in harden mode.

## Day 6: Tier 2 pre-gates (P09 to P15) and isolation fallback

- [ ] D6.1 **[Systems Engineer / Nikhil]** Wire P09, P10, P11, P12, P14, P15 into G2; probe parameter templates per task. (FR-11)
- [ ] D6.2 **[Systems Engineer / Nikhil]** P13 with controller-side `RegistryOracle`: index client, vendored top-packages list, offline snapshot mode, import-to-distribution map; G1 runs before any candidate code executes. (FR-17)
- [ ] D6.3 **[Systems Engineer / Nikhil]** `SandboxRouter` with `provision_timeout_s`, hardened-container fallback (`docker_cmd.py`), `require_backend` fail-closed; ledger records the backend for every operation. (FR-16)
- [ ] D6.4 **[Systems Engineer / Nikhil]** Run `conformance.py` on both backends; archive results.
- [ ] D6.5 **[Lead Architect / Nitin]** Context packs P09 to P15; `verify` flags (`--fail-on`, `--no-model`, budgets); `selftest` command complete. (FR-19, FR-21)
- **Exit gate D6:** Tier 2 acceptance tests pass; fallback demonstrated and recorded; `--require-backend nebius` refuses to fall back.

## Day 7: Tier 3, ledger sealing, CI mode, evaluation harness

- [ ] D7.1 **[Systems Engineer / Nikhil]** Wire P16, P18, P19 into G3 and P17 into G5; optional PostgreSQL variant for P17 in a sandbox-local database.
- [ ] D7.2 **[Systems Engineer / Nikhil]** `ledger seal` and `ledger verify --seal --pubkey`; tamper tests (edit, delete, reorder, truncate tail) all exit 4. (FR-14)
- [ ] D7.3 **[Lead Architect / Nitin]** CI mode: PR comment, SARIF upload, example workflow file; never merges or pushes. (FR-15)
- [ ] D7.4 **[Systems Engineer / Nikhil]** `evals/` harness: B0 to B5 configurations, frozen task set of 12 to 20 tasks including every red fixture as an unsafe candidate, results JSON. (PRD 2.8)
- [ ] D7.5 **[Lead Architect / Nitin]** Waivers: `TaskIntake.waivers` parsing, expiry, scope; expired waiver ignored. (FR-22)
- **Exit gate D7:** 19 of 19 probes wired and exercised through `verify`; evaluation harness executes end to end.

## Day 8: Evidence cockpit

- [ ] D8.1 **[Systems Engineer / Nikhil]** `proofstack serve`: read-only REST and SSE API over run directories; path-joined artifacts; localhost bind. (FR-18)
- [ ] D8.2 **[Systems Engineer / Nikhil]** `proofstack replay`: deterministic event emitter from a ledger; shared canonical-JSON test vectors for the browser verifier.
- [ ] D8.3 **[Lead Architect / Nitin]** Next.js app: tokens, self-hosted fonts, layout, status glyphs, Interlock, viewport 1 (sample strips, variance meter, icicle). (UI 6.3 to 6.5)
- [ ] D8.4 **[Lead Architect / Nitin]** Viewport 2 (hypothesis rows, discrimination matrix, score breakdown, timeline) and viewport 3 (Monaco diff, exploit trace, console, probe JSON). (UI 6.5)
- [ ] D8.5 **[Lead Architect / Nitin]** Viewport 4 (gate table, badges, ledger chain with in-browser verify, exports); `/demo` replay route. (FR-18)
- [ ] D8.6 **[Lead Architect / Nitin]** Accessibility pass (keyboard, live regions, contrast, reduced motion); performance budgets. (NFR-07)
- **Exit gate D8:** replay of the recorded false-win run shows Performance seated, Security breached, bolt retracted, then the accepted second cycle; browser verification matches `ledger verify`.

## Day 9: Evaluation, hardening, fresh-environment run

- [ ] D9.1 **[Systems Engineer / Nikhil]** Freeze the task set and commands; run B1 and the full system on identical tasks and seeds; repeat selected tasks for variance; store raw counts per task. (PRD 2.8)
- [ ] D9.2 **[Systems Engineer / Nikhil]** Audit every false speedup and every accepted patch manually; confirm zero acceptance false positives.
- [ ] D9.3 **[Systems Engineer / Nikhil]** Fresh-environment reproduction: clean checkout, new sandbox project, `doctor`, `selftest`, one full `verify`, `ledger verify`; identical verdict. (NFR-02)
- [ ] D9.4 **[Lead Architect / Nitin]** `docs/evaluation.md` and `docs/limitations.md` from the raw results; tune the demo fixture (`SLOW_FETCH_MS`) and record the replay fallback. 
- [ ] D9.5 **[Both]** Security review of the controller: secrets handling, SSE path joins, dependency pins with hashes, run P13 on the repository itself; fix findings only.
- **Exit gate D9:** `evals/results.json`, evaluation and limitations documents committed; PRD 2.10 release criteria all ticked except submission items.

## Day 10: Submission package

- [ ] D10.1 **[Lead Architect / Nitin]** Record the demo from the script in UI_UX_DESIGN_SYSTEM.md 6.9; final cut under 3:00; subtitles; upload publicly. 
- [ ] D10.2 **[Lead Architect / Nitin]** README: problem, measured result, setup, credentials needed, how to run `doctor`, `selftest`, `verify`; model and runtime disclosure (Nemotron through Token Factory; Nebius Sandboxes); project page text.
- [ ] D10.3 **[Systems Engineer / Nikhil]** Clean install from the README on a machine that is not a development machine; judge access path documented (read-only demo or replay) without exposing credentials.
- [ ] D10.4 **[Systems Engineer / Nikhil]** Repository hygiene: no keys in history, license visible, `doctor`, `selftest` and `ledger verify` outputs archived under `docs/evidence/`.
- [ ] D10.5 **[Both]** Recheck the official rules page and deadline (Research Deliverable 02 records 30 October 2026, 10:00 a.m. PDT, about 10:30 p.m. IST on the same date; confirm before submitting).
- [ ] D10.6 **[Both]** Submission checklist: working app on Nebius Token Factory or AI Cloud; at least one NVIDIA open model used at runtime; public open-source repository; visible license; setup instructions; public demo video under three minutes; Sandbox usage shown in the demo.
- **Exit gate D10:** submission form complete; video, repository and project page links verified from a logged-out browser.

## Cross-day traceability

| Requirement | Day tasks |
|---|---|
| FR-01 to FR-04 | D1, D2, D4 |
| FR-05 to FR-08 | D2, D3 |
| FR-09 to FR-13 | D4, D5, D6, D7 |
| FR-14, FR-15 | D2, D3, D7 |
| FR-16, FR-17 | D1, D6 |
| FR-18 | D8 |
| FR-19 to FR-22 | D1, D4, D6, D7 |
| Probes P01 to P08 | D5 |
| Probes P09 to P15 | D6 |
| Probes P16 to P19 | D7 |
