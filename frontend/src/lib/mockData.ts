export interface GateInfo {
  id: string;
  name: string;
  description: string;
  status: "pass" | "fail" | "warn";
  timing: string;
  invariant: string;
}

export const MOCK_SENTINEL_GATES: GateInfo[] = [
  { id: "G0", name: "AST Parser Guard", description: "Enforces lockfile boundaries, abstract syntax tree parse tree integrity & strict type constraints", status: "pass", timing: "0.12s", invariant: "No illegal external imports or AST node corruptions" },
  { id: "G1", name: "Regression Suite", description: "28 unit & integration tests re-executed in isolated microVM sandbox", status: "pass", timing: "1.42s", invariant: "Zero semantic drift across existing test assertions" },
  { id: "G2", name: "Exploit Oracle", description: "Live IDOR, ReDoS & SQL injection attack payload probes (12 vectors)", status: "pass", timing: "2.10s", invariant: "Replayed exploit payloads strictly fail or get rejected" },
  { id: "G3", name: "Identity Tenancy Guard", description: "Multi-tenant user identity equality predicates strictly preserved", status: "pass", timing: "0.45s", invariant: "Tenant boundary parameters survive refactoring" },
  { id: "G4", name: "Concurrency Invariant", description: "Lost updates, deadlocks & race contention checks under stress", status: "pass", timing: "1.15s", invariant: "No race conditions under parallel executor stress" },
  { id: "G5", name: "Performance Delta", description: "p95 latency reduction measured above 5% noise floor", status: "pass", timing: "4.20s", invariant: "Candidate p95 faster than pinned golden baseline" },
  { id: "G6", name: "Memory Hygiene", description: "tracemalloc heap growth capped strictly under 20MB threshold", status: "pass", timing: "0.85s", invariant: "No unbounded memory leaks or cyclic references" },
  { id: "G7", name: "Deterministic Sign-off", description: "Zero hardcoded secrets, eval calls or supply chain flaws", status: "pass", timing: "0.30s", invariant: "Secrets and unsafe dynamic calls rejected" },
];

export const MOCK_GATES = MOCK_SENTINEL_GATES;

export interface MerkleBlock {
  block: number;
  blockNumber?: number;
  action: string;
  type?: string;
  timestamp: string;
  hash: string;
  parentHash: string;
  prevHash?: string;
  author: string;
  verified: boolean;
}

export const MOCK_MERKLE_CHAIN: MerkleBlock[] = [
  {
    block: 0,
    blockNumber: 0,
    action: "Genesis Anchor · Sentinel Gate Core Initialization",
    type: "GENESIS",
    timestamp: "2026-10-20 10:00:00",
    hash: "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    parentHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    prevHash: "0x0000000000000000000000000000000000000000000000000000000000000000",
    author: "system:genesis",
    verified: true,
  },
  {
    block: 1,
    blockNumber: 1,
    action: "Golden Baseline Pinned: p95 428ms (5,001 SQL queries)",
    type: "BASELINE",
    timestamp: "2026-10-20 10:00:15",
    hash: "0xa4f89d34b12c8e90a56d23f4b89e012c45f67a89b012c34d56e78f90a12b34c5",
    parentHash: "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    prevHash: "0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    author: "agent:telemetry_pin",
    verified: true,
  },
  {
    block: 2,
    blockNumber: 2,
    action: "Hypothesis Confirmed: N+1 eager joinedload optimization in query tree",
    type: "HYPOTHESIS",
    timestamp: "2026-10-20 10:00:32",
    hash: "0xc5d6e7f8a9b012c34d56e78f90a12b34c5d6e7f8a9b012c34d56e78f90a12b34",
    parentHash: "0xa4f89d34b12c8e90a56d23f4b89e012c45f67a89b012c34d56e78f90a12b34c5",
    prevHash: "0xa4f89d34b12c8e90a56d23f4b89e012c45f67a89b012c34d56e78f90a12b34c5",
    author: "agent:hypothesis_ranker",
    verified: true,
  },
  {
    block: 3,
    blockNumber: 3,
    action: "NVIDIA Nemotron 70B AST patch synthesized (+joinedload, tenant_id preserved)",
    type: "CANDIDATE_PATCH",
    timestamp: "2026-10-20 10:00:48",
    hash: "0x7f3a09e8c142890dbaf423a8e9e19d6512f45b789a012c34d56e78f90a12b34c",
    parentHash: "0xc5d6e7f8a9b012c34d56e78f90a12b34c5d6e7f8a9b012c34d56e78f90a12b34",
    prevHash: "0xc5d6e7f8a9b012c34d56e78f90a12b34c5d6e7f8a9b012c34d56e78f90a12b34",
    author: "nemotron:ast_synthesizer",
    verified: true,
  },
  {
    block: 4,
    blockNumber: 4,
    action: "8/8 Sentinel Verification Passed · Exploit Oracle tested 12 vectors (0 leaks)",
    type: "SENTINEL_EVALUATION",
    timestamp: "2026-10-20 10:01:05",
    hash: "0x9b012c34d56e78f90a12b34c5d6e7f8a9b012c34d56e78f90a12b34c5d6e7f8a",
    parentHash: "0x7f3a09e8c142890dbaf423a8e9e19d6512f45b789a012c34d56e78f90a12b34c",
    prevHash: "0x7f3a09e8c142890dbaf423a8e9e19d6512f45b789a012c34d56e78f90a12b34c",
    author: "sentinel:gate_evaluator",
    verified: true,
  },
  {
    block: 5,
    blockNumber: 5,
    action: "Canonical Verdict: ACCEPTED · Automated Pull Request #482 Sealed & Committed",
    type: "DECISION_SEALED",
    timestamp: "2026-10-20 10:01:22",
    hash: "0xb3e94a81c0451e04cf8d743a1290bb3457102e3a1294801e0fa389dc129034aa",
    parentHash: "0x9b012c34d56e78f90a12b34c5d6e7f8a9b012c34d56e78f90a12b34c5d6e7f8a",
    prevHash: "0x9b012c34d56e78f90a12b34c5d6e7f8a9b012c34d56e78f90a12b34c5d6e7f8a",
    author: "ledger:merkle_notary",
    verified: true,
  },
];

