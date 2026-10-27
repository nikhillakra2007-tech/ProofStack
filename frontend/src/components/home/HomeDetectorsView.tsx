"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { MOCK_CATALOG } from "@/lib/mockData";
import { CatalogProblem } from "@/lib/types";

export default function HomeDetectorsView({ onOpenTour }: { onOpenTour?: () => void }) {
  const router = useRouter();
  const [selectedDomain, setSelectedDomain] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedId, setExpandedId] = useState<string | null>("T1-1");

  const domains = ["All", "Performance", "Security", "Concurrency"];

  const filteredDetectors = useMemo(() => {
    return MOCK_CATALOG.filter((item) => {
      const matchesDomain =
        selectedDomain === "All" ||
        item.domain.toLowerCase().includes(selectedDomain.toLowerCase()) ||
        (selectedDomain === "Security" && (item.domain === "Security" || item.domain === "Database" || item.domain === "Cloud Security")) ||
        (selectedDomain === "Concurrency" && (item.domain === "Resource" || item.title.toLowerCase().includes("async") || item.title.toLowerCase().includes("race")));

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.id.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        (item.realWorldImpact && item.realWorldImpact.toLowerCase().includes(q));

      return matchesDomain && matchesSearch;
    });
  }, [selectedDomain, searchQuery]);

  const handleLaunchDemo = () => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("proofstack_auth_active");
        localStorage.removeItem("proofstack_session");
        localStorage.removeItem("proofstack_role");
        localStorage.removeItem("proofstack_user");
        document.cookie = "ps_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "proofstack_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        document.cookie = "ps_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      } catch {}
    }
    router.push("/login");
  };

  return (
    <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "40px 24px 80px" }}>
      {/* Sub-Page Header */}
      <div style={{ textAlign: "center", maxWidth: "840px", margin: "0 auto 40px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
          <span className="chip brand" style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em" }}>
            ZERO-BLINDSPOT BENCHMARK
          </span>
          <span style={{ fontSize: "12px", background: "#ECFDF5", color: "#065F46", padding: "3px 10px", borderRadius: "12px", border: "1px solid #A7F3D0", fontWeight: 600 }}>
            19 Industrial Problem Classes
          </span>
          <span style={{ fontSize: "12px", background: "#EFF6FF", color: "#1E40AF", padding: "3px 10px", borderRadius: "12px", border: "1px solid #BFDBFE", fontWeight: 600 }}>
            Public Interactive Catalog
          </span>
        </div>

        <h1 style={{ fontFamily: "var(--f-display)", fontSize: "40px", fontWeight: 700, margin: "0 0 16px", letterSpacing: "-0.02em", lineHeight: 1.15 }}>
          19 Problem Classes &amp; Invariant Detectors
        </h1>

        <p style={{ color: "var(--ink2)", fontSize: "16px", lineHeight: 1.6, margin: "0 auto 24px" }}>
          Explore the exact empirical detector harnesses and AST ban rules running inside ProofStack.
          Each problem class pairs a real-world outage case study with an automated exploit oracle.
        </p>

        {/* Search Bar & Category Filter Pills */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "center" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "480px" }}>
            <input
              type="text"
              placeholder="Search by detector ID, title, or failure story (e.g., IDOR, N+1, ReDoS, Deadlock)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 42px",
                borderRadius: "10px",
                border: "1.5px solid var(--line)",
                background: "var(--surface)",
                color: "var(--ink)",
                fontSize: "13.5px",
                outline: "none",
                boxShadow: "0 2px 6px rgba(0,0,0,0.03)",
              }}
            />
            <svg
              style={{ position: "absolute", left: "14px", top: "14px", width: "16px", height: "16px", color: "var(--ink2)" }}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "12px",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--ink2)",
                  fontSize: "13px",
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", justifyContent: "center" }}>
            {domains.map((dom) => (
              <button
                key={dom}
                type="button"
                onClick={() => setSelectedDomain(dom)}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: selectedDomain === dom ? "1px solid var(--brand)" : "1px solid var(--line)",
                  background: selectedDomain === dom ? "var(--brand)" : "var(--surface)",
                  color: selectedDomain === dom ? "#FFFFFF" : "var(--ink)",
                  transition: "all 120ms ease",
                }}
              >
                {dom === "All" && `All (19)`}
                {dom === "Performance" && `⚡ Performance`}
                {dom === "Security" && `🛡️ Security & Isolation`}
                {dom === "Concurrency" && `🔄 Concurrency & Async`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Detector Cards Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))", gap: "20px" }}>
        {filteredDetectors.map((item) => {
          const isExpanded = expandedId === item.id;
          return (
            <div
              key={item.id}
              className="card"
              style={{
                borderRadius: "12px",
                padding: "24px",
                background: "var(--surface)",
                border: isExpanded ? "1.5px solid var(--brand)" : "1px solid var(--line)",
                boxShadow: isExpanded ? "0 10px 25px rgba(0, 0, 0, 0.08)" : "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "all 180ms ease",
              }}
            >
              <div>
                {/* Header row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className="chip brand" style={{ fontSize: "11px", fontWeight: 700 }}>
                      {item.id}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background:
                          item.domain === "Performance"
                            ? "#ECFDF5"
                            : item.domain === "Security"
                            ? "#FEF2F2"
                            : "#EFF6FF",
                        color:
                          item.domain === "Performance"
                            ? "#065F46"
                            : item.domain === "Security"
                            ? "#991B1B"
                            : "#1E40AF",
                        fontWeight: 600,
                      }}
                    >
                      {item.domain}
                    </span>
                  </div>
                  <span className="mono" style={{ fontSize: "11px", color: "var(--pass)", fontWeight: 700 }}>
                    ACTIVE ORACLE ✓
                  </span>
                </div>

                <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "0 0 8px", color: "var(--ink)" }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: "13px", color: "var(--ink2)", lineHeight: 1.55, margin: "0 0 14px" }}>
                  {item.summary}
                </p>

                {/* Real World Impact Badge */}
                {item.realWorldImpact && (
                  <div
                    style={{
                      background: "color-mix(in srgb, var(--brand) 4%, var(--surface2))",
                      border: "1px solid var(--line)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      fontSize: "12px",
                      color: "var(--ink)",
                      marginBottom: "14px",
                    }}
                  >
                    <b style={{ color: "var(--brand)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em", display: "block", marginBottom: "2px" }}>
                      Real-World Outage Case:
                    </b>
                    {item.realWorldImpact}
                  </div>
                )}

                {/* Expandable Technical Deep Dive */}
                {isExpanded && (
                  <div style={{ marginTop: "14px", borderTop: "1px solid var(--line)", paddingTop: "14px" }}>
                    <div style={{ marginBottom: "12px" }}>
                      <div className="eyebrow" style={{ fontSize: "10px", color: "#EF4444", marginBottom: "4px" }}>
                        Vulnerable Code Pattern (Bug Snippet)
                      </div>
                      <pre
                        className="mono"
                        style={{
                          background: "#0F172A",
                          color: "#F8FAFC",
                          padding: "10px 12px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          lineHeight: 1.5,
                          overflowX: "auto",
                          margin: 0,
                        }}
                      >
                        {item.bugSnippet}
                      </pre>
                    </div>

                    <div style={{ marginBottom: "12px" }}>
                      <div className="eyebrow" style={{ fontSize: "10px", color: "#10B981", marginBottom: "4px" }}>
                        ProofStack Verified Defensive Patch
                      </div>
                      <pre
                        className="mono"
                        style={{
                          background: "#0F172A",
                          color: "#10B981",
                          padding: "10px 12px",
                          borderRadius: "6px",
                          fontSize: "11px",
                          lineHeight: 1.5,
                          overflowX: "auto",
                          margin: 0,
                        }}
                      >
                        {item.safeFixSnippet}
                      </pre>
                    </div>

                    <div style={{ background: "var(--surface2)", padding: "10px 12px", borderRadius: "6px", fontSize: "11.5px" }}>
                      <div style={{ color: "var(--ink2)", marginBottom: "3px" }}>
                        <b>Verification Oracle:</b> {item.probeMethod}
                      </div>
                      <div style={{ color: "#10B981", fontWeight: 600 }}>
                        <b>Verdict:</b> {item.safeReason}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Actions */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--line)" }}>
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: 0,
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "var(--brand)",
                    cursor: "pointer",
                  }}
                >
                  {isExpanded ? "▲ Hide Technical Details" : "▼ Inspect Oracle & Diffs"}
                </button>

                <button
                  type="button"
                  onClick={handleLaunchDemo}
                  style={{
                    fontSize: "11.5px",
                    fontWeight: 600,
                    color: "var(--ink)",
                    background: "var(--surface2)",
                    border: "1px solid var(--line)",
                    padding: "4px 10px",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Replay in Studio →
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
