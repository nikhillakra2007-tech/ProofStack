"use client";

import React from "react";

interface MonacoDiffViewerProps {
  originalCode: string;
  modifiedCode: string;
  language?: string;
}

export default function MonacoDiffViewer({
  originalCode,
  modifiedCode,
  language = "python",
}: MonacoDiffViewerProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "12px",
        height: "380px",
        width: "100%",
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid var(--line)",
        background: "var(--surface2)",
        padding: "12px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="eyebrow" style={{ fontSize: "10px", marginBottom: "6px" }}>
          Baseline Code
        </div>
        <textarea
          readOnly
          value={originalCode}
          spellCheck={false}
          data-language={language}
          style={{
            flex: 1,
            width: "100%",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "6px",
            padding: "10px",
            color: "var(--ink)",
            fontFamily: "var(--f-mono, 'JetBrains Mono', monospace)",
            fontSize: "12px",
            lineHeight: "1.45",
            resize: "none",
            outline: "none",
          }}
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <div className="eyebrow" style={{ fontSize: "10px", marginBottom: "6px" }}>
          Candidate Defensive Patch
        </div>
        <textarea
          readOnly
          value={modifiedCode}
          spellCheck={false}
          data-language={language}
          style={{
            flex: 1,
            width: "100%",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: "6px",
            padding: "10px",
            color: "var(--ink)",
            fontFamily: "var(--f-mono, 'JetBrains Mono', monospace)",
            fontSize: "12px",
            lineHeight: "1.45",
            resize: "none",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}