export const MOCK_LEDGER_CHAIN = MOCK_MERKLE_CHAIN;

export interface FindingItem {
  id: string;
  cwe: string;
  title: string;
  severity: "Critical" | "High" | "Medium" | "Low";
  file: string;
  line: number;
  description: string;
  vulnerableCode: string;
  suggestedFix: string;
}

export const MOCK_FINDINGS: FindingItem[] = [
  {
    id: "SEC-900",
    cwe: "CWE-639",
    title: "Insecure Direct Object Reference (IDOR) in Cache Key",
    severity: "Critical",
    file: "backend/invoices.py",
    line: 34,
    description: "Invoice cache key lacked tenant/principal partitioning (cache_key = f'inv:{invoice_id}'), allowing cross-tenant data exfiltration during speedup optimization.",
    vulnerableCode: `@router.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: str, db: Session = Depends(get_db)):
    # Flaw: Global unkeyed cache permits Bob to read Alice's invoice #42
    cache_key = f"inv:{invoice_id}"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    redis.setex(cache_key, 300, json.dumps(inv.to_dict()))
    return inv.to_dict()`,
    suggestedFix: `@router.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: str, principal: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Hardened AST: Cache strictly partitioned by tenant_id + authenticated user
    cache_key = f"inv:{principal.tenant_id}:{principal.id}:{invoice_id}"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    inv = db.query(Invoice).filter(Invoice.id == invoice_id, Invoice.tenant_id == principal.tenant_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    redis.setex(cache_key, 300, json.dumps(inv.to_dict()))
    return inv.to_dict()`,
  },
  {
    id: "SEC-901",
    cwe: "CWE-89",
    title: "SQL Injection via Unsanitized Raw String Interpolation",
    severity: "Critical",
    file: "backend/orders.py",
    line: 42,
    description: "Raw string interpolation passed directly to SQL execution engine allowing arbitrary query execution.",
    vulnerableCode: `def get_order_by_id(order_id: str, db: Session):\n    query = f"SELECT * FROM orders WHERE id = '{order_id}'"\n    return db.execute(query).fetchone()`,
    suggestedFix: `def get_order_by_id(order_id: str, db: Session):\n    stmt = select(Order).where(Order.id == bindparam("oid", type_=String))\n    return db.scalars(stmt, {"oid": order_id}).first()`,
  },
  {
    id: "SEC-902",
    cwe: "CWE-1333",
    title: "Polynomial ReDoS in User Email Verification Pattern",
    severity: "High",
    file: "backend/auth.py",
    line: 118,
    description: "Unbounded overlapping repetition groups cause exponential backtracking when matching malicious input.",
    vulnerableCode: `EMAIL_REGEX = r"^([a-zA-Z0-9_\\-\\.]+)@([a-zA-Z0-9_\\-\\.]+)+$"\ndef validate_email(email: str):\n    return bool(re.match(EMAIL_REGEX, email))`,
    suggestedFix: `from email_validator import validate_email, EmailNotValidError\ndef validate_email(email: str):\n    try:\n        return bool(validate_email(email, check_deliverability=False))\n    except EmailNotValidError:\n        return False`,
  },
  {
    id: "SEC-903",
    cwe: "CWE-918",
    title: "Server-Side Request Forgery via Webhook Dispatcher",
    severity: "High",
    file: "backend/webhooks.py",
    line: 67,
    description: "Outbound HTTP requests without IP pinning or cloud metadata protections allow AWS/GCP credential theft.",
    vulnerableCode: `def send_webhook(target_url: str, payload: dict):\n    return requests.post(target_url, json=payload, timeout=5)`,
    suggestedFix: `def send_webhook(target_url: str, payload: dict):\n    pinned_ip = resolve_public_ip_pinned(target_url)\n    return secure_http_client.post(target_url, ip_pin=pinned_ip, json=payload, timeout=3.0)`,
  },
  {
    id: "SEC-904",
    cwe: "CWE-78",
    title: "OS Command Injection via File Compression Utility",
    severity: "Critical",
    file: "backend/backup.py",
    line: 88,
    description: "shell=True invocation with unescaped user-supplied file names allows remote code execution.",
    vulnerableCode: `def compress_folder(folder_name: str):\n    os.system(f"zip -r /tmp/{folder_name}.zip /data/{folder_name}")`,
    suggestedFix: `def compress_folder(folder_name: str):\n    safe_name = Path(folder_name).name\n    subprocess.run(["zip", "-r", f"/tmp/{safe_name}.zip", f"/data/{safe_name}"], check=True, shell=False)`,
  },
];
