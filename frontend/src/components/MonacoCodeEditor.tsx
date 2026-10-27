"use client";

import React from "react";

interface MonacoCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  readOnly?: boolean;
  height?: string;
}

export default function MonacoCodeEditor({
  value,
  onChange,
  language = "python",
  readOnly = false,
  height = "420px",
}: MonacoCodeEditorProps) {
  return (
    <div
      style={{
        width: "100%",
        height,
        borderRadius: "8px",
        overflow: "hidden",
        border: "1px solid var(--line)",
        background: "var(--surface2)",
      }}
    >
      <textarea
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        data-language={language}
        style={{
          width: "100%",
          height: "100%",
          padding: "14px",
          background: "transparent",
          border: "none",
          outline: "none",
          color: "var(--ink)",
          fontFamily: "var(--f-mono, 'JetBrains Mono', monospace)",
          fontSize: "13px",
          lineHeight: "1.5",
          resize: "none",
        }}
      />
    </div>
  );
}
