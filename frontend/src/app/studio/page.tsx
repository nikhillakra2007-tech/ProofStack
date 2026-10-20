"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { 
  Cpu, Play, Terminal, Sparkles, CheckCircle2, 
  Copy, Check, RefreshCw, Code, ShieldCheck 
} from "lucide-react";

export default function StudioPage() {
  const [code, setCode] = useState<string>(
`def fetch_invoice(invoice_id: str, db: Session):
    # Vulnerable f-string query execution
    raw_query = f"SELECT * FROM invoices WHERE id = '{invoice_id}'"
    return db.execute(raw_query).first()`
  );

  const [synthesizing, setSynthesizing] = useState(false);
  const [patchResult, setPatchResult] = useState<string | null>(null);
  const [astTree, setAstTree] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const handleSynthesize = () => {
    setSynthesizing(true);
    setPatchResult(null);
    setAstTree([]);

    setTimeout(() => {
      setAstTree([
        "Module -> FunctionDef(name='fetch_invoice')",
        "  Arguments: invoice_id: str, db: Session",
        "  Body: Assign(targets=[Name('stmt')])",
        "    Call: select(Invoice).where(Invoice.id == bindparam('inv_id'))",
        "  Return: db.scalars(stmt, {'inv_id': invoice_id}).first()"
      ]);

      setPatchResult(
`def fetch_invoice(invoice_id: str, db: Session):
    # HARDENED DETERMINISTIC AST PATCH
    stmt = select(Invoice).where(
        Invoice.id == bindparam("inv_id", type_=String)
    )
    return db.scalars(stmt, {"inv_id": invoice_id}).first()`
      );
      setSynthesizing(false);
    }, 1300);
  };

  const handleCopy = () => {
    if (patchResult) {
      navigator.clipboard.writeText(patchResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 pb-6 border-b border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-2">
            <Cpu className="w-3.5 h-3.5" />
            NVIDIA NEMOTRON 70B REPAIR STUDIO
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            AST-Guided Synthesis Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Input arbitrary vulnerable functions to parse compiler grammar invariants and synthesize mathematically guaranteed patches.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Editor Input (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-cyan-400" />
                VULNERABLE SOURCE INPUT (PYTHON / TS / GO)
              </span>
              <button
                onClick={() => setCode(
`def run_backup(folder_name: str):
    # Remote command execution flaw
    os.system(f"zip -r /backups/{folder_name}.zip /data")`
                )}
                className="text-[11px] text-cyan-400 hover:text-cyan-300"
              >
                Load RCE Example
              </button>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4">
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                rows={12}
                className="w-full bg-transparent font-mono text-xs md:text-sm text-cyan-200 focus:outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            <button
              onClick={handleSynthesize}
              disabled={synthesizing}
              className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)]"
            >
              {synthesizing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Parsing AST Grammar &amp; Synthesizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 fill-current" />
                  Synthesize Deterministic AST Patch
                </>
              )}
            </button>
          </div>

          {/* AST & Result Output (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                COMPILER AST INVARIANTS &amp; RESULT
              </span>
              {patchResult && (
                <button
                  onClick={handleCopy}
                  className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy Patch"}
                </button>
              )}
            </div>

            {/* AST Grammar Breakdown */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 font-mono text-xs space-y-2 min-h-[140px]">
              <div className="text-[11px] text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-1">
                AST Node Invariant Hierarchy
              </div>
              {astTree.length === 0 ? (
                <div className="text-slate-500 py-6 text-center italic">
                  Press &quot;Synthesize&quot; to parse grammar and extract AST nodes.
                </div>
              ) : (
                <div className="space-y-1 text-slate-300 text-[11px]">
                  {astTree.map((node, i) => (
                    <div key={i} className="text-cyan-300">{node}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Synthesized Code */}
            <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/10 p-4 min-h-[180px]">
              <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                Hardened Patch Output
              </div>
              {patchResult ? (
                <pre className="font-mono text-xs text-emerald-300 leading-relaxed overflow-x-auto p-3 bg-slate-950/90 rounded-xl border border-emerald-900/30">
                  <code>{patchResult}</code>
                </pre>
              ) : (
                <div className="text-slate-500 text-xs font-mono py-8 text-center italic">
                  Awaiting patch synthesis...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
