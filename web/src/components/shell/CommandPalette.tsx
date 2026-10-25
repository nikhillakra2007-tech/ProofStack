"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/roles";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenIngestModal?: () => void;
}

export default function CommandPalette({
  isOpen,
  onClose,
  onOpenIngestModal,
}: CommandPaletteProps) {
  const router = useRouter();
  const { role } = useAuth();
  const roleDef = ROLES[role] || ROLES.developer;
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const items = [
    { label: "Dashboard", category: "Navigation", path: "/", shortcut: "G D" },
    ...(roleDef.canAccessStudio
      ? [{ label: "Studio", category: "Navigation", path: "/studio", shortcut: "G S" }]
      : []),
    { label: "Cockpit (TASK9142)", category: "Navigation", path: "/cockpit/TASK9142", shortcut: "1-6" },
    { label: "Findings", category: "Navigation", path: "/findings", shortcut: "" },
    { label: "Evidence Ledger Explorer", category: "Navigation", path: "/ledger", shortcut: "G L" },
    { label: "19-Problem Specification Catalog", category: "Navigation", path: "/catalog", shortcut: "" },
    ...(roleDef.canAccessControlPlane
      ? [{ label: "SuperAdmin Control Plane", category: "Administration", path: "/control-plane", shortcut: "" }]
      : []),
    { label: "Settings & Appearance", category: "Settings", path: "/settings", shortcut: "" },
    ...(roleDef.canIngestTask
      ? [{ label: "Ingest Repo / New Task", category: "Action", action: () => { onClose(); onOpenIngestModal?.(); }, shortcut: "+ Task" }]
      : []),
    { label: "TASK9142 (orders.py:get_orders - N+1 Query Explosion)", category: "Tasks", path: "/cockpit/TASK9142" },
    { label: "TASKC02A (orders.py:get_orders - Retest)", category: "Tasks", path: "/cockpit/TASK9142" },
    { label: "F-0142: Broken Object-Level Auth (IDOR) in Cache", category: "Findings", path: "/findings" },
    { label: "D-05: Exposed Client-Side AWS Access Key in Script Bundle", category: "DAST", path: "/findings" },
    { label: "D-06: DOM-Based XSS: location.hash Flows into innerHTML", category: "DAST", path: "/findings" },
    { label: "Block #0 Hash: 8f4b238e89c132890dbaf423a8e9e19d...", category: "Hashes", path: "/ledger" },
    { label: "Block #1 Hash: 318cb92931ea789dcba2891901a8df90...", category: "Hashes", path: "/ledger" },
  ];

  const filtered = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase()) ||
    item.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="scrim"
      onClick={onClose}
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "110px",
        zIndex: 50,
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "560px",
          maxWidth: "92vw",
          padding: 0,
          boxShadow: "0 24px 60px rgba(0,0,0,0.28)",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            borderBottom: "1px solid var(--line)",
            background: "var(--surface)",
          }}
        >
          <svg className="i" viewBox="0 0 24 24" style={{ color: "var(--ink2)" }}>
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tasks, hashes, findings, pages…"
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "13.5px",
              color: "var(--ink)",
              fontFamily: "var(--f-ui)",
            }}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
            }}
          />
          <kbd
            style={{
              font: "600 10px var(--f-mono)",
              border: "1px solid var(--line)",
              borderRadius: "4px",
              padding: "2px 6px",
              color: "var(--ink2)",
              background: "var(--surface2)",
            }}
          >
            ESC
          </kbd>
        </div>

        <div style={{ maxHeight: "360px", overflowY: "auto", padding: "6px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--ink2)" }}>
              No results found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filtered.map((item, idx) => (
              <div
                key={idx}
                onClick={() => {
                  onClose();
                  if (item.action) {
                    item.action();
                  } else if (item.path) {
                    router.push(item.path);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "12.5px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--surface2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span className="chip" style={{ fontSize: "9.5px", height: "18px" }}>
                  {item.category}
                </span>
                <span style={{ flex: 1, fontWeight: 500, color: "var(--ink)" }}>
                  {item.label}
                </span>
                {item.shortcut && (
                  <span className="mono" style={{ fontSize: "10px", color: "var(--ink3)" }}>
                    {item.shortcut}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
