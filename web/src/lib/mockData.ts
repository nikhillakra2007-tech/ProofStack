import { CatalogProblem, GateStatus, NemotronHypothesis, IdentityCheck, DastFindingItem, LedgerBlock } from "./types";

export const MOCK_CATALOG: CatalogProblem[] = [
  // --- TIER 1 ---
  {
    id: "T1-1",
    tier: "Tier 1",
    domain: "Performance",
    title: "ReDoS / Catastrophic Regex Backtracking",
    summary: "Nested quantifiers (a+)+ burn 100% CPU on crafted evil input.",
    realWorldImpact: "Cloudflare 2019 global outage caused by catastrophic backtracking on WAF rules.",
    bugSnippet: `import re
# VULNERABLE: Nested repetition with overlapping character classes
URL_PATTERN = re.compile(r"^([a-zA-Z0-9]+)+$")

def validate_slug(slug: str) -> bool:
    return bool(URL_PATTERN.match(slug))`,
    naiveFixSnippet: `import re
# NAIVE FIX: Silently truncates user input or sets arbitrary length guard
def validate_slug(slug: str) -> bool:
    if len(slug) > 25:
        return False  # REJECTED: breaks legitimate long valid slugs
    return bool(re.match(r"^([a-zA-Z0-9]+)+$", slug))`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G1 failed: truncated valid inputs without fixing exponential backtracking root cause.",
    safeFixSnippet: `import re
# SAFE FIX: Unambiguous linear regex pattern
URL_PATTERN = re.compile(r"^[a-zA-Z0-9]+$")

def validate_slug(slug: str) -> bool:
    return bool(URL_PATTERN.match(slug))`,
    safeVerdict: "ACCEPT",
    safeReason: "G5 Performance passed: log-log slope = 1.02 (<1.3). Zero evil input freeze.",
    probeMethod: "Empirical scaling ratio on evil input (28-char canary < 3s, slope < 1.3)",
    truthRank: 2,
  },
  {
    id: "T1-2",
    tier: "Tier 1",
    domain: "Database",
    title: "N+1 Query Explosion & The SQL-Injection Trap",
    summary: "Iterative relationship loads fire thousands of DB queries; naive string gluing opens SQLi.",
    realWorldImpact: "5,000 orders generate 5,001 database transactions, exhausting connection pools.",
    bugSnippet: `# VULNERABLE: Relationship accessed inside loop triggers separate queries
for order in db.query(Order).all():
    customer = db.query(Customer).filter_by(id=order.customer_id).first()
    print(order.id, customer.name)`,
    naiveFixSnippet: `# NAIVE AI FIX: Combines IDs via raw string formatting -> SQL INJECTION!
ids = [str(o.id) for o in orders]
raw_sql = f"SELECT * FROM customers WHERE id IN ({','.join(ids)})"
db.execute(text(raw_sql)) # REJECTED: String-built SQL opens exploit vector`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G2 Security failed: SQL injection canary payload extracted foreign rows.",
    safeFixSnippet: `# SAFE FIX: Eager loading via joinedload with strict bound params
orders = db.query(Order).options(joinedload(Order.customer)).all()
for order in orders:
    print(order.id, order.customer.name)`,
    safeVerdict: "ACCEPT",
    safeReason: "G5 Performance passed: exactly 1 SQL query for N=10, 100, 500. SQLi payload safe.",
    probeMethod: "Exact SQL statement counter (Rank 1). Bound params intact.",
    truthRank: 1,
  },
  {
    id: "T1-3",
    tier: "Tier 1",
    domain: "Security",
    title: "Broken Object-Level Auth (IDOR) in Cache",
    summary: "Speedup caching keyed only by document_id allows cross-tenant data leaks.",
    realWorldImpact: "User B directly accesses User A's private healthcare documents from cache.",
    bugSnippet: `# VULNERABLE: Cache key ignores tenant boundary
@lru_cache(maxsize=1000)
def get_document(doc_id: str):
    return db.query(Document).filter_by(id=doc_id).first()`,
    naiveFixSnippet: `# NAIVE FIX: Caches the permission check globally
@lru_cache(maxsize=1000)
def get_cached_doc(user_id, doc_id):
    # Weakened security: caches authorization across different users
    return db.query(Document).filter_by(id=doc_id).first()`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G3 Identity failed: User B received User A's cached record.",
    safeFixSnippet: `# SAFE FIX: Check authorization on every call; cache key includes tenant
def get_document(tenant_id: str, user_id: str, doc_id: str):
    doc = _fetch_doc_cached(tenant_id, doc_id)
    if doc.user_id != user_id and not is_admin(user_id):
        raise PermissionDenied("Access forbidden")
    return doc

@lru_cache(maxsize=1000)
def _fetch_doc_cached(tenant_id: str, doc_id: str):
    return db.query(Document).filter_by(tenant_id=tenant_id, id=doc_id).first()`,
    safeVerdict: "ACCEPT",
    safeReason: "G2 & G3 passed: cross-tenant access returns 403 Forbidden. Cache isolated.",
    probeMethod: "Two-user exploit oracle (Rank 5) with distinct tenant credentials.",
    truthRank: 5,
  },
  {
    id: "T1-4",
    tier: "Tier 1",
    domain: "Performance",
    title: "Accidental Quadratic Complexity O(n^2)",
    summary: "Repeated list scan 'item in list' inside nested loops causes production crawl.",
    realWorldImpact: "50-row test dataset takes 2ms; 10,000-row batch spikes to 42 seconds.",
    bugSnippet: `def deduplicate_records(records: list[dict]) -> list[dict]:
    seen = []
    result = []
    for r in records:
        # VULNERABLE: 'in seen' is O(n), creating O(n^2) overall
        if r["id"] not in seen:
            seen.append(r["id"])
            result.append(r)
    return result`,
    naiveFixSnippet: `# NAIVE FIX: Uses list(set(...)) which breaks stable order and duplicates
def deduplicate_records(records: list[dict]) -> list[dict]:
    # REJECTED: breaks output order stability and return structure
    return [dict(t) for t in {tuple(d.items()) for d in records}]`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G1 Correctness failed: differential mismatch on sort order preservation.",
    safeFixSnippet: `def deduplicate_records(records: list[dict]) -> list[dict]:
    # SAFE FIX: O(1) set lookup preserving exact first-occurrence order
    seen_ids = set()
    result = []
    for r in records:
        rid = r["id"]
        if rid not in seen_ids:
            seen_ids.add(rid)
            result.append(r)
    return result`,
    safeVerdict: "ACCEPT",
    safeReason: "G5 Performance passed: slope = 1.01 (<1.3). Doubling ratio = 2.04 (<2.6).",
    probeMethod: "Empirical scaling sweep across 1k, 2k, 4k, 8k rows (Rank 2).",
    truthRank: 2,
  },
  {
    id: "T1-5",
    tier: "Tier 1",
    domain: "Concurrency",
    title: "Blocking Calls Inside async def (Event-Loop Freeze)",
    summary: "Synchronous I/O or sleep inside async route serializes all concurrent web requests.",
    realWorldImpact: "A single slow request causes all 50 concurrent users to timeout; health check fails.",
    bugSnippet: `@app.get("/compute")
async def handle_compute():
    # VULNERABLE: Synchronous sleep or blocking request freezes entire asyncio loop
    time.sleep(0.05)
    return {"status": "ok"}`,
    naiveFixSnippet: `# NAIVE FIX: Changes async def to sync def without handling async middleware
def handle_compute():
    # REJECTED: Drops async Depends() auth context and fails type contracts
    time.sleep(0.05)
    return {"status": "ok"}`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G3 Identity failed: async auth Depends() dropped.",
    safeFixSnippet: `@app.get("/compute")
async def handle_compute():
    # SAFE FIX: Native asyncio sleep or offloading to worker thread
    await asyncio.sleep(0.05)
    return {"status": "ok"}`,
    safeVerdict: "ACCEPT",
    safeReason: "G4 Concurrency passed: 20 concurrent requests overlap < 4x delay. Max lag < 50ms.",
    probeMethod: "Event-loop heartbeat monitor measuring max lag in milliseconds (Rank 4).",
    truthRank: 4,
  },
  {
    id: "T1-6",
    tier: "Tier 1",
    domain: "Resource",
    title: "Unbounded In-Memory Caches & Memory Leaks",
    summary: "Dictionary cache without eviction limit grows indefinitely until OOMKilled.",
    realWorldImpact: "Server pods crash every 6 hours under peak traffic due to Kubernetes memory limit.",
    bugSnippet: `GLOBAL_CACHE = {}

def get_profile(user_id: str):
    # VULNERABLE: Unbounded growth, keys never pruned
    if user_id not in GLOBAL_CACHE:
        GLOBAL_CACHE[user_id] = db.fetch_user(user_id)
    return GLOBAL_CACHE[user_id]`,
    naiveFixSnippet: `# NAIVE FIX: Disables caching entirely
def get_profile(user_id: str):
    # REJECTED: Completely drops caching, causing 30x database load spike
    return db.fetch_user(user_id)`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G5 Performance failed: database throughput collapsed under load.",
    safeFixSnippet: `from collections import OrderedDict

class BoundedLRU:
    def __init__(self, maxsize=10000):
        self.cache = OrderedDict()
        self.maxsize = maxsize

    def get(self, key):
        if key in self.cache:
            self.cache.move_to_end(key)
            return self.cache[key]
        return None

    def put(self, key, value):
        self.cache[key] = value
        self.cache.move_to_end(key)
        if len(self.cache) > self.maxsize:
            self.cache.popitem(last=False)`,
    safeVerdict: "ACCEPT",
    safeReason: "G6 Resources passed: size capped <= 10,000. Memory growth < 20MB under 40k keys.",
    probeMethod: "tracemalloc differential snapshot over 20k and 40k unique insertions (Rank 3).",
    truthRank: 3,
  },
  {
    id: "T1-7",
    tier: "Tier 1",
    domain: "Concurrency",
    title: "TOCTOU Race Conditions / Double-Spend",
    summary: "Checking balance then subtracting without atomic lock allows double-spending.",
    realWorldImpact: "Simultaneous transfer requests allow withdrawing $100 twice with a $100 balance.",
    bugSnippet: `def withdraw(account_id: str, amount: float):
    # VULNERABLE: Time-Of-Check to Time-Of-Use window
    balance = db.get_balance(account_id)
    if balance >= amount:
        time.sleep(0.001) # Race window
        db.set_balance(account_id, balance - amount)
        return True
    return False`,
    naiveFixSnippet: `# NAIVE FIX: Global Python threading lock that serializes all accounts
GLOBAL_LOCK = threading.Lock()
def withdraw(account_id: str, amount: float):
    with GLOBAL_LOCK: # REJECTED: Serializes entire financial platform
        # ...
        pass`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G4 & G5 failed: global lock serialized non-conflicting accounts.",
    safeFixSnippet: `def withdraw(account_id: str, amount: float):
    # SAFE FIX: Atomic conditional database UPDATE
    updated_rows = db.execute(
        text("UPDATE accounts SET balance = balance - :amount WHERE id = :id AND balance >= :amount"),
        {"amount": amount, "id": account_id}
    ).rowcount
    if updated_rows == 0:
        raise InsufficientFunds("Balance insufficient")
    return True`,
    safeVerdict: "ACCEPT",
    safeReason: "G4 Concurrency passed: exactly 1 success out of 20 concurrent threads. Final balance == 0.",
    probeMethod: "20-thread concurrent hammer test with balance invariant check (Rank 4).",
    truthRank: 4,
  },
  {
    id: "T1-8",
    tier: "Tier 1",
    domain: "Cloud Security",
    title: "Server-Side Request Forgery (SSRF) in URL Fetchers",
    summary: "Fetching user-supplied URLs allows contacting AWS cloud metadata service (169.254.169.254).",
    realWorldImpact: "Capital One 2019 breach: SSRF allowed exfiltrating IAM credentials from metadata.",
    bugSnippet: `import requests

def fetch_webhook(url: str):
    # VULNERABLE: Direct fetch permits internal loopback and metadata requests
    return requests.get(url, timeout=5).text`,
    naiveFixSnippet: `# NAIVE FIX: Weak string-check on URL before DNS resolution (DNS rebinding!)
def fetch_webhook(url: str):
    if "169.254" in url or "localhost" in url:
        raise ValueError("Forbidden")
    # REJECTED: Bypassed by DNS rebinding or hex IP representations (0x7f000001)
    return requests.get(url, timeout=5).text`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G2 Security failed: DNS rebinding decoy hit metadata canary.",
    safeFixSnippet: `import socket, ipaddress, urllib.parse

def fetch_webhook(url: str):
    # SAFE FIX: Resolve once, pin IP, reject private/reserved ranges
    parsed = urllib.parse.urlparse(url)
    if parsed.scheme not in ("http", "https"):
        raise ValueError("Invalid scheme")
    ip_str = socket.gethostbyname(parsed.hostname)
    ip_obj = ipaddress.ip_address(ip_str)
    if ip_obj.is_private or ip_obj.is_loopback or ip_obj.is_link_local:
        raise ValueError("Forbidden internal destination")
    return safe_pinned_request(ip_str, parsed.path, timeout=5, max_bytes=2*1024*1024)`,
    safeVerdict: "ACCEPT",
    safeReason: "G2 Security passed: 12 internal probes rejected; legitimate public endpoint works.",
    probeMethod: "Decoy hit counter on loopback & RFC1918 canaries (Rank 5).",
    truthRank: 5,
  },

  // --- TIER 2 ---
  {
    id: "T2-1",
    tier: "Tier 2",
    domain: "Security",
    title: "Insecure Deserialization & Command Injection",
    summary: "pickle.loads() or shell=True allows arbitrary remote code execution.",
    realWorldImpact: "Attacker sends serialized payload that executes reverse shell on target host.",
    bugSnippet: `import pickle
def load_session(raw_data: bytes):
    return pickle.loads(raw_data) # CRITICAL: Deserialization RCE`,
    naiveFixSnippet: `def load_session(raw_data: bytes):
    if b"os.system" in raw_data:
        raise ValueError("Banned") # REJECTED: Trivially bypassed with alternative opcodes
    return pickle.loads(raw_data)`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G0 Pre-gate failed: banned pickle.loads construct remains in AST.",
    safeFixSnippet: `import json
def load_session(raw_data: str):
    # SAFE FIX: Schema-validated JSON deserialization
    return json.loads(raw_data)`,
    safeVerdict: "ACCEPT",
    safeReason: "G0 & G2 passed: zero banned AST constructs. Canary file not executed.",
    probeMethod: "Marker file canary execution check in microVM sandbox (Rank 5).",
    truthRank: 5,
  },
  {
    id: "T2-2",
    tier: "Tier 2",
    domain: "Performance",
    title: "Missing HTTP Timeouts & Runaway Retries",
    summary: "Outbound HTTP calls without timeouts hang forever; retries amplify outage.",
    realWorldImpact: "Third-party API blip causes hundreds of worker threads to freeze, crashing cluster.",
    bugSnippet: `def call_upstream():
    while True: # VULNERABLE: Unbounded loop, missing timeouts
        try:
            return requests.get("https://upstream.api/v1/pay").json()
        except:
            time.sleep(1)`,
    naiveFixSnippet: `def call_upstream():
    for _ in range(10): # NAIVE: Retries non-idempotent operations without backoff
        return requests.get("https://upstream.api/v1/pay", timeout=30).json()`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G2 failed: non-idempotent call retried without idempotency header.",
    safeFixSnippet: `def call_upstream():
    # SAFE FIX: Explicit (connect, read) timeouts with exponential backoff & jitter
    for attempt in range(4):
        try:
            return requests.get("https://upstream.api/v1/pay", timeout=(2.0, 6.0)).json()
        except requests.RequestException:
            if attempt == 3: raise
            time.sleep(0.5 * (2 ** attempt) + random.uniform(0, 0.2))`,
    safeVerdict: "ACCEPT",
    safeReason: "G5 Performance passed: max retry elapsed < 8s. Outbound calls timeout-bounded.",
    probeMethod: "Stub hit counts and gap ratio assertion (Rank 1).",
    truthRank: 1,
  },
  {
    id: "T2-3",
    tier: "Tier 2",
    domain: "Security",
    title: "Broken JWT Validation & Weak Token Gen",
    summary: "Algorithm 'none' attack or reading alg from header allows token forgery.",
    realWorldImpact: "Attacker alters JWT header to 'alg: none' and gains SuperAdmin rights.",
    bugSnippet: `import jwt
def verify_token(token: str):
    # VULNERABLE: Reads algorithm from unverified header, signature verification disabled
    header = jwt.get_unverified_header(token)
    return jwt.decode(token, options={"verify_signature": False})`,
    naiveFixSnippet: `def verify_token(token: str):
    header = jwt.get_unverified_header(token)
    return jwt.decode(token, key="secret", algorithms=[header["alg"]]) # REJECTED`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G2 Security failed: algorithm confusion (HS256 vs RS256) accepted.",
    safeFixSnippet: `def verify_token(token: str):
    # SAFE FIX: Pinned RS256 algorithm with strict required exp/iat/sub claims
    return jwt.decode(
        token,
        PUBLIC_KEY,
        algorithms=["RS256"],
        options={"require": ["exp", "iat", "sub"]}
    )`,
    safeVerdict: "ACCEPT",
    safeReason: "G2 Security passed: all 4 forged tokens rejected. Pinned RS256 literal list.",
    probeMethod: "Exploit probe testing 'alg: none', alg confusion, and tampered payload (Rank 5).",
    truthRank: 5,
  },
  {
    id: "T2-4",
    tier: "Tier 2",
    domain: "Security",
    title: "Path Traversal & Unsafe Archive Extraction",
    summary: "Filename ../../etc/passwd or ZipSlip overwrites files outside target directory.",
    realWorldImpact: "Malicious tarball writes authorized_keys to ~/.ssh/ and grants host access.",
    bugSnippet: `def extract_zip(archive_path, dest_dir):
    with zipfile.ZipFile(archive_path) as z:
        # VULNERABLE: ZipSlip extracts members without checking destination path
        z.extractall(dest_dir)`,
    naiveFixSnippet: `def extract_zip(archive_path, dest_dir):
    with zipfile.ZipFile(archive_path) as z:
        for member in z.namelist():
            if "../" in member: continue # REJECTED: Bypassed by ..\\ or absolute /etc/passwd
            z.extract(member, dest_dir)`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G2 Security failed: absolute path member escaped destination directory.",
    safeFixSnippet: `def extract_zip(archive_path, dest_dir):
    base = Path(dest_dir).resolve()
    with zipfile.ZipFile(archive_path) as z:
        for member in z.infolist():
            target = (base / member.filename).resolve()
            if not target.is_relative_to(base) or member.is_symlink():
                raise SecurityError(f"Traversal blocked: {member.filename}")
            z.extract(member, dest_dir)`,
    safeVerdict: "ACCEPT",
    safeReason: "G2 Security passed: 7 traversal payloads blocked. No file written outside base.",
    probeMethod: "Canary file write attempt check in isolated sandbox (Rank 5).",
    truthRank: 5,
  },
  {
    id: "T2-5",
    tier: "Tier 2",
    domain: "Supply Chain",
    title: "Slopsquatting & Hard-Coded Secrets",
    summary: "Hallucinated AI dependencies and committed API keys or tokens.",
    realWorldImpact: "Package hallucinated by LLM is registered by malware authors and imported.",
    bugSnippet: `# VULNERABLE: Hardcoded credential and unverified imported package
AWS_SECRET = "AKIAIOSFODNN7EXAMPLE"
import fastapi_secure_auth_v2 # Hallucinated package not in lockfile!`,
    naiveFixSnippet: `# NAIVE FIX: Moves secret to config file without encryption or redaction
CONFIG = {"secret": "AKIAIOSFODNN7EXAMPLE"} # REJECTED: Still committed`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G0 Pre-gate failed: secret committed in diff; unapproved dependency.",
    safeFixSnippet: `# SAFE FIX: Load from secure environment; only stdlib/lockfile packages
import os
AWS_KEY = os.environ.get("AWS_ACCESS_KEY_ID")
import hmac # Use standard library`,
    safeVerdict: "ACCEPT",
    safeReason: "G0 Pre-gate passed: zero unapproved packages; secrets sanitized.",
    probeMethod: "Static diff scan against lockfile allowlist + Shannon entropy >= 4.0 (Rank 5).",
    truthRank: 5,
  },
  {
    id: "T2-6",
    tier: "Tier 2",
    domain: "Correctness",
    title: "Swallowed Exceptions & Mutable Defaults",
    summary: "Bare except pass hides errors; default list argument leaks data between users.",
    realWorldImpact: "Failed payment recorded as success; User B sees User A's items in cart.",
    bugSnippet: `def add_item(item_id: str, cart: list = []): # VULNERABLE: Mutable default argument!
    try:
        cart.append(item_id)
        charge_user()
    except Exception:
        pass # VULNERABLE: Swallowed exception hides payment failure
    return cart`,
    naiveFixSnippet: `def add_item(item_id: str, cart: list = []):
    try:
        cart.append(item_id)
    except:
        return True # REJECTED: Mutable default retained; error hidden behind True`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G1 Correctness failed: cart state leaked between sequential user calls.",
    safeFixSnippet: `def add_item(item_id: str, cart: list | None = None) -> list:
    if cart is None:
        cart = []
    try:
        cart.append(item_id)
        charge_user()
    except PaymentError as e:
        logger.exception("Payment failed for item %s", item_id)
        raise
    return cart`,
    safeVerdict: "ACCEPT",
    safeReason: "G1 Correctness passed: independent user cart sessions. ConnectionError raised.",
    probeMethod: "Multi-user state isolation invariant + exception surfacing assertion (Rank 4).",
    truthRank: 4,
  },
  {
    id: "T2-7",
    tier: "Tier 2",
    domain: "Database",
    title: "DB Connection Pool Exhaustion & Missing Idempotency",
    summary: "Unreleased connections cause pool starvation; retried payment charges twice.",
    realWorldImpact: "Duplicate orders created on retried network requests; DB pool hangs.",
    bugSnippet: `def process_payment(account_id, amount):
    conn = pool.get_connection()
    # VULNERABLE: Not inside context manager; connection leaks on error
    conn.execute("INSERT INTO orders ...")
    # Missing idempotency key check`,
    naiveFixSnippet: `def process_payment(account_id, amount):
    # NAIVE FIX: Increases pool size instead of fixing resource leak
    pool.size += 50 # REJECTED`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G6 Resources failed: connection leak persists under error conditions.",
    safeFixSnippet: `def process_payment(tenant_id, account_id, amount, idempotency_key):
    # SAFE FIX: Context manager releases connection; INSERT ON CONFLICT DO NOTHING
    with pool.session() as s:
        s.execute(
            text("INSERT INTO orders (tenant_id, idemp_key, amount) VALUES (:t, :k, :a) ON CONFLICT DO NOTHING"),
            {"t": tenant_id, "k": idempotency_key, "a": amount}
        )`,
    safeVerdict: "ACCEPT",
    safeReason: "G6 passed: pool.checkedout() == 0 after 50 calls. Exactly 1 row per key.",
    probeMethod: "Connection checkout counter + 10-thread identical key hammer test (Rank 1).",
    truthRank: 1,
  },

  // --- TIER 3 ---
  {
    id: "T3-1",
    tier: "Tier 3",
    domain: "Testing",
    title: "Green-But-Dead Tests (Test Theatre)",
    summary: "Assertionless tests or tests asserting on mocks give false 100% coverage confidence.",
    realWorldImpact: "Critical billing engine bugs slip to production because test suite asserts True.",
    bugSnippet: `def test_calculate_interest():
    result = calculate_interest(principal=1000, rate=0.05)
    # VULNERABLE: Assertionless test theatre!
    assert True`,
    naiveFixSnippet: `def test_calculate_interest():
    # NAIVE FIX: Snapshot current broken output without checking business logic
    result = calculate_interest(principal=1000, rate=0.05)
    assert result is not None # REJECTED: Trivial assertion`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G1 failed: mutation score = 0.0 (mutants survived).",
    safeFixSnippet: `def test_calculate_interest():
    # SAFE FIX: Real behavioral assertion with documented exact expected values
    result = calculate_interest(principal=1000, rate=0.05)
    assert result == Decimal("50.00")`,
    safeVerdict: "ACCEPT",
    safeReason: "G1 Correctness passed: mutation score = 1.0 (all 5 surviving mutants killed).",
    probeMethod: "AST mutant generation and survival scoring (Rank 4).",
    truthRank: 4,
  },
  {
    id: "T3-2",
    tier: "Tier 3",
    domain: "Database",
    title: "Multi-Resource Database Deadlock Ordering",
    summary: "Transactions acquiring row locks in opposite order cause SQLSTATE 40P01 deadlocks.",
    realWorldImpact: "High-volume transfer platform experiences frequent transaction aborts under load.",
    bugSnippet: `def transfer(from_acc, to_acc, amount):
    # VULNERABLE: Locks from_acc then to_acc; opposing thread locks to_acc then from_acc
    lock(from_acc)
    lock(to_acc)
    execute_transfer()`,
    naiveFixSnippet: `def transfer(from_acc, to_acc, amount):
    # NAIVE FIX: Retries on deadlock in a loop without fixing lock order
    while True: # REJECTED: Severe latency degradation and livelock risk
        try: ...`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G4 Concurrency failed: lock order graph contains directed cycle.",
    safeFixSnippet: `def transfer(from_acc, to_acc, amount):
    # SAFE FIX: Global consistent lock acquisition order (lower ID first)
    first_lock, second_lock = sorted([from_acc, to_acc])
    with db.transaction():
        db.execute(text("SELECT * FROM accounts WHERE id IN (:a, :b) ORDER BY id FOR UPDATE"),
                   {"a": first_lock, "b": second_lock})
        execute_transfer()`,
    safeVerdict: "ACCEPT",
    safeReason: "G4 Concurrency passed: 100 rounds zero deadlocks (SQLSTATE 40P01). Graph acyclic.",
    probeMethod: "Lock acquisition graph cycle analysis + 100-round stress test (Rank 4).",
    truthRank: 4,
  },
  {
    id: "T3-3",
    tier: "Tier 3",
    domain: "Correctness",
    title: "Distributed Multi-Service Contract Drift",
    summary: "Quietly renaming or changing schema types breaks downstream consumer microservices.",
    realWorldImpact: "Frontend and billing services crash in production after auth service deploy.",
    bugSnippet: `class UserResponse(BaseModel):
    # VULNERABLE: Renamed field 'user_id' to 'id', breaking consumer contracts
    id: str
    email: str`,
    naiveFixSnippet: `class UserResponse(BaseModel):
    id: str
    email: str # NAIVE FIX: Deletes consumer contract validation tests!`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G7 failed: modified consumer contract fixtures to force test pass.",
    safeFixSnippet: `class UserResponse(BaseModel):
    # SAFE FIX: Additive schema evolution with backward compatibility
    id: str
    user_id: str # Preserved for existing consumers
    email: str

    @model_validator(mode="before")
    def sync_id(cls, data):
        if "id" in data and "user_id" not in data:
            data["user_id"] = data["id"]
        return data`,
    safeVerdict: "ACCEPT",
    safeReason: "G1 Correctness passed: zero breaking changes vs provider.baseline.schema.json.",
    probeMethod: "Schema diff analyzer against consumer contract fixtures (Rank 4).",
    truthRank: 4,
  },
  {
    id: "T3-4",
    tier: "Tier 3",
    domain: "Fintech",
    title: "Float-Based Money Arithmetic Rounding Drift",
    summary: "Using standard floating point (0.1 + 0.2 != 0.3) drifts financial ledger totals.",
    realWorldImpact: "Nightly accounting reconciliation fails with 14-cent discrepancy across 100k trades.",
    bugSnippet: `def calculate_fee(balance: float, fee_pct: float) -> float:
    # VULNERABLE: IEEE-754 float representation causes fractional rounding error
    return round(balance * (fee_pct / 100.0), 2)`,
    naiveFixSnippet: `def calculate_fee(balance: float, fee_pct: float):
    # NAIVE FIX: Wraps float into Decimal -> Decimal(0.1) has float precision artifact!
    return Decimal(round(balance * (fee_pct / 100.0), 2)) # REJECTED`,
    naiveVerdict: "REJECT",
    naiveReason: "Gate G1 failed: Decimal(float) introduces precision artifact.",
    safeFixSnippet: `from decimal import Decimal, ROUND_HALF_EVEN

def calculate_fee(balance: Decimal, fee_pct: Decimal) -> Decimal:
    # SAFE FIX: Decimal strings with banker's rounding ROUND_HALF_EVEN
    raw_fee = balance * (fee_pct / Decimal("100"))
    return raw_fee.quantize(Decimal("0.01"), rounding=ROUND_HALF_EVEN)`,
    safeVerdict: "ACCEPT",
    safeReason: "G1 Correctness passed: exact cent reconciliation on 100k batches. Zero float in AST.",
    probeMethod: "Exact decimal equality test + AST float literal scanner (Rank 4).",
    truthRank: 4,
  },
];

