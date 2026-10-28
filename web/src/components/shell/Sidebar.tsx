"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ROLES, TeamMember } from "@/lib/roles";
import BrandLogo from "@/components/common/BrandLogo";

interface SidebarProps {
  onOpenNewTaskModal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export default function Sidebar({
  onOpenNewTaskModal,
  isMobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, activeMember, switchMember, logout } = useAuth();
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  // Persistent sidebar collapse state (width 72px vs 260px)
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      try {
        return localStorage.getItem("proofstack_sidebar_collapsed") === "true";
      } catch {}
    }
    return false;
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.style.setProperty(
        "--side-w",
        isCollapsed ? "72px" : "260px"
      );
    }
  }, [isCollapsed]);

  const toggleCollapsed = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("proofstack_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  const roleDef = ROLES[role] || ROLES.developer;

  // Click outside to close switcher popover
  useEffect(() => {
    const handleDocClick = (e: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(e.target as Node)) {
        setIsSwitcherOpen(false);
      }
    };
    if (isSwitcherOpen) {
      document.addEventListener("mousedown", handleDocClick);
    }
    return () => document.removeEventListener("mousedown", handleDocClick);
  }, [isSwitcherOpen]);

  const isRouteActive = (route: string) => {
    if (route === "/") return pathname === "/";
    return pathname.startsWith(route);
  };

  // Strict link visibility rules:
  // - Developer sees: Dashboard, Studio, Cockpit, Settings
  // - Security Auditor sees: Dashboard, Findings, Ledger, Cockpit, Settings
  // - Workspace Admin sees: Dashboard, Control Plane, 19-Catalog, Findings, Settings
  // - Super Admin sees: Dashboard, Control Plane, Ledger, Settings
  const showStudio = role === "developer";
  const showCockpit = role === "developer" || role === "auditor";
  const showFindings = role === "auditor" || role === "admin";
  const showLedger = role === "auditor" || role === "super_admin";
  const showCatalog = role === "admin";
  const showControlPlane = role === "admin" || role === "super_admin";

  return (
    <>
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          aria-hidden="true"
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            WebkitBackdropFilter: "blur(4px)",
            zIndex: 199,
          }}
        />
      )}
      <aside
        className={`side ${isMobileOpen ? "mobile-sidebar-open" : ""}`}
        style={{
          width: isCollapsed ? "72px" : "260px",
          minWidth: isCollapsed ? "72px" : "260px",
          maxWidth: isCollapsed ? "72px" : "260px",
          padding: isCollapsed ? "16px 8px 14px" : "18px 14px 14px",
          flex: "none",
          position: "relative",
          zIndex: 200,
          transition: "width 200ms cubic-bezier(0.16, 1, 0.3, 1), min-width 200ms ease, max-width 200ms ease, padding 200ms ease, transform 200ms ease",
          overflowX: "hidden",
        }}
      >
        {/* Top Brand & Collapse/Expand Header */}
        <div
          style={{
            display: "flex",
            flexDirection: isCollapsed ? "column" : "row",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            gap: isCollapsed ? "8px" : "0",
            padding: isCollapsed ? "0 0 14px" : "0 4px 16px",
            borderBottom: "1px solid var(--side-line)",
            marginBottom: "12px",
          }}
        >
          {!isCollapsed ? (
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
                minWidth: 0,
                overflow: "hidden",
              }}
            >
              <BrandLogo size="sm" showTagline={true} />
            </Link>
          ) : (
            <Link href="/" title="ProofStack Autonomous Engine" style={{ textDecoration: "none", color: "inherit" }}>
              <BrandLogo size="icon" />
            </Link>
          )}

          {/* Crisp Collapse / Expand Toggle Button */}
          <button
            type="button"
            onClick={toggleCollapsed}
            title={isCollapsed ? "Expand sidebar (260px)" : "Collapse sidebar (72px)"}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            style={{
              background: "var(--side-line)",
              border: "1px solid color-mix(in srgb, var(--side-ink) 14%, transparent)",
              borderRadius: "6px",
              width: "26px",
              height: "26px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--side-ink)",
              fontSize: "12px",
              fontWeight: 700,
              flex: "none",
              transition: "all 120ms ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "color-mix(in srgb, var(--side-ink) 15%, var(--side-line))")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "var(--side-line)")}
          >
            {isCollapsed ? "»" : "«"}
          </button>
        </div>

        {/* Navigation Group Header */}
        {!isCollapsed && (
          <div className="navgrp" style={{ paddingTop: "2px", paddingBottom: "6px" }}>
            {role === "developer"
              ? "Developer Workspace"
              : role === "auditor"
              ? "Auditor Workspace"
              : role === "admin"
              ? "Workspace Admin"
              : "Super Admin Root"}
          </div>
        )}

        {/* 1. Dashboard (Always visible) */}
        <Link
          href="/dashboard"
          className={`nav ${pathname === "/dashboard" ? "on" : ""}`}
          title={isCollapsed ? "Dashboard" : undefined}
          onClick={onCloseMobile}
          style={{
            justifyContent: isCollapsed ? "center" : "flex-start",
            padding: isCollapsed ? "0" : "0 10px",
          }}
        >
          <svg className="i" viewBox="0 0 24 24">
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
          {!isCollapsed && <span>Dashboard</span>}
        </Link>

        {/* Dedicated Role Portal */}
        {roleDef.primaryRoute && (
          <Link
            href={roleDef.primaryRoute}
            className={`nav ${isRouteActive(roleDef.primaryRoute) ? "on" : ""}`}
            title={isCollapsed ? `${roleDef.label} Portal` : undefined}
            onClick={onCloseMobile}
            style={{
              justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "0" : "0 10px",
            }}
          >
            <svg className="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {!isCollapsed && (
              <span>
                {role === "super_admin"
                  ? "CISO Portal"
                  : role === "admin"
                  ? "Admin Portal"
                  : role === "auditor"
                  ? "Auditor Portal"
                  : "Developer Portal"}
              </span>
            )}
          </Link>
        )}

        {/* 2. Studio (Developer ONLY) */}
        {showStudio && (
          <Link
            href="/studio"
            className={`nav ${isRouteActive("/studio") ? "on" : ""}`}
            title={isCollapsed ? "Studio" : undefined}
            onClick={onCloseMobile}
            style={{
              justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "0" : "0 10px",
            }}
          >
            <svg className="i" viewBox="0 0 24 24">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            {!isCollapsed && <span>Studio</span>}
          </Link>
        )}

        {/* 3. Control Plane (Super Admin & Workspace Admin ONLY) */}
        {showControlPlane && (
          <Link
            href="/control-plane"
            className={`nav ${isRouteActive("/control-plane") ? "on" : ""}`}
            title={isCollapsed ? "Control Plane" : undefined}
            onClick={onCloseMobile}
            style={{
              justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "0" : "0 10px",
            }}
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
            {!isCollapsed && <span>Control Plane</span>}
          </Link>
        )}

        {/* 4. 19-Catalog (Workspace Admin ONLY) */}
        {showCatalog && (
          <Link
            href="/catalog"
            className={`nav ${isRouteActive("/catalog") ? "on" : ""}`}
            title={isCollapsed ? "19-Catalog" : undefined}
            onClick={onCloseMobile}
            style={{
              justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "0" : "0 10px",
            }}
          >
            <svg className="i" viewBox="0 0 24 24">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
            {!isCollapsed && <span>19-Catalog</span>}
          </Link>
        )}

        {/* 5. Findings (Security Auditor & Workspace Admin) */}
        {showFindings && (
          <Link
            href="/findings"
            className={`nav ${isRouteActive("/findings") ? "on" : ""}`}
            title={isCollapsed ? "Findings" : undefined}
            onClick={onCloseMobile}
            style={{
              justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "0" : "0 10px",
            }}
          >
            <svg className="i" viewBox="0 0 24 24">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            {!isCollapsed && (
              <>
                <span>Findings</span>
                <span className="tag">6</span>
              </>
            )}
          </Link>
        )}

        {/* 6. Ledger (Security Auditor & Super Admin) */}
        {showLedger && (
          <Link
            href="/ledger"
            className={`nav ${isRouteActive("/ledger") ? "on" : ""}`}
            title={isCollapsed ? "Ledger" : undefined}
            onClick={onCloseMobile}
            style={{
              justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "0" : "0 10px",
            }}
          >
            <svg className="i" viewBox="0 0 24 24">
              <ellipse cx="12" cy="5" rx="9" ry="3" />
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
            </svg>
            {!isCollapsed && <span>Ledger</span>}
          </Link>
        )}

        {/* 7. Cockpit (Developer & Security Auditor) */}
        {showCockpit && (
          <Link
            href="/cockpit/TASK9142"
            className={`nav ${isRouteActive("/cockpit") ? "on" : ""}`}
            title={isCollapsed ? "Cockpit" : undefined}
            onClick={onCloseMobile}
            style={{
              justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "0" : "0 10px",
            }}
          >
            <svg className="i" viewBox="0 0 24 24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            {!isCollapsed && (
              <>
                <span>Cockpit</span>
                <span className="tag">TASK9142</span>
              </>
            )}
          </Link>
        )}

        {/* 8. Settings (Always visible) */}
        <Link
          href="/settings"
          className={`nav ${isRouteActive("/settings") ? "on" : ""}`}
          title={isCollapsed ? "Settings" : undefined}
          onClick={onCloseMobile}
          style={{
            justifyContent: isCollapsed ? "center" : "flex-start",
            padding: isCollapsed ? "0" : "0 10px",
          }}
        >
          <svg className="i" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          {!isCollapsed && <span>Settings</span>}
        </Link>

        {/* User Card with Multi-User Avatar Switcher in Bottom */}
        <div className="sidefoot" ref={switcherRef} style={{ position: "relative", marginTop: "auto" }}>
          {/* Active persona preview card */}
          <div
            className="usercard"
            style={{
              cursor: "pointer",
              transition: "background 100ms",
              justifyContent: isCollapsed ? "center" : "flex-start",
              padding: isCollapsed ? "8px 0 0" : "8px 6px 0",
            }}
            onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
            title={
              isCollapsed
                ? `${activeMember.name} (${roleDef.label})`
                : `${activeMember.name} — Account Options`
            }
          >
            <div
              className="avatar"
              style={{
                fontSize: "17px",
                display: "grid",
                placeItems: "center",
                background: "var(--surface2)",
                border: "1.5px solid var(--line)",
              }}
            >
              {activeMember.avatar}
            </div>

            {!isCollapsed && (
              <>
                <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                  <b style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>
                    {activeMember.name}
                  </b>
                  <span style={{ fontSize: "10px", color: "var(--brand)", letterSpacing: "0.4px" }}>
                    {roleDef.label.toUpperCase()}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                  }}
                  title="Sign out"
                  style={{ background: "transparent", border: "none", color: "var(--ink3)", cursor: "pointer", padding: "4px" }}
                >
                  <svg className="i" style={{ width: "14px", height: "14px" }} viewBox="0 0 24 24">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                </button>
              </>
            )}
          </div>

          {/* User Account Popover */}
          {isSwitcherOpen && (
            <div
              style={{
                position: "absolute",
                bottom: "calc(100% + 8px)",
                left: isCollapsed ? "76px" : "4px",
                width: "250px",
                background: "var(--surface)",
                border: "1px solid var(--line)",
                borderRadius: "12px",
                boxShadow: "0 18px 40px rgba(0, 0, 0, 0.28)",
                zIndex: 1000,
                padding: "12px",
                animation: "fadeIn 120ms ease-out",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingBottom: "8px", borderBottom: "1px solid var(--line)", marginBottom: "8px" }}>
                <span style={{ fontSize: "20px" }}>{activeMember.avatar}</span>
                <div style={{ minWidth: 0, flex: 1 }}>
                  <b style={{ fontSize: "12.5px", color: "var(--ink)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {activeMember.name}
                  </b>
                  <div style={{ fontSize: "10.5px", color: "var(--ink2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {activeMember.title || roleDef.label}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "3px", marginBottom: "8px" }}>
                <Link
                  href="/settings"
                  onClick={() => setIsSwitcherOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--ink)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg className="i" viewBox="0 0 24 24" style={{ width: "13px", height: "13px" }}>
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>Account Settings</span>
                </Link>
                <Link
                  href={roleDef.primaryRoute || "/dashboard"}
                  onClick={() => setIsSwitcherOpen(false)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "6px 8px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    color: "var(--ink)",
                    textDecoration: "none",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <svg className="i" viewBox="0 0 24 24" style={{ width: "13px", height: "13px", color: "var(--brand)" }}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Role Portal ({roleDef.label})</span>
                </Link>
              </div>

                {role === "developer" && (
                  <div style={{ marginTop: "4px", paddingTop: "6px", borderTop: "1px solid var(--line)", marginBottom: "6px" }}>
                    <div style={{ fontSize: "10px", color: "var(--ink3)", textTransform: "uppercase", padding: "2px 8px 4px", fontWeight: 600 }}>
                      Switch Developer Identity
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        switchMember("nitin-pandey");
                        setIsSwitcherOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "5px 8px",
                        borderRadius: "6px",
                        fontSize: "11.5px",
                        color: activeMember.id === "nitin-pandey" ? "var(--brand)" : "var(--ink)",
                        fontWeight: activeMember.id === "nitin-pandey" ? 700 : 500,
                        background: activeMember.id === "nitin-pandey" ? "var(--surface2)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span>👨‍💻</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Nitin Pandey</span>
                      {activeMember.id === "nitin-pandey" && <span style={{ color: "var(--brand)" }}>✓</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        switchMember("nikhil-lakra");
                        setIsSwitcherOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        width: "100%",
                        padding: "5px 8px",
                        borderRadius: "6px",
                        fontSize: "11.5px",
                        color: activeMember.id === "nikhil-lakra" ? "var(--brand)" : "var(--ink)",
                        fontWeight: activeMember.id === "nikhil-lakra" ? 700 : 500,
                        background: activeMember.id === "nikhil-lakra" ? "var(--surface2)" : "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      <span>👨‍💻</span>
                      <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Nikhil Lakra</span>
                      {activeMember.id === "nikhil-lakra" && <span style={{ color: "var(--brand)" }}>✓</span>}
                    </button>
                  </div>
                )}
              <div style={{ paddingTop: "8px", borderTop: "1px solid var(--line)" }}>
                <button
                  type="button"
                  className="btn sm danger"
                  onClick={() => {
                    setIsSwitcherOpen(false);
                    logout();
                  }}
                  style={{ width: "100%", justifyContent: "center", fontSize: "11.5px", height: "28px" }}
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
      <style>{`
        @media (max-width: 960px) {
          aside.side {
            position: fixed !important;
            top: 0 !important;
            bottom: 0 !important;
            left: 0 !important;
            height: 100vh !important;
            transform: translateX(-100%);
            box-shadow: none;
          }
          aside.side.mobile-sidebar-open {
            transform: translateX(0) !important;
            box-shadow: 0 0 40px rgba(0, 0, 0, 0.45) !important;
          }
        }
      `}</style>
    </>
  );
}
