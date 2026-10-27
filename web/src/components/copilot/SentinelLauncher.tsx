"use client";

import React from "react";
import { useTheme } from "@/lib/theme";
import { SentinelLogo } from "./SentinelAssistant";
import { Sparkles } from "lucide-react";

export default function SentinelLauncher() {
  const { isCopilotOpen, setIsCopilotOpen } = useTheme();

  return (
    <button
      type="button"
      onClick={() => setIsCopilotOpen(!isCopilotOpen)}
      className="sentinel-launcher-btn"
      aria-label="Toggle Sentinel Autonomous AI Copilot"
      aria-expanded={isCopilotOpen}
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9998,
        height: "44px",
        padding: "0 16px 0 12px",
        borderRadius: "9999px",
        background: "var(--surface)",
        color: "var(--heading-primary)",
        border: "1px solid var(--line-strong, var(--line))",
        boxShadow: "var(--shadow-md, 0 8px 24px rgba(0,0,0,0.12))",
        cursor: "pointer",
        display: "inline-flex",
        alignItems: "center",
        gap: "9px",
        fontFamily: "var(--f-ui)",
        fontSize: "13px",
        fontWeight: 600,
        transition: "all 180ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          background: "var(--surface-green)",
          border: "1px solid var(--line)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <SentinelLogo size={16} />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span>Sentinel AI</span>
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: "var(--brand)",
            display: "inline-block",
          }}
        />
      </div>
    </button>
  );
}
