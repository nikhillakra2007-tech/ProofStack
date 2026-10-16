---
title: "ProofStack: Complete 19-Problem Verification Engine Catalog"
subtitle: "Document 03 of the ProofStack specification suite (VERIFICATION_CATALOG.md)"
version: "1.0"
date: "13 October 2026"
---

# 4. Verification engine catalog

## 4.1 How to read and execute this catalog

Every problem below has the same four parts, in the order the engine uses them.

1. **Failure mechanics and enterprise root cause.** How AI-written or refactored code introduces the flaw while unit tests stay green, with the field evidence (post-mortems, CVEs, production practice) that motivates the check.
2. **Red-state sandbox probe.** A runnable Python harness (the reference implementation, all 19 self-tested) plus the smallest vulnerable fixture it is validated against. The probe is a *detector*: `found=true` means the defect or exploit was reproduced on the target it was given.
3. **Nemotron patch prompt context.** The context pack the controller injects into the patch prompt (AI_PIPELINE.md section 7.3): the AST slice, the measured runtime evidence, invariants the patch must keep, forbidden moves, and the expected fix shape.
4. **Deterministic green-state gate.** The exact assertions and thresholds, plus a `- [ ]` checklist an engineer or coding agent ticks off.

Execution order for an engineer or agent, per problem: run `selftest` for the probe (red found, green clean) then wire the probe into the router (ARCHITECTURE.md 3.7).

```bash
# probe self-test (host): every probe on its red and green fixtures
python tests/selftest.py            # all 19 probes; add P01 P02 ... to select; PS_WRAP=1 applies guest limits

# one probe, inside a sandbox (command the controller issues; argv only, no shell)
python -m proofstack.sandbox.guest_runner python3 -m proofstack.probes.p01_redos \
  --target fixtures/p01/red.py::validate --params '{"attacks":[{"unit":"a","suffix":"!"}]}'
```

Probe contract (all probes): one stdout line `PROOFSTACK_FINDING <json>` matching `schemas/probe-finding.v1.json`; refuses to run unless `PROOFSTACK_SANDBOX=1`; exit code 0 for any verdict; harness defects return `INCONCLUSIVE`. Class A probes take `--target path.py[::symbol] --params JSON`; class B probes (P13, P16, P18) take file sets. Payloads are benign canaries (an empty directory, a loopback decoy, a sentinel file) and never leave the sandbox.

Family tags: SEC security, PERF performance, CORR correctness, CONC concurrency and resilience.

### 4.1.1 Shared probe kit

{{include proofstack/probes/_kit.py}}

\newpage

# Tier 1: highest priority, the core eight

## P01. ReDoS and catastrophic regex backtracking

**Tier 1 | SEC, PERF | CWE-1333, CWE-400 | probe `p01_redos.py` | gate G4 | target: callable `f(str) -> comparable`**

**Failure mechanics and root cause.** A pattern with nested quantifiers or overlapping alternation such as `^([a-z0-9]+)*@` lets a backtracking engine try an exponential number of ways to split a failing input. Unit tests use short, valid inputs, so the pattern looks fine. AI "validation helpers" generate these patterns routinely because they are idiomatic and read well. One crafted string then pins a core.

**Field evidence.** Cloudflare, 2 July 2019: a single WAF rule containing a backtracking-heavy fragment (`.*(?:.*=.*)`) drove CPU to saturation worldwide for about half an hour; remediation was to remove the rule, add a CPU guard, and move to a linear-time engine (RE2/Rust). Stack Exchange, 20 July 2016: a whitespace-trimming regex met a post containing roughly 20,000 consecutive whitespace characters. Python standard library: CVE-2018-1060 and CVE-2018-1061 (`poplib`, `difflib`), CVE-2020-8492 (`urllib`). Mitigations that work: unambiguous patterns; atomic groups and possessive quantifiers (Python 3.11+); linear-time engines (`google-re2`); length caps; `regex` module timeouts.

