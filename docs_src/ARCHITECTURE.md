---
title: "ProofStack: System Architecture Specification (ARCHITECTURE.md)"
subtitle: "Document 02 of the ProofStack specification suite"
version: "1.0"
date: "13 October 2026"
---

# 3. System architecture

All code in this document is the tested reference implementation (`proofstack/` in the reference kit). It was exercised by `tests/test_core.py`, `tests/test_sandbox.py` and `tests/selftest.py`.

## 3.1 Unified engine lifecycle

Legend: `[D]` deterministic controller code, `[M]` model (Nemotron), `[S]` executes inside the sandbox.

```text
 TASK INTAKE (task.json)                                  [D] validate against TaskIntakeSchema
        |
        v
 GIT WORKTREE SNAPSHOT                                    [D] clean baseline + candidate worktrees,
        |                                                     tarball uploaded as a sandbox image
        v
 DETERMINISTIC BASELINE (profile + benchmark)             [D+S] tests, pyperf samples, cProfile,
        |                                                      tracemalloc  -> ledger BASELINE
        |        unstable or irreproducible -> INCONCLUSIVE, stop (no model call)
        v
 PROBE ROUTER / PRE-EXISTING AUDIT                        [D+S] AST triggers -> probes on baseline
        |                                                      (Red State)  -> ledger AUDIT_FINDING
        v
 NEMOTRON COMPETING HYPOTHESES                            [M] at most 3, schema-validated JSON
        |
        v
 EXPERIMENT SELECTOR HEURISTIC  <------------------+     [D] Score = D / (T + S + R)
        |                                           |
        v                                           | loop until one hypothesis survives,
 ISOLATED SANDBOX RUNNER                            |      none is separable, or budget ends
        |        allowlisted argv, network off,     |
        |        rlimits  -> ledger EXPERIMENT -----+
        v
 PATCH SYNTHESIS  <------------- typed counterexample feedback --------------+   [M] minimal diff
        |                                                                    |   (at most 3 cycles)
        v                                                                    |
 MULTI-GATE GAUNTLET                                      [D+S]              |
   G0 integrity > G1 supply chain > G2 pre-gates > G3 correctness            |
   > G4 security > G5 concurrency/resource > G6 complexity > G7 benchmark ---+ on FAIL
        |
        v
 ZERO-COMPROMISE ACCEPTANCE GATE                          [D] pure function over gate results
        |
        v
 HASH-CHAINED EVIDENCE LEDGER  ->  report.md / report.json / SARIF / PR comment / cockpit
```

| Stage | Owner | Output | Ledger `entry_type` |
|---|---|---|---|
| Intake, snapshot | Controller | Validated task, worktree paths, image UUID | `RUN_STARTED` |
| Baseline | Controller + sandbox | Samples, medians, relative MAD, profile digests | `BASELINE` |
| Audit | Controller + sandbox | Probe findings with fingerprints | `AUDIT_FINDING` |
| Hypotheses | Model | `HypothesisSet` | `HYPOTHESES` |
| Experiments | Controller + sandbox | Observation per experiment, survivors | `EXPERIMENT` |
| Patch | Model | Unified diff, model call metadata | `PATCH_PROPOSED` |
| Gauntlet | Controller + sandbox | Gate results | `GATE_RESULT` |
| Verdict | Controller | `ACCEPTED`/`REJECTED`/`INCONCLUSIVE`, family summary, reasons | `FINAL_VERDICT` |

## 3.2 Subsystem isolation boundaries

```text
+--------------------- CONTROLLER HOST (trusted, holds credentials) ---------------------+
|  Deterministic Controller                |  Semantic Reasoning Engine                    |
|  git, profile parsing, selector,         |  Nemotron client; the only holder of          |
|  gates, acceptance, ledger, policy       |  NEBIUS_API_KEY for inference; emits JSON     |
+------------------+-----------------------+-------------------+---------------------------+
                   | allowlisted argv + files in                | HTTPS: prompts contain
                   | results out (size-capped)                  | excerpts, never credentials
                   v                                            v
+------- SANDBOX (untrusted: repository, tests, patch) ----+   Nebius Token Factory
|  VM-level isolation, guest network interface disabled     |   (inference API)
|  read-only: tests, benchmarks, policy | writable: /work   |
|  rlimits, no secrets, no route to the controller          |
+-----------------------------------------------------------+
```

