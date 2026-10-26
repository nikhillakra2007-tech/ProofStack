"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ShieldCheck,
  Home,
  Code2,
  BookOpen,
  Database,
  Globe,
  Lock,
  Plus,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Sliders,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface SidebarProps {
  onOpenNewTaskModal: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  onOpenNewTaskModal,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();
  const { session, role, isAdmin, isSuperAdmin, isAuditor, logout } = useAuth();

  const navItems = [
    { label: "Workspace Home", href: "/", icon: Home, hidden: false },
    { label: "Code Studio", href: "/studio", icon: Code2, hidden: isAuditor },
    { label: "Problem Library", href: "/library", icon: BookOpen, hidden: false },
    { label: "Evidence Ledger", href: "/ledger", icon: Database, hidden: false },
    { label: "Live DAST Scanner", href: "/dast", icon: Globe, hidden: false },
  ];

  if (pathname === "/login") return null;

  return (
    <aside
      className={`relative z-40 bg-ink-900 border-r border-[#1E293B] flex flex-col justify-between transition-all duration-300 ease-in-out shrink-0 select-none ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Top Header & Logo */}
      <div className="flex flex-col">
        <div className="h-16 px-4 flex items-center justify-between border-b border-[#1E293B]">
          <Link href="/" className="flex items-center gap-3 overflow-hidden group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-white text-sm tracking-tight truncate">
                    ProofStack
                  </span>
                  <span className="px-1.5 py-0.2 text-[9px] font-mono tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                    v2.4
                  </span>
                </div>
                <span className="text-[10px] text-ink-400 font-mono truncate -mt-0.5">
                  DevSecOps Studio
                </span>
              </div>
            )}
          </Link>

          {/* Collapse Toggle Button */}
          <button
            onClick={onToggleCollapse}
            className="p-1 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors shrink-0"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Primary CTA: [+ Ingest Repo / New Task] */}
        {!isAuditor && (
          <div className="p-3">
            <button
              onClick={onOpenNewTaskModal}
              className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/20 border border-emerald-400/30 group ${
                isCollapsed ? "px-2" : "px-4"
              }`}
              title="Ingest custom repository or launch new task"
            >
              <Plus className="w-4 h-4 text-emerald-200 stroke-[3] group-hover:rotate-90 transition-transform" />
              {!isCollapsed && <span className="truncate">Ingest Repo / New Task</span>}
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5">
          {!isCollapsed && (
            <span className="text-[10px] font-mono uppercase tracking-wider text-ink-500 px-3 pb-1 block">
              Core Workspaces
            </span>
          )}

          {navItems
            .filter((item) => !item.hidden)
            .map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-indigo-600/20 text-white border border-indigo-500/40 shadow-sm"
                      : "text-ink-300 hover:text-white hover:bg-ink-850"
                  } ${isCollapsed ? "justify-center" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-colors ${
                      isActive ? "text-indigo-400" : "text-ink-400 group-hover:text-ink-200"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
        </nav>
      </div>

      {/* Footer / Control Plane & User Badge */}
      <div className="p-3 border-t border-[#1E293B] space-y-2">
        {/* Control Plane Link (Strictly Admin & Super Admin) */}
        {isAdmin && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all group ${
              pathname.startsWith("/admin")
                ? "bg-purple-600/20 text-white border border-purple-500/40"
                : "text-ink-300 hover:text-white hover:bg-ink-850"
            } ${isCollapsed ? "justify-center" : ""}`}
            title={isCollapsed ? "Control Plane" : undefined}
          >
            <Lock className="w-4 h-4 shrink-0 text-purple-400" />
            {!isCollapsed && (
              <div className="flex items-center justify-between flex-1 truncate">
                <span className="truncate">Control Plane</span>
                {isSuperAdmin && (
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    OVERRIDE
                  </span>
                )}
              </div>
            )}
          </Link>
        )}

        {/* User Card & Sign Out */}
        <div
          className={`p-2.5 rounded-xl bg-ink-950 border border-hairline flex items-center justify-between gap-2 ${
            isCollapsed ? "flex-col" : ""
          }`}
        >
          <div className="flex items-center gap-2 truncate">
            <div className="w-7 h-7 rounded-lg bg-ink-800 border border-hairline flex items-center justify-center text-indigo-400 shrink-0 font-bold font-mono text-xs">
              {role.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-[11px] font-bold text-white uppercase tracking-wider font-mono truncate">
                  {role.replace("_", " ")}
                </span>
                <span className="text-[10px] text-ink-400 font-mono truncate">
                  {session?.email || "active session"}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-ink-400 hover:text-rose-400 hover:bg-ink-900 rounded-lg transition-colors shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
