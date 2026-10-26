"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES } from "@/lib/roles";

interface SidebarProps {
  onOpenNewTaskModal?: () => void;
}

export default function Sidebar({ onOpenNewTaskModal }: SidebarProps) {
  const pathname = usePathname();
  const { session, role, logout } = useAuth();
  const roleDef = ROLES[role] || ROLES.developer;

  // Initials for avatar
  const initials = role === "super_admin"
    ? "SA"
    : role === "admin"
    ? "AD"
    : role === "developer"
    ? "LD"
    : "SE";

  const isRouteActive = (route: string) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  };

  return (
    <aside className="side" style={{ width: "248px", flex: "none" }}>
      {/* Brand block (PDF p. 11 #1) */}
      <Link href="/" className="brand" style={{ cursor: "pointer", textDecoration: "none" }}>
        <div className="logo">
          <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        </div>
        <div>
          <b>ProofStack</b>
          <span>Autonomous DevSecOps Engine</span>
        </div>
      </Link>

      {/* WORKSPACE group */}
      <div className="navgrp" style={{ paddingTop: "6px" }}>
        Workspace
      </div>

      {/* Dashboard */}
      <Link
        href="/dashboard"
        className={`nav ${pathname === "/dashboard" ? "on" : ""}`}
      >
        <svg className="i" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
        <span>Dashboard</span>
      </Link>

      {/* Studio: hidden for Auditor */}
      {roleDef.canAccessStudio && (
        <Link
          href="/studio"
          className={`nav ${isRouteActive("/studio") ? "on" : ""}`}
        >
          <svg className="i" viewBox="0 0 24 24">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Studio</span>
        </Link>
      )}

      {/* Cockpit */}
      <Link
        href="/cockpit/TASK9142"
        className={`nav ${isRouteActive("/cockpit") ? "on" : ""}`}
      >
        <svg className="i" viewBox="0 0 24 24">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
        <span>Cockpit</span>
        <span className="tag">TASK9142</span>
      </Link>

      {/* Findings */}
      <Link
        href="/findings"
        className={`nav ${isRouteActive("/findings") ? "on" : ""}`}
      >
        <svg className="i" viewBox="0 0 24 24">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
        <span>Findings</span>
        <span className="tag">6</span>
      </Link>

      {/* Ledger */}
      <Link
        href="/ledger"
        className={`nav ${isRouteActive("/ledger") ? "on" : ""}`}
      >
        <svg className="i" viewBox="0 0 24 24">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
        <span>Ledger</span>
      </Link>

      {/* REFERENCE group */}
      <div className="navgrp">Reference</div>

      {/* 19-Catalog */}
      <Link
        href="/catalog"
        className={`nav ${isRouteActive("/catalog") ? "on" : ""}`}
      >
        <svg className="i" viewBox="0 0 24 24">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <span>19-Catalog</span>
      </Link>

      {/* ADMINISTRATION group */}
      <div className="navgrp">Administration</div>

      {/* Control Plane: visible ONLY to super_admin and admin */}
      {roleDef.canAccessControlPlane && (
        <Link
          href="/control-plane"
          className={`nav ${isRouteActive("/control-plane") ? "on" : ""}`}
        >
          <svg className="i" viewBox="0 0 24 24">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span>Control Plane</span>
        </Link>
      )}

      {/* Settings */}
      <Link
        href="/settings"
        className={`nav ${isRouteActive("/settings") ? "on" : ""}`}
      >
        <svg className="i" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
        <span>Settings</span>
      </Link>

      {/* User Card (bottom-left) */}
      <div className="sidefoot">
        <div
          className="usercard"
          style={{ cursor: "pointer" }}
          onClick={() => logout()}
          title="Click to sign out"
        >
          <div className="avatar">{initials}</div>
          <div>
            <b>{roleDef.label}</b>
            <span>{roleDef.label.toUpperCase()}</span>
          </div>
          <svg className="i" viewBox="0 0 24 24" aria-label="Sign out">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>
      </div>
    </aside>
  );
}