| Subsystem | Responsibility | May | May not |
|---|---|---|---|
| Deterministic controller | Worktrees, profiling parse, `pyperf` and probe orchestration, selector, gates, acceptance, ledger | Read everything; spawn sandbox operations; hold secrets | Delegate any measurement or decision to a model |
| Semantic reasoning engine | Hypotheses, minimal-diff patches, counterexample-driven repair | Read prompt context assembled by the controller | Run code, touch the filesystem, see credentials, decide acceptance |
| Sandbox execution harness | Run probes, tests, benchmarks, experiments | Write to `/work`; loopback networking for probe stubs | Reach any network, read host files, hold credentials, write to protected paths |
| Fallback isolation | Hardened container when the primary backend cannot be provisioned in time | Act only if policy allows fallback and the ledger records it | Be a bare subprocess, or be used when `require_backend` is set |

## 3.3 Sandbox execution harness

Primary backend: **Nebius Token Factory Sandboxes (Contree)**: VM-level isolation, git-like images and branches, per-operation resource records. Contract used (verified against the public documentation on 13 Oct 2026; the service is in Beta, so `proofstack doctor` re-verifies it):

| Item | Value |
|---|---|
| Base URL | `https://api.tokenfactory.nebius.com/sandboxes` (override `CONTREE_BASE_URL`) |
| Headers | `Authorization: Bearer $NEBIUS_API_KEY`, `Project: $NEBIUS_PROJECT_ID` |
| Upload | `POST /v1/files` (octet-stream) returns `uuid`, `sha256`, `size` |
| Spawn | `POST /v1/instances`: `image`, `command`, `args`, `shell`, `env`, `cwd`, `timeout`, `disposable`, `networking.enabled`, `truncate_output_at`, `files`; `201` with operation `uuid` |
| Observe | `GET /v1/operations/{uuid}` until `SUCCESS`, `FAILED` or `CANCELLED` (pending: `PENDING`, `ASSIGNED`, `EXECUTING`) |
| Result | `metadata.result.state` (`exit_code`, `signal`, `timed_out`), `stdout`/`stderr` (`value`, `encoding`, `truncated`), `resources`, top-level `result_image_uuid` |
| Limits to plan for | 50 simultaneous operations (Beta); recorded streams 1 MiB default, 10 MiB maximum; images retained 180 days; account-effective maximums from `GET /v1/whoami` |

Operating rules (each is a documented platform behaviour or a ProofStack policy):

1. **Setup, then verify.** One *setup* operation (`disposable: false`) uploads the worktree tarball and unpacks it; its `result_image_uuid` is the immutable baseline image. A patch is applied in a second retained operation, giving a candidate image. Every verification operation runs from an image UUID with `disposable: true` and `networking.enabled: false`. The network policy is a property of each operation, so it is set explicitly on every verification operation.
2. **Direct execution.** Verification uses `command` + `args` with `shell: false` and an explicit `env` (image variables are not inherited). Shell text is used only for fixed, trusted setup scripts, never with interpolated untrusted values.
3. **In-guest ceilings.** The spawn API exposes no memory limit; `guest_runner.py` applies `RLIMIT_AS` (1 GiB), `RLIMIT_NPROC` (128), file size, core, descriptors and CPU seconds, scrubs the environment, then `exec`s. `resources.max_rss` is recorded afterwards to confirm the ceiling held.
4. **Submit once.** A POST that fails in transit raises `SubmissionUncertain`; the controller inspects the operation list before any resubmission. A polling timeout never cancels work.
5. **Resource fields are diagnostics.** Units and aggregation of `resources.*` and `cost` are not guaranteed for calculation; benchmark evidence always comes from in-guest `pyperf`, never from these fields.
6. **Candidates are branches.** Parallel patch candidates fork from the same baseline image, so each is evaluated against identical state.
7. **Credentials stay on the controller.** `preserve_env` is never set; no secret appears in args, uploads, stdout, or retained images.

Control matrix (every row has a conformance check, `proofstack doctor --check sandbox`):