**Red-state probe.** Growth ladder at $n=18,20,22$ (attack = `unit * n + suffix`, template chosen as the slowest at $n=14$); red when $T(n+2)/T(n)\ge2$ at both steps above a 5 ms floor, or any measurement hits the 5 s cap. Not exponential? A polynomial check at $n=10^4,2\cdot10^4,4\cdot10^4$ flags a log-log exponent $\ge1.6$. If `reference` is given, a differential fuzz (seeds plus 3000 random strings, seed 1337) must show zero mismatches, which catches "fast but wrong" rewrites.

{{include proofstack/probes/p01_redos.py}}

Vulnerable fixture `fixtures/p01/red.py` (validated: growth 4.0x then 4.2x per two characters; the fast rewrite with `+` is caught by differential fuzz via the seed `@example.com`):

{{include fixtures/p01/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P01
ast_slice: "regex literal and its enclosing function, line-numbered, at most 40 lines"
runtime_evidence: {t_ns: {"18": 13663785, "20": 54506321, "22": 228725759}, growth: [3.99, 4.20],
                   attack: {unit: "a", suffix: "!"}, timed_out_at: null}
invariants:
  - "accepted language unchanged: differential fuzz against the baseline must report 0 mismatches"
  - "anchors, flags and the function signature unchanged"
forbidden: ["raising or adding an input-length cap as the only change", "catching a timeout", "dropping validation"]
fix_shape: "rewrite to an unambiguous linear pattern (e.g. [a-z0-9]* for ([a-z0-9]+)*), or use an atomic group /
            possessive quantifier (Python 3.11+); a length cap may accompany but not replace the rewrite"
```

**Green-state gate (all must hold).**

```python
assert not (t[20]/t[18] >= 2.0 and t[22]/t[20] >= 2.0 and t[22] >= 5_000_000)   # no geometric growth
assert timed_out_at is None                                                     # no cap hit at n <= 22
assert poly_slope < 1.6                                                         # no polynomial backtracking
assert diff_mismatches == 0                                                     # same language as baseline
```

- [ ] `selftest P01`: red found, green clean, `wrong_rewrite` found by differential.
- [ ] Candidate passes the four assertions; G3 tests pass; ledger `GATE_RESULT` for P01 is `PASS`.

## P02. N+1 query explosion and the SQL-injection trap

**Tier 1 | PERF, SEC | CWE-89 | probe `p02_nplus1_sqli.py` | gate G4 | target: `fetch(conn, user_ids, status) -> dict`**

**Failure mechanics and root cause.** A loop that issues one query per parent row looks correct and passes tests on five rows; on 500 rows it issues 500 round trips. The "obvious" AI fix is batching with an f-string (`IN ({ids}) AND status = '{status}'`): the query count drops to one, the functional tests pass, and a SQL injection sink has been created. Using an ORM does not remove the risk: Django alone has shipped injection CVEs through ORM features (for example CVE-2022-28346 column aliases, CVE-2019-14234 JSON key transforms).

**Field practice.** Eager-loading primitives (`select_related`, `prefetch_related`, SQLAlchemy `selectinload`) or one parameterized `IN (?, ...)` with chunking below the driver's variable limit; statements counted at the connection boundary.

**Red-state probe.** The connection is wrapped so every `(sql, params)` is recorded exactly as issued. Query counts at $N=10$ and $N=100$ expose growth; a hostile status `x' OR '1'='1' -- MARK` must remain a bound parameter. Red if the count grows with $N$ or exceeds 3, if the marker appears in SQL text, or if the hostile call returns rows.

{{include proofstack/probes/p02_nplus1_sqli.py}}

Fixtures: `fixtures/p02/red.py` (N+1), `fixtures/p02/trap.py` (flat count, injectable; the probe returns `leaked_rows: 60`), `fixtures/p02/green.py` (one parameterized query).

{{include fixtures/p02/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P02
ast_slice: "the loop and the execute() call(s), plus the function signature and row shape"
runtime_evidence: {q10: 10, q100: 100, growth: "linear in N"}
invariants:
  - "result structure identical: dict[user_id] -> list of {id, total}, empty list for users without rows"
  - "after the patch q100 == q10 and q100 <= 3"
forbidden: ["f-strings, %, .format or + to insert values into SQL", "interpolating user_ids or status",
            "changing the function signature", "disabling or catching errors"]
fix_shape: "single query with IN (?,?,...) built only from '?' placeholders, values passed as parameters;
            chunk user_ids when len > 500; status bound as a parameter"
```

**Green-state gate.**

```python
assert q100 == q10 and q100 <= 3        # flat statement count (rank-1 evidence)
assert sqli_sink is False               # hostile marker never appears in SQL text
assert leaked_rows == 0                 # hostile status returns nothing
```

- [ ] `selftest P02`: red (n+1) found, trap (sqli) found, green clean.
- [ ] Candidate result equals baseline result on the correctness suite.

## P03. Broken object-level authorization (IDOR) introduced by caching

**Tier 1 | SEC (PERF confirm) | CWE-639, CWE-524 | probe `p03_idor_cache.py` | gate G4 | target module: `get_object(principal, object_id)`**

**Failure mechanics and root cause.** The slow function fetches a row and then checks ownership. The AI speed-up caches the row by `object_id`. The first (authorized) caller warms the cache; every later caller gets the row before the ownership check runs. Single-user tests never see it. The measured speed-up is real, which is why a performance-only gate would accept it.

**Field evidence.** OWASP API Security Top 10 (2023) API1: Broken Object Level Authorization. OpenAI, 20 March 2023: a redis-py connection bug made a cache return other users' chat titles and some billing details; redis-py CVE-2023-28858 and CVE-2023-28859 track the underlying issue. Web cache deception (Omer Gil, 2017) shows the same class at the HTTP layer. Practice: key every cache entry by principal and tenant, authorize before serving a hit, or cache only authorization-independent data; `Cache-Control: private` and `Vary` for HTTP caches.

**Red-state probe.** A fresh module instance per scenario. Scenario A: Alice reads her object (warming the cache), then Bob requests Alice's object. Scenario B: roles swapped. Any success for the non-owner is a leak. The probe also reports the legitimate cache speed-up (cold versus warm median of 5) so the cockpit can show "faster *and* leaking".

{{include proofstack/probes/p03_idor_cache.py}}

{{include fixtures/p03/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P03
ast_slice: "the cached function and cache definition, ownership check lines marked"
runtime_evidence: {leaks: [{victim: alice, attacker: bob, object: 1}, {victim: bob, attacker: alice, object: 2}],
                   cache_speedup_x: 2935.56}
invariants:
  - "a principal never receives an object it does not own, warm cache or cold"
  - "owner's repeated reads stay cached (speed-up preserved)"
forbidden: ["removing the cache", "removing or moving the ownership check after the cache lookup",
            "global cache without principal in the key", "clearing the cache on every call"]
fix_shape: "key = (principal, object_id) [and tenant if present]; ownership verified on miss before insertion;
            cache hit only returns an entry stored for the same principal"
```

**Green-state gate.**

```python
assert leaks == []                      # both orderings, non-owner is denied
assert cache_speedup_x >= 2.0           # the optimization is real for the owner (confirmed by G7 benchmark)
```

- [ ] `selftest P03`: red leaks, green clean. [ ] Verdict console shows PERF pass and SEC fail for the red candidate.

## P04. Accidental quadratic complexity

**Tier 1 | PERF | CWE-407 | probe `p04_quadratic.py` | gate G6 | target: `f(items)`**

**Failure mechanics and root cause.** `x in some_list` or `.index()` inside a loop is $O(n)$ per iteration, so the whole function is $O(n^2)$. On 50 test rows it is microseconds; at 10,000 rows it dominates a request. AI refactors reintroduce it when "simplifying" a set or dict into a list.

**Field evidence.** Algorithmic-complexity attacks were demonstrated against hash tables in 2011 (Klink and Walde, 28C3), which led Python to enable hash randomization by default; the underlying lesson, that a worst case you never test is reachable by an attacker, applies to every accidental quadratic path. Practice: sets and dicts for membership, `collections.Counter`, sort plus two-pointer, `bisect`.

**Red-state probe.** Sizes 1k, 10k, 50k on an all-unique input (worst case), each capped at 3 s; the empirical exponent is the maximum of the regression slope and any consecutive pair above a 5 ms floor (a capped point only lower-bounds the exponent, so slow baselines are still caught). Red at exponent $\ge1.6$; the band $(1.5,1.6)$ is `INCONCLUSIVE`.

{{include proofstack/probes/p04_quadratic.py}}

{{include fixtures/p04/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P04
ast_slice: "the loop nest with the inner membership/scan expression highlighted"
runtime_evidence: {t_ns: {"1000": 6899183, "10000": 625721340, "50000": 3000356666}, exponent: 1.96, capped_at: 50000}
invariants: ["same return value and ordering semantics", "no new dependencies", "memory growth at most O(n)"]
forbidden: ["caching results across calls", "special-casing benchmark sizes", "changing the signature"]
fix_shape: "build a set/dict index once; iterate once; keep first-occurrence semantics if the baseline had them"
```

**Green-state gate.**

```python
assert capped_at is None and exponent < 1.5      # target about 1.0-1.3; (1.5, 1.6) => INCONCLUSIVE, rerun larger
assert t_ns[50000] < 3_000_000_000
```

- [ ] `selftest P04`. [ ] G7 benchmark confirms the gain with the bootstrap CI.

## P05. Synchronous blocking inside `async def`

**Tier 1 | CONC, PERF | CWE-400 | probe `p05_async_block.py` | gate G5 | target: async callable `handler()`**

**Failure mechanics and root cause.** One `requests.get`, `time.sleep`, sync DB driver call or blocking file read inside an `async def` endpoint freezes the entire event loop: every other request waits. A single-request test passes; under 8 concurrent clients latency becomes 8x.

**Field evidence.** FastAPI and Starlette documentation: blocking work in `async def` must be awaited non-blocking or run in a thread (a plain `def` endpoint is run in a bounded thread pool). `asyncio` debug mode reports callbacks slower than 100 ms by default; libraries such as `blockbuster` instrument known blocking calls. Fixes: `httpx.AsyncClient`/`aiohttp`, `asyncio.to_thread`, async DB drivers.

**Red-state probe.** One warm single call, then 8 concurrent calls with a 5 ms heartbeat task measuring event-loop lag. Flatness ratio $=$ total / single. A fully blocking handler gives about 8; a 5-worker default thread pool about 2; a non-blocking handler about 1. Red when the ratio exceeds 3.0 and lag exceeds 25% of one call.

{{include proofstack/probes/p05_async_block.py}}

{{include fixtures/p05/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P05
ast_slice: "the async def and the blocking call(s) with line numbers"
runtime_evidence: {single_ms: 100.2, total_ms: 802.1, flatness_ratio: 8.01, max_loop_lag_ms: 797.1, k: 8}
invariants: ["same response body and status", "no new global state", "cancellation propagates"]
forbidden: ["wrapping in an unbounded thread creation per request", "time.sleep replaced by a shorter sleep",
            "removing the call"]
fix_shape: "await an async client for I/O, or await asyncio.to_thread(blocking_fn) with a bounded executor;
            keep CPU-bound work off the loop"
```

**Green-state gate.**

```python
assert flatness_ratio <= 3.0 and max_loop_lag_ms < 0.25 * single_ms
```

- [ ] `selftest P05`: red found; `green_thread` (ratio about 2.0) and `green_async` (about 1.0) clean.

## P06. Unbounded in-memory caches and memory leaks

**Tier 1 | CONC (resource), PERF | CWE-401, CWE-770 | probe `p06_memory_growth.py` | gate G5 | target: `f(key)`**

**Failure mechanics and root cause.** A module-level dict used as a cache never evicts; `functools.lru_cache(maxsize=None)` and unclosed files or sockets behave the same. Memory grows with distinct keys until the container is OOM-killed (exit code 137 under Kubernetes). Tests use a handful of keys.

**Field practice.** Bounded caches (`lru_cache(maxsize=N)`, `cachetools.TTLCache(maxsize, ttl)`), context managers for resources, and `tracemalloc` snapshot comparison to find growth sites. A TTL alone is not a bound inside its window, so the policy requires a `maxsize`.

**Red-state probe.** Warm-up of 20,000 keys saturates any bounded cache; then four rounds of 5,000 *new* keys, `gc.collect()`, and `tracemalloc` deltas. Red when growth is monotonic and at least 16 bytes per new key, or when descriptor count grows by more than 50, or `EMFILE` occurs.

{{include proofstack/probes/p06_memory_growth.py}}

{{include fixtures/p06/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P06
ast_slice: "the cache definition, every write site, and the read function"
runtime_evidence: {growth_bytes: [2311016, 3901080, 5491112, 7081144], bytes_per_new_key: 354.1, fd_growth: 0}
invariants: ["same values returned for the same key", "hit path stays O(1)"]
forbidden: ["clearing the whole cache on a timer as the only bound", "weakref hacks that never hit",
            "maxsize larger than 100000 without a stated memory estimate"]
fix_shape: "bounded LRU (maxsize N) or TTL+maxsize cache; close resources with 'with'; document the bound"
```

**Green-state gate.**

```python
assert bytes_per_new_key < 16 and fd_growth <= 50      # zero growth after warm-up, within tolerance
```

- [ ] `selftest P06`. [ ] Candidate's `growth_bytes` is flat (differences below 4 KiB).

## P07. TOCTOU race conditions and double-spend

**Tier 1 | CONC, SEC | CWE-367, CWE-362 | probe `p07_toctou.py` | gate G5 | target module: `setup`, `withdraw`, `balance`**

**Failure mechanics and root cause.** `if balance >= amount: balance -= amount` is two steps. Two requests that both pass the check before either debits spend the same money, or oversell the same inventory. Sequential tests pass. AI code introduces it when "validating first" before an update.

**Field evidence.** Race-condition double spends are a recurring fintech failure class: Egor Homakov's 2015 Starbucks gift-card race, and widely reported exchange withdrawal races in the early 2010s; James Kettle's "Smashing the state machine" (2023) showed single-packet attacks that make web races reliable. Practice: one atomic statement (`UPDATE accounts SET balance = balance - :amt WHERE id = :id AND balance >= :amt`, then check the row count), `SELECT ... FOR UPDATE`, serializable isolation with retry, unique constraints and idempotency keys. A process-local `threading.Lock` is only valid for a single process.

**Red-state probe.** `Lockstep` (ARCHITECTURE kit) parks every worker before each source line of the target file and releases one at a time: seed 0 is breadth-first, so all 8 workers pass the check before any debits; seeds 1 to 29 are seeded random schedules. No timing luck: the same seed gives the same interleaving. Red when successes times amount exceeds the start balance, the balance goes negative, or conservation breaks.

{{include proofstack/probes/p07_toctou.py}}

{{include fixtures/p07/red.py}}

**Nemotron patch prompt context.**

```yaml
context_pack: P07
ast_slice: "the check and the act lines, shared state definition, any existing lock"
runtime_evidence: {seed: 0, successful_withdrawals: 8, final_balance: -700, initial_balance: 100, amount: 100}
invariants: ["at most floor(start/amount) successful withdrawals", "balance never negative", "return values unchanged"]
forbidden: ["sleep/retry to 'reduce the window'", "catching the negative balance afterwards",
            "a lock that is created per call"]
fix_shape: "in-process: one shared lock around check+act; database-backed: single atomic UPDATE ... WHERE balance >= amt
            with row-count check, or SELECT ... FOR UPDATE inside one transaction"
```

**Green-state gate.**

```python
for seed in range(30):                         # 8 workers, forced interleavings
    assert ok * amount <= start and bal >= 0 and bal == start - ok * amount
```

- [ ] `selftest P07`: red found at seed 0; green clean over 30 rounds.

## P08. Server-side request forgery in URL fetchers

**Tier 1 | SEC | CWE-918 | probe `p08_ssrf.py` | gate G4 | target: `fetch_url(url)`**

**Failure mechanics and root cause.** Webhook, link-preview, image-proxy and import-by-URL features fetch attacker-supplied URLs from inside the network. Without validation they reach loopback services and the cloud metadata endpoint. The common AI "fix", checking the hostname's IP and then handing the URL to the HTTP client, is defeated by DNS rebinding: the client resolves again and connects somewhere else. Spelling tricks (decimal, hex, short and IPv4-mapped IPv6 forms) defeat string blocklists.

**Field evidence.** Capital One, 2019: SSRF against a misconfigured web application firewall reached the EC2 instance metadata service and returned role credentials; AWS introduced IMDSv2 (session tokens, hop limit) in November 2019. OWASP A10:2021 and API7:2023 list SSRF; CVE-2021-26855 (Exchange) is a widely exploited instance. Python specifics: `ipaddress` misclassified some ranges before the 2024 fixes (CVE-2024-4032, use Python 3.12.4+ and add an explicit blocklist), and CVE-2023-24329 bypassed `urllib.parse` blocklists with a leading blank. Practice: allowlist hosts where possible; resolve once; validate every returned address with `is_global` after unwrapping IPv4-mapped IPv6; connect to the pinned IP (keeping `Host` and SNI); do not follow redirects, or re-validate each hop; block link-local `169.254.0.0/16`; enforce IMDSv2; apply egress policy.

**Red-state probe.** Decoy servers on loopback (IPv4 and IPv6) emulate the metadata service; any inbound request is proof. Vectors: `127.0.0.1`, `localhost`, decimal `2130706433`, hex `0x7f.0.0.1`, short `127.1`, `0.0.0.0`, userinfo trick, `[::1]`, `[::ffff:127.0.0.1]`, and `rebind.test`, a name that resolves to a public address on the first lookup and loopback afterwards.

{{include proofstack/probes/p08_ssrf.py}}

{{include fixtures/p08/red.py}}

Fixtures `fixtures/p08/naive.py` (validate-then-fetch; found only by the rebind vector) and `fixtures/p08/green.py` (resolve once, validate all answers, connect to the pinned IP, no redirects).

**Nemotron patch prompt context.**

```yaml
context_pack: P08
ast_slice: "fetch function, URL parsing, resolver and HTTP client call sites"
runtime_evidence: {vectors_hit: [decimal, hex, localhost, loopback, short, zero], decoy_hits: 6,
                   body_leaked: [loopback, localhost, decimal, hex, short, zero]}
invariants: ["legitimate public http(s) URLs still fetch", "response size cap and timeout preserved or added"]
forbidden: ["string/regex blocklists on the hostname", "validating then re-resolving", "following redirects unchecked",
            "disabling the feature"]
fix_shape: "urlsplit; scheme allowlist; getaddrinfo once; every address ipaddress.is_global (unwrap ipv4_mapped);
            connect to the chosen IP with Host/SNI = original host; redirects off or re-validated per hop"
```

**Green-state gate.**

```python
assert decoy_hits == 0 and body_leaked == []     # every vector, including rebind
```

- [ ] `selftest P08`: red, naive (rebind only) found; green clean. [ ] Legitimate-fetch test in the task's own suite still passes (G3).

\newpage
