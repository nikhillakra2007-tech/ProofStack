"use client";

import { useEffect, useRef, useState } from "react";
import { Terminal, Copy, Check, Play, ShieldAlert } from "lucide-react";

interface TerminalViewProps {
  logs: string[];
  runId: string;
  isolationLevel: "platform" | "container";
  exitCode: number;
}

export default function TerminalView({
  logs,
  runId,
  isolationLevel,
  exitCode,
}: TerminalViewProps) {
  const [copied, setCopied] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-ink-950 border border-hairline rounded-lg overflow-hidden font-mono text-xs">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-ink-900 border-b border-hairline">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold text-white">Isolated MicroVM Sandbox Console</span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            {runId}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Isolation: {isolationLevel}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
              exitCode === 0
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-rose-500/20 text-rose-300"
            }`}
          >
            EXIT CODE: {exitCode}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-ink-800 rounded text-ink-400 hover:text-white transition-colors"
            title="Copy logs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Terminal Output Area */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1 text-ink-300 bg-ink-950 leading-relaxed select-text">
        <div className="text-ink-500 border-b border-hairline pb-2 mb-2">
          [PROOFSTACK_SANDBOX] Bootstrapping rootless microVM environment... (network=none, limits=60s, 1GB RAM)
        </div>
        {logs.map((line, idx) => {
          const isError = line.includes("ERROR") || line.includes("FAIL") || line.includes("RED");
          const isSuccess = line.includes("SUCCESS") || line.includes("PASS") || line.includes("GREEN");
          const isInfo = line.includes("INFO") || line.includes("PROBE");

          return (
            <div
              key={idx}
              className={`${
                isError
                  ? "text-rose-400 font-medium"
                  : isSuccess
                  ? "text-emerald-400 font-medium"
                  : isInfo
                  ? "text-indigo-300"
                  : "text-ink-300"
              }`}
            >
              <span className="text-ink-600 select-none mr-2">{String(idx + 1).padStart(3, "0")}</span>
              {line}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
