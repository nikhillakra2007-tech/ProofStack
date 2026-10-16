# Tier 2: medium priority, enterprise pre-gates

Pre-gates are cheap (AST trigger plus a fast sandbox check) and run before correctness and benchmarks (gates G1 and G2), so an unsafe candidate is rejected in seconds.

## P09. Insecure deserialization and command injection

**Tier 2 | SEC | CWE-502, CWE-78, CWE-95 | probe `p09_deserialization.py` | gate G2 | target module: functions named in `params.channels`**

**Failure mechanics and root cause.** `pickle.loads`, `yaml.load` with an unsafe loader, `eval`, and `subprocess` with `shell=True` plus string formatting execute attacker-controlled data as code. They work, they are short, and models emit them for "load this config" or "run this tool". Unit tests pass benign input.

**Field evidence.** The Python documentation states plainly that `pickle` is not secure against untrusted data; PyYAML's `yaml.load` default loader allowed arbitrary object construction (CVE-2017-18342) and `full_load` was bypassed (CVE-2020-14343); the `subprocess` documentation has a dedicated shell-injection warning. OWASP A03:2021 (Injection) and A08:2021 (Software and Data Integrity Failures). Safe replacements: `json`, `yaml.safe_load`, `ast.literal_eval`, argv lists with `shell=False`.

**Red-state probe.** Benign canary payloads whose only effect is creating an empty directory in a temp folder: a pickle whose `__reduce__` calls `os.mkdir`, a YAML `!!python/object/apply:os.mkdir`, a shell string `proofstack; mkdir PATH`, and an `eval` string. The directory's existence proves attacker-controlled execution.

{{include proofstack/probes/p09_deserialization.py}}