// Problem-specific metadata mappings for all 19 catalog fixtures
const CATALOG_METADATA: Record<string, {
  filename: string;
  probeFile: string;
  failingGate: "G0" | "G1" | "G2" | "G3" | "G4" | "G5" | "G6" | "G7";
  failingGateReason: string;
  metrics: {
    baseline: { keyMetric: string; latency: string; invariant: string; delta: string };
    naive: { keyMetric: string; latency: string; invariant: string; delta: string };
    safe: { keyMetric: string; latency: string; invariant: string; delta: string };
  };
}> = {
  "T1-1": {
    filename: "auth/validators.py",
    probeFile: "t1_1_redos_probe.py",
    failingGate: "G1",
    failingGateReason: "Gate G1 failed: truncated valid inputs without fixing exponential backtracking root cause.",
    metrics: {
      baseline: { keyMetric: "Backtrack: >100k steps", latency: "14,200 ms", invariant: "CPU 100% Hang", delta: "0.0%" },
      naive: { keyMetric: "Length guard <= 25", latency: "2 ms", invariant: "Valid Slugs Truncated", delta: "-40.0%" },
      safe: { keyMetric: "Linear O(n) regex", latency: "0.04 ms", invariant: "0 Regressions ✓", delta: "+99.8%" },
    },
  },
  "T1-2": {
    filename: "orders.py",
    probeFile: "t1_2_n_plus_one.py",
    failingGate: "G2",
    failingGateReason: "Gate G2 Security failed: SQL injection canary payload extracted foreign rows.",
    metrics: {
      baseline: { keyMetric: "5,001 SQL queries", latency: "428 ms", invariant: "N+1 Explosion", delta: "0.0%" },
      naive: { keyMetric: "String-built SQL", latency: "11 ms", invariant: "SQLi Exploit Leak", delta: "+60.0%" },
      safe: { keyMetric: "1 SQL query (JOIN)", latency: "12 ms", invariant: "0 Regressions ✓", delta: "+74.2%" },
    },
  },
  "T1-3": {
    filename: "cache/store.py",
    probeFile: "t1_3_cache_idor_probe.py",
    failingGate: "G2",
    failingGateReason: "Gate G2/G3 failed: User B received User A's cached private documents.",
    metrics: {
      baseline: { keyMetric: "doc_id cache key", latency: "1.2 ms", invariant: "Cross-Tenant IDOR", delta: "0.0%" },
      naive: { keyMetric: "Global auth cache", latency: "1.0 ms", invariant: "Auth Bypass Leak", delta: "+5.0%" },
      safe: { keyMetric: "tenant:user isolated", latency: "1.4 ms", invariant: "Tenant Isolated ✓", delta: "+68.0%" },
    },
  },
  "T1-4": {
    filename: "billing/reconcile.py",
    probeFile: "t1_4_quadratic_probe.py",
    failingGate: "G1",
    failingGateReason: "Gate G1 Correctness failed: differential mismatch on sort order preservation.",
    metrics: {
      baseline: { keyMetric: "O(n^2) nested scan", latency: "42,000 ms", invariant: "Quadratic Freeze", delta: "0.0%" },
      naive: { keyMetric: "list(set()) order scrambled", latency: "4 ms", invariant: "Sort Order Broken", delta: "-80.0%" },
      safe: { keyMetric: "O(1) in-order set", latency: "3.2 ms", invariant: "Order Preserved ✓", delta: "+99.9%" },
    },
  },
  "T1-5": {
    filename: "api/export.py",
    probeFile: "t1_5_async_freeze_probe.py",
    failingGate: "G4",
    failingGateReason: "Gate G4 Concurrency failed: synchronous blocking sleep froze asyncio event loop.",
    metrics: {
      baseline: { keyMetric: "Loop lag: 840 ms", latency: "1,250 ms", invariant: "Async Loop Frozen", delta: "0.0%" },
      naive: { keyMetric: "Converted to sync def", latency: "450 ms", invariant: "Auth Depends Dropped", delta: "-20.0%" },
      safe: { keyMetric: "await asyncio.sleep()", latency: "52 ms", invariant: "0 Lost Updates ✓", delta: "+95.8%" },
    },
  },
  "T1-6": {
    filename: "telemetry/buffer.py",
    probeFile: "t1_6_memory_leak_probe.py",
    failingGate: "G6",
    failingGateReason: "Gate G6 Resources failed: tracemalloc delta 240MB > 20MB limit under load.",
    metrics: {
      baseline: { keyMetric: "Tracemalloc: +240 MB", latency: "210 ms", invariant: "Unbounded OOM Risk", delta: "0.0%" },
      naive: { keyMetric: "Caching disabled", latency: "1,800 ms", invariant: "30x DB Spike", delta: "-85.0%" },
      safe: { keyMetric: "Bounded LRU (10k)", latency: "14 ms", invariant: "Memory Delta 1.2MB ✓", delta: "+93.3%" },
    },
  },
  "T1-7": {
    filename: "fintech/wallet.py",
    probeFile: "t1_7_toctou_hammer_probe.py",
    failingGate: "G4",
    failingGateReason: "Gate G4 Concurrency failed: 20-thread race condition allowed account overdraft.",
    metrics: {
      baseline: { keyMetric: "Check-then-act gap", latency: "18 ms", invariant: "Double-Spend Exploit", delta: "0.0%" },
      naive: { keyMetric: "Global threading.Lock", latency: "420 ms", invariant: "Entire Engine Serialized", delta: "-65.0%" },
      safe: { keyMetric: "Atomic UPDATE where", latency: "8 ms", invariant: "Zero Overdraft ✓", delta: "+82.5%" },
    },
  },
  "T1-8": {
    filename: "webhooks/fetcher.py",
    probeFile: "t1_8_ssrf_metadata_probe.py",
    failingGate: "G2",
    failingGateReason: "Gate G2 Security failed: DNS rebinding decoy reached cloud metadata canary (169.254.169.254).",
    metrics: {
      baseline: { keyMetric: "Direct requests.get()", latency: "45 ms", invariant: "SSRF Canary Breached", delta: "0.0%" },
      naive: { keyMetric: "String check '169.254'", latency: "44 ms", invariant: "DNS Rebinding Bypass", delta: "0.0%" },
      safe: { keyMetric: "DNS resolve + IP range check", latency: "48 ms", invariant: "Loopback Blocked ✓", delta: "+70.0%" },
    },
  },
  "T2-1": {
    filename: "security/deserializer.py",
    probeFile: "t2_1_deserialization_probe.py",
    failingGate: "G0",
    failingGateReason: "Gate G0 Pre-gate failed: banned pickle.loads() opcode remains in AST.",
    metrics: {
      baseline: { keyMetric: "pickle.loads()", latency: "12 ms", invariant: "Arbitrary RCE Canary", delta: "0.0%" },
      naive: { keyMetric: "Byte pattern filter", latency: "12 ms", invariant: "Opcode Bypass Open", delta: "0.0%" },
      safe: { keyMetric: "Schema JSON deserializer", latency: "2 ms", invariant: "Zero Banned AST ✓", delta: "+83.3%" },
    },
  },
  "T2-2": {
    filename: "network/http_client.py",
    probeFile: "t2_2_http_retry_probe.py",
    failingGate: "G2",
    failingGateReason: "Gate G2 failed: non-idempotent call retried without idempotency header.",
    metrics: {
      baseline: { keyMetric: "while True unbounded", latency: "30,000 ms", invariant: "Worker Thread Freeze", delta: "0.0%" },
      naive: { keyMetric: "10x loop retry", latency: "15,000 ms", invariant: "Double-Charge Storm", delta: "-20.0%" },
      safe: { keyMetric: "Exponential backoff + jitter", latency: "1,200 ms", invariant: "Timeout Bounded ✓", delta: "+96.0%" },
    },
  },
  "T2-3": {
    filename: "auth/jwt_handler.py",
    probeFile: "t2_3_jwt_forge_probe.py",
    failingGate: "G2",
    failingGateReason: "Gate G2 Security failed: algorithm confusion (HS256 vs RS256) accepted forged token.",
    metrics: {
      baseline: { keyMetric: "verify_signature: False", latency: "0.5 ms", invariant: "Auth Bypass Forged", delta: "0.0%" },
      naive: { keyMetric: "Header alg accepted", latency: "0.8 ms", invariant: "Algorithm Confusion", delta: "0.0%" },
      safe: { keyMetric: "Pinned RS256 + claims", latency: "1.1 ms", invariant: "Forged Tokens Blocked ✓", delta: "+85.0%" },
    },
  },
  "T2-4": {
    filename: "storage/archive.py",
    probeFile: "t2_4_zipslip_traversal_probe.py",
    failingGate: "G2",
    failingGateReason: "Gate G2 Security failed: absolute path member escaped destination directory.",
    metrics: {
      baseline: { keyMetric: "z.extractall(dest_dir)", latency: "15 ms", invariant: "ZipSlip Path Traversal", delta: "0.0%" },
      naive: { keyMetric: "String filter '../'", latency: "14 ms", invariant: "Absolute Path Escape", delta: "0.0%" },
      safe: { keyMetric: "Path.is_relative_to()", latency: "16 ms", invariant: "Traversal Blocked ✓", delta: "+80.0%" },
    },
  },
  "T2-5": {
    filename: "config/credentials.py",
    probeFile: "t2_5_secrets_slopsquatting_probe.py",
    failingGate: "G0",
    failingGateReason: "Gate G0 Pre-gate failed: secret committed in diff; unapproved dependency.",
    metrics: {
      baseline: { keyMetric: "Hardcoded AWS_SECRET", latency: "1 ms", invariant: "Committed Key Exposed", delta: "0.0%" },
      naive: { keyMetric: "Plain config dict", latency: "1 ms", invariant: "Plaintext Config", delta: "0.0%" },
      safe: { keyMetric: "os.environ.get()", latency: "1 ms", invariant: "Secrets Redacted ✓", delta: "+95.0%" },
    },
  },
  "T2-6": {
    filename: "cart/session.py",
    probeFile: "t2_6_mutable_defaults_probe.py",
    failingGate: "G1",
    failingGateReason: "Gate G1 Correctness failed: cart state leaked between sequential user calls.",
    metrics: {
      baseline: { keyMetric: "cart: list = []", latency: "2 ms", invariant: "Session State Leaked", delta: "0.0%" },
      naive: { keyMetric: "except: return True", latency: "1 ms", invariant: "Silent Payment Failure", delta: "-50.0%" },
      safe: { keyMetric: "cart: list | None = None", latency: "2 ms", invariant: "Isolated Sessions ✓", delta: "+88.0%" },
    },
  },
  "T2-7": {
    filename: "database/pool.py",
    probeFile: "t2_7_pool_exhaustion_probe.py",
    failingGate: "G6",
    failingGateReason: "Gate G6 Resources failed: connection leak persists under error conditions.",
    metrics: {
      baseline: { keyMetric: "Unclosed connections", latency: "2,400 ms", invariant: "Pool Starvation", delta: "0.0%" },
      naive: { keyMetric: "Increased pool size +50", latency: "1,200 ms", invariant: "Resource Leak Persists", delta: "-30.0%" },
      safe: { keyMetric: "with pool.session()", latency: "8 ms", invariant: "0 Checked Out (Clean) ✓", delta: "+99.6%" },
    },
  },
  "T3-1": {
    filename: "tests/test_interest.py",
    probeFile: "t3_1_mutation_theatre_probe.py",
    failingGate: "G1",
    failingGateReason: "Gate G1 failed: mutation score = 0.0 (mutants survived test suite).",
    metrics: {
      baseline: { keyMetric: "assert True (theatre)", latency: "1 ms", invariant: "Zero Mutants Killed", delta: "0.0%" },
      naive: { keyMetric: "assert result is not None", latency: "1 ms", invariant: "Trivial Assertion", delta: "0.0%" },
      safe: { keyMetric: "Exact Decimal assertion", latency: "2 ms", invariant: "All Mutants Killed ✓", delta: "+95.0%" },
    },
  },
  "T3-2": {
    filename: "database/deadlock.py",
    probeFile: "t3_2_deadlock_ordering_probe.py",
    failingGate: "G4",
    failingGateReason: "Gate G4 Concurrency failed: lock order graph contains directed cycle.",
    metrics: {
      baseline: { keyMetric: "Arbitrary lock order", latency: "1,500 ms", invariant: "SQLSTATE 40P01 Deadlocks", delta: "0.0%" },
      naive: { keyMetric: "while True retry loop", latency: "8,500 ms", invariant: "Livelock Contention", delta: "-40.0%" },
      safe: { keyMetric: "sorted([a, b]) lock order", latency: "14 ms", invariant: "Graph Acyclic (0 aborts) ✓", delta: "+99.1%" },
    },
  },
  "T3-3": {
    filename: "contracts/user_schema.py",
    probeFile: "t3_3_contract_drift_probe.py",
    failingGate: "G7",
    failingGateReason: "Gate G7 failed: modified consumer contract fixtures to force test pass.",
    metrics: {
      baseline: { keyMetric: "Renamed 'user_id' -> 'id'", latency: "1 ms", invariant: "Downstream Services Broken", delta: "0.0%" },
      naive: { keyMetric: "Deleted consumer tests", latency: "1 ms", invariant: "Contract Drift Hidden", delta: "-90.0%" },
      safe: { keyMetric: "Additive model_validator", latency: "1.2 ms", invariant: "Contract Preserved ✓", delta: "+85.0%" },
    },
  },
  "T3-4": {
    filename: "fintech/currency.py",
    probeFile: "t3_4_float_precision_probe.py",
    failingGate: "G1",
    failingGateReason: "Gate G1 failed: Decimal(float) introduces precision artifact.",
    metrics: {
      baseline: { keyMetric: "round(float, 2)", latency: "0.01 ms", invariant: "14-Cent Ledger Drift", delta: "0.0%" },
      naive: { keyMetric: "Decimal(round(float))", latency: "0.02 ms", invariant: "Float Artifact Retained", delta: "0.0%" },
      safe: { keyMetric: "ROUND_HALF_EVEN Decimal", latency: "0.05 ms", invariant: "Exact Cent Balanced ✓", delta: "+94.0%" },
    },
  },
};

