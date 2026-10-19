"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES, TENANT_UUID } from "@/lib/roles";
import { MOCK_CATALOG } from "@/lib/mockData";

interface FindingRecord {
  id: string;
  severity: "HIGH" | "MED" | "LOW";
  title: string;
  location: string;
  category: string;
  source: "DAST" | "Repo scan";
  status: "Open" | "Fixed";
  truthRank?: number;
  description: string;
  naiveVerdict?: "Rejected";
  naiveReason?: string;
  safeVerdict?: "Accepted";
  safeReason?: string;
  /** Catalog problem this finding maps to, resolved from the shared catalog by title. */
  problemId?: string;
  patchDeleted: string;
  patchAdded: string;
}

const BASE_FINDINGS: FindingRecord[] = [
  {
    id: "fd_d44e55667788",
    severity: "HIGH",
    title: "Exposed Client-Side AWS Access Key in Script Bundle",
    location: ".env.production",
    category: "Cloud Security",
    source: "DAST",
    status: "Open",
    truthRank: 1,
    description: "Production JS bundle inlines AWS IAM credential literal leading to unrestricted cloud resource access.",
    naiveVerdict: "Rejected",
    naiveReason:
      "Rejected: the key literal is only relocated into process.env.SERVER_ONLY_AWS_KEY, which Next.js still inlines into the client bundle.",
    safeVerdict: "Accepted",
    safeReason:
      "Accepted: the credential is read from a server-only environment variable that no client module references.",
    patchDeleted: "const AWS_KEY = 'AKIAIOSFODNN7EXAMPLE';",
    patchAdded: "const AWS_KEY = process.env.SERVER_ONLY_AWS_KEY;",
  },
  {
    id: "fd_e99a88776655",
    severity: "HIGH",
    title: "DOM-Based XSS: location.hash flows into innerHTML",
    location: "src/components/SearchBox.tsx",
    category: "Security",
    source: "DAST",
    status: "Open",
    truthRank: 2,
    description: "Dynamic probe confirmed unescaped user location.hash flows directly into an element.innerHTML sink without sanitization.",
    naiveVerdict: "Rejected",
    naiveReason:
      "Rejected: HTML-encoding the fragment before assigning it to innerHTML still leaves a raw HTML sink that a crafted payload can escape.",
    safeVerdict: "Accepted",
    safeReason:
      "Accepted: textContent renders the fragment as inert text, so no markup carried by location.hash is ever parsed.",
    patchDeleted: "document.getElementById('results').innerHTML = location.hash;",
    patchAdded: "document.getElementById('results').textContent = location.hash;",
  },
  {
    id: "fd_f11223344556",
    severity: "HIGH",
    title: "Exposed Public Environment File (/.env)",
    location: "public/.env",
    category: "Security",
    source: "DAST",
    status: "Open",
    truthRank: 3,
    description: "HTTP GET /.env returned status 200 with matching DATABASE_URL and secret credentials exposed publicly.",
    naiveVerdict: "Rejected",
    naiveReason:
      "Rejected: moving the file out of public/ hides it from the static route but leaves the credential inside the deployed image and the repository history.",
    safeVerdict: "Accepted",
    safeReason:
      "Accepted: the file is deleted from the static root and the publish step refuses any .env artifact, so the secret never reaches the CDN.",
    patchDeleted: "mv public/.env /var/www/",
    patchAdded: "# Remove .env from static assets public directory completely",
  },
  {
    id: "fd_idor_cache_01",
    severity: "HIGH",
    title: "Broken Object-Level Auth (IDOR) in Cache",
    location: "cache/store.py:get_doc",
    category: "Security",
    source: "Repo scan",
    status: "Open",
    truthRank: 2,
    description: "Speedup caching keyed only by document id allows cross-tenant data access.",
    naiveVerdict: "Rejected",
    naiveReason:
      "Rejected: scoping the cache key by tenant alone still serves a cached document to any authenticated user inside that tenant.",
    safeVerdict: "Accepted",
    safeReason:
      "Accepted: authorization is re-evaluated on every call and the cache key carries the tenant boundary, so a cross-tenant read cannot hit the cache.",
    patchDeleted: "cache_key = doc_id",
    patchAdded: 'cache_key = f"{tenant_id}:{doc_id}"',
  },
  {
    id: "fd_a1b2c3d4e5f6",
    severity: "MED",
    title: "Missing Security Headers (CSP, HSTS, X-Content-Type-Options)",
    location: "next.config.js",
    category: "Security",
    source: "DAST",
    status: "Open",
    truthRank: 4,
    description: "Main document response omitted Content-Security-Policy and X-Content-Type-Options: nosniff headers.",
    naiveVerdict: "Rejected",
    naiveReason:
      "Rejected: a single Content-Security-Policy header leaves HSTS and X-Content-Type-Options unset, so downgrade and MIME-sniffing attacks still succeed.",
    safeVerdict: "Accepted",
    safeReason:
      "Accepted: CSP, HSTS and nosniff are emitted together on every response, closing the whole misconfiguration class rather than one header of it.",
    patchDeleted: "// headers: none",
    patchAdded: "Content-Security-Policy: default-src 'self'",
  },
  {
    id: "fd_b2c3d4e5f6a1",
    severity: "MED",
    title: "Permissive CSP Contains 'unsafe-inline' and Wildcard (*)",
    location: "middleware.ts",
    category: "Security",
    source: "DAST",
    status: "Open",
    truthRank: 5,
    description: "script-src directive includes 'unsafe-inline' and wildcard origin (*) allowing arbitrary script execution.",
    naiveVerdict: "Rejected",
    naiveReason:
      "Rejected: a hard-coded nonce is predictable and stays valid across responses, so a wildcard or inline injection still executes.",
    safeVerdict: "Accepted",
    safeReason:
      "Accepted: a per-request random nonce replaces 'unsafe-inline' and the wildcard origin is dropped from script-src.",
    patchDeleted: "script-src * 'unsafe-inline'",
    patchAdded: "script-src 'self' 'nonce-rAnd0m'",
  },
  {
    id: "fd_c37d92841f3e",
    severity: "MED",
    title: "Insecure Session Cookie Missing HttpOnly & SameSite=Strict",
    location: "src/server/auth.ts",
    category: "Security",
    source: "DAST",
    status: "Open",
    truthRank: 6,
    description: "Cookie 'session_id' set without HttpOnly flag; accessible to client JavaScript.",
    naiveVerdict: "Rejected",
    naiveReason:
      "Rejected: adding SameSite alone leaves the cookie readable from client JavaScript, so a single XSS still exfiltrates the session.",
    safeVerdict: "Accepted",
    safeReason:
      "Accepted: HttpOnly, Secure and SameSite=Strict are set together, so the session is neither script-readable nor cross-site transmittable.",
    patchDeleted: "res.setHeader('Set-Cookie', `session_id=${id}; Path=/`);",
    patchAdded: "res.setHeader('Set-Cookie', `session_id=${id}; Path=/; HttpOnly; SameSite=Strict; Secure`);",
  },
  {
    id: "fd_async_freeze_01",
    severity: "MED",
    title: "Blocking Call Inside async def (Event-Loop Freeze)",
    location: "api/export.py:stream",
    category: "Concurrency",
    source: "Repo scan",
    status: "Open",
    truthRank: 7,
    description: "Synchronous blocking IO inside an async def route freezes the entire Python asyncio event loop for all requests.",
    naiveVerdict: "Rejected",
    naiveReason:
      "Rejected: dropping the async decorator turns the route into a blocking worker while the blocking call itself is left untouched.",
    safeVerdict: "Accepted",
    safeReason:
      "Accepted: the blocking call is replaced by a cooperative await, so the event loop keeps serving concurrent requests without lag.",
    patchDeleted: "time.sleep(2.5) # blocking io",
    patchAdded: "await asyncio.sleep(2.5) # cooperative non-blocking yield",
  },
  {
    id: "fd_n1_sql_01",
    severity: "LOW",
    title: "N+1 Query Explosion & The SQL-Injection Trap",
    location: "orders.py:get_orders",
    category: "Database",
    source: "Repo scan",
    status: "Fixed",
    truthRank: 1,
    description: "Iterative customer relationship loads fired 5,001 SQL queries. Defensive patch verified and committed to ledger.",
    naiveVerdict: "Rejected",
    naiveReason:
      "Rejected: rewriting the loop as a set-based comprehension reorders the result rows, breaking the pagination contract the API guarantees.",
    safeVerdict: "Accepted",
    safeReason:
      "Accepted: eager loading collapses 5,001 statements into 1 while preserving first-occurrence row order and bound parameters.",
    patchDeleted: "for order in orders: customer = db.query(Customer)...",
    patchAdded: "orders = db.query(Order).options(joinedload(Order.customer)).all()",
  },
];

