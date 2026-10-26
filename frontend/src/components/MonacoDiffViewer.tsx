"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

const DiffEditor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.DiffEditor),
  { ssr: false, loading: () => <div className="h-96 flex items-center justify-center font-mono text-xs text-ink-500">Loading Monaco Diff Engine...</div> }
);

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
    <div className="h-96 w-full border border-hairline rounded-lg overflow-hidden bg-ink-950">
      <DiffEditor
        height="100%"
        language={language}
        original={originalCode}
        modified={modifiedCode}
        theme="vs-dark"
        options={{
          readOnly: true,
          renderSideBySide: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 12,
          fontFamily: "JetBrains Mono, monospace",
          lineNumbers: "on",
          renderWhitespace: "selection",
        }}
      />
    </div>
  );
}
