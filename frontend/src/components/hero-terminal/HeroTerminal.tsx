"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, ShieldCheck, Bug, Play, CheckCircle2, 
  AlertTriangle, Cpu, Copy, Check, ArrowRight, ShieldAlert
} from "lucide-react";

interface VulnerabilityScenario {
  id: string;
  title: string;
  cwe: string;
  vulnerableCode: string;
  naivePatch: string;
  hardenedPatch: string;
  astChecks: string[];
  exploitResult: string;
}

const SCENARIOS: VulnerabilityScenario[] = [
  {
    id: "idor",
    title: "Cross-Tenant Cache Key Exposure (P03 IDOR)",
    cwe: "CWE-639",
    vulnerableCode: `# VULNERABLE: Direct lookup without tenant-partitioned cache key
@router.get("/invoices/{invoice_id}")
def get_invoice(invoice_id: str, db: Session = Depends(get_db)):
    # Flaw: Global unkeyed invoice cache permits Bob to read Alice's data
    cache_key = f"invoice:{invoice_id}"
    cached = redis.get(cache_key)
    if cached:
        return json.loads(cached)
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    redis.setex(cache_key, 300, json.dumps(inv.to_dict()))
    return inv.to_dict()`,
    naivePatch: `# NAIVE LLM FIX: Adds in-memory LRU cache for 1000x speedup
# DAST PROBE RESULT: VETOED - Bob still accessed Alice's invoice #42
@lru_cache(maxsize=10000)
def get_invoice_cached(invoice_id: str):
    # LLM hallucinated performance win but created severe cross-tenant IDOR
    return db.query(Invoice).filter(Invoice.id == invoice_id).first()`,
    hardenedPatch: `# HARDENED SENTINEL AST: Multi-tenant partitioned cache + principal bound
@router.get("/invoices/{invoice_id}")
def get_invoice(
    invoice_id: str,
    principal: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Deterministic Gate: Cache strictly keyed by tenant_id + principal
    cache_key = f"inv:{principal.tenant_id}:{principal.id}:{invoice_id}"
    inv = db.query(Invoice).filter(
        Invoice.id == invoice_id,
        Invoice.tenant_id == principal.tenant_id
    ).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found")
    return inv`,
    astChecks: [
      "Tenant boundary enforced: principal.tenant_id predicate bound",
      "DAST Probe P03: Cross-tenant IDOR exploit neutralized",
      "Security Gate G4: PASS | Performance Gate G7: PASS"
    ],
    exploitResult: "Exploit Probe P03 neutralized. Cross-tenant leakage blocked.",
  },
  {
    id: "sqli",
    title: "SQL Injection via Unsanitized f-string",
    cwe: "CWE-89",
    vulnerableCode: `def get_user_profile(user_id: str, db: Session):
    # CRITICAL: Raw f-string interpolation into SQL statement
    query = f"SELECT * FROM users WHERE id = '{user_id}' AND is_active = 1"
    return db.execute(query).fetchone()`,
    naivePatch: `def get_user_profile(user_id: str, db: Session):
    # NAIVE LLM FIX: Escapes single quotes only (Bypassed via hex/unicode)
    clean_id = user_id.replace("'", "''")
    query = f"SELECT * FROM users WHERE id = '{clean_id}' AND is_active = 1"
    return db.execute(query).fetchone()`,
    hardenedPatch: `def get_user_profile(user_id: str, db: Session):
    # HARDENED SENTINEL AST: Parameterized Statement AST Bound
    stmt = select(User).where(
        User.id == bindparam("uid", type_=String),
        User.is_active == True
    )
    return db.scalars(stmt, {"uid": user_id}).first()`,
    astChecks: [
      "AST invariant confirmed: No Call(raw_sql) node permitted",
      "Type safety check passed: UUID / String bounded",
      "DAST probe simulation passed: SQLi probe neutralized"
    ],
    exploitResult: "SQLi Probe D01 neutralized. Parameterized AST bound.",
  },
  {
    id: "cmdi",
    title: "Remote Code Execution via OS Command",
    cwe: "CWE-78",
    vulnerableCode: `def export_report(filename: str):
    # CRITICAL: shell=True with unvalidated user input
    os.system(f"tar -czf /tmp/{filename}.tar.gz /data/reports")`,
    naivePatch: `def export_report(filename: str):
    # NAIVE LLM FIX: Basic blacklist check (Bypassed via newline or pipe)
    if ";" in filename:
        raise ValueError("Invalid chars")
    os.system(f"tar -czf /tmp/{filename}.tar.gz /data/reports")`,
    hardenedPatch: `def export_report(filename: str):
    # HARDENED SENTINEL AST: Isolated argv array without shell interpreter
    safe_name = Path(filename).name
    subprocess.run(
        ["tar", "-czf", f"/tmp/{safe_name}.tar.gz", "/data/reports"],
        check=True,
        shell=False
    )`,
    astChecks: [
      "AST invariant confirmed: shell=False enforced in AST",
      "Path traversal blocked: Path.name sanitization active",
      "gVisor MicroVM Sandbox: Execution strictly isolated"
    ],
    exploitResult: "Subprocess injection neutralized. Shell=False invariant enforced.",
  },
];