/**
 * A finding only claims a catalog problem when the shared catalog actually
 * contains a problem with the exact same title. No finding is mapped by guess.
 */
const CATALOG_PROBLEM_BY_TITLE = new Map(MOCK_CATALOG.map((p) => [p.title, p.id]));

const ALL_FINDINGS: FindingRecord[] = BASE_FINDINGS.map((f) => ({
  ...f,
  problemId: CATALOG_PROBLEM_BY_TITLE.get(f.title),
}));

const TOTAL_FINDINGS = ALL_FINDINGS.length;
const OPEN_FINDINGS = ALL_FINDINGS.filter((f) => f.status === "Open").length;
const FIXED_FINDINGS = ALL_FINDINGS.filter((f) => f.status === "Fixed").length;

const countBySeverity = (severity: FindingRecord["severity"]) =>
  ALL_FINDINGS.filter((f) => f.severity === severity).length;

const VERDICT_CHIP_CLASS: Record<string, string> = {
  Rejected: "fail",
  Accepted: "pass",
};

function FindingsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedParam = searchParams.get("selected");
  const { role } = useAuth();
  const roleDef = ROLES[role] || ROLES.developer;

  // Filters state
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Fixed">("All");
  const [severityFilter, setSeverityFilter] = useState<"ANY" | "HIGH" | "MED" | "LOW">("ANY");
  const [categoryFilter, setCategoryFilter] = useState<string>("ANY");
  const [sourceFilter, setSourceFilter] = useState<string>("ANY");

  // Dropdown toggles
  const [openDropdown, setOpenDropdown] = useState<"sev" | "cat" | "src" | "export" | null>(null);

  const [selectedFindingId, setSelectedFindingId] = useState<string>(
    selectedParam || "fd_idor_cache_01"
  );
  const [isDetailOpen, setIsDetailOpen] = useState<boolean>(true);

  // Close dropdowns on outside click
  const dropdownRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (selectedParam) {
      setSelectedFindingId(selectedParam);
      setIsDetailOpen(true);
    }
  }, [selectedParam]);

  const filteredFindings = ALL_FINDINGS.filter((f) => {
    if (statusFilter === "Open" && f.status !== "Open") return false;
    if (statusFilter === "Fixed" && f.status !== "Fixed") return false;
    if (severityFilter !== "ANY" && f.severity !== severityFilter) return false;
    if (categoryFilter !== "ANY" && f.category !== categoryFilter) return false;
    if (sourceFilter !== "ANY" && f.source !== sourceFilter) return false;
    return true;
  });

  const selectedFinding =
    ALL_FINDINGS.find((f) => f.id === selectedFindingId) || ALL_FINDINGS[3];

  const handleSelfHeal = () => {
    if (selectedFinding?.problemId) {
      router.push(`/studio?problem=${selectedFinding.problemId}`);
    } else {
      router.push("/studio");
    }
  };

  const handleOpenCockpit = () => {
    router.push("/cockpit/TASK9142");
  };

  // Real Export Handlers
  const handleExportMarkdown = () => {
    setOpenDropdown(null);
    let md = `# ProofStack Audit Findings Report\nGenerated: ${new Date().toISOString()}\nTotal Findings: ${filteredFindings.length}\n\n`;
    md += `| ID | Severity | Finding | Location | Category | Source | Status |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    filteredFindings.forEach((f) => {
      md += `| \`${f.id}\` | **${f.severity}** | ${f.title} | \`${f.location}\` | ${f.category} | ${f.source} | ${f.status} |\n`;
    });
    md += `\n## Remediations & Safe Patches\n\n`;
    filteredFindings.forEach((f) => {
      md += `### [${f.severity}] ${f.title} (${f.location})\n`;
      md += `${f.description}\n\n`;
      md += `\`\`\`diff\n- ${f.patchDeleted}\n+ ${f.patchAdded}\n\`\`\`\n\n`;
    });

    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `proofstack-findings-${Date.now()}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    setOpenDropdown(null);
    const headers = ["ID", "Severity", "Title", "Location", "Category", "Source", "Status", "Description"];
    const rows = filteredFindings.map((f) => [
      f.id,
      f.severity,
      `"${f.title.replace(/"/g, '""')}"`,
      `"${f.location.replace(/"/g, '""')}"`,
      f.category,
      f.source,
      f.status,
      `"${f.description.replace(/"/g, '""')}"`,
    ]);
    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `proofstack-findings-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    setOpenDropdown(null);
    const jsonStr = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        tenant: TENANT_UUID,
        total: filteredFindings.length,
        findings: filteredFindings,
      },
      null,
      2
    );
    const blob = new Blob([jsonStr], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `proofstack-findings-${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    setOpenDropdown(null);
    window.print();
  };

  const resetFilters = () => {
    setStatusFilter("All");
    setSeverityFilter("ANY");
    setCategoryFilter("ANY");
    setSourceFilter("ANY");
  };

  return (
    <div ref={dropdownRef}>
      {/* Header */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">Workspace</div>
          <h1 className="h1" style={{ marginTop: "6px" }}>
            Findings
          </h1>
          <p>
            Everything the engine has detected across repository scans and DAST runs, with a verified fix for each.
          </p>
        </div>
        <div className="r" style={{ position: "relative" }}>
          {(severityFilter !== "ANY" || categoryFilter !== "ANY" || sourceFilter !== "ANY" || statusFilter !== "All") && (
            <button
              type="button"
              className="btn sec"
              onClick={resetFilters}
              style={{ cursor: "pointer", fontSize: "12px" }}
            >
              Reset Filters
            </button>
          )}

          {/* Export Dropdown Trigger */}
          <div style={{ position: "relative" }}>
            <button
              type="button"
              className="btn sec"
              onClick={() => setOpenDropdown(openDropdown === "export" ? null : "export")}
              style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}
            >
              <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px" }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export
              <svg className="i" viewBox="0 0 24 24" style={{ width: "12px", height: "12px" }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openDropdown === "export" && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "100%",
                  marginTop: "6px",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  boxShadow: "0 10px 24px rgba(0, 0, 0, 0.25)",
                  padding: "6px",
                  minWidth: "220px",
                  zIndex: 100,
                  display: "flex",
                  flexDirection: "column",
                  gap: "2px",
                }}
              >
                <button
                  type="button"
                  onClick={handleExportMarkdown}
                  style={{
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    color: "var(--ink)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px", color: "var(--brand)" }}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                  Export as Markdown (.md)
                </button>
                <button
                  type="button"
                  onClick={handleExportCSV}
                  style={{
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    color: "var(--ink)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px", color: "var(--pass)" }}>
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <line x1="3" y1="9" x2="21" y2="9" />
                    <line x1="9" y1="21" x2="9" y2="9" />
                  </svg>
                  Export as CSV (.csv)
                </button>
                <button
                  type="button"
                  onClick={handleExportJSON}
                  style={{
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    color: "var(--ink)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px", color: "var(--brand)" }}>
                    <polyline points="16 18 22 12 16 6" />
                    <polyline points="8 6 2 12 8 18" />
                  </svg>
                  Export as JSON (.json)
                </button>
                <div style={{ height: "1px", background: "var(--line)", margin: "4px 0" }} />
                <button
                  type="button"
                  onClick={handlePrintPDF}
                  style={{
                    background: "transparent",
                    border: "none",
                    textAlign: "left",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    fontSize: "12.5px",
                    color: "var(--ink)",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px" }}>
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Print / Save as PDF
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Filter Row with Working Dropdowns */}
      <div className="row" style={{ marginBottom: "12px", gap: "10px", flexWrap: "wrap", position: "relative" }}>
        {/* Status segment */}
        <div className="seg" style={{ cursor: "pointer" }}>
          <span
            className={statusFilter === "All" ? "on" : ""}
            onClick={() => setStatusFilter("All")}
          >
            All {TOTAL_FINDINGS}
          </span>
          <span
            className={statusFilter === "Open" ? "on" : ""}
            onClick={() => setStatusFilter("Open")}
          >
            Open {OPEN_FINDINGS}
          </span>
          <span
            className={statusFilter === "Fixed" ? "on" : ""}
            onClick={() => setStatusFilter("Fixed")}
          >
            Fixed {FIXED_FINDINGS}
          </span>
        </div>

        {/* 1. Severity Dropdown Filter */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="chip"
            onClick={() => setOpenDropdown(openDropdown === "sev" ? null : "sev")}
            style={{
              cursor: "pointer",
              background: severityFilter !== "ANY" ? "color-mix(in srgb, var(--brand) 15%, var(--surface))" : "var(--surface)",
              borderColor: severityFilter !== "ANY" ? "var(--brand)" : "var(--line)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>Severity: {severityFilter === "ANY" ? "Any" : severityFilter}</span>
            <svg className="i" viewBox="0 0 24 24" style={{ width: "11px", height: "11px" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {openDropdown === "sev" && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                boxShadow: "0 10px 24px rgba(0, 0, 0, 0.25)",
                padding: "4px",
                minWidth: "150px",
                zIndex: 100,
              }}
            >
              {[
                { label: "Any Severity", val: "ANY" },
                { label: `HIGH only (${countBySeverity("HIGH")})`, val: "HIGH" },
                { label: `MED only (${countBySeverity("MED")})`, val: "MED" },
                { label: `LOW only (${countBySeverity("LOW")})`, val: "LOW" },
              ].map((item) => (
                <div
                  key={item.val}
                  onClick={() => {
                    setSeverityFilter(item.val as any);
                    setOpenDropdown(null);
                  }}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "5px",
                    fontSize: "12px",
                    cursor: "pointer",
                    background: severityFilter === item.val ? "var(--surface2)" : "transparent",
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = severityFilter === item.val ? "var(--surface2)" : "transparent")}
                >
                  <span>{item.label}</span>
                  {severityFilter === item.val && (
                    <svg className="i" viewBox="0 0 24 24" style={{ width: "12px", height: "12px", color: "var(--brand)" }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Category Dropdown Filter */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="chip"
            onClick={() => setOpenDropdown(openDropdown === "cat" ? null : "cat")}
            style={{
              cursor: "pointer",
              background: categoryFilter !== "ANY" ? "color-mix(in srgb, var(--brand) 15%, var(--surface))" : "var(--surface)",
              borderColor: categoryFilter !== "ANY" ? "var(--brand)" : "var(--line)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>Category: {categoryFilter === "ANY" ? "Any" : categoryFilter}</span>
            <svg className="i" viewBox="0 0 24 24" style={{ width: "11px", height: "11px" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {openDropdown === "cat" && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                boxShadow: "0 10px 24px rgba(0, 0, 0, 0.25)",
                padding: "4px",
                minWidth: "170px",
                zIndex: 100,
              }}
            >
              {[
                { label: "Any Category", val: "ANY" },
                { label: "Security", val: "Security" },
                { label: "Database", val: "Database" },
                { label: "Concurrency", val: "Concurrency" },
                { label: "Cloud Security", val: "Cloud Security" },
              ].map((item) => (
                <div
                  key={item.val}
                  onClick={() => {
                    setCategoryFilter(item.val);
                    setOpenDropdown(null);
                  }}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "5px",
                    fontSize: "12px",
                    cursor: "pointer",
                    background: categoryFilter === item.val ? "var(--surface2)" : "transparent",
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = categoryFilter === item.val ? "var(--surface2)" : "transparent")}
                >
                  <span>{item.label}</span>
                  {categoryFilter === item.val && (
                    <svg className="i" viewBox="0 0 24 24" style={{ width: "12px", height: "12px", color: "var(--brand)" }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Source Dropdown Filter */}
        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="chip"
            onClick={() => setOpenDropdown(openDropdown === "src" ? null : "src")}
            style={{
              cursor: "pointer",
              background: sourceFilter !== "ANY" ? "color-mix(in srgb, var(--brand) 15%, var(--surface))" : "var(--surface)",
              borderColor: sourceFilter !== "ANY" ? "var(--brand)" : "var(--line)",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>Source: {sourceFilter === "ANY" ? "Any" : sourceFilter}</span>
            <svg className="i" viewBox="0 0 24 24" style={{ width: "11px", height: "11px" }}>
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {openDropdown === "src" && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "4px",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                boxShadow: "0 10px 24px rgba(0, 0, 0, 0.25)",
                padding: "4px",
                minWidth: "160px",
                zIndex: 100,
              }}
            >
              {[
                { label: "Any Source", val: "ANY" },
                { label: "DAST (Dynamic)", val: "DAST" },
                { label: "Repo scan (Static)", val: "Repo scan" },
              ].map((item) => (
                <div
                  key={item.val}
                  onClick={() => {
                    setSourceFilter(item.val);
                    setOpenDropdown(null);
                  }}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "5px",
                    fontSize: "12px",
                    cursor: "pointer",
                    background: sourceFilter === item.val ? "var(--surface2)" : "transparent",
                    color: "var(--ink)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = sourceFilter === item.val ? "var(--surface2)" : "transparent")}
                >
                  <span>{item.label}</span>
                  {sourceFilter === item.val && (
                    <svg className="i" viewBox="0 0 24 24" style={{ width: "12px", height: "12px", color: "var(--brand)" }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <span className="mono sub" style={{ fontSize: "11.5px", marginLeft: "auto" }}>
          Showing {filteredFindings.length} of {ALL_FINDINGS.length} findings
        </span>
      </div>

      {/* Main Table + 380px Right Drawer Grid */}
      <div
        className="grid"
        style={{
          gridTemplateColumns: isDetailOpen ? "1fr 380px" : "1fr",
          alignItems: "start",
          gap: "14px",
        }}
      >
        {/* Findings Table */}
        <div className="card" style={{ padding: "14px 6px 6px", overflowX: "auto" }}>
          {filteredFindings.length === 0 ? (
            <div style={{ padding: "32px 16px", textAlign: "center", color: "var(--ink2)" }}>
              No findings match the current filter selection.{" "}
              <button
                type="button"
                className="btn sm sec"
                onClick={resetFilters}
                style={{ marginLeft: "8px", cursor: "pointer" }}
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <table className="t">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Finding</th>
                  <th>Location</th>
                  <th>Category</th>
                  <th>Source</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredFindings.map((f) => {
                  const isSelected = f.id === selectedFindingId && isDetailOpen;
                  return (
                    <tr
                      key={f.id}
                      onClick={() => {
                        setSelectedFindingId(f.id);
                        setIsDetailOpen(true);
                      }}
                      style={{
                        cursor: "pointer",
                        background: isSelected
                          ? "color-mix(in srgb, var(--brand) 7%, var(--surface))"
                          : "transparent",
                      }}
                    >
                      <td>
                        {f.severity === "HIGH" && <span className="sev sevH">HIGH</span>}
                        {f.severity === "MED" && <span className="sev sevM">MED</span>}
                        {f.severity === "LOW" && (
                          <span
                            className="sev"
                            style={{
                              background: "color-mix(in srgb, var(--pass) 12%, var(--surface))",
                              color: "var(--pass)",
                              border: "1px solid color-mix(in srgb, var(--pass) 36%, var(--line))",
                            }}
                          >
                            LOW
                          </span>
                        )}
                      </td>
                      <td>
                        <b>{f.title}</b>
                      </td>
                      <td className="m">{f.location}</td>
                      <td>{f.category}</td>
                      <td className="m">{f.source}</td>
                      <td>
                        {f.status === "Open" ? (
                          <span className="chip warn">Open</span>
                        ) : (
                          <span className="chip pass">
                            <svg className="i" viewBox="0 0 24 24">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                            Fixed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* 380px Right Detail Drawer */}
        {isDetailOpen && selectedFinding && (
          <div className="card" style={{ position: "sticky", top: "18px" }}>
            <div className="row" style={{ flexWrap: "wrap", gap: "8px" }}>
              {selectedFinding.severity === "HIGH" && <span className="sev sevH">HIGH</span>}
              {selectedFinding.severity === "MED" && <span className="sev sevM">MED</span>}
              {selectedFinding.severity === "LOW" && (
                <span
                  className="sev"
                  style={{
                    background: "color-mix(in srgb, var(--pass) 12%, var(--surface))",
                    color: "var(--pass)",
                    border: "1px solid color-mix(in srgb, var(--pass) 36%, var(--line))",
                  }}
                >
                  LOW
                </span>
              )}
              <span className="eyebrow">
                {selectedFinding.category} · {selectedFinding.source}
              </span>
              <button
                type="button"
                onClick={() => setIsDetailOpen(false)}
                style={{
                  marginLeft: "auto",
                  color: "var(--ink2)",
                  cursor: "pointer",
                  display: "grid",
                  placeItems: "center",
                  background: "transparent",
                  border: "none",
                }}
                aria-label="Close detail drawer"
              >
                <svg className="i" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <h3
              className="disp"
              style={{
                fontSize: "19px",
                fontWeight: 600,
                margin: "10px 0 6px",
                lineHeight: 1.25,
              }}
            >
              {selectedFinding.title}
            </h3>

            <p style={{ margin: 0, color: "var(--ink2)", fontSize: "12.5px" }}>
              {selectedFinding.description}
            </p>

            <div className="mono" style={{ margin: "12px 0", fontSize: "11.5px", color: "var(--ink2)" }}>
              {selectedFinding.location} · Truth Rank {selectedFinding.truthRank || 1}
              {selectedFinding.problemId && ` · Catalog ${selectedFinding.problemId}`}
            </div>

            <div className="grid" style={{ gap: "8px", marginBottom: "12px" }}>
              {[
                {
                  label: "Naive fix",
                  verdict: selectedFinding.naiveVerdict,
                  reason: selectedFinding.naiveReason,
                  icon: (
                    <svg className="i" viewBox="0 0 24 24" style={{ color: "var(--fail)" }}>
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  ),
                },
                {
                  label: "Safe fix",
                  verdict: selectedFinding.safeVerdict,
                  reason: selectedFinding.safeReason,
                  icon: (
                    <svg className="i" viewBox="0 0 24 24" style={{ color: "var(--pass)" }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ),
                },
              ].map((row) => (
                <div key={row.label}>
                  <div
                    className="row"
                    style={{
                      justifyContent: "space-between",
                      border: "1px solid var(--line)",
                      borderRadius: "7px",
                      padding: "8px 10px",
                    }}
                  >
                    <span className="row">
                      {row.icon}
                      {row.label}
                    </span>
                    <span
                      className={`chip ${row.verdict ? VERDICT_CHIP_CLASS[row.verdict] || "warn" : "warn"}`}
                    >
                      {row.verdict || "Not evaluated"}
                    </span>
                  </div>
                  {row.reason && (
                    <div
                      className="sub"
                      style={{ fontSize: "11.5px", marginTop: "5px", lineHeight: 1.5 }}
                    >
                      {row.reason}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="eyebrow" style={{ marginBottom: "6px" }}>
              Suggested patch
            </div>
            <div className="code">
              <div className="ln del">
                <s>-</s>
                <em>{selectedFinding.patchDeleted}</em>
              </div>
              <div className="ln add">
                <s>+</s>
                <em>{selectedFinding.patchAdded}</em>
              </div>
            </div>

            <div className="row" style={{ marginTop: "14px", gap: "8px" }}>
              {roleDef.canSelfHeal && (
                <button
                  type="button"
                  className="btn"
                  onClick={handleSelfHeal}
                  style={{ cursor: "pointer" }}
                >
                  <svg className="i" viewBox="0 0 24 24">
                    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
                    <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" />
                  </svg>
                  {selectedFinding.problemId ? "Self-Heal (Nemotron)" : "Open in Studio"}
                </button>
              )}
              <button
                type="button"
                className="btn sec"
                onClick={handleOpenCockpit}
                style={{ cursor: "pointer" }}
              >
                Open in Cockpit
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function FindingsPage() {
  return (
    <Suspense fallback={<div className="card">Loading Findings...</div>}>
      <FindingsContent />
    </Suspense>
  );
}
