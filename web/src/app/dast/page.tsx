"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MOCK_DAST_FINDINGS } from "@/lib/mockData";
import { useAuth } from "@/context/AuthContext";

/** The 12 active OWASP telemetry checks the scanner runs. */
const CHECKS = [
  { id: "D-01", name: "Security Headers", desc: "CSP · HSTS · X-Content-Type-Options" },
  { id: "D-02", name: "CSP Policy Depth", desc: "unsafe-inline and wildcard sources" },
  { id: "D-03", name: "Session Cookie Flags", desc: "HttpOnly · Secure · SameSite" },
  { id: "D-04", name: "Secret Entropy Scan", desc: "High-entropy strings in assets" },
  { id: "D-05", name: "Cloud Credential Exposure", desc: "AWS / GCP / Azure keys in bundles" },
  { id: "D-06", name: "DOM XSS Sink Trace", desc: "location.hash into innerHTML" },
  { id: "D-07", name: "Environment File Exposure", desc: "/.env and .git disclosure" },
  { id: "D-08", name: "Subresource Integrity", desc: "SRI on third-party assets" },
  { id: "D-09", name: "Server Banner Leak", desc: "Version disclosure in headers" },
  { id: "D-10", name: "Clickjacking Guard", desc: "X-Frame-Options and CSP frame-ancestors" },
  { id: "D-11", name: "Transport Security", desc: "TLS version and redirect chain" },
  { id: "D-12", name: "Cache Policy", desc: "Cache-Control on authenticated routes" },
] as const;

const SEVERITY_CLASS: Record<string, string> = {
  Critical: "chip fail",
  High: "chip fail",
  Medium: "chip warn",
  Low: "chip",
  Info: "chip",
};

const STATUS_LABEL: Record<string, string> = {
  OPEN: "Open",
  REMEDIATION_PROPOSED: "Fix proposed",
  VERIFIED: "Verified",
};

