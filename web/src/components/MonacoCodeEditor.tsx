"use client";

import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@monaco-editor/react").then((mod) => mod.Editor),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full min-h-[380px] bg-ink-950 flex flex-col items-center justify-center font-mono text-xs text-ink-500 gap-2">
        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <span>Initializing Monaco Code Engine...</span>
      </div>
    ),
  }
);

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
    <div className="w-full border border-hairline rounded-lg overflow-hidden bg-ink-950">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={(val) => onChange(val || "")}
        theme="vs-dark"
        options={{
          readOnly,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 13,
          fontFamily: "JetBrains Mono, Menlo, monospace",
          lineNumbers: "on",
          renderWhitespace: "selection",
          tabSize: 4,
          wordWrap: "on",
          automaticLayout: true,
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