// Enrich all 19 problems with real filenames, probe files, failing gates, and metrics
MOCK_CATALOG.forEach((p) => {
  const meta = CATALOG_METADATA[p.id];
  if (meta) {
    p.filename = meta.filename;
    p.probeFile = meta.probeFile;
    p.failingGate = meta.failingGate;
    p.failingGateReason = meta.failingGateReason;
    p.metrics = meta.metrics;
  }
});

/**
 * Returns dynamic, problem-specific microVM sandbox execution logs.
 */
export function getProblemLogs(problem: CatalogProblem, mode: "bug" | "naive" | "safe" | "custom"): string[] {
  const probe = problem.probeFile || `${problem.id.toLowerCase().replace("-", "_")}_probe.py`;
  const file = problem.filename || "main.py";
  const failingGate = problem.failingGate || "G2";

  if (mode === "custom") {
    return [
      `001 [18:01:02.102] MICROVM: Booting rootless container (Linux 6.6-microvm, Python 3.11.8)...`,
      `002 [18:01:02.140] AST PARSER: Scanning candidate code AST for syntax & security invariants...`,
      `003 [18:01:02.185] AUDIT: Evaluating parameter bindings & tenant context boundaries...`,
      `004 [18:01:02.240] SANDBOX: Ready for user execution. Click 'Run Code ↵' to test live.`,
    ];
  }

  if (mode === "bug") {
    return [
      `001 [18:01:02.102] PROBE: Executing ${probe} on baseline (${file})...`,
      `002 [18:01:02.450] STATS: Target baseline vulnerability triggered: ${problem.summary}`,
      `003 [18:01:02.455] STATE: Baseline Probe Outcome: RED PROVEN (Impact: ${problem.realWorldImpact || "Production Risk"})`,
      `004 [18:01:03.110] NEMOTRON: Calling Token Factory (nvidia/nemotron-3-super-120b) for hypotheses...`,
      `005 [18:01:03.880] DISCRIMINATOR: Evaluated candidate hypotheses for ${problem.id}.`,
      `006 [18:01:04.200] VERDICT: BASELINE VULNERABLE -> RED PROVEN (Score: 0.00)`,
    ];
  }

  if (mode === "naive") {
    return [
      `001 [18:01:02.102] PROBE: Executing ${probe} on naive candidate patch (${file})...`,
      `002 [18:01:02.450] STATS: Naive AI shortcut applied: ${problem.naiveReason}`,
      `003 [18:01:03.110] GAUNTLET: Evaluating Zero-Compromise Gates G0 through G7 in isolated microVM...`,
      `004 [18:01:03.420] GATE G0: PASS (Pre-gate AST scan: zero banned imports)`,
      `005 [18:01:03.850] GATE ${failingGate}: FAIL (${problem.naiveReason})`,
      `006 [18:01:04.120] SECURITY/PERF VETO: Unsafe optimization shortcut detected!`,
      `007 [18:01:04.300] VERDICT: ZERO-COMPROMISE VETO -> REJECTED (${failingGate} FAILED)`,
      `008 [18:01:04.402] LEDGER: Veto logged. Block candidate rejected without ledger head update.`,
    ];
  }

  // Safe mode
  return [
    `001 [18:01:02.102] PROBE: Executing ${probe} on candidate patch (${file})...`,
    `002 [18:01:02.450] STATS: Invariant verified: ${problem.safeReason}`,
    `003 [18:01:02.455] STATE: Baseline Probe Outcome: RED -> GREEN FLIPPED`,
    `004 [18:01:03.110] NEMOTRON: Calling Token Factory (nvidia/nemotron-3-super-120b) for hypotheses...`,
    `005 [18:01:04.280] DISCRIMINATOR: Score(e_counter_probe) = 0.96. Experiment chosen.`,
    `006 [18:01:05.150] NEMOTRON: Defensive patch synthesized via nvidia/nemotron-3.5-lightning`,
    `007 [18:01:06.010] GAUNTLET: Running Zero-Compromise Gates G0 through G7 in isolated microVM...`,
    `008 [18:01:06.320] GATE G0: PASS (Pre-gate AST scan: zero banned imports, lockfile clean)`,
    `009 [18:01:06.850] GATE G1: PASS (All unit tests passed on candidate, zero regressions)`,
    `010 [18:01:07.120] GATE G2: PASS (Target probe flipped RED -> GREEN; exploit payloads blocked)`,
    `011 [18:01:07.410] GATE G3: PASS (Identity Guard: user_id, tenant_id preserved)`,
    `012 [18:01:07.820] GATE G4: PASS (Concurrency: 0 lost updates, max loop lag 12ms < 50ms)`,
    `013 [18:01:08.200] GATE G5: PASS (Performance: ${problem.safeReason})`,
    `014 [18:01:08.550] GATE G6: PASS (Resources: tracemalloc delta 1.2MB < 20MB ceiling, FD delta = 0)`,
    `015 [18:01:08.790] GATE G7: PASS (Hygiene: writable paths respected, zero tests modified)`,
    `016 [18:01:08.910] VERDICT: ZERO-COMPROMISE INVARIANT SATISFIED -> ACCEPT (8/8 PASSED)`,
    `017 [18:01:09.002] LEDGER: Hash chain entry index=5 recorded (SHA-256 verified)`,
  ];
}

