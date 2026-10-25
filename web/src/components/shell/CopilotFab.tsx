"use client";

import React from "react";
import { useTheme } from "@/lib/theme";

export default function CopilotFab() {
  const { isCopilotOpen, setIsCopilotOpen } = useTheme();

  return (
    <button
      type="button"
      className="fab"
      onClick={() => setIsCopilotOpen(!isCopilotOpen)}
      aria-label="Toggle AI Co-Pilot drawer"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        zIndex: 9999,
        cursor: "pointer",
        border: "none",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <svg
        style={{
          width: "16px",
          height: "16px",
          minWidth: "16px",
          minHeight: "16px",
          flexShrink: 0,
          fill: "none",
          stroke: "currentColor",
          strokeWidth: 2,
          strokeLinecap: "round",
          strokeLinejoin: "round",
        }}
        viewBox="0 0 24 24"
      >
        <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
        <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" />
      </svg>
      <div>
        AI Co-Pilot
      </div>
    </button>
  );
}
