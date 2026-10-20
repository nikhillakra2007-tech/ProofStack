"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MOCK_FINDINGS } from "@/lib/mockData";
import { 
  Bug, Search, Filter, ShieldAlert, ArrowRight, 
  FileCode, CheckCircle2, ChevronRight 
} from "lucide-react";
import { useCurtain } from "@/components/layout/CurtainTransition";

export default function FindingsPage() {
  const { navigateWithCurtain } = useCurtain();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  const filtered = MOCK_FINDINGS.filter((f) => {
    const matchesSearch = 
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.cwe.toLowerCase().includes(search.toLowerCase()) ||
      f.file.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || f.severity.toUpperCase() === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-400 mb-2">
              <Bug className="w-3.5 h-3.5" />
              TRIAGE INVENTORY
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">
              Vulnerability Findings Feed
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Active AST defect registry detected across current pull request branches.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateWithCurtain("/cockpit")}
              className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-[0_0_15px_rgba(0,240,255,0.25)] flex items-center gap-2"
            >
              <span>Open Remediation Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by CWE, title, or filename..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-white text-xs font-mono focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "CRITICAL", "HIGH", "MEDIUM"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-2 rounded-xl text-xs font-mono transition-colors border ${
                  severityFilter === sev
                    ? "bg-cyan-500/15 border-cyan-500 text-cyan-300"
                    : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Table of Findings */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 overflow-hidden shadow-xl">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[11px] border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Finding ID / CWE</th>
                <th className="py-3.5 px-4">Vulnerability Title</th>
                <th className="py-3.5 px-4">File Location</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-4 px-4 font-bold text-cyan-400">
                    <div>{item.id}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{item.cwe}</div>
                  </td>
                  <td className="py-4 px-4 text-white font-medium max-w-xs truncate">
                    {item.title}
                  </td>
                  <td className="py-4 px-4 text-slate-400">
                    <div className="flex items-center gap-1.5 truncate">
                      <FileCode className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{item.file}:{item.line}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${
                        item.severity === "Critical"
                          ? "bg-red-500/20 text-red-300 border border-red-500/40"
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                      }`}
                    >
                      {item.severity}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button
                      onClick={() => navigateWithCurtain("/cockpit")}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500 text-cyan-300 transition-colors inline-flex items-center gap-1 text-[11px]"
                    >
                      <span>Triage in Cockpit</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
