---
title: "ProofStack: Data Contracts and CLI Specification (API_SPEC.md)"
subtitle: "Document 04 of the ProofStack specification suite"
version: "1.0"
date: "13 October 2026"
---

# 5. Data contracts and CLI

## 5.1 Conventions

- JSON Schema draft 2020-12; every schema has a versioned `$id` and ships in `schemas/`. The examples in this document are not hand-written: they were produced by `tests/gen_examples.py` from real runs (probe output, the hash-chained ledger, the perf gate) and validated against these schemas with `tests/minischema.py`.
- Units: time in nanoseconds (`*_ns`) or milliseconds (`*_ms`), memory in bytes or kilobytes as named, timestamps ISO 8601 UTC with offset.
- **No floats inside ledger entries.** The ledger writer converts every float to a 9-significant-digit decimal string before hashing, so hashes are platform independent. Probe outputs may contain floats; they are frozen when written to the ledger.
- Unknown fields are rejected (`additionalProperties: false`) except where a schema says an object is free-form.
- Versioning: breaking changes bump `schema_version`; the controller refuses mismatched major versions.

## 5.2 `TaskIntakeSchema`: repository, target, baseline, benchmark, budgets

`schemas/task-intake.v1.json`

{{include schemas/task-intake.v1.json}}

Example (`examples/task.example.json`, validated; the schema rejects `samples: 5` and `wall_clock_per_experiment_s: 600`):

{{include examples/task.example.json}}

Modes: `optimize` requires a measured gain; `harden` requires the target defect to clear without an unapproved slowdown; `audit` runs the pre-existing scan only (no model call, no patch).

## 5.3 `HypothesisSchema` and the experiment plan

`schemas/hypothesis-set.v1.json`. The model returns the whole set in one JSON object. Each experiment carries a categorical predicted outcome per hypothesis; the selector (ARCHITECTURE.md 3.5) scores on these. `command` must match the allowlist (`proofstack-run <probe>`, `pyperf`, `cProfile`, `pytest tests_generated/...`); anything else is refused.

{{include schemas/hypothesis-set.v1.json}}

Example (validated; the selector picks `E2` because only it separates `H1` from `H2`):

{{include examples/hypothesis-set.example.json}}

CWE and performance taxonomy: `P01` CWE-1333, `P02` CWE-89 (+ `PERF.DB.N_PLUS_1`), `P03` CWE-639/524, `P04` CWE-407, `P05` CWE-400 (`PERF.CONC.EVENT_LOOP_BLOCK`), `P06` CWE-401/770, `P07` CWE-367/362, `P08` CWE-918, `P09` CWE-502/78, `P10` CWE-1088/400, `P11` CWE-347/330/338, `P12` CWE-22, `P13` CWE-829/1357/798/532, `P14` CWE-390/391/665, `P15` CWE-404/772, `P16` (`TEST.MUTATION_SURVIVAL`), `P17` CWE-833, `P18` (`INTEG.CONTRACT_DRIFT`), `P19` CWE-681/1339.

## 5.4 `SandboxExecutionResultSchema`

`schemas/sandbox-execution-result.v1.json`. Produced from the adapter's `ExecResult` by `to_record()` (ARCHITECTURE.md 3.3). Limits are the ceilings actually applied. `max_rss_kb` and the CPU fields are diagnostics from the platform's resource record; benchmark evidence never comes from them.

{{include schemas/sandbox-execution-result.v1.json}}

Example:

{{include examples/sandbox-execution-result.example.json}}

## 5.5 `EvidenceLedgerEntrySchema`

`schemas/evidence-ledger-entry.v1.json`. The seven mandatory fields from the engine specification are `previous_hash`, `timestamp`, `baseline_metrics`, `candidate_metrics`, `diff_patch`, `gate_results` and `final_verdict`; entry types that do not use one of them carry `null` (or `[]` for `gate_results`).

{{include schemas/evidence-ledger-entry.v1.json}}

The chain below is the recorded false-win scenario (an unkeyed cache: performance gate PASS, security gate FAIL, verdict REJECTED). `proofstack ledger verify` returns the head hash, and any edit, deletion or reordering changes it. Entry 3 (gate results):

{{jsonl examples/demo_idor_run.ledger.jsonl 3}}

Entry 4 (final verdict):

{{jsonl examples/demo_idor_run.ledger.jsonl 4}}

Verification procedure (what `ledger verify` does): for each line `i`, check `seq == i`, `previous_hash == hash(i-1)` (genesis: 64 zeros), and `SHA-256(canonical(entry without "hash")) == hash`. A sealed head (`ledger seal`) adds an Ed25519 signature over `head:count`, which also detects truncation of the tail.