| Control | Nebius Sandboxes | Hardened container fallback | Check |
|---|---|---|---|
| Network zero-egress | `networking.enabled=false` | `--network none` | `network_off`, `egress_blocked` |
| Credential masking | Env allowlist; key never uploaded | `-e` allowlist only | `no_credentials` |
| Read-only tests, benchmarks, policy | Protected-path SHA-256 verified by G0 before and after; files supplied from a separate image layer | `-v host:guest:ro` | `readonly_mount` |
| Process cap | `RLIMIT_NPROC` via guest runner | `--pids-limit 128` | `process_cap` |
| Memory ceiling | `RLIMIT_AS` via guest runner; `max_rss` audit | `--memory 1g --memory-swap 1g` | `rlimits` |
| Wall clock | `timeout` (at most 60 s) | `timeout --signal=KILL` wrapper | verified by the controller |
| Allowlisted CLI runners | Controller refuses any argv not matching the allowlist | same | unit tests |
| No privilege | VM boundary | `--cap-drop ALL`, `no-new-privileges`, non-root user, `--read-only`, noexec tmpfs | inspection |

**Fallback routing.** `SandboxRouter` tries the primary backend. If provisioning or queueing exceeds `provision_timeout_s` (default 20 s) and the task's `require_backend` is null, it re-runs the operation on the hardened container backend, and the fallback is recorded in `sandbox_operations` and shown in the cockpit. If `require_backend` is set (all demo and judging runs set it to `nebius`), the run fails closed with exit code 3. A plain subprocess with a timeout is never a backend.

{{include proofstack/sandbox/backend.py}}

{{include proofstack/sandbox/nebius.py}}

{{include proofstack/sandbox/guest_runner.py}}

{{include proofstack/sandbox/docker_cmd.py}}

{{include proofstack/sandbox/conformance.py}}

## 3.4 Deterministic primary-truth hierarchy

Wall-clock time depends on CPU frequency, neighbours, caches and the clock. Counters and growth ratios depend only on program behaviour. Evidence is therefore ranked, and a lower rank can *confirm* but never *override* a higher one.

| Rank | Evidence | Why it is deterministic | Decides |
|---|---|---|---|
| 1 | Exact SQL statement counts ($N=10\to1$, $N=100\to1$) | Counted at the connection boundary | N+1 removal (P02) |
| 2 | Empirical growth ratios: $T(2n)/T(n)$ and the log-log exponent | Scale-free; only relative change matters | ReDoS, quadratic complexity (P01, P04) |
| 3 | Bounded memory delta by `tracemalloc` after warm-up | Allocation accounting, not RSS noise | Leaks, unbounded caches (P06) |
| 4 | Adversarial counterexample discovery | A found counterexample is a proof of failure | Security, concurrency, correctness probes |
| 5 | `pyperf` median latency with dispersion and bootstrap CI | Statistical, environment-dependent | Confirms the speedup magnitude only |

Precedence rules:

1. A failing rank 1-4 result rejects the candidate regardless of rank 5.
2. A rank 5 improvement is reportable only if ranks 1-4 for the same claim do not contradict it.
3. Flat counters with a wall-clock gain that the growth ratios cannot explain are `INCONCLUSIVE` (likely caching or noise), not accepted.
4. Wall-clock evidence with unstable dispersion (relative MAD above 0.10) is `INCONCLUSIVE`.
5. "No counterexample found within budget" is reported as such, never as correctness.

## 3.5 Experiment scoring heuristic

$$\text{Score}(e)=\frac{D(e)}{T(e)+S(e)+R(e)}$$

- $D(e)\in[0,1]$: fraction of still-alive hypothesis *pairs* whose predicted outcome label differs for $e$ (pairs where either hypothesis made no prediction are ignored).
- $T(e)$: estimated runtime in seconds (history, else the declared estimate). $S(e)$: setup seconds.
- $R(e)$: risk penalty in seconds-equivalent: network 30, nondeterministic 20, new dependency 15; destructive or writes outside the workspace make the experiment ineligible.
- Ties break on the entropy of the outcome partition, then lexicographically on the experiment id. Experiments whose $T+S$ exceeds the remaining time budget are ineligible.
- Stop when one hypothesis survives, when every eligible experiment has $D=0$ (hypotheses are indistinguishable: `INCONCLUSIVE`), or when the budget ends.
- It is a heuristic, not "optimal information gain"; it is benchmarked against fixed-order selection in the evaluation.