export const MOCK_GATES: GateStatus[] = [
  { gateId: "G0", name: "Pre-gate", status: "PASS", description: "AST Scan, Slopsquatting & Secrets", details: "Zero banned imports, zero committed keys, AST syntax valid." },
  { gateId: "G1", name: "Correctness", status: "PASS", description: "Baseline vs Candidate Test Suite", details: "All 28 baseline tests passed on candidate (0 regressions)." },
  { gateId: "G2", name: "Security", status: "PASS", description: "Exploit Oracle Re-Execution", details: "Target red probe flipped RED -> GREEN. Untouched probes stay GREEN." },
  { gateId: "G3", name: "Identity", status: "PASS", description: "Identity & Auth Preservation", details: "user_id, tenant_id, and @login_required preserved in AST." },
  { gateId: "G4", name: "Concurrency", status: "PASS", description: "Race Condition & Deadlock Watchdog", details: "20-thread stress completed: 0 lost updates, loop lag 12ms (<50ms)." },
  { gateId: "G5", name: "Performance", status: "PASS", description: "Truth-Hierarchy Invariant Check", details: "Exact SQL count: 5001 -> 1. DeltaPerf = +74.2% (> tau_noise 5.0%)." },
  { gateId: "G6", name: "Resources", status: "PASS", description: "Tracemalloc & FD Leak Monitor", details: "Memory growth: 1.2MB (<20MB limit). Open FD delta = 0 (<5)." },
  { gateId: "G7", name: "Patch Hygiene", status: "PASS", description: "Writable Scope & Lockfile Guard", details: "Diff strictly confined to writable paths; tests untouched." },
];

