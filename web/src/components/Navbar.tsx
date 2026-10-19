"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Cpu,
  BookOpen,
  Database,
  Lock,
  UserCircle,
  Activity,
  Code,
  Bot,
  Sparkles,
  Plus,
  PlusCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import NewTaskModal from "@/components/NewTaskModal";

interface NavbarProps {
  onToggleCopilot?: () => void;
  copilotOpen?: boolean;
}

export default function Navbar({ onToggleCopilot, copilotOpen }: NavbarProps) {
  const pathname = usePathname();
  const { session, role, isSuperAdmin, isAuditor } = useAuth();
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);

  const navItems = [
    { label: "Studio", href: "/studio", icon: Code, hidden: isAuditor },
    { label: "Cockpit", href: "/cockpit/TASK9142", icon: Activity, hidden: false },
    { label: "19-Catalog", href: "/catalog", icon: BookOpen, hidden: false },
    { label: "Ledger", href: "/ledger", icon: Database, hidden: false },
    { label: "Control Plane", href: "/admin", icon: Lock, hidden: !isSuperAdmin },
  ];

  if (pathname === "/login") return null;

  return (
    <header className="sticky top-0 z-50 w-full bg-ink-900/90 backdrop-blur-md border-b border-hairline">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/studio" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">ProofStack</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                  STUDIO
                </span>
              </div>
              <span className="text-[10px] text-ink-400 font-mono block -mt-1">Autonomous DevSecOps Engine</span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems
            .filter((item) => !item.hidden)
            .map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? "bg-ink-800 text-white border border-hairline shadow-sm"
                      : "text-ink-400 hover:text-ink-100 hover:bg-ink-850"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-indigo-400" : "text-ink-500"}`} />
                  {item.label}
                </Link>
              );
            })}
        </nav>

        {/* Right Status Badges & Controls */}
        <div className="flex items-center gap-2.5">
          {/* Ingest Repo / New Task Button (Developer & Super Admin) */}
          {!isAuditor && (
            <button
              onClick={() => setIsNewTaskModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold font-mono bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 hover:scale-[1.02] transition-all"
              title="Ingest custom repository or live DAST website"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-300 stroke-[3]" />
              <span className="tracking-tight">Ingest Repo / New Task</span>
            </button>
          )}

          {/* AI Co-Pilot Toggle Button */}
          {onToggleCopilot && (
            <button
              onClick={onToggleCopilot}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all shadow-md ${
                copilotOpen
                  ? "bg-indigo-600 text-white shadow-indigo-600/30 border border-indigo-400/50"
                  : "bg-ink-800 text-indigo-300 hover:bg-ink-700 border border-indigo-500/30"
              }`}
            >
              <Bot className="w-4 h-4 text-indigo-400" />
              <span>AI Co-Pilot</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          )}

          {/* MicroVM Sandbox Status */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-ink-850 border border-hairline rounded-md text-[11px] font-mono text-ink-300">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sandbox:</span>
            <span className="text-emerald-400 font-semibold">TokenFactory</span>
          </div>

          {/* User Role Badge */}
          {session && (
            <Link
              href="/login"
              title="Click to switch judge role"
              className="flex items-center gap-2 px-2.5 py-1 bg-ink-800 border border-hairline hover:border-indigo-500/50 rounded-md transition-all group"
            >
              <UserCircle className="w-4 h-4 text-indigo-400" />
              <div className="text-left">
                <span className="text-[10px] font-mono uppercase tracking-wider block text-ink-300 group-hover:text-white">
                  {role.replace("_", " ")}
                </span>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* Interactive New Task / Repo Intake Modal */}
      <NewTaskModal
        isOpen={isNewTaskModalOpen}
        onClose={() => setIsNewTaskModalOpen(false)}
      />
    </header>
  );
}
