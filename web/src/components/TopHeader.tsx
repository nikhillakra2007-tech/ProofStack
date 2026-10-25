"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Bot,
  Sparkles,
  Server,
  ShieldCheck,
  Activity,
  Layers,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface TopHeaderProps {
  onToggleCopilot: () => void;
  copilotOpen: boolean;
}

export default function TopHeader({ onToggleCopilot, copilotOpen }: TopHeaderProps) {
  const pathname = usePathname();
  const { role, session } = useAuth();
  const [isBackendOnline, setIsBackendOnline] = useState(true);

  // Real-time ping to check backend status
  useEffect(() => {
    let isMounted = true;
    const checkBackend = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/", {
          method: "GET",
          signal: AbortSignal.timeout(1500),
        });
        if (isMounted) {
          setIsBackendOnline(res.ok);
        }
      } catch {
        if (isMounted) {
          // If port 8000 direct call blocked or offline, verify /api/tasks
          try {
            const apiRes = await fetch("/api/tasks");
            setIsBackendOnline(apiRes.ok);
          } catch {
            setIsBackendOnline(false);
          }
        }
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  if (pathname === "/login") return null;

  // Breadcrumbs calculation
  const getBreadcrumbs = () => {
    if (pathname === "/") return ["Workspace", "Dashboard Overview"];
    if (pathname.startsWith("/studio")) return ["Workspace", "Code Studio"];
    if (pathname.startsWith("/library")) return ["Knowledge Base", "19-Problem Library"];
    if (pathname.startsWith("/ledger")) return ["Compliance", "Cryptographic Evidence Ledger"];
    if (pathname.startsWith("/dast")) return ["DAST Engine", "Live Web Telemetry Scanner"];
    if (pathname.startsWith("/admin")) return ["Administration", "Control Plane & RBAC"];
    if (pathname.startsWith("/cockpit")) {
      const parts = pathname.split("/");
      const id = parts[2] || "TASK9142";
      return ["Case Explorer", `Diagnostic Cockpit (${id})`];
    }
    return ["Workspace", pathname.replace("/", "")];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="h-16 px-6 bg-ink-900/80 backdrop-blur-md border-b border-[#1E293B] flex items-center justify-between z-30 select-none">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-mono">
        <Link
          href="/"
          className="text-ink-400 hover:text-white transition-colors flex items-center gap-1.5"
        >
          <Layers className="w-3.5 h-3.5 text-indigo-400" />
          <span>ProofStack</span>
        </Link>

        {breadcrumbs.map((crumb, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <ChevronRight className="w-3.5 h-3.5 text-ink-600" />
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? "text-white font-semibold"
                  : "text-ink-400"
              }
            >
              {crumb}
            </span>
          </div>
        ))}
      </div>

      {/* Right: Real-time Backend Connection & AI Co-Pilot Toggle */}
      <div className="flex items-center gap-3">
        {/* Real-time Backend Connection Status (No static gimmick badge) */}
        <div className="flex items-center gap-2 px-3 py-1 bg-ink-950 border border-hairline rounded-lg text-[11px] font-mono">
          <Server className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-ink-400 hidden sm:inline">Backend (8000):</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                isBackendOnline
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse"
                  : "bg-amber-400"
              }`}
            />
            <span
              className={
                isBackendOnline
                  ? "text-emerald-400 font-semibold"
                  : "text-amber-400 font-semibold"
              }
            >
              {isBackendOnline ? "Connected" : "Simulated"}
            </span>
          </div>
        </div>

        {/* AI Co-Pilot Trigger Button */}
        <button
          onClick={onToggleCopilot}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all shadow-md ${
            copilotOpen
              ? "bg-indigo-600 text-white shadow-indigo-600/30 border border-indigo-400/50"
              : "bg-ink-800 text-indigo-300 hover:bg-ink-750 hover:text-white border border-indigo-500/30"
          }`}
          title="Toggle AI Co-Pilot (Ctrl + /)"
        >
          <Bot className="w-4 h-4 text-indigo-400" />
          <span>AI Co-Pilot</span>
          <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.2 bg-ink-900 text-indigo-200 rounded border border-hairline">
            Ctrl + /
          </span>
        </button>
      </div>
    </header>
  );
}
