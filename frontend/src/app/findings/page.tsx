"use client";

import React, { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MOCK_FINDINGS } from "@/lib/mockData";
import { 
  Bug, Search, Filter, ShieldAlert, ArrowRight, 
  FileCode, CheckCircle2, ChevronRight, SlidersHorizontal 
} from "lucide-react";
import { useCurtain } from "@/components/layout/CurtainTransition";

export default function FindingsPage() {
  const { navigateWithCurtain } = useCurtain();
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"severity" | "id">("severity");

  const severityOrder: Record<string, number> = {
    Critical: 0,
    High: 1,
    Medium: 2,
    Low: 3,
  };

  const filtered = MOCK_FINDINGS.filter((f) => {
    const matchesSearch = 
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.cwe.toLowerCase().includes(search.toLowerCase()) ||
      f.file.toLowerCase().includes(search.toLowerCase()) ||
      f.id.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || f.severity.toUpperCase() === severityFilter;
    return matchesSearch && matchesSeverity;
  }).sort((a, b) => {
    if (sortBy === "severity") {
      return (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99);
    }
    return a.id.localeCompare(b.id);
  });

  const criticalCount = MOCK_FINDINGS.filter((f) => f.severity === "Critical").length;
  const highCount = MOCK_FINDINGS.filter((f) => f.severity === "High").length;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[var(--line)]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-mono text-emerald-400 mb-2 font-semibold">
              <Bug className="w-3.5 h-3.5" />
              <span>SECURITY VULNERABILITY REGISTRY</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--ink)]">
              AST Vulnerability Findings Feed
            </h1>
            <p className="text-xs text-[var(--ink-body)] mt-1">
              Active taint sink detections and verified flaw inventory across monitored repositories.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateWithCurtain("/cockpit", "Remediation Cockpit")}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-mono text-xs font-bold transition-all shadow-md flex items-center gap-2"
            >
              <span>Triage in Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Severity Summary Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3.5 rounded-xl border border-[var(--line)] bg-[var(--surface)]">
            <div className="text-[11px] text-[var(--ink-muted)]">Total Active Findings</div>
            <div className="text-lg font-bold text-[var(--ink)] mt-0.5">{MOCK_FINDINGS.length}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-950/10">
            <div className="text-[11px] text-red-400">Critical Severity</div>
            <div className="text-lg font-bold text-red-400 mt-0.5">{criticalCount}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-amber-500/20 bg-amber-950/10">
            <div className="text-[11px] text-amber-400">High Severity</div>
            <div className="text-lg font-bold text-amber-400 mt-0.5">{highCount}</div>
          </div>
          <div className="p-3.5 rounded-xl border border-emerald-500/20 bg-emerald-950/10">
            <div className="text-[11px] text-emerald-400">Synthesis Available</div>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">{MOCK_FINDINGS.length}</div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-[var(--ink-muted)]" />
            <input
              type="text"
              placeholder="Search by CWE, ID, vulnerability title, or file location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--surface)] border border-[var(--line)] text-[var(--ink)] text-xs font-mono focus:border-emerald-400 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            {["ALL", "CRITICAL", "HIGH"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-3 py-2 rounded-xl text-xs font-mono transition-colors border ${
                  severityFilter === sev
                    ? "bg-emerald-500/15 border-emerald-500 text-emerald-300 font-bold"
                    : "bg-[var(--surface)] border-[var(--line)] text-[var(--ink-muted)] hover:text-[var(--ink)]"
                }`}
              >
                {sev}
              </button>
            ))}
            <button
              onClick={() => setSortBy(sortBy === "severity" ? "id" : "severity")}
              className="px-3 py-2 rounded-xl text-xs font-mono border border-[var(--line)] bg-[var(--surface)] text-[var(--ink-muted)] hover:text-[var(--ink)] flex items-center gap-1.5"
              title="Toggle sorting order"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Sort: {sortBy.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* Table of Findings */}
        <div className="rounded-2xl border border-[var(--line)] bg-[var(--surface)] overflow-hidden shadow-xl">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-xs font-mono text-[var(--ink-muted)]">
              No defect sinks match your search query or active filter.
            </div>
          ) : (
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-[var(--card-bg)] text-[var(--ink-muted)] uppercase text-[10px] border-b border-[var(--line)]">
                <tr>
                  <th className="py-3.5 px-4">Finding ID / CWE</th>
                  <th className="py-3.5 px-4">Vulnerability Title</th>
                  <th className="py-3.5 px-4">File Location</th>
                  <th className="py-3.5 px-4">Severity</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)] text-[var(--ink-body)]">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[var(--card-bg)]/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-emerald-400">
                      <div>{item.id}</div>
                      <div className="text-[10px] text-[var(--ink-muted)] font-normal">{item.cwe}</div>
                    </td>
                    <td className="py-4 px-4 text-[var(--ink)] font-medium max-w-xs truncate">
                      {item.title}
                    </td>
                    <td className="py-4 px-4 text-[var(--ink-muted)]">
                      <div className="flex items-center gap-1.5 truncate">
                        <FileCode className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{item.file}:{item.line}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                          item.severity === "Critical"
                            ? "bg-red-500/20 text-red-400 border border-red-500/40"
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        }`}
                      >
                        {item.severity}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => navigateWithCurtain("/cockpit", "Remediation Cockpit")}
                        className="px-3 py-1.5 rounded-lg bg-[var(--bg)] hover:bg-[var(--line)] border border-[var(--line)] hover:border-emerald-500 text-emerald-300 transition-colors inline-flex items-center gap-1 text-[11px]"
                      >
                        <span>Triage Invariant</span>
                        <ChevronRight className="w-3 h-3 text-emerald-400" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