{{include fixtures/p09/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P09
ast_slice: "each flagged call site with its argument's data flow (parameter -> call), line-numbered"
runtime_evidence: {executed: [{fn: load_config, kind: pickle}, {fn: run_tool, kind: shell}], channels_tested: 4}
invariants: ["accepted input format unchanged for legitimate callers (state it: JSON/YAML mapping, plain string arg)",
             "return types unchanged"]
forbidden: ["denylist filtering of payload strings", "wrapping eval in try/except", "shell=True with shlex.quote as the only fix"]
fix_shape: "pickle/eval -> json.loads / ast.literal_eval; yaml.load -> yaml.safe_load;
            subprocess shell=True + f-string -> argv list with shell=False"
```

**Green-state gate.** `assert executed == []` for every channel (sentinel directory never created).

- [ ] `selftest P09`. [ ] Candidate diff contains none of the flagged constructs (AST re-scan).

## P10. Missing HTTP timeouts and runaway retry loops

**Tier 2 | CONC (resilience), SEC (cost/DoS) | CWE-1088, CWE-400, CWE-770 | probe `p10_timeouts_retries.py` | gate G2 | target: `call_service(url)`**

**Failure mechanics and root cause.** Most HTTP clients wait forever by default; the `requests` documentation says production code should always set a timeout. A hung dependency then pins every worker. The AI "resilience" addition is `while True: try ... except: continue`: an unbounded, sleepless retry loop that turns one outage into a request storm and, on metered infrastructure, into the checklist's five-figure cloud-bill class of incident.

**Field evidence.** AWS Builders' Library, "Timeouts, retries and backoff with jitter"; AWS Architecture Blog, "Exponential Backoff and Jitter" (full jitter); Google SRE book, "Addressing Cascading Failures" (retry amplification, retry budgets). Practice: connect and read timeouts, one overall deadline, bounded attempts, exponential backoff with full jitter, retry only transient errors (timeouts, 429, 503) on idempotent calls, circuit breaker.

**Red-state probe.** Two loopback stubs: a black hole that accepts TCP and never answers, and an always-503 server that timestamps each attempt. Red when either call exceeds `budget_s` (default 5 s), attempts exceed `max_attempts` (default 5), or at least 4 attempts occur with every gap under 10 ms.

{{include proofstack/probes/p10_timeouts_retries.py}}

{{include fixtures/p10/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P10
ast_slice: "the network call and any enclosing loop/retry decorator"
runtime_evidence: {blackhole_s: 7.0, flaky_s: 7.0, attempts_on_503: 12693, max_gap_ms: 2.6, hot_loop: true}
invariants: ["success path returns the same payload", "caller-visible exception type documented"]
forbidden: ["timeout=None", "infinite or unbounded retries", "retry without sleep", "swallowing the final error"]
fix_shape: "explicit timeout per attempt; overall deadline; attempts <= 3; sleep = random.uniform(0, min(cap, base*2**k));
            raise the last error when the budget is exhausted"
```

**Green-state gate.**

```python
assert blackhole_s <= 5.0 and flaky_s <= 5.0 and attempts_on_503 <= 5 and hot_loop is False
```

- [ ] `selftest P10` (red takes about 14 s by design). [ ] Retry count and budget appear in the candidate's docstring or config.

## P11. Broken JWT validation and weak token generation

**Tier 2 | SEC | CWE-347, CWE-330, CWE-338 | probe `p11_jwt_tokens.py` | gate G2 | target module: `verify_token`, `issue_token`, `new_token`**

**Failure mechanics and root cause.** Hand-rolled or loosely configured JWT verification trusts the token's own `alg` header: `alg: none` (any casing) skips the signature, and algorithm confusion lets an HS256 token be signed with a published RSA key. Expiry and audience are often not enforced. Separately, session, reset and API tokens are generated with `random` (a Mersenne Twister whose state is recoverable from a few hundred outputs) or from timestamps.

**Field evidence.** Tim McLean, "Critical vulnerabilities in JSON Web Token libraries" (2015); RFC 8725 (JWT best current practices: pin algorithms, validate claims); PyJWT CVE-2022-29217 and CVE-2017-11424 (key-confusion issues). Python documents `secrets` for security tokens and `hmac.compare_digest` for constant-time comparison.

**Red-state probe.** Forges with the standard library only: `alg` set to `none`, `None`, `NONE`, `nOnE` with an empty signature; a legitimate token with a swapped payload; a stripped signature; and a correctly signed but expired token. For token generation: determinism after `random.seed()`, constancy under frozen time, collisions across 2000 tokens, and estimated entropy under 128 bits.

{{include proofstack/probes/p11_jwt_tokens.py}}

{{include fixtures/p11/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P11
ast_slice: "verify function, key handling, token generator"
runtime_evidence: {forged_tokens_accepted: [alg_NONE, alg_None, alg_nOnE, alg_none, expired_but_signed],
                   weak_token_generation: [deterministic_after_random_seed]}
invariants: ["valid tokens issued by issue_token still verify", "claims dict shape unchanged"]
forbidden: ["algorithm taken from the token header", "verify_signature=False", "random/uuid1/time-based tokens",
            "string == for signature comparison"]
fix_shape: "algorithms=[<one pinned alg>]; require exp, aud, iss; hmac.compare_digest;
            secrets.token_urlsafe(32) for opaque tokens"
```

**Green-state gate.** `assert forged_tokens_accepted == [] and weak_token_generation == []` and `est_entropy_bits >= 128`.

- [ ] `selftest P11`. [ ] Existing login and refresh tests pass (G3).

## P12. Path traversal and unsafe archive extraction

**Tier 2 | SEC | CWE-22 | probe `p12_path_traversal.py` | gate G2 | target module: `read_file(base_dir, user_path)`, `extract(archive_path, dest_dir)`**

**Failure mechanics and root cause.** `open(os.path.join(base, user_path))` follows `../`, absolute paths (a later absolute component discards the base) and symlinks. Extraction code that trusts member names writes anywhere the process can write. Tests use well-formed names.

**Field evidence.** Zip Slip (Snyk, 2018) across many ecosystems; CVE-2007-4559 in `tarfile`, answered by PEP 706 extraction filters (available since Python 3.12 and backported to security releases; the `data` filter becomes the default in 3.14). Practice: resolve with `realpath`, compare with `commonpath` or `is_relative_to`, validate every member before writing, refuse absolute names and link escapes.

**Red-state probe.** A temporary tree with a jail directory, a secret outside it, and a symlink inside pointing out. Five read payloads (`../secret.txt`, absolute path, `....//secret.txt`, the symlink, `sub/../../secret.txt`). A hostile zip (`../`, absolute member) and tar (`../`, symlink member to `..` then a file through it) are extracted; the tree is diffed for anything created outside `dest`.

{{include proofstack/probes/p12_path_traversal.py}}

{{include fixtures/p12/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P12
ast_slice: "path construction and archive extraction code"
runtime_evidence: {read_leaks: ["../secret.txt", "<absolute path>", "link", "sub/../../secret.txt"],
                   files_written_outside_dest: [[zip, escaped_zip.txt], [zip, escaped_abs.txt], [tar, escaped_tar.txt], [tar, escaped_symlink.txt]]}
invariants: ["files under base_dir/dest still readable/extractable", "error type for bad input documented"]
forbidden: ["stripping '../' with replace()", "denylist of names", "ignoring symlinks"]
fix_shape: "realpath + commonpath check before any open; zip: validate every infolist() name first;
            tar: extractall(dest, filter='data')"
```

**Green-state gate.** `assert read_leaks == [] and files_written_outside_dest == []`.

- [ ] `selftest P12`.

## P13. Slopsquatting and hardcoded secrets (supply-chain pre-gate)

**Tier 2 | SEC | CWE-829, CWE-1357, CWE-798, CWE-532 | probe `p13_supply_chain.py` + controller `RegistryOracle` | gate G1 (runs before any candidate code executes) | class B target: file set**

**Failure mechanics and root cause.** Code models invent plausible package names. An attacker who registers the invented name turns the AI's `pip install` into code execution ("slopsquatting", term popularised by Seth Larson). Research on package hallucination across code-generation models (Spracklen et al., USENIX Security 2025) found a substantial share of recommended packages did not exist, with open-source models worse than commercial ones; hallucinated names recur, which makes them registrable. The same generators paste literal API keys into code and log tokens "for debugging".

**Field evidence.** PyPI typosquats that stole SSH keys (2019, `jeIlyfish` and a fake `python3-dateutil`); Lasso Security's demonstration that a hallucinated `huggingface-cli` package gathered tens of thousands of downloads; Uber 2016 (credentials in a repository) and Toyota 2022 (an access key exposed on GitHub for years). Practice: hash-pinned lockfiles (`pip install --require-hashes`), dependency allowlists, existence/age/typosquat checks, `gitleaks` or `detect-secrets` with entropy thresholds, secrets from the environment or a manager.

**Design.** The sandbox half is static (no network, nothing executed): it extracts third-party imports and declared dependencies and scans for secrets, emitting digests only. The controller half, `RegistryOracle`, is the only component allowed to query the package index; a 404 means the name was invented (`FAIL`), a near-miss of a popular name is a `TYPOSQUAT` (`FAIL`), a brand-new or single-release package is `NEEDS_HUMAN` (`INCONCLUSIVE`). Secrets are never written to the ledger.

{{include proofstack/probes/p13_supply_chain.py}}

{{include proofstack/core/registry_oracle.py}}

Fixtures are generated by `tests/make_fixtures.py` so no secret-shaped literal exists at rest (the AWS-style key is assembled at run time).

**Nemotron patch prompt context.**

```yaml
context_pack: P13
ast_slice: "import lines, dependency diff, flagged assignments (values redacted), flagged log calls"
runtime_evidence: {unresolved: [flask-secure-utils-pro],       # from the controller-side RegistryOracle
                   secrets: [{file: app.py, line: 5, kind: high_entropy_secret_assignment, digest: "6933135a"},
                             {file: app.py, line: 6, kind: aws_access_key_id, digest: "457643f4"}],
                   secrets_logged: [{file: app.py, line: 11, name: auth_token}]}   # digests vary per generated fixture
invariants: ["functionality preserved using an existing, allowlisted dependency or the standard library"]
forbidden: ["inventing or renaming packages", "adding unpinned dependencies", "moving the secret to another literal", "logging credentials"]
fix_shape: "replace the invented package by a real allowlisted one (or stdlib); read secrets with os.environ[...];
            log identifiers, never credentials"
```

**Green-state gate.** `found == False` (no secrets, no logged secrets) and the registry gate returns `PASS` for every import and declared name; the lockfile resolves.

- [ ] `selftest P13`. [ ] Registry oracle unit tests pass offline (fake index). [ ] `proofstack doctor` confirms index reachability from the controller, not the sandbox.

## P14. Swallowed exceptions and mutable default arguments

**Tier 2 | CORR | CWE-390, CWE-391, CWE-665 | probe `p14_silent_corruption.py` | gate G2 | target module + `params.inject`, `params.defaults`**

**Failure mechanics and root cause.** `except Exception: return None` converts an outage into "no data"; callers proceed with empty results and corrupt downstream state. `def f(items=[])` evaluates the default once, so one request's data leaks into the next. Both look harmless in single-call tests.

**Field evidence.** Python tutorial and FAQ (default values are evaluated once); Ruff/flake8-bugbear B006 and Bandit B110 (`try_except_pass`) exist because the patterns are common in production incident reviews. Practice: `None` sentinel, narrow exception types, `raise ... from e`, log with exception info.

**Red-state probe.** Failure injection replaces a named dependency with a function raising `ConnectionError("PS_INJECTED_FAILURE")`; the failure must reach the caller directly or through `__cause__`/`__context__`. For defaults, the live default objects are snapshotted, the function is called twice with different arguments, and any mutation proves cross-call state.

{{include proofstack/probes/p14_silent_corruption.py}}

{{include fixtures/p14/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P14
ast_slice: "except blocks and function signatures with defaults, line-numbered"
runtime_evidence: {flags: [exception_swallowed, default_state_retained], mutated_defaults: [bucket]}
invariants: ["success-path behaviour unchanged", "documented error type raised on dependency failure"]
forbidden: ["bare except", "logging then returning a default as the only change", "copy of the default at import time"]
fix_shape: "catch the specific exception, raise a domain error 'from e'; default=None then create inside the function"
```

**Green-state gate.** `assert flags == []` (propagated with cause; defaults unchanged after two calls).

- [ ] `selftest P14`.

## P15. DB connection-pool exhaustion and missing idempotency

**Tier 2 | CONC, CORR | CWE-404, CWE-772, CWE-400 | probe `p15_pool_idempotency.py` | gate G2 | target module: `POOL`, `handle`, `created`**

**Failure mechanics and root cause.** A session acquired without `with` or `finally` leaks on the error path; after `pool_size` failures every request waits for a connection that never returns. Network retries then re-send non-idempotent calls (payments, orders), and the same request is executed twice.

**Field evidence.** SQLAlchemy's `QueuePool limit ... reached, connection timed out` error is a daily on-call artifact; HikariCP's "About Pool Sizing" explains why pools are small; Stripe's engineering write-up "Designing robust and predictable APIs with idempotency" (2017) and the IETF `Idempotency-Key` header draft define the key-deduplication pattern. Practice: context-managed sessions, a unique constraint on the idempotency key with `INSERT ... ON CONFLICT DO NOTHING` returning the stored result, bounded pool with timeouts.

**Red-state probe.** `size+3` sequential calls on success and error paths (any connection still checked out is a leak), a burst of `6*size` calls through `3*size` threads (pool timeouts), and 8 concurrent replays of one key (exactly one side effect required).

{{include proofstack/probes/p15_pool_idempotency.py}}

{{include fixtures/p15/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P15
ast_slice: "acquire/release sites, error paths, the side-effecting write"
runtime_evidence: {connections_leaked: 3, pool_timeouts: 0, side_effects_for_same_key: 8}
invariants: ["first call result unchanged", "replays return the stored result without a second side effect"]
forbidden: ["increasing pool size as the fix", "global lock around the whole handler in production code",
            "catching and ignoring the second write"]
fix_shape: "context manager or try/finally for every acquire; idempotency key persisted with a unique constraint
            (INSERT ... ON CONFLICT DO NOTHING RETURNING) and checked before the side effect"
```

**Green-state gate.**

```python
assert connections_leaked == 0 and pool_timeouts == 0 and side_effects_for_same_key == 1
```

- [ ] `selftest P15`.

\newpage
