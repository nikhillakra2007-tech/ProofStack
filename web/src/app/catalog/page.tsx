"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_CATALOG } from "@/lib/mockData";
import { CatalogProblem } from "@/lib/types";
import MainLayout from "@/components/layout/MainLayout";

const ALL = "All";

const TIERS = [ALL, "Tier 1", "Tier 2", "Tier 3"];

const verdictChipClass = (
  verdict: CatalogProblem["naiveVerdict"] | CatalogProblem["safeVerdict"]
) => {
  if (verdict === "ACCEPT") return "chip pass";
  if (verdict === "REJECT") return "chip fail";
  return "chip warn";
};

export default function CatalogPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string>(ALL);
  const [selectedDomain, setSelectedDomain] = useState<string>(ALL);
  const [searchQuery, setSearchQuery] = useState<string>("");
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
      const matchesTier =
        selectedTier === ALL || p.tier.toLowerCase() === selectedTier.toLowerCase();
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

  return (
    <MainLayout>
      <div>
        {/* Header (PDF p. 29) */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">Reference</div>
          <h1 className="h1" style={{ marginTop: "6px" }}>
            19-Problem Specification Catalog
          </h1>
          <p>
            Full empirical catalog across Tier 1 (8), Tier 2 (7), and Tier 3 (4) verification fixtures
          </p>
        </div>
        <div className="r">
          <div className="search" style={{ margin: 0, width: "240px" }}>
            <svg className="i" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems"
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
        </div>
      </div>

      {/* Filter Row: Segmented tier control */}
      <div className="row" style={{ marginBottom: "10px", gap: "8px", flexWrap: "wrap" }}>
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
        {hasActiveFilters && (
          <button type="button" className="btn sec sm" onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      {/* Domain filter — real, clickable, derived from the catalogue */}
      <div
        className="row"
        style={{ marginBottom: "14px", gap: "6px", flexWrap: "wrap", alignItems: "center" }}
      >
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

      {/* Result count */}
      <div className="row" style={{ justifyContent: "space-between", marginBottom: "10px" }}>
        <span className="eyebrow">
          Showing {filteredProblems.length} of {MOCK_CATALOG.length}
        </span>
        {hasActiveFilters && (
          <span className="sub" style={{ fontSize: "11.5px" }}>
            Filters: tier {selectedTier} · domain {selectedDomain}
            {searchQuery.trim() ? ` · query "${searchQuery.trim()}"` : ""}
          </span>
        )}
      </div>

      {filteredProblems.length === 0 ? (
        /* Empty state */
        <div
          className="card"
          style={{
            padding: "40px 24px",
            textAlign: "center",
            borderStyle: "dashed",
            marginBottom: "24px",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: "8px" }}>
            Empty result set
          </div>
          <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "5px" }}>
            No problem classes match this filter.
          </div>
          <div className="sub" style={{ fontSize: "12px", marginBottom: "16px" }}>
            Widen the tier or domain selection, or clear the search query to restore the full
            19-class catalogue.
          </div>
          <button type="button" className="btn sec" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        /* 2-Column Neutral Cards Grid (PDF p. 29) */
        <div
          className="grid"
          style={{
            gridTemplateColumns: "1fr 1fr",
            gap: "14px",
            paddingBottom: "24px",
          }}
        >
          {filteredProblems.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                padding: "14px 16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div className="row" style={{ flexWrap: "wrap", gap: "6px" }}>
                  <span className="chip brand mono">{p.id}</span>
                  <span className="chip">{p.tier}</span>
                  <span className="eyebrow" style={{ marginLeft: "2px" }}>
                    {p.domain}
                  </span>
                  {p.truthRank && (
                    <span className="chip" style={{ marginLeft: "auto" }}>
                      Truth Hierarchy: Rank {p.truthRank}
                    </span>
                  )}
                </div>

                <b style={{ display: "block", margin: "9px 0 4px", fontSize: "14px" }}>
                  {p.title}
                </b>

                <div className="sub" style={{ minHeight: "34px", fontSize: "12px" }}>
                  {p.summary}
                </div>

                {p.realWorldImpact && (
                  <div
                    className="mono"
                    style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "8px" }}
                  >
                    REAL-WORLD FAILURE: {p.realWorldImpact}
                  </div>
                )}

                {/* Why each candidate was accepted or rejected */}
                <div
                  className="mono"
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "3px",
                    fontSize: "10.5px",
                    lineHeight: 1.5,
                    color: "var(--ink3)",
                  }}
                >
                  <div>
                    <span style={{ color: "var(--fail)", fontWeight: 700 }}>
                      NAIVE {p.naiveVerdict}
                    </span>
                    <span> — {p.naiveReason}</span>
                  </div>
                  <div>
                    <span style={{ color: "var(--pass)", fontWeight: 700 }}>
                      SAFE {p.safeVerdict}
                    </span>
                    <span> — {p.safeReason}</span>
                  </div>
                </div>
              </div>

              <div className="row" style={{ marginTop: "12px", gap: "8px" }}>
                <span className={verdictChipClass(p.naiveVerdict)}>
                  <svg className="i" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                  Naive: {p.naiveVerdict}
                </span>
                <span className={verdictChipClass(p.safeVerdict)}>
                  <svg className="i" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Safe: {p.safeVerdict}
                </span>
                <button
                  type="button"
                  onClick={() => handleOpenInStudio(p.id)}
                  style={{
                    marginLeft: "auto",
                    color: "var(--brand)",
                    fontSize: "12px",
                    fontWeight: 600,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "3px",
                  }}
                >
                  Open in Studio →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
    </MainLayout>
  );
}