export const MOCK_HYPOTHESES: NemotronHypothesis[] = [
  {
    id: "H1",
    claim: "N+1 query explosion triggered by customer attribute read inside the order iteration loop.",
    problemId: "T1-2",
    codeRefs: [{ file: "proofstack/routes/orders.py", lineStart: 42, lineEnd: 48 }],
    modelScore: 0.94,
    computedSupport: 0.96,
    experimentKind: "counter_probe",
    status: "CONFIRMED",
  },
  {
    id: "H2",
    claim: "Unindexed primary key scanning causing full table lock contention on orders table.",
    problemId: "T1-2",
    codeRefs: [{ file: "proofstack/models/order.py", lineStart: 12, lineEnd: 18 }],
    modelScore: 0.32,
    computedSupport: 0.08,
    experimentKind: "static_ast",
    status: "REFUTED",
  },
  {
    id: "H3",
    claim: "Connection pool starvation due to sync driver blocking within the async request context.",
    problemId: "T1-5",
    codeRefs: [{ file: "proofstack/db/session.py", lineStart: 88, lineEnd: 95 }],
    modelScore: 0.41,
    computedSupport: 0.12,
    experimentKind: "race_harness",
    status: "REFUTED",
  },
];

export const MOCK_IDENTITY_CHECKS: IdentityCheck[] = [
  { type: "parameter", name: "tenant_id: UUID", preserved: true, baselineLocation: "orders.py:42", candidateLocation: "orders.py:42" },
  { type: "parameter", name: "user_id: str", preserved: true, baselineLocation: "orders.py:42", candidateLocation: "orders.py:42" },
  { type: "predicate", name: "Order.tenant_id == tenant_id", preserved: true, baselineLocation: "orders.py:45", candidateLocation: "orders.py:46" },
  { type: "decorator", name: "@login_required", preserved: true, baselineLocation: "orders.py:40", candidateLocation: "orders.py:40" },
  { type: "authorization_branch", name: "if order.tenant_id != ctx.tenant: raise", preserved: true, baselineLocation: "orders.py:51", candidateLocation: "orders.py:52" },
];

