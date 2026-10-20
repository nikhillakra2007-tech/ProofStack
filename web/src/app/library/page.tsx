"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_CATALOG } from "@/lib/mockData";
import { CatalogProblem } from "@/lib/types";
import MainLayout from "@/components/layout/MainLayout";

const ALL = "All";

const TIERS = [ALL, "Tier 1", "Tier 2", "Tier 3"];

type LibraryTab = "bug" | "naive" | "safe" | "proof";

export default function ProblemLibraryPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string>(ALL);
  const [selectedDomain, setSelectedDomain] = useState<string>(ALL);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeProblem, setActiveProblem] = useState<CatalogProblem>(MOCK_CATALOG[0]);
  const [activeTab, setActiveTab] = useState<LibraryTab>("bug");
  const [hoveredDomain, setHoveredDomain] = useState<string | null>(null);

  /* Distinct domains are derived from the catalogue itself — never hardcoded. */
  const domainCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of MOCK_CATALOG) {
      counts.set(p.domain, (counts.get(p.domain) ?? 0) + 1);
    }
    return counts;
  }, []);

  const domains = useMemo(() => Array.from(domainCounts.keys()), [domainCounts]);

  const filteredProblems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MOCK_CATALOG.filter((p) => {
      const matchesTier = selectedTier === ALL || p.tier === selectedTier;
      const matchesDomain = selectedDomain === ALL || p.domain === selectedDomain;
      const matchesSearch =
        q === "" ||
        p.title.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q);
      return matchesTier && matchesDomain && matchesSearch;
    });
  }, [selectedTier, selectedDomain, searchQuery]);

  /* Keep the detail pane in sync with the filtered index (no stale content). */
  useEffect(() => {
    if (filteredProblems.length === 0) return;
    if (!filteredProblems.some((p) => p.id === activeProblem.id)) {
      setActiveProblem(filteredProblems[0]);
    }
  }, [filteredProblems, activeProblem.id]);

  const hasActiveFilters =
    selectedTier !== ALL || selectedDomain !== ALL || searchQuery.trim() !== "";

  const clearFilters = () => {
    setSelectedTier(ALL);
    setSelectedDomain(ALL);
    setSearchQuery("");
  };

  const handleOpenInStudio = (probId: string) => {
    router.push(`/studio?problem=${probId}`);
  };

  const hasResults = filteredProblems.length > 0;

  return (
    <MainLayout>
      <div>
        {/* Page Header */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">Reference</div>
          <h1 className="h1" style={{ marginTop: "6px" }}>
            Problem Library &amp; Benchmark Knowledge Base
          </h1>
          <p>
            Ground-truth fault catalogue, empirical probe specifications, and mathematical truth
            ranks
          </p>
        </div>
        <div className="r">
          <span className="chip brand">{MOCK_CATALOG.length} Defect Classes</span>
        </div>
      </div>

      {/* Filter Bar: tier segment + search + real domain filter */}
      <div
        className="card"
        style={{
          padding: "12px 14px",
          marginBottom: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
        }}
      >
        <div className="row" style={{ gap: "10px", flexWrap: "wrap" }}>
          <div className="seg" style={{ cursor: "pointer" }}>
            {TIERS.map((t) => (
              <span
                key={t}
                className={selectedTier === t ? "on" : ""}
                onClick={() => setSelectedTier(t)}
              >
                {t}
              </span>
            ))}
          </div>

          <div className="search" style={{ margin: 0, width: "280px" }}>
            <svg className="i" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by title, ID, or root cause"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                fontSize: "12.5px",
                color: "var(--ink)",
                fontFamily: "var(--f-ui)",
              }}
            />
          </div>

          {hasActiveFilters && (
            <button type="button" className="btn sec sm" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </div>

        {/* Domain filter — real, clickable, derived from the catalogue */}
        <div className="row" style={{ gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <span className="eyebrow" style={{ marginRight: "4px" }}>
            Domain
          </span>
          <button
            type="button"
            onClick={() => setSelectedDomain(ALL)}
            onMouseEnter={() => setHoveredDomain(ALL)}
            onMouseLeave={() => setHoveredDomain(null)}
            aria-pressed={selectedDomain === ALL}
            className="chip"
            style={{
              cursor: "pointer",
              transition: "border-color .18s ease, color .18s ease, background .18s ease",
              ...(selectedDomain === ALL
                ? {
                    color: "var(--brand)",
                    background: "color-mix(in srgb, var(--brand) 12%, var(--surface))",
                    borderColor: "color-mix(in srgb, var(--brand) 40%, var(--line))",
                  }
                : hoveredDomain === ALL
                  ? { color: "var(--ink)", borderColor: "var(--ink3)" }
                  : {}),
            }}
          >
            {ALL}
            <span style={{ color: "var(--ink3)" }}>{MOCK_CATALOG.length}</span>
          </button>
          {domains.map((d) => {
            const active = selectedDomain === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDomain(d)}
                onMouseEnter={() => setHoveredDomain(d)}
                onMouseLeave={() => setHoveredDomain(null)}
                aria-pressed={active}
                className="chip"
                style={{
                  cursor: "pointer",
                  transition: "border-color .18s ease, color .18s ease, background .18s ease",
                  ...(active
                    ? {
                        color: "var(--brand)",
                        background: "color-mix(in srgb, var(--brand) 12%, var(--surface))",
                        borderColor: "color-mix(in srgb, var(--brand) 40%, var(--line))",
                      }
                    : hoveredDomain === d
                      ? { color: "var(--ink)", borderColor: "var(--ink3)" }
                      : {}),
                }}
              >
                {d}
                <span style={{ color: "var(--ink3)" }}>{domainCounts.get(d) ?? 0}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-Pane Explorer: index + detail */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: "minmax(0, 330px) minmax(0, 1fr)",
          gap: "14px",
          alignItems: "start",
          paddingBottom: "24px",
        }}
      >
        {/* Left: Problem Index */}
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div
            className="row"
            style={{
              padding: "11px 14px",
              borderBottom: "1px solid var(--line)",
              justifyContent: "space-between",
            }}
          >
            <span className="eyebrow">Problem Index</span>
            <span className="chip">
              Showing {filteredProblems.length} of {MOCK_CATALOG.length}
            </span>
          </div>

          {hasResults ? (
            <div style={{ maxHeight: "calc(100vh - 340px)", overflowY: "auto" }}>
              {filteredProblems.map((p) => {
                const isSelected = activeProblem.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveProblem(p)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 14px",
                      borderBottom: "1px solid var(--line)",
                      borderLeft: `3px solid ${isSelected ? "var(--brand)" : "transparent"}`,
                      background: isSelected
                        ? "color-mix(in srgb, var(--brand) 7%, var(--surface))"
                        : "transparent",
                      cursor: "pointer",
                      transition: "background .16s ease, border-color .16s ease",
                    }}
                  >
                    <div className="row" style={{ justifyContent: "space-between", gap: "8px" }}>
                      <span className="row" style={{ gap: "6px" }}>
                        <span
                          className="mono"
                          style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--brand)" }}
                        >
                          {p.id}
                        </span>
                        <span
                          className="chip"
                          style={{ height: "18px", fontSize: "9.5px", padding: "0 6px" }}
                        >
                          {p.domain}
                        </span>
                      </span>
                      <span
                        className="mono"
                        style={{ fontSize: "10.5px", color: "var(--pass)", fontWeight: 600 }}
                      >
                        Rank {p.truthRank}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 600,
                        color: "var(--ink)",
                        margin: "5px 0 3px",
                      }}
                    >
                      {p.title}
                    </div>
                    <div
                      className="sub"
                      style={{
                        fontSize: "11.5px",
                        lineHeight: 1.45,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {p.summary}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            /* Empty state — never leave the index pane blank */
            <div style={{ padding: "28px 18px", textAlign: "center" }}>
              <div className="eyebrow" style={{ marginBottom: "7px" }}>
                No matches
              </div>
              <div style={{ fontSize: "12.5px", fontWeight: 600, marginBottom: "4px" }}>
                No problem classes match this filter.
              </div>
              <div className="sub" style={{ fontSize: "11.5px", marginBottom: "14px" }}>
                Adjust the tier, domain, or search query to restore the index.
              </div>
              <button type="button" className="btn sec sm" onClick={clearFilters}>
                Clear
              </button>
            </div>
          )}
        </div>

        {/* Right: Problem Detail & Specification */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", minWidth: 0 }}>
          {hasResults ? (
            <>
              {/* Header of Active Problem */}
              <div className="card" style={{ padding: "15px 17px" }}>
                <div
                  className="row"
                  style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div className="row" style={{ gap: "6px", flexWrap: "wrap" }}>
                      <span className="chip brand mono">{activeProblem.id}</span>
                      <span className="chip">{activeProblem.tier}</span>
                      <span className="chip">{activeProblem.domain}</span>
                      <span className="chip pass">
                        Truth Hierarchy Rank: {activeProblem.truthRank}
                      </span>
                    </div>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, margin: "9px 0 4px" }}>
                      {activeProblem.title}
                    </h2>
                    <div className="sub" style={{ fontSize: "12px" }}>
                      {activeProblem.summary}
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn"
                    onClick={() => handleOpenInStudio(activeProblem.id)}
                    style={{ cursor: "pointer", flex: "none" }}
                  >
                    <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px" }}>
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    Test in Code Studio
                  </button>
                </div>

                {/* Real World Impact Callout */}
                <div
                  style={{
                    marginTop: "13px",
                    padding: "10px 12px",
                    borderRadius: "8px",
                    border: "1px solid color-mix(in srgb, var(--fail) 32%, var(--line))",
                    background: "color-mix(in srgb, var(--fail) 9%, var(--surface))",
                  }}
                >
                  <div
                    className="eyebrow"
                    style={{ color: "var(--fail)", marginBottom: "4px" }}
                  >
                    Documented Real-World Incident
                  </div>
                  <div className="mono" style={{ fontSize: "11.5px", color: "var(--ink2)" }}>
                    {activeProblem.realWorldImpact}
                  </div>
                </div>

                {/* Probe Method Spec */}
                <div
                  className="row"
                  style={{
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: "4px 12px",
                    marginTop: "9px",
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid var(--line)",
                    background: "var(--bg)",
                    fontSize: "11.5px",
                  }}
                >
                  <span className="eyebrow" style={{ flex: "none" }}>
                    Deterministic Probe Oracle
                  </span>
                  <span
                    className="mono"
                    style={{
                      color: "var(--pass)",
                      fontWeight: 600,
                      textAlign: "right",
                      minWidth: 0,
                      marginLeft: "auto",
                    }}
                  >
                    {activeProblem.probeMethod}
                  </span>
                </div>
              </div>

              {/* Snippet Inspector Tabs */}
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                <div
                  className="tabs"
                  style={{ margin: 0, padding: "0 10px", borderBottom: "1px solid var(--line)" }}
                >
                  <div
                    className={`tab ${activeTab === "bug" ? "on" : ""}`}
                    onClick={() => setActiveTab("bug")}
                    style={{ cursor: "pointer" }}
                  >
                    <svg className="i" viewBox="0 0 24 24">
                      <path d="M8 2l1.88 1.88" />
                      <path d="M14.12 3.88L16 2" />
                      <path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1" />
                      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v3c0 3.3-2.7 6-6 6" />
                      <path d="M12 20v-9" />
                      <path d="M6.53 9C4.6 8.8 3 7.1 3 5" />
                      <path d="M6 13H2" />
                      <path d="M3 21c0-2.1 1.7-3.9 3.8-4" />
                      <path d="M20.97 5c0 2.1-1.6 3.8-3.5 4" />
                      <path d="M22 13h-4" />
                      <path d="M17.2 17c2.1.1 3.8 1.9 3.8 4" />
                    </svg>
                    1. Flawed Baseline Code
                  </div>

                  <div
                    className={`tab ${activeTab === "naive" ? "on" : ""}`}
                    onClick={() => setActiveTab("naive")}
                    style={{ cursor: "pointer" }}
                  >
                    <svg className="i" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    2. Naive AI Fix (Provably Rejected)
                  </div>

                  <div
                    className={`tab ${activeTab === "safe" ? "on" : ""}`}
                    onClick={() => setActiveTab("safe")}
                    style={{ cursor: "pointer" }}
                  >
                    <svg className="i" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      <polyline points="9 12 11 14 15 10" />
                    </svg>
                    3. Verified Defensive Patch (Accepted)
                  </div>

                  <div
                    className={`tab ${activeTab === "proof" ? "on" : ""}`}
                    onClick={() => setActiveTab("proof")}
                    style={{ cursor: "pointer" }}
                  >
                    <svg className="i" viewBox="0 0 24 24">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                    4. Verification Proof
                  </div>
                </div>

                <div style={{ padding: "16px 18px" }}>
                  {activeTab === "bug" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <span className="eyebrow" style={{ color: "var(--fail)" }}>
                          Flawed Pattern — Zero-Compromise Invariant Violated
                        </span>
                        <span className="sub" style={{ fontSize: "11.5px" }}>
                          Language: Python 3.11
                        </span>
                      </div>
                      <div className="code">
                        <div className="bar">Baseline · {activeProblem.id}</div>
                        <pre
                          style={{
                            margin: 0,
                            padding: "12px 14px",
                            overflowX: "auto",
                            whiteSpace: "pre",
                            fontFamily: "var(--f-mono)",
                            fontSize: "12px",
                            lineHeight: 1.65,
                            color: "var(--ink)",
                          }}
                        >
                          {activeProblem.bugSnippet}
                        </pre>
                      </div>
                    </div>
                  )}

                  {activeTab === "naive" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <span className="eyebrow" style={{ color: "var(--warn)" }}>
                          Naive Fix Attempt
                        </span>
                        <span className="chip fail">GATE VERDICT: {activeProblem.naiveVerdict}</span>
                      </div>
                      <div className="code">
                        <div className="bar">Naive Candidate · {activeProblem.id}</div>
                        <pre
                          style={{
                            margin: 0,
                            padding: "12px 14px",
                            overflowX: "auto",
                            whiteSpace: "pre",
                            fontFamily: "var(--f-mono)",
                            fontSize: "12px",
                            lineHeight: 1.65,
                            color: "var(--ink)",
                          }}
                        >
                          {activeProblem.naiveFixSnippet}
                        </pre>
                      </div>
                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid color-mix(in srgb, var(--fail) 32%, var(--line))",
                          background: "color-mix(in srgb, var(--fail) 9%, var(--surface))",
                          fontSize: "11.5px",
                          color: "var(--ink2)",
                        }}
                      >
                        <b style={{ color: "var(--fail)" }}>Rejection Rationale:</b>{" "}
                        {activeProblem.naiveReason}
                      </div>
                    </div>
                  )}

                  {activeTab === "safe" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      <div className="row" style={{ justifyContent: "space-between" }}>
                        <span className="eyebrow" style={{ color: "var(--pass)" }}>
                          Verified Defensive Candidate
                        </span>
                        <span className="chip pass">GATE VERDICT: {activeProblem.safeVerdict}</span>
                      </div>
                      <div className="code">
                        <div className="bar">Verified Candidate · {activeProblem.id}</div>
                        <pre
                          style={{
                            margin: 0,
                            padding: "12px 14px",
                            overflowX: "auto",
                            whiteSpace: "pre",
                            fontFamily: "var(--f-mono)",
                            fontSize: "12px",
                            lineHeight: 1.65,
                            color: "var(--ink)",
                          }}
                        >
                          {activeProblem.safeFixSnippet}
                        </pre>
                      </div>
                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid color-mix(in srgb, var(--pass) 32%, var(--line))",
                          background: "color-mix(in srgb, var(--pass) 9%, var(--surface))",
                          fontSize: "11.5px",
                          color: "var(--ink2)",
                        }}
                      >
                        <b style={{ color: "var(--pass)" }}>Acceptance Guarantee:</b>{" "}
                        {activeProblem.safeReason}
                      </div>
                    </div>
                  )}

                  {activeTab === "proof" && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div
                        className="row"
                        style={{ justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}
                      >
                        <span className="eyebrow">Verification Proof · {activeProblem.id}</span>
                        <span className="row" style={{ gap: "6px" }}>
                          <span className="chip fail">{activeProblem.naiveVerdict}</span>
                          <span className="chip pass">{activeProblem.safeVerdict}</span>
                        </span>
                      </div>

                      <div
                        style={{
                          border: "1px solid var(--line)",
                          borderRadius: "10px",
                          background: "var(--surface2)",
                          overflow: "hidden",
                        }}
                      >
                        {[
                          {
                            label: "Deterministic Probe Oracle",
                            value: activeProblem.probeMethod,
                            tone: "var(--pass)",
                          },
                          {
                            label: "Truth Hierarchy Rank",
                            value: `Rank ${activeProblem.truthRank}`,
                            tone: "var(--brand)",
                          },
                          {
                            label: "Severity Tier",
                            value: activeProblem.tier,
                            tone: "var(--ink)",
                          },
                          {
                            label: "Domain",
                            value: activeProblem.domain,
                            tone: "var(--ink)",
                          },
                          {
                            label: "Real-World Impact",
                            value: activeProblem.realWorldImpact,
                            tone: "var(--fail)",
                          },
                        ].map((row, i, arr) => (
                          <div
                            key={row.label}
                            className="row"
                            style={{
                              justifyContent: "space-between",
                              flexWrap: "wrap",
                              gap: "4px 16px",
                              padding: "10px 12px",
                              borderBottom:
                                i === arr.length - 1 ? "none" : "1px solid var(--line)",
                            }}
                          >
                            <span className="eyebrow" style={{ flex: "none" }}>
                              {row.label}
                            </span>
                            <span
                              className="mono"
                              style={{
                                fontSize: "11.5px",
                                color: row.tone,
                                fontWeight: 600,
                                textAlign: "right",
                                minWidth: 0,
                                marginLeft: "auto",
                              }}
                            >
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div
                        style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          border: "1px solid var(--line)",
                          background: "var(--bg)",
                          fontSize: "11.5px",
                          color: "var(--ink2)",
                        }}
                      >
                        <b style={{ color: "var(--ink)" }}>Naive candidate rejected:</b>{" "}
                        {activeProblem.naiveReason}
                        <br />
                        <b style={{ color: "var(--ink)" }}>Verified candidate accepted:</b>{" "}
                        {activeProblem.safeReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* No stale detail when the index is empty */
            <div
              className="card"
              style={{ padding: "44px 24px", textAlign: "center", borderStyle: "dashed" }}
            >
              <div className="eyebrow" style={{ marginBottom: "8px" }}>
                Nothing selected
              </div>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "5px" }}>
                No problem class is loaded.
              </div>
              <div className="sub" style={{ fontSize: "12px", marginBottom: "16px" }}>
                The current filter matches nothing in the catalogue. Clear it to select a defect
                class.
              </div>
              <button type="button" className="btn sec" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </MainLayout>
  );
}