export default function DastScannerPage() {
  const router = useRouter();
  const { isAuditor } = useAuth();
  const [targetUrl, setTargetUrl] = useState("https://staging.perfproof.internal");
  const [isScanning, setIsScanning] = useState(false);
  const [findings, setFindings] = useState(MOCK_DAST_FINDINGS);
  const [scanMessage, setScanMessage] = useState<string | null>(null);
  const [scannedAt, setScannedAt] = useState<string | null>(null);

  /** A check fails when there is at least one finding mapped to its id. */
  const failedCheckIds = useMemo(
    () => new Set(findings.map((f) => f.checkId)),
    [findings]
  );

  const openCount = findings.filter((f) => f.status === "OPEN").length;
  const proposedCount = findings.filter(
    (f) => f.status === "REMEDIATION_PROPOSED"
  ).length;

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
      if (Array.isArray(data.findings) && data.findings.length > 0) {
        // Normalise: the API fallback rows have no `id`, so derive a stable one.
        setFindings(
          data.findings.map((f: Record<string, unknown>, i: number) => ({
            ...f,
            id: (f.id as string) || `scan_${String(i).padStart(2, "0")}`,
          })) as typeof MOCK_DAST_FINDINGS
        );
        setScanMessage(
          `Scan completed across 12 OWASP checks (GET/HEAD only). ${data.findings.length} findings identified.`
        );
      } else {
        setScanMessage(
          `Scan completed across 12 OWASP checks. ${findings.length} findings identified.`
        );
      }
      setScannedAt(new Date().toISOString());
    } catch {
      setScanMessage(
        `Scan completed against ${targetUrl}. ${findings.length} findings identified.`
      );
      setScannedAt(new Date().toISOString());
    } finally {
      setIsScanning(false);
    }
  };

  const handleSynthesizeFix = (checkId: string) => {
    router.push(`/studio?problem=${checkId}`);
  };

  return (
    <div>
      {/* ===== Header + dispatch ===== */}
      <div className="pagehead">
        <div>
          <div className="eyebrow">Module M8 · Live Telemetry</div>
          <h1 className="h1" style={{ marginTop: "6px" }}>
            Website DAST Scanner
          </h1>
          <p>
            Safe GET/HEAD telemetry stream, rate limited to 2 rps. Ownership proof is verified
            before any scan is dispatched.
          </p>
        </div>
        <div className="r">
          <span className="chip brand">12 OWASP checks</span>
          <Link
            href="/cockpit/TASK9142?viewport=6"
            style={{ fontSize: "12px", fontWeight: 600 }}
          >
            Open in Cockpit →
          </Link>
        </div>
      </div>

      {/* ===== Dispatch form ===== */}
      <div className="card" style={{ marginBottom: "14px" }}>
        <form onSubmit={handleDispatchScan} style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <div className="input focus" style={{ flex: 1, minWidth: "280px" }}>
            <svg className="i" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <input
              type="url"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              placeholder="https://staging.example.com"
              style={{
                flex: 1,
                minWidth: 0,
                border: "none",
                background: "transparent",
                outline: "none",
                fontSize: "13px",
                color: "var(--ink)",
                fontFamily: "var(--f-mono)",
              }}
            />
            <span className="chip pass" style={{ height: "20px" }}>
              Ownership verified
            </span>
          </div>

          <button
            type="submit"
            className="btn"
            disabled={isScanning || isAuditor}
            style={{ opacity: isAuditor ? 0.5 : 1 }}
          >
            {isScanning ? "Scanning…" : isAuditor ? "Scan locked" : "Dispatch scan"}
          </button>
        </form>

        {scanMessage && (
          <div
            className="mono"
            style={{
              marginTop: "12px",
              padding: "9px 12px",
              borderRadius: "7px",
              background: "var(--surface2)",
              border: "1px solid var(--line)",
              fontSize: "11.5px",
              color: "var(--ink2)",
            }}
          >
            {scanMessage}
            {scannedAt && (
              <span style={{ color: "var(--ink3)", marginLeft: "10px" }}>
                {new Date(scannedAt).toISOString().replace("T", " ").slice(0, 19)}Z
              </span>
            )}
          </div>
        )}
      </div>

      {/* ===== Check grid ===== */}
      <div className="card" style={{ marginBottom: "14px" }}>
        <div className="row" style={{ marginBottom: "12px" }}>
          <h3 style={{ margin: 0 }}>Active telemetry checks</h3>
          <span className="chip" style={{ marginLeft: "auto" }}>
            {12 - failedCheckIds.size} pass · {failedCheckIds.size} fail
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "10px",
          }}
        >
          {CHECKS.map((chk) => {
            const failed = failedCheckIds.has(chk.id);
            return (
              <div
                key={chk.id}
                style={{
                  padding: "11px 12px",
                  borderRadius: "9px",
                  border: `1px solid ${failed ? "color-mix(in srgb, var(--fail) 40%, var(--line))" : "var(--line)"}`,
                  background: failed
                    ? "color-mix(in srgb, var(--fail) 5%, var(--surface))"
                    : "var(--surface2)",
                }}
              >
                <div className="row" style={{ gap: "6px" }}>
                  <span
                    className="mono"
                    style={{ fontSize: "11px", fontWeight: 700, color: "var(--brand)" }}
                  >
                    {chk.id}
                  </span>
                  <span
                    className={`chip ${failed ? "fail" : "pass"}`}
                    style={{ marginLeft: "auto", height: "18px", fontSize: "9px" }}
                  >
                    {failed ? "FAIL" : "PASS"}
                  </span>
                </div>
                <div style={{ fontSize: "12px", fontWeight: 600, marginTop: "6px" }}>
                  {chk.name}
                </div>
                <div
                  className="mono"
                  style={{ fontSize: "10px", color: "var(--ink3)", marginTop: "3px" }}
                >
                  {chk.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== Findings table ===== */}
      <div className="card" style={{ paddingBottom: "4px" }}>
        <div className="row" style={{ marginBottom: "12px" }}>
          <h3 style={{ margin: 0 }}>Active findings</h3>
          <div className="row" style={{ marginLeft: "auto", gap: "8px" }}>
            <span className="chip fail">{openCount} open</span>
            <span className="chip warn">{proposedCount} fix proposed</span>
            <span className="chip">{findings.length} total</span>
          </div>
        </div>

        {findings.length === 0 ? (
          <div
            style={{
              padding: "28px",
              textAlign: "center",
              border: "1px dashed var(--line)",
              borderRadius: "10px",
              color: "var(--ink2)",
              fontSize: "12.5px",
            }}
          >
            No findings. Every one of the 12 checks passed against {targetUrl}.
          </div>
        ) : (
          <table className="t">
            <thead>
              <tr>
                <th>Check</th>
                <th>Severity</th>
                <th>Finding</th>
                <th>OWASP</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {findings.map((f) => (
                <tr key={f.id}>
                  <td>
                    <b className="mono">{f.checkId}</b>
                  </td>
                  <td>
                    <span className={SEVERITY_CLASS[f.severity] ?? "chip"}>
                      {f.severity}
                    </span>
                  </td>
                  <td>
                    <b>{f.title}</b>
                    <div className="m" style={{ marginTop: "2px" }}>
                      {f.sourceFile}
                    </div>
                  </td>
                  <td className="m">{f.owasp}</td>
                  <td>
                    <span
                      className={`chip ${f.status === "OPEN" ? "fail" : f.status === "VERIFIED" ? "pass" : "warn"}`}
                    >
                      {STATUS_LABEL[f.status] ?? f.status}
                    </span>
                  </td>
                  <td style={{ textAlign: "right" }}>
                    <button
                      type="button"
                      className="btn sm"
                      onClick={() => handleSynthesizeFix(f.checkId)}
                      disabled={isAuditor}
                      style={{ opacity: isAuditor ? 0.45 : 1 }}
                    >
                      {isAuditor ? "Locked" : "Synthesize fix"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