export const MOCK_DAST_FINDINGS: DastFindingItem[] = [
  {
    id: "fd_a82f1b490c21",
    checkId: "D-01",
    title: "Missing Security Headers (CSP, HSTS, X-Content-Type-Options)",
    owasp: "A05 Security Misconfiguration",
    severity: "Medium",
    url: "https://staging.perfproof.internal/",
    evidenceSummary: "Main document response omitted Content-Security-Policy and X-Content-Type-Options: nosniff headers.",
    redactedPreview: "headers: { Server: 'Express', Content-Type: 'text/html' }",
    status: "REMEDIATION_PROPOSED",
    sourceFile: "next.config.js",
  },
  {
    id: "fd_b19c28e401aa",
    checkId: "D-02",
    title: "Permissive CSP Contains 'unsafe-inline' and Wildcard (*)",
    owasp: "A05 Security Misconfiguration",
    severity: "Medium",
    url: "https://staging.perfproof.internal/dashboard",
    evidenceSummary: "script-src directive includes 'unsafe-inline' and wildcard origin *.",
    redactedPreview: "Content-Security-Policy: default-src 'self' 'unsafe-inline' *;",
    status: "OPEN",
    sourceFile: "middleware.ts",
  },
  {
    id: "fd_c37d92841f3e",
    checkId: "D-03",
    title: "Insecure Session Cookie Missing HttpOnly & SameSite=Strict",
    owasp: "A07 Authentication Failures",
    severity: "Medium",
    url: "https://staging.perfproof.internal/api/auth/session",
    evidenceSummary: "Cookie 'session_id' set without HttpOnly flag; accessible to client JavaScript.",
    redactedPreview: "Set-Cookie: session_id=s%3A_****; Path=/; Domain=.perfproof.internal",
    status: "REMEDIATION_PROPOSED",
    sourceFile: "src/server/auth.ts",
  },
  {
    id: "fd_d44e55667788",
    checkId: "D-05",
    title: "Exposed Client-Side AWS Access Key in Script Bundle",
    owasp: "A02 Cryptographic Failures",
    severity: "High",
    url: "https://staging.perfproof.internal/_next/static/chunks/main-app.js",
    evidenceSummary: "Production JS bundle inlines AWS IAM credential literal.",
    redactedPreview: "AKIA****",
    status: "OPEN",
    sourceFile: ".env.production",
  },
  {
    id: "fd_e99a88776655",
    checkId: "D-06",
    title: "DOM-Based XSS: location.hash Flows into innerHTML Sink",
    owasp: "A03 Injection",
    severity: "High",
    url: "https://staging.perfproof.internal/search#pp_canary_7f3a",
    evidenceSummary: "Dynamic probe confirmed inert canary string reached Element.innerHTML sink without sanitization.",
    redactedPreview: "document.getElementById('results').innerHTML = location.hash;",
    status: "REMEDIATION_PROPOSED",
    sourceFile: "src/components/SearchBox.tsx",
  },
  {
    id: "fd_f11223344556",
    checkId: "D-07",
    title: "Exposed Public Environment File (/.env)",
    owasp: "A05 Security Misconfiguration",
    severity: "High",
    url: "https://staging.perfproof.internal/.env",
    evidenceSummary: "HTTP GET /.env returned status 200 with matching KEY=VALUE content signature.",
    redactedPreview: "DATABASE_URL=postgres://****:****@db:5432/prod",
    status: "OPEN",
    sourceFile: "public/.env",
  },
];

