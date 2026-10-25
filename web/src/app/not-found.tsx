"use client";

import Link from "next/link";
import { TENANT_BOUNDARY_UUID } from "@/lib/roles";

export default function NotFound() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "calc(100vh - 120px)",
        padding: "32px",
        textAlign: "center",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "560px",
          width: "100%",
          padding: "36px 32px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          border: "1px solid var(--line)",
          background: "var(--surface)",
          borderRadius: "10px",
        }}
      >
        <div className="row" style={{ gap: "8px" }}>
          <span className="chip fail" style={{ fontWeight: 600 }}>
            HTTP 404
          </span>
          <span className="chip mono">LOCKED DECISION D13</span>
        </div>

        <h1
          className="disp"
          style={{
            fontSize: "28px",
            fontWeight: 600,
            margin: "4px 0",
            color: "var(--ink)",
          }}
        >
          Resource Not Found
        </h1>

        <p
          style={{
            fontSize: "13.5px",
            lineHeight: 1.6,
            color: "var(--ink2)",
            margin: 0,
          }}
        >
          The requested task, verification run, or artifact does not exist within the active tenant boundary. Cross-tenant queries are cryptographically blocked and strictly return HTTP 404.
        </p>

        <div
          className="mono"
          style={{
            width: "100%",
            padding: "10px 14px",
            background: "var(--surface2)",
            border: "1px solid var(--line)",
            borderRadius: "7px",
            fontSize: "11px",
            color: "var(--ink)",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
          }}
        >
          <div style={{ color: "var(--ink2)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Active Tenant Boundary
          </div>
          <div>{TENANT_BOUNDARY_UUID}</div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "12px", width: "100%" }}>
          <Link
            href="/"
            className="btn brand"
            style={{
              flex: 1,
              justifyContent: "center",
              textDecoration: "none",
              padding: "9px 16px",
              borderRadius: "7px",
            }}
          >
            ← Return to Dashboard
          </Link>
          <Link
            href="/ledger"
            className="btn"
            style={{
              justifyContent: "center",
              textDecoration: "none",
              padding: "9px 16px",
              borderRadius: "7px",
            }}
          >
            Inspect Ledger
          </Link>
        </div>
      </div>
    </div>
  );
}
