"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_CATALOG } from "@/lib/mockData";
import { CatalogProblem, ProblemTier } from "@/lib/types";
import {
  ShieldAlert,
  ShieldCheck,
  Filter,
  Code2,
  Bug,
  Sparkles,
  Search,
  ExternalLink,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Zap,
} from "lucide-react";

export default function ProblemLibraryPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeProblem, setActiveProblem] = useState<CatalogProblem>(MOCK_CATALOG[0]);
  const [activeTab, setActiveTab] = useState<"bug" | "naive" | "safe" | "proof">("bug");

  const tiers = ["All", "Tier 1", "Tier 2", "Tier 3"];
  const domains = [
    "All",
    "Performance",
    "Security",
    "Concurrency",
    "Database",
    "Resource",
    "Cloud Security",
    "Supply Chain",
    "Correctness",
    "Fintech",
    "Testing",
  ];

  const filteredProblems = MOCK_CATALOG.filter((p) => {
    const matchesTier = selectedTier === "All" || p.tier === selectedTier;
    const matchesDomain = selectedDomain === "All" || p.domain === selectedDomain;
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesDomain && matchesSearch;
  });

  const handleOpenInStudio = (probId: string) => {
    router.push(`/studio?problem=${probId}`);
  };

  return (
    <div className="flex-1 bg-ink-950 flex flex-col h-full overflow-hidden">
      {/* Subheader / Filter Bar */}
      <div className="border-b border-hairline bg-ink-900/60 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-400" />
            <span>Problem Library & Benchmark Knowledge Base</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300">
              19 Defect Classes
            </span>
          </h1>
          <p className="text-[11px] text-ink-400 font-mono">
            Ground-truth fault catalogue, empirical probe specifications, and mathematical truth ranks
          </p>
        </div>

        {/* Search & Tier Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-ink-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filter faults by title, ID, or root cause..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-ink-950 border border-hairline rounded-lg pl-8 pr-3 py-1.5 text-xs text-white placeholder-ink-500 focus:outline-none focus:border-indigo-500 w-64 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-ink-950 border border-hairline p-0.5 rounded-lg">
            {tiers.map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTier(t)}
                className={`px-2.5 py-1 text-[11px] font-mono rounded transition-colors ${
                  selectedTier === t
                    ? "bg-indigo-600 text-white font-semibold"
                    : "text-ink-400 hover:text-ink-200"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Pane Explorer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Scrollable Problem Index */}
        <div className="w-80 md:w-96 border-r border-hairline bg-ink-900/30 overflow-y-auto divide-y divide-hairline shrink-0">
          {filteredProblems.map((p) => {
            const isSelected = activeProblem.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setActiveProblem(p)}
                className={`p-4 cursor-pointer transition-all ${
                  isSelected
                    ? "bg-indigo-950/40 border-l-2 border-indigo-500"
                    : "hover:bg-ink-850/50"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400">
                      {p.id}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-ink-800 text-ink-300">
                      {p.domain}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Rank {p.truthRank}
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-white line-clamp-1 mb-1">
                  {p.title}
                </h3>
                <p className="text-[11px] text-ink-400 line-clamp-2 leading-relaxed">
                  {p.summary}
                </p>
              </div>
            );
          })}
        </div>

        {/* Right: Problem Detail & Specification */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* Header of Active Problem */}
          <div className="bg-ink-900 border border-hairline rounded-xl p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2.5">
                  <span className="px-2.5 py-1 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-xs font-bold">
                    {activeProblem.id}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-ink-800 text-ink-300">
                    {activeProblem.tier} • {activeProblem.domain}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Truth Hierarchy Rank: {activeProblem.truthRank}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white pt-1">{activeProblem.title}</h2>
                <p className="text-xs text-ink-300 font-mono">{activeProblem.summary}</p>
              </div>

              {/* Action Button: Open in Code Studio */}
              <button
                onClick={() => handleOpenInStudio(activeProblem.id)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white font-mono text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0"
              >
                <Code2 className="w-4 h-4 text-emerald-300" />
                <span>Test in Code Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Real World Impact Callout */}
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/25 rounded-lg flex items-start gap-3">
              <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div className="space-y-0.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-300 font-bold block">
                  Documented Real-World Incident
                </span>
                <p className="text-xs text-rose-200/90 leading-relaxed font-mono">
                  {activeProblem.realWorldImpact}
                </p>
              </div>
            </div>

            {/* Probe Method Spec */}
            <div className="p-3 bg-ink-950 border border-hairline rounded-lg flex items-center justify-between text-xs font-mono">
              <span className="text-ink-400">Deterministic Probe Oracle:</span>
              <span className="text-emerald-400 font-bold">{activeProblem.probeMethod}</span>
            </div>
          </div>

          {/* Snippet Inspector Tabs */}
          <div className="bg-ink-900 border border-hairline rounded-xl overflow-hidden">
            <div className="flex border-b border-hairline bg-ink-950 px-4">
              <button
                onClick={() => setActiveTab("bug")}
                className={`py-3 px-4 text-xs font-mono font-medium border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === "bug"
                    ? "border-rose-500 text-white bg-ink-900"
                    : "border-transparent text-ink-400 hover:text-ink-200"
                }`}
              >
                <Bug className="w-3.5 h-3.5 text-rose-400" />
                <span>1. Flawed Baseline Code</span>
              </button>

              <button
                onClick={() => setActiveTab("naive")}
                className={`py-3 px-4 text-xs font-mono font-medium border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === "naive"
                    ? "border-amber-500 text-white bg-ink-900"
                    : "border-transparent text-ink-400 hover:text-ink-200"
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
                <span>2. Naive AI Fix (Provably Rejected)</span>
              </button>

              <button
                onClick={() => setActiveTab("safe")}
                className={`py-3 px-4 text-xs font-mono font-medium border-b-2 flex items-center gap-2 transition-all ${
                  activeTab === "safe"
                    ? "border-emerald-500 text-white bg-ink-900"
                    : "border-transparent text-ink-400 hover:text-ink-200"
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Verified Defensive Patch (Accepted)</span>
              </button>
            </div>

            <div className="p-5">
              {activeTab === "bug" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-rose-400">Flawed Pattern (Zero-Compromise Invariant Violated)</span>
                    <span className="text-ink-500">Language: Python 3.11</span>
                  </div>
                  <pre className="p-4 bg-ink-950 border border-rose-500/30 rounded-lg text-xs font-mono text-ink-100 overflow-x-auto leading-relaxed">
                    {activeProblem.bugSnippet}
                  </pre>
                </div>
              )}

              {activeTab === "naive" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400">Naive Fix Attempt</span>
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold text-[10px]">
                      GATE VERDICT: {activeProblem.naiveVerdict}
                    </span>
                  </div>
                  <pre className="p-4 bg-ink-950 border border-amber-500/30 rounded-lg text-xs font-mono text-ink-100 overflow-x-auto leading-relaxed">
                    {activeProblem.naiveFixSnippet}
                  </pre>
                  <div className="p-3 bg-rose-950/30 border border-rose-500/30 rounded-lg text-xs font-mono text-rose-300">
                    <strong>Rejection Rationale:</strong> {activeProblem.naiveReason}
                  </div>
                </div>
              )}

              {activeTab === "safe" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-emerald-400">Verified Defensive Candidate</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                      GATE VERDICT: {activeProblem.safeVerdict}
                    </span>
                  </div>
                  <pre className="p-4 bg-ink-950 border border-emerald-500/30 rounded-lg text-xs font-mono text-ink-100 overflow-x-auto leading-relaxed">
                    {activeProblem.safeFixSnippet}
                  </pre>
                  <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs font-mono text-emerald-300">
                    <strong>Acceptance Guarantee:</strong> {activeProblem.safeReason}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
