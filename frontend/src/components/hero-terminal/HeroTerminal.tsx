"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Terminal, ShieldCheck, Bug, Play, CheckCircle2, 
  AlertTriangle, Cpu, Copy, Check, ArrowRight
} from "lucide-react";

interface VulnerabilityScenario {
  id: string;
  title: string;
  cwe: string;
  vulnerableCode: string;
  naivePatch: string;
  hardenedPatch: string;
  astChecks: string[];
}

const SCENARIOS: VulnerabilityScenario[] = [
  {
    id: "sqli",
    title: "SQL Injection via Unsanitized f-string",
    cwe: "CWE-89",
    vulnerableCode: `def get_user_profile(user_id: str, db: Session):\n    # CRITICAL: String interpolation in raw query\n    query = f"SELECT * FROM users WHERE id = '{user_id}' AND is_active = 1"\n    return db.execute(query).fetchone()`,
    naivePatch: `def get_user_profile(user_id: str, db: Session):\n    # NAIVE LLM FIX: Escapes quotes only (Bypassed via hex/unicode)\n    clean_id = user_id.replace("'", "''")\n    query = f"SELECT * FROM users WHERE id = '{clean_id}' AND is_active = 1"\n    return db.execute(query).fetchone()`,
    hardenedPatch: `def get_user_profile(user_id: str, db: Session):\n    # HARDENED SENTINEL AST: Parameterized Statement AST Bound\n    stmt = select(User).where(\n        User.id == bindparam("uid", type_=String),\n        User.is_active == True\n    )\n    return db.scalars(stmt, {"uid": user_id}).first()`,
    astChecks: [
      "AST invariant confirmed: No Call(raw_sql) node",
      "Type safety check passed: UUID / String bounded",
      "DAST probe simulation passed: 0/12 bypasses"
    ]
  },
  {
    id: "cmdi",
    title: "Remote Code Execution via OS Command",
    cwe: "CWE-78",
    vulnerableCode: `def export_report(filename: str):\n    # CRITICAL: shell=True with unvalidated user input\n    os.system(f"tar -czf /tmp/{filename}.tar.gz /data/reports")`,
    naivePatch: `def export_report(filename: str):\n    # NAIVE LLM FIX: Basic regex (Fails on newline / semicolon bypass)\n    if ";" in filename:\n        raise ValueError("Invalid chars")\n    os.system(f"tar -czf /tmp/{filename}.tar.gz /data/reports")`,
    hardenedPatch: `def export_report(filename: str):\n    # HARDENED SENTINEL AST: Isolated argv array without shell\n    safe_name = Path(filename).name\n    subprocess.run(\n        ["tar", "-czf", f"/tmp/{safe_name}.tar.gz", "/data/reports"],\n        check=True,\n        shell=False\n    )`,
    astChecks: [
      "AST invariant confirmed: shell=False enforced",
      "Path traversal blocked: Path.name sanitization active",
      "Exploit Oracle sandbox: Execution isolated"
    ]
  },
  {
    id: "ssrf",
    title: "Server-Side Request Forgery via Webhook",
    cwe: "CWE-918",
    vulnerableCode: `def trigger_webhook(target_url: str, payload: dict):\n    # CRITICAL: Direct fetch allows 169.254.169.254 metadata exfil\n    return requests.post(target_url, json=payload, timeout=5)`,
    naivePatch: `def trigger_webhook(target_url: str, payload: dict):\n    # NAIVE LLM FIX: Blacklist check (Bypassed via DNS rebinding or 0.0.0.0)\n    if "169.254" in target_url or "localhost" in target_url:\n        raise SecurityError("Blocked")\n    return requests.post(target_url, json=payload, timeout=5)`,
    hardenedPatch: `def trigger_webhook(target_url: str, payload: dict):\n    # HARDENED SENTINEL AST: Validated IP Pinning & Non-Routable Drop\n    validated_ip = resolve_public_ip_pinned(target_url)\n    return secure_http_client.post(\n        target_url, ip_pin=validated_ip, json=payload, timeout=3.0\n    )`,
    astChecks: [
      "DNS Rebinding guard: IP pinned during resolve",
      "RFC-1918 & Cloud Metadata blocks active",
      "Strict TLS 1.3 verification enforced"
    ]
  }
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
    }, 1100);
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
    <div className="w-full max-w-6xl mx-auto px-4 py-12">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D7BE82]/10 border border-[#D7BE82]/30 text-xs font-mono text-[#D7BE82] mb-2">
            <Cpu className="w-3.5 h-3.5 text-[#D7BE82]" />
            LIVE AST VALIDATION ENGINE
          </div>
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-[#FDFBF7]">
            Deterministic AST Patches vs. Hallucinated AI Code
          </h2>
          <p className="text-sm text-[#D6D1C4] mt-1 max-w-2xl">
            See how Sentinel Gate inspects abstract syntax trees to guarantee mathematically verified zero-day remediation.
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
              className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${
                selectedScenario.id === sc.id
                  ? "bg-[#D7BE82]/20 border-[#D7BE82] text-[#D7BE82] shadow-[0_0_15px_rgba(215,190,130,0.25)]"
                  : "bg-[#151B13] border-[#515A47]/40 text-[#9E9889] hover:text-[#D6D1C4] hover:border-[#515A47]"
              }`}
            >
              <span className="text-[#D7BE82] font-bold mr-1">{sc.cwe}</span>
              {sc.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Main Terminal Shell */}
      <div className="relative rounded-2xl border border-[#515A47]/40 bg-[#151B13]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
        {/* Terminal Titlebar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#0E120D]/90 border-b border-[#515A47]/40">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#7A4419]/90 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#D7BE82]/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-[#515A47] inline-block" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#9E9889] pl-2 border-l border-[#515A47]/40">
              <Terminal className="w-3.5 h-3.5 text-[#D7BE82]" />
              <span>sentinel-gate://ast-inspector/{selectedScenario.id}.py</span>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-1 bg-[#0E120D] p-1 rounded-lg border border-[#515A47]/40">
            <button
              onClick={() => setActiveTab("hardened")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "hardened"
                  ? "bg-[#D7BE82]/20 text-[#D7BE82] border border-[#D7BE82]/40 shadow-sm"
                  : "text-[#9E9889] hover:text-[#D6D1C4]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D7BE82]" />
              Hardened AST Patch
            </button>
            <button
              onClick={() => setActiveTab("naive")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "naive"
                  ? "bg-[#7A4419]/25 text-[#E9B086] border border-[#7A4419]/50 shadow-sm"
                  : "text-[#9E9889] hover:text-[#D6D1C4]"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#E9B086]" />
              Naive LLM Fix
            </button>
            <button
              onClick={() => setActiveTab("vulnerable")}
              className={`px-3 py-1 text-xs font-mono rounded-md transition-all flex items-center gap-1.5 ${
                activeTab === "vulnerable"
                  ? "bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm"
                  : "text-[#9E9889] hover:text-[#D6D1C4]"
              }`}
            >
              <Bug className="w-3.5 h-3.5 text-red-400" />
              Vulnerable Code
            </button>
          </div>
        </div>

        {/* Code Content Area */}
        <div className="relative p-6 font-mono text-xs md:text-sm overflow-x-auto min-h-[220px] bg-[#0E120D]/60">
          <button
            onClick={handleCopy}
            className="absolute top-4 right-4 p-2 rounded-lg bg-[#151B13] hover:bg-[#1E261B] border border-[#515A47]/40 text-[#D6D1C4] hover:text-white transition-all z-10"
            title="Copy code"
          >
            {copied ? <Check className="w-4 h-4 text-[#D7BE82]" /> : <Copy className="w-4 h-4" />}
          </button>

          <AnimatePresence mode="wait">
            <motion.pre
              key={`${selectedScenario.id}-${activeTab}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="text-[#D6D1C4] leading-relaxed font-mono"
            >
              <code>
                {activeTab === "hardened" && (
                  <span className="text-[#D7BE82]">{selectedScenario.hardenedPatch}</span>
                )}
                {activeTab === "naive" && (
                  <span className="text-[#E9B086]">{selectedScenario.naivePatch}</span>
                )}
                {activeTab === "vulnerable" && (
                  <span className="text-red-300/90">{selectedScenario.vulnerableCode}</span>
                )}
              </code>
            </motion.pre>
          </AnimatePresence>
        </div>

        {/* Verification & Telemetry Bar */}
        <div className="px-6 py-4 bg-[#151B13]/80 border-t border-[#515A47]/40 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1 space-y-1.5">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#9E9889]">
              Sentinel Gate Real-time Verification
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {selectedScenario.astChecks.map((check, idx) => (
                <div key={idx} className="flex items-center gap-1.5 text-xs font-mono text-[#D6D1C4]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#D7BE82] shrink-0" />
                  <span>{check}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleRunVerify}
              disabled={isVerifying}
              className={`w-full md:w-auto px-5 py-2.5 rounded-lg font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 ${
                isVerifying
                  ? "bg-[#D7BE82]/30 text-[#D7BE82] cursor-wait"
                  : verificationPassed
                  ? "bg-[#D7BE82]/20 border border-[#D7BE82] text-[#D7BE82]"
                  : "bg-[#D7BE82] hover:bg-[#EAD6B0] text-[#0E120D] shadow-[0_0_20px_rgba(215,190,130,0.35)]"
              }`}
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#0E120D] border-t-transparent rounded-full animate-spin" />
                  Synthesizing AST Invariants...
                </>
              ) : verificationPassed ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-[#D7BE82]" />
                  Verified (0 Bypass Vectors)
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Execute Sentinel Invariant Test
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