export const MOCK_LEDGER_CHAIN: LedgerBlock[] = [
  {
    index: 0,
    type: "TASK_INTAKE",
    timestamp: "2026-10-15T18:00:00Z",
    actor: "nitin@perfproof.local",
    prev_hash: "0000000000000000000000000000000000000000000000000000000000000000",
    entry_hash: "8f4b238e89c132890dbaf423a8e9e19d7010a3952f012c8b74f38891ac3980bc",
    payload: { task_id: "TASK9142", target: "orders.py:get_orders", class: "performance" },
    verified: true,
  },
  {
    index: 1,
    type: "BASELINE",
    timestamp: "2026-10-15T18:01:12Z",
    actor: "controller/baseline",
    prev_hash: "8f4b238e89c132890dbaf423a8e9e19d7010a3952f012c8b74f38891ac3980bc",
    entry_hash: "318cb92931ea789dcba2891901a8df9038ba1c890123f890dbca901283901def",
    payload: { median_time_s: 0.428, cv: 0.041, tau_noise: 0.05, sql_queries: 5001 },
    verified: true,
  },
  {
    index: 2,
    type: "HYPOTHESIS",
    timestamp: "2026-10-15T18:02:05Z",
    actor: "model/nemotron-3-super-120b",
    prev_hash: "318cb92931ea789dcba2891901a8df9038ba1c890123f890dbca901283901def",
    entry_hash: "45a89df0123bc890192389102389019238901238901238901238901238901234",
    payload: { supported_hypothesis: "H1", claim: "N+1 query explosion via iterative customer load", score: 0.96 },
    verified: true,
  },
  {
    index: 3,
    type: "PATCH",
    timestamp: "2026-10-15T18:03:40Z",
    actor: "model/nemotron-3.5-lightning",
    prev_hash: "45a89df0123bc890192389102389019238901238901238901238901238901234",
    entry_hash: "c890123890123890123890123890123890123890123890123890123890123890",
    payload: { diff_artifact: "art_39a018bc92ef", rationale: "Use selectinload for customer relationship" },
    verified: true,
  },
  {
    index: 4,
    type: "GATE_RESULT",
    timestamp: "2026-10-15T18:04:15Z",
    actor: "gauntlet/zero-compromise",
    prev_hash: "c890123890123890123890123890123890123890123890123890123890123890",
    entry_hash: "d901238901238901238901238901238901238901238901238901238901238901",
    payload: { G0: "PASS", G1: "PASS", G2: "PASS", G3: "PASS", G4: "PASS", G5: "PASS", G6: "PASS", G7: "PASS" },
    verified: true,
  },
  {
    index: 5,
    type: "VERDICT",
    timestamp: "2026-10-15T18:04:20Z",
    actor: "controller/verdict",
    prev_hash: "d901238901238901238901238901238901238901238901238901238901238901",
    entry_hash: "ea01238901238901238901238901238901238901238901238901238901238902",
    payload: { verdict: "ACCEPT", delta_perf: 0.742, tau_noise: 0.05, security_regress: false },
    verified: true,
  },
];
