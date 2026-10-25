"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MOCK_CATALOG } from "@/lib/mockData";
import { CatalogProblem } from "@/lib/types";

export default function CatalogPage() {
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filteredProblems = MOCK_CATALOG.filter((p) => {
    const matchesTier =
      selectedTier === "All" || p.tier.toLowerCase() === selectedTier.toLowerCase();
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.domain.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTier && matchesSearch;
  });

  const handleOpenInStudio = (probId: string) => {
    router.push(`/studio?problem=${probId}`);
  };

  return (
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
        <div className="r" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            type="button"
            className="btn sm"
            onClick={() => router.push("/studio?mode=custom&problem=CUSTOM-1")}
            style={{ height: "34px", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px" }}
          >
            <svg style={{ width: "13px", height: "13px", fill: "none", stroke: "currentColor", strokeWidth: 2 }} viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Ingest Custom Snippet
          </button>
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

      {/* Filter Row: Segmented control + Domain chip */}
      <div className="row" style={{ marginBottom: "14px", gap: "8px", flexWrap: "wrap" }}>
        <div className="seg" style={{ cursor: "pointer" }}>
          <span
            className={selectedTier === "All" ? "on" : ""}
            onClick={() => setSelectedTier("All")}
          >
            All
          </span>
          <span
            className={selectedTier === "Tier 1" ? "on" : ""}
            onClick={() => setSelectedTier("Tier 1")}
          >
            Tier 1
          </span>
          <span
            className={selectedTier === "Tier 2" ? "on" : ""}
            onClick={() => setSelectedTier("Tier 2")}
          >
            Tier 2
          </span>
          <span
            className={selectedTier === "Tier 3" ? "on" : ""}
            onClick={() => setSelectedTier("Tier 3")}
          >
            Tier 3
          </span>
        </div>
        <span className="chip">Domain: All</span>
      </div>

      {/* 2-Column Neutral Cards Grid (PDF p. 29) */}
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
            </div>

            <div className="row" style={{ marginTop: "12px", gap: "8px" }}>
              <span className="chip fail">
                <svg className="i" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Naive: Rejected
              </span>
              <span className="chip pass">
                <svg className="i" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Safe: Accepted
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

        {/* Expandable Custom Real-World Problem Card */}
        <div
          className="card"
          onClick={() => router.push("/studio?mode=custom&problem=CUSTOM-1")}
          style={{
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            border: "1px dashed var(--brand)",
            background: "color-mix(in srgb, var(--brand) 4%, var(--surface))",
            cursor: "pointer",
            transition: "all 120ms ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "color-mix(in srgb, var(--brand) 8%, var(--surface))";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "color-mix(in srgb, var(--brand) 4%, var(--surface))";
          }}
        >
          <div>
            <div className="row" style={{ flexWrap: "wrap", gap: "6px" }}>
              <span className="chip brand mono">CUSTOM-1</span>
              <span className="chip pass">Dynamic Ingestion</span>
              <span className="eyebrow" style={{ marginLeft: "2px" }}>
                Real-World Engine
              </span>
              <span className="chip" style={{ marginLeft: "auto" }}>
                AST + MicroVM Ready
              </span>
            </div>

            <b style={{ display: "block", margin: "10px 0 4px", fontSize: "14.5px" }}>
              + Ingest Arbitrary Production Code
            </b>

            <div className="sub" style={{ fontSize: "12px", minHeight: "34px" }}>
              Paste or import arbitrary Python/FastAPI functions. ProofStack parses the AST and runs live exploit &amp; performance checks inside rootless microVM sandboxes.
            </div>
          </div>

          <div className="row" style={{ marginTop: "14px", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: "10px" }}>
            <span className="mono" style={{ fontSize: "11px", color: "var(--brand)" }}>
              Arbitrary Code Verification →
            </span>
            <button type="button" className="btn sm">
              Open Live Editor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