## 5.6 `ProbeFindingSchema`

`schemas/probe-finding.v1.json`: the payload of the single `PROOFSTACK_FINDING` line every probe prints. `fingerprint` is stable across runs for the same defect, which lets the controller compute $F(\text{cand})\setminus F(\text{base})$.

{{include schemas/probe-finding.v1.json}}

Live output of `p03_idor_cache` on the red fixture:

{{include examples/probe-finding.example.json}}

## 5.7 CLI interface

Primary commands are `scan`, `verify` and `report`; `ledger`, `doctor`, `selftest` and `replay` support them.

```text
proofstack scan <repo>
    [--target FILE[::SYMBOL]]          limit the audit to one file or symbol
    [--probes auto|P01,P02,...]        default auto (AST triggers)       [--exclude P16,...]
    [--backend nebius|docker|nsjail]   [--require-backend nebius]        fail closed, no fallback
    [--out DIR] [--ledger PATH]        defaults: .proofstack/runs/<run_id>/ and <out>/ledger.jsonl
    [--format text|json|sarif]         [--max-runtime-s N]

proofstack verify  --task task.json                                      full TaskIntake
proofstack verify  <repo> --target FILE::SYMBOL --baseline REV
    ( --candidate REV | --patch FILE | --synthesize )                    exactly one
    [--mode optimize|harden]           default optimize
    [--samples 20] [--tau 0.05] [--regression-budget 0.05] [--noise-max 0.10]
    [--max-hypotheses 3] [--max-cycles 3] [--budget-tokens 60000] [--max-runtime-s 1800]
    [--max-diff-lines 40] [--max-files 2]
    [--backend ...] [--require-backend ...] [--image UUID]
    [--model-diagnosis ID] [--model-patch ID]   override route defaults (resolved against the live catalog)
    [--fail-on rejected,inconclusive]  CI: which verdicts produce a non-zero exit
    [--seed N]                         workload and fuzz seed; default from the task
    [--no-model]                       audit and gate an existing candidate; no model calls
    [--out DIR] [--ledger PATH] [--format text|json]

proofstack report <ledger> [--run RUN_ID] --format md|json|sarif|pr-comment|html [--out FILE]
proofstack ledger verify <ledger> [--seal FILE --pubkey FILE]      exit 4 on any failure
proofstack ledger seal   <ledger> --key ED25519_PRIVATE_KEY [--out FILE]
proofstack doctor [--check models,sandbox,index,git,all] [--require-backend nebius]
proofstack selftest [--probes P01,P02,...] [--wrap]                 red found / green clean for every probe
proofstack replay <ledger> [--speed 1x|4x]                          emit cockpit events from a recorded ledger
```

| Exit code | Meaning |
|---|---|
| 0 | `ACCEPTED` |
| 10 | `REJECTED` (a required gate failed) |
| 20 | `INCONCLUSIVE` (noise, budget, indistinguishable hypotheses, unrun required gate) |
| 2 | Usage or schema error |
| 3 | Environment, eligibility or sandbox error (including `require_backend` not satisfiable, unknown model ID) |
| 4 | Ledger verification failure |

With `--fail-on rejected` an `INCONCLUSIVE` run exits 0 but still prints and records its verdict; the default for CI is `rejected,inconclusive`.

| Variable | Used by | Meaning |
|---|---|---|
| `NEBIUS_API_KEY` | controller only | Bearer token for inference and Sandboxes; never forwarded into a sandbox |
| `NEBIUS_PROJECT_ID` | controller | `Project` header for Sandboxes |
| `NEBIUS_BASE_URL` | model client | default `https://api.tokenfactory.nebius.com/v1` |
| `CONTREE_BASE_URL` | sandbox adapter | default `https://api.tokenfactory.nebius.com/sandboxes` |
| `PROOFSTACK_MODEL_DIAGNOSIS`, `PROOFSTACK_MODEL_PATCH` | model client | preferred model IDs; resolved against `GET /v1/models` |
| `PROOFSTACK_SANDBOX=1` | probes (set by the runner inside the guest) | probes refuse to run without it |

Report formats: **Markdown** (verdict, four-family table, per-gate evidence, reasons, commands, versions, ledger head), **JSON** (the ledger projection), **SARIF 2.1.0** (one result per failing gate: `ruleId` = probe id, `level` = `error`, `partialFingerprints["proofstack/v1"]` = probe fingerprint, location from the AST trigger), **PR comment** (verdict line, family table, up to five reasons, link to the artifact and the sealed head hash), **HTML** (the cockpit's static export).

\newpage