{{include proofstack/core/selector.py}}

Worked example (asserted in `tests/test_core.py`). Hypotheses H1 list scan, H2 repeated regex compile, H3 allocation.

| Experiment | $T+S$ | Predictions (H1, H2, H3) | Pairs separated | Score |
|---|---|---|---|---|
| E1 scaling probe | 4 + 1 = 5 s | quadratic, linear, linear | 2 of 3 | 0.1333 |
| E2 compile-call counter | 1 + 2 = 3 s | low, high, low | 2 of 3 | **0.2222** |
| E3 tracemalloc growth | 6 + 1 = 7 s | flat, flat, growth | 2 of 3 | 0.0952 |

E2 runs first. If it observes `high`, only H2 survives and the loop stops. If it observes `low`, H1 and H3 survive; E1 now separates the only remaining pair at score $1/5=0.2$ and E3 at $1/7\approx0.143$, so E1 runs next.

## 3.6 Performance gate

Measurement runs inside the sandbox with `pyperf` (warm-ups, separate worker processes) and the workload seed from the task. The gate is a pure function of the raw samples.

{{include proofstack/core/perf_gate.py}}

| Parameter | Default | Meaning |
|---|---|---|
| `tau` ($\tau_{\text{noise}}$) | 0.05 | Required gain beyond 1.0 for `optimize`; configure per task |
| `budget` ($\rho$) | 0.05 | Tolerated slowdown for `harden` |
| `min_n` | 10 | Minimum samples per side |
| `noise_max` | 0.10 | Maximum relative MAD (1.4826 * MAD / median) |
| bootstrap | 5000 resamples, seed 20261013 | 95% percentile interval of the ratio of medians |

## 3.7 Probe router and probe protocol

A probe is a detector: `found=True` means the defect or exploit was reproduced on the target it was given. On the baseline that is the Red State (expected for the targeted defect); on a candidate it is a rejection. Probes print exactly one line `PROOFSTACK_FINDING {json}` (ProbeFinding schema), refuse to run unless `PROOFSTACK_SANDBOX=1`, never exit non-zero for a verdict, and report harness defects as `INCONCLUSIVE`, never as a pass.

| Probe | Family | AST trigger on baseline or diff | Gate |
|---|---|---|---|
| P01 ReDoS | SEC, PERF | Literal regex with nested quantifiers or alternation overlap; any regex applied to request-derived text | G4 |
| P02 N+1 and SQLi | PERF, SEC | DB call inside a loop; SQL built by f-string, `%` or `+` | G4 |
| P03 IDOR cache | SEC | `cache`/`lru_cache`/dict cache whose key lacks a principal or tenant near an ownership check | G4 |
| P04 quadratic | PERF | Nested loops over one collection; `in list`, `.index`, `.count`, `.remove` inside loops | G6 |
| P05 async blocking | CONC, PERF | `async def` containing `time.sleep`, `requests.*`, sync DB drivers, `subprocess.run`, blocking file I/O | G5 |
| P06 unbounded cache | CONC, PERF | Module-level mutable container written in functions; `lru_cache(maxsize=None)`; unclosed `open`/socket | G5 |
| P07 TOCTOU | CONC, SEC | Read-then-write on shared state without lock or atomic UPDATE; `SELECT` then `UPDATE` without `FOR UPDATE` | G5 |
| P08 SSRF | SEC | HTTP client call whose URL derives from a parameter or request data | G4 |
| P09 deserialization, injection | SEC | `pickle`, `marshal`, `yaml.load` without SafeLoader, `eval`/`exec`, `shell=True`, `os.system` | G2 |
| P10 timeouts, retries | CONC, SEC | HTTP call without `timeout=`; unbounded or sleepless retry loop | G2 |
| P11 JWT, tokens | SEC | `jwt.decode` with verification off or `algorithms` missing; tokens made with `random` or `time` | G2 |
| P12 path traversal | SEC | `open(join(base, user))`, `extractall`/`extract` without a filter, archive member names used as paths | G2 |
| P13 supply chain | SEC | New third-party import or dependency; secret-shaped literals; secret-named identifiers in log calls | G1 |
| P14 silent corruption | CORR | `except` blocks that `pass`, `return None` or `continue`; mutable default arguments | G2 |
| P15 pool, idempotency | CONC, CORR | Session or connection acquired without context manager; mutating endpoint without idempotency key | G2 |
| P16 test theatre | CORR | New or changed tests with no assertions, `assert True`, or only `is not None` | G3 |
| P17 deadlock order | CONC | Function taking two or more locks or row locks in argument-dependent order | G5 |
| P18 contract drift | CORR | Change to shared models, OpenAPI, JSON Schema, protobuf, enums | G3 |
| P19 float money | CORR | Arithmetic on names like price, amount, balance, total, fee, tax with `float`, `/` or `round` | G3 |