export const HeroTerminal: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<VulnerabilityScenario>(SCENARIOS[0]);
  const [activeTab, setActiveTab] = useState<"hardened" | "naive" | "vulnerable">("hardened");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationPassed, setVerificationPassed] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleRunVerify = () => {
    setIsVerifying(true);
    setVerificationPassed(false);
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationPassed(true);
    }, 900);
  };

  const handleCopy = () => {
    const textToCopy = activeTab === "hardened" 
      ? selectedScenario.hardenedPatch 
      : activeTab === "naive" 
      ? selectedScenario.naivePatch 
      : selectedScenario.vulnerableCode;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            <span>INTERACTIVE PRODUCT PREVIEW • REAL DEFECT SCENARIOS</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[var(--ink)]">
            Deterministic AST Patches vs. Hallucinated AI Code
          </h2>
          <p className="text-sm text-[var(--ink-body)] mt-1 max-w-2xl">
            Generative models propose speedups or naive fixes. Sentinel Gate deterministically inspects compiler AST invariants and executes adversarial DAST probes before code can ship.
          </p>
        </div>

        {/* Scenario Selector Pills */}
        <div className="flex flex-wrap gap-2">
          {SCENARIOS.map((sc) => (
            <button
              key={sc.id}
              onClick={() => {
                setSelectedScenario(sc);
                setVerificationPassed(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all duration-150 border ${
                selectedScenario.id === sc.id
                  ? "bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] font-bold"
                  : "bg-[var(--surface)] border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)] hover:border-[var(--line-strong)]"
              }`}
            >
              <span className="text-emerald-400 font-bold mr-1.5">{sc.cwe}</span>
              <span>{sc.id.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Shell */}
      <div className="relative rounded-2xl border border-[var(--line)] bg-[var(--surface)] backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Terminal Titlebar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-[var(--bg)] border-b border-[var(--line)] gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink-muted)] pl-2 border-l border-[var(--line)]">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span>sentinel-gate://ast-inspector/{selectedScenario.id}.py</span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-[var(--card-bg)] p-1 rounded-xl border border-[var(--line)]">
            <button
              onClick={() => setActiveTab("hardened")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "hardened"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified AST Patch</span>
            </button>
            <button
              onClick={() => setActiveTab("naive")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "naive"
                  ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold shadow-sm"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Naive AI Speedup (Vetoed)</span>
            </button>
            <button
              onClick={() => setActiveTab("vulnerable")}
              className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all flex items-center gap-1.5 ${
                activeTab === "vulnerable"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40 font-bold shadow-sm"
                  : "text-[var(--ink-muted)] hover:text-[var(--ink)]"
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-red-400" />
              <span>Vulnerable Code</span>
            </button>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="relative p-6 font-mono text-xs md:text-sm overflow-x-auto min-h-[240px] bg-[var(--bg)]/70">
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--card-bg)] border border-[var(--line)] text-[var(--ink-muted)] hover:text-white transition-all z-10"
            title="Copy code"
            aria-label="Copy code snippet"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <AnimatePresence mode="wait">
            <motion.pre
              key={`${selectedScenario.id}-${activeTab}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="text-[var(--ink)] leading-relaxed font-mono"
            >
              <code>
                {activeTab === "hardened" && (
                  <span className="text-emerald-300">{selectedScenario.hardenedPatch}</span>
                )}
                {activeTab === "naive" && (
                  <span className="text-amber-300">{selectedScenario.naivePatch}</span>
                )}
                {activeTab === "vulnerable" && (
                  <span className="text-red-300/90">{selectedScenario.vulnerableCode}</span>
                )}
              </code>
            </motion.pre>
          </AnimatePresence>
        </div>

        {/* Verification & Telemetry Bar */}
        <div className="px-6 py-4 bg-[var(--card-bg)]/80 border-t border-[var(--line)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[var(--ink-muted)] flex items-center gap-2">
              <span>Deterministic Verification Invariants</span>
              <span className="text-emerald-400 font-bold">• Zero-Compromise Security Veto</span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {selectedScenario.astChecks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs font-mono text-[var(--ink-body)]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleRunVerify}
              disabled={isVerifying}
              className={`w-full md:w-auto px-5 py-2.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                isVerifying
                  ? "bg-emerald-500/30 text-emerald-300 cursor-wait"
                  : verificationPassed
                  ? "bg-emerald-500/20 border border-emerald-500 text-emerald-300"
                  : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.35)]"
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Synthesizing AST Invariants...</span>
                </>
              ) : verificationPassed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Verified: Exploit Neutralized</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Deterministic Verification</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroTerminal;
