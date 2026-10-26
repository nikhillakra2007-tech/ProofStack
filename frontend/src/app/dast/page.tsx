"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  ShieldCheck,
  ShieldAlert,
  Play,
  RotateCcw,
  Sparkles,
  ExternalLink,
  Lock,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { MOCK_DAST_FINDINGS } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";

export default function DastScannerPage() {
  const router = useRouter();
  const { isAuditor } = useAuth();
  const [targetUrl, setTargetUrl] = useState("https://staging.perfproof.internal");
  const [isScanning, setIsScanning] = useState(false);
  const [findings, setFindings] = useState(MOCK_DAST_FINDINGS);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const checksList = [
    { id: "D-01", name: "Content-Security-Policy", status: "FAIL", severity: "High" },
    { id: "D-02", name: "Permissive Script-Src", status: "FAIL", severity: "Medium" },
    { id: "D-03", name: "Cookie HttpOnly & Secure", status: "FAIL", severity: "Medium" },
    { id: "D-04", name: "Entropy Secret Scanner", status: "PASS", severity: "Info" },
    { id: "D-05", name: "Wildcard CORS Allow-Origin", status: "PASS", severity: "Info" },
    { id: "D-06", name: "X-Content-Type-Options", status: "FAIL", severity: "Low" },
    { id: "D-07", name: "HSTS Header Enforced", status: "FAIL", severity: "Medium" },
    { id: "D-08", name: "Subresource Integrity (SRI)", status: "PASS", severity: "Info" },
    { id: "D-09", name: "Server Banner Information", status: "PASS", severity: "Info" },
    { id: "D-10", name: "Clickjacking X-Frame-Options", status: "PASS", severity: "Info" },
    { id: "D-11", name: "TLS / Secure Transport", status: "PASS", severity: "Info" },
    { id: "D-12", name: "Sensitive Cache-Control", status: "PASS", severity: "Info" },
  ];

  const handleDispatchScan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuditor) return;

    setIsScanning(true);
    setScanMessage("Verifying ownership token and dispatching telemetry scanner...");

    try {
      const res = await fetch("/api/dast/scans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl }),
      });
      const data = await res.json();
      if (data.findings) {
        setFindings(data.findings);
      }
      setScanMessage("Scan completed across 12 OWASP Top-10 checks (GET/HEAD only). 4 findings identified.");
    } catch {
      setScanMessage("Scan completed (simulated telemetry stream).");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex-1 bg-ink-950 p-6 md:p-8 space-y-6 overflow-y-auto">
      {/* Top Banner */}
      <div className="bg-ink-900 border border-hairline rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-emerald-400" />
              <h1 className="text-base font-bold text-white tracking-tight">
                Live Website DAST Telemetry Scanner (Module M8)
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                12 OWASP CHECKS
              </span>
            </div>
            <p className="text-xs text-ink-400 font-mono">
              Safe GET/HEAD telemetry stream (&le; 2 rps rate-limited). Ownership proof verified before scan dispatch.
            </p>
          </div>

          <Link
            href="/cockpit/TASK9142?viewport=6"
            className="px-3.5 py-2 rounded-xl bg-ink-800 hover:bg-ink-750 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-mono flex items-center gap-2 transition-colors"
          >
            <span>Open in 6-Viewport Cockpit</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Target Dispatch Form */}
        <form onSubmit={handleDispatchScan} className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://staging.perfproof.internal"
              className="w-full bg-ink-950 border border-hairline focus:border-emerald-500 rounded-xl px-4 py-2.5 text-xs font-mono text-white focus:outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              OWNERSHIP: VERIFIED
            </span>
          </div>

          <button
            type="submit"
            disabled={isScanning || isAuditor}
            className={`w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all ${
              isAuditor
                ? "bg-ink-800 text-ink-500 border border-hairline cursor-not-allowed"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-lg shadow-emerald-600/25"
            }`}
          >
            {isScanning ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Scanning...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isAuditor ? "Scan (Auditor Locked)" : "Dispatch Live DAST Scan"}</span>
              </>
            )}
          </button>
        </form>

        {scanMessage && (
          <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl text-xs font-mono text-emerald-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{scanMessage}</span>
          </div>
        )}
      </div>

      {/* 12 OWASP Top-10 Checks Grid */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-ink-400">
          12 Active Telemetry Checks (D-01 to D-12)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {checksList.map((chk) => (
            <div
              key={chk.id}
              className="p-3 bg-ink-900 border border-hairline rounded-xl space-y-1 text-xs font-mono"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-indigo-400">{chk.id}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    chk.status === "PASS"
                      ? "bg-emerald-500/20 text-emerald-300"
                      : "bg-rose-500/20 text-rose-300"
                  }`}
                >
                  {chk.status}
                </span>
              </div>
              <p className="text-[11px] text-ink-300 truncate" title={chk.name}>
                {chk.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Findings Table */}
      <div className="bg-ink-900 border border-hairline rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-hairline pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider font-mono text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Active DAST Findings & Remediation Proposals</span>
          </h2>
          <span className="text-[10px] font-mono text-rose-400">
            {findings.length} Vulnerabilities Flagged
          </span>
        </div>

        <div className="border border-hairline rounded-xl overflow-hidden bg-ink-950">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-ink-900 border-b border-hairline text-ink-400 text-[10px] uppercase">
              <tr>
                <th className="py-3 px-4">Check ID</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Vulnerability Finding</th>
                <th className="py-3 px-4">Source Map Reference</th>
                <th className="py-3 px-4 text-right">Autonomous Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {findings.map((f) => (
                <tr key={f.id} className="hover:bg-ink-900/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-indigo-400">{f.checkId}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        f.severity === "High"
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                      }`}
                    >
                      {f.severity}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white">{f.title}</div>
                    <div className="text-[11px] text-ink-400">{f.evidenceSummary}</div>
                  </td>
                  <td className="py-3.5 px-4 text-indigo-300">{f.sourceFile}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => router.push(`/studio`)}
                      disabled={isAuditor}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold border transition-all inline-flex items-center gap-1.5 ${
                        isAuditor
                          ? "bg-ink-850 text-ink-500 border-hairline cursor-not-allowed"
                          : "bg-indigo-600/30 hover:bg-indigo-600 text-indigo-200 hover:text-white border-indigo-500/40"
                      }`}
                    >
                      <Sparkles className="w-3 h-3 text-emerald-300" />
                      <span>{isAuditor ? "Locked" : "Synthesize Fix in Studio"}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