Class A probes load a target module (`--target path.py[::symbol] --params JSON`); class B probes (P13, P16, P18) take file sets. The router runs a probe when its trigger fires on the baseline files (audit) or on the changed files (candidate). The always-run set for every candidate is G0, G3 tests, and every probe whose trigger fired; probes whose trigger provably did not fire are `NOT_APPLICABLE`, with the trigger evidence in the ledger. The shared kit and all 19 probes are listed in VERIFICATION_CATALOG.md.

## 3.8 Gauntlet and acceptance

Gates run in increasing cost; a FAIL in a required gate stops the cycle immediately and its typed counterexample goes to the repair prompt.

| Gate | Content | Probes | Typical cost |
|---|---|---|---|
| G0 integrity | Patch applies; only allowed files; protected-path hashes unchanged; at most 40 changed lines and 2 files; no new binary blobs | none | ms |
| G1 supply chain | Imports and dependency diff resolved against the index (controller side); secrets scan | P13 | s |
| G2 pre-gates | Fast sandbox checks | P09, P10, P11, P12, P14, P15 | s |
| G3 correctness | Test suite (baseline failures recorded separately); differential equivalence; ledger arithmetic and contract checks | P16, P18, P19 | s to min |
| G4 security | Deep exploit probes | P01, P02, P03, P08 | s |
| G5 concurrency and resource | Interleaving, loop-blocking, memory growth | P05, P06, P07, P17 | s |
| G6 complexity | Multi-size exponent | P04 | up to 10 s |
| G7 performance | `pyperf` benchmark and bootstrap decision | none | longest |

{{include proofstack/core/acceptance.py}}

## 3.9 Evidence ledger

Append-only JSON Lines. `hash = SHA-256(canonical JSON of the entry without "hash")`; `previous_hash` links entries; the genesis link is 64 zeros. Canonical JSON is sorted keys, no whitespace, UTF-8, no NaN. Floats are never hashed: `freeze()` converts them to 9-significant-digit strings, so hashes do not depend on float formatting. Every entry carries the seven mandatory fields (`previous_hash`, `timestamp`, `baseline_metrics`, `candidate_metrics`, `diff_patch`, `gate_results`, `final_verdict`), null or empty where not applicable. `verify` detects edits, deletions, reordering and mid-chain truncation; tail truncation is detectable only with a sealed head (Ed25519 over `head:count`), which the CI gate publishes next to the artifact.

{{include proofstack/core/ledger.py}}

## 3.10 Repository layout

```text
proofstack/
  pyproject.toml  LICENSE  README.md  .env.example
  docs/                      00_STRATEGIC_AUDIT.md ... EXECUTION_PLAN.md
  schemas/                   *.v1.json  (five schemas)
  proofstack/
    cli.py  config.py  worktree.py  baseline.py  profile_parse.py
    llm/        client.py  routes.py  prompts/  schemas.py
    core/       selector.py  perf_gate.py  acceptance.py  ledger.py  registry_oracle.py  policy.py
    sandbox/    backend.py  nebius.py  docker_cmd.py  guest_runner.py  conformance.py  router.py
    probes/     _kit.py  p01_redos.py ... p19_float_money.py
    report/     markdown.py  sarif.py  pr_comment.py
  fixtures/pXX/{red,green}.py      probe self-test targets
  evals/       tasks.json  run_baseline.py  run_candidate.py  results/
  cockpit/     Next.js app (UI_UX_DESIGN_SYSTEM.md)
  tests/       selftest.py  test_core.py  test_sandbox.py  gen_examples.py  minischema.py
```

\newpage
