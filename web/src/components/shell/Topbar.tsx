"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";
import { MOCK_CATALOG } from "@/lib/mockData";
import TourGuideModal from "./TourGuideModal";
import ThemeSelector from "@/components/common/ThemeSelector";

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onOpenNewTaskModal: () => void;
  onToggleCopilot: () => void;
  onToggleMobileSidebar?: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
  path: string;
  severity?: "pass" | "warn" | "fail";
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1",
    title: "TASK9142 passed all 8 Zero-Compromise Gates",
    detail: "Candidate B verified: 1 SQL query, p95 12ms (+74.2% speedup).",
    time: "10m ago",
    read: false,
    path: "/cockpit/TASK9142",
    severity: "pass",
  },
  {
    id: "n2",
    title: "DAST Scan detected 3 High findings on staging",
    detail: "Missing CSP, exposed AWS key literal, and insecure cookie found.",
    time: "32m ago",
    read: false,
    path: "/findings",
    severity: "fail",
  },
  {
    id: "n3",
    title: "Admin updated Developer token quota to 50,000",
    detail: "Monthly token quota revised for engineering sandbox boundary.",
    time: "1h ago",
    read: false,
    path: "/control-plane",
    severity: "warn",
  },
];

const SEARCH_PAGES = [
  { title: "Studio Code Editor", category: "Pages", path: "/studio", desc: "Monaco split diff & live patch synthesis" },
  { title: "Workspace Dashboard", category: "Pages", path: "/dashboard", desc: "Platform overview & fleet status" },
  { title: "Cockpit (TASK9142)", category: "Pages", path: "/cockpit/TASK9142", desc: "Six-viewport deep diagnostic console" },
  { title: "Findings & DAST Scanner", category: "Pages", path: "/findings", desc: "Security vulnerabilities & remediations" },
  { title: "Evidence Ledger", category: "Pages", path: "/ledger", desc: "Cryptographic SHA-256 Merkle chain" },
  { title: "Benchmark Catalog", category: "Pages", path: "/catalog", desc: "19-problem industrial test suite" },
  { title: "Control Plane", category: "Pages", path: "/control-plane", desc: "Admin governance & token budgets" },
];

const SEARCH_FINDINGS = [
  { title: "D-01: Missing Security Headers (CSP, HSTS)", category: "Findings", path: "/findings?selected=D-01", desc: "next.config.js · Medium" },
  { title: "D-02: Permissive CSP Wildcards (*)", category: "Findings", path: "/findings?selected=D-02", desc: "middleware.ts · Medium" },
  { title: "D-03: Insecure Session Cookie", category: "Findings", path: "/findings?selected=D-03", desc: "src/server/auth.ts · Medium" },
  { title: "D-05: Exposed AWS Access Key Literal", category: "Findings", path: "/findings?selected=D-05", desc: ".env.production · High" },
  { title: "D-06: DOM-Based XSS (location.hash sink)", category: "Findings", path: "/findings?selected=D-06", desc: "src/components/SearchBox.tsx · High" },
  { title: "D-07: Exposed Public Environment File (/.env)", category: "Findings", path: "/findings?selected=D-07", desc: "public/.env · High" },
];

export default function Topbar({
  onOpenCommandPalette,
  onOpenNewTaskModal,
  onToggleCopilot,
  onToggleMobileSidebar,
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role, activeMember, switchMember, logout } = useAuth();
  const roleDef = ROLES[role] || ROLES.developer;

  // Notification state
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  // Persona switcher state
  const [isMemberSwitcherOpen, setIsMemberSwitcherOpen] = useState(false);
  const memberSwitcherRef = useRef<HTMLDivElement>(null);

  // Google Search-style bar state
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Interactive Tour Guide Modal state
  const [isTourGuideOpen, setIsTourGuideOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Click outside listener for notifications, search dropdown, and member switcher
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsSearchFocused(false);
      }
      if (memberSwitcherRef.current && !memberSwitcherRef.current.contains(e.target as Node)) {
        setIsMemberSwitcherOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n))
    );
    setIsNotifOpen(false);
    router.push(item.path);
  };

  // Breadcrumb generator
  const getBreadcrumb = () => {
    if (pathname === "/" || pathname === "/dashboard") {
      return (
        <div className="crumb">
          Workspace <span>/</span> <b>Dashboard</b>
        </div>
      );
    }
    if (pathname.startsWith("/studio")) {
      return (
        <div className="crumb">
          Workspace <span>/</span> <b>Studio</b>
        </div>
      );
    }
    if (pathname.startsWith("/cockpit")) {
      const parts = pathname.split("/").filter(Boolean);
      const taskId = parts[1] || "TASK9142";
      return (
        <div className="crumb">
          Workspace <span>/</span> Cockpit <span>/</span> <b>{taskId}</b>
        </div>
      );
    }
    if (pathname.startsWith("/findings")) {
      return (
        <div className="crumb">
          Workspace <span>/</span> <b>Findings</b>
        </div>
      );
    }
    if (pathname.startsWith("/ledger")) {
      return (
        <div className="crumb">
          Workspace <span>/</span> <b>Ledger</b>
        </div>
      );
    }
    if (pathname.startsWith("/catalog")) {
      return (
        <div className="crumb">
          Workspace <span>/</span> <b>Catalog</b>
        </div>
      );
    }
    if (pathname.startsWith("/control-plane")) {
      return (
        <div className="crumb">
          Workspace <span>/</span> <b>Control Plane</b>
        </div>
      );
    }
    return (
      <div className="crumb">
        Workspace <span>/</span> <b>{pathname.replace("/", "")}</b>
      </div>
    );
  };

  // Filter search results
  const q = searchQuery.toLowerCase().trim();
  const filteredPages = SEARCH_PAGES.filter(
    (p) => !q || p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
  );
  const filteredFindings = SEARCH_FINDINGS.filter(
    (f) => !q || f.title.toLowerCase().includes(q) || f.desc.toLowerCase().includes(q)
  );
  const filteredProblems = MOCK_CATALOG.filter(
    (p) =>
      !q ||
      p.id.toLowerCase().includes(q) ||
      p.title.toLowerCase().includes(q) ||
      (p.filename || "").toLowerCase().includes(q)
  ).slice(0, 6);

  const hasAnyResults =
    filteredPages.length > 0 || filteredFindings.length > 0 || filteredProblems.length > 0;

  const handleSelectSearchResult = (path: string) => {
    setIsSearchFocused(false);
    setSearchQuery("");
    router.push(path);
  };

  return (
    <header className="top" style={{ position: "relative" }}>
      {/* Mobile Sidebar Hamburger Toggle */}
      {onToggleMobileSidebar && (
        <button
          type="button"
          className="mobile-topbar-hamburger"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Navigation Sidebar"
          style={{
            display: "none",
            background: "var(--surface2)",
            border: "1px solid var(--line)",
            borderRadius: "6px",
            width: "32px",
            height: "32px",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--ink)",
            flex: "none",
            marginRight: "6px",
          }}
        >
          <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      )}

      {/* Breadcrumb */}
      {getBreadcrumb()}

      {/* Google Search-Style Pill Search Bar */}
      <div
        ref={searchContainerRef}
        className="top-search-container"
        style={{
          position: "relative",
          width: "320px",
          maxWidth: "340px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            height: "36px",
            background: isSearchFocused ? "var(--surface)" : "var(--surface2)",
            border: isSearchFocused ? "1.6px solid var(--brand)" : "1px solid var(--line)",
            borderRadius: "9999px",
            padding: "0 12px 0 34px",
            position: "relative",
            transition: "all 140ms ease",
            boxShadow: isSearchFocused ? "0 2px 10px rgba(0,0,0,0.12)" : "none",
          }}
        >
          {/* Left Magnifier Icon */}
          <svg
            style={{
              position: "absolute",
              left: "11px",
              width: "15px",
              height: "15px",
              color: isSearchFocused ? "var(--brand)" : "var(--ink2)",
              pointerEvents: "none",
            }}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>

          {/* Search Input */}
          <input
            type="text"
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                setIsSearchFocused(false);
              }
            }}
            placeholder="Search pages, findings, code files…"
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: "12.5px",
              color: "var(--ink)",
              fontFamily: "var(--f-ui)",
            }}
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--ink2)",
                cursor: "pointer",
                padding: "2px 4px",
                fontSize: "12px",
                display: "grid",
                placeItems: "center",
              }}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Compact Attached Dropdown Result List */}
        {isSearchFocused && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              width: "380px",
              maxHeight: "390px",
              overflowY: "auto",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "12px",
              boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
              zIndex: 1000,
              padding: "6px",
              animation: "fadeIn 100ms ease-out",
            }}
          >
            {!hasAnyResults ? (
              <div style={{ padding: "14px", textAlign: "center", fontSize: "12px", color: "var(--ink2)" }}>
                No results found for &quot;{searchQuery}&quot;
              </div>
            ) : (
              <>
                {/* 1. Pages */}
                {filteredPages.length > 0 && (
                  <div>
                    <div className="eyebrow" style={{ fontSize: "9.5px", padding: "6px 10px 4px", color: "var(--ink2)" }}>
                      DESTINATIONS
                    </div>
                    {filteredPages.map((p) => (
                      <div
                        key={p.path}
                        onClick={() => handleSelectSearchResult(p.path)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "background 90ms ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div>
                          <b style={{ fontSize: "12.5px", color: "var(--ink)", display: "block" }}>{p.title}</b>
                          <span style={{ fontSize: "11px", color: "var(--ink2)" }}>{p.desc}</span>
                        </div>
                        <span className="mono" style={{ fontSize: "10.5px", color: "var(--brand)" }}>
                          {p.path} →
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 2. Problems & Code Files */}
                {filteredProblems.length > 0 && (
                  <div style={{ marginTop: "6px", borderTop: "1px solid var(--line)", paddingTop: "6px" }}>
                    <div className="eyebrow" style={{ fontSize: "9.5px", padding: "4px 10px", color: "var(--ink2)" }}>
                      BENCHMARK PROBLEMS &amp; FILES
                    </div>
                    {filteredProblems.map((prob) => (
                      <div
                        key={prob.id}
                        onClick={() => handleSelectSearchResult(`/studio?problem=${prob.id}`)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "background 90ms ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                            <span className="chip brand" style={{ fontSize: "9.5px", padding: "1px 5px" }}>
                              {prob.id}
                            </span>
                            <b style={{ fontSize: "12px", color: "var(--ink)" }}>{prob.filename || "file.py"}</b>
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "2px" }}>
                            {prob.title}
                          </div>
                        </div>
                        <span className="mono" style={{ fontSize: "10px", color: "var(--ink2)" }}>
                          Studio ↵
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 3. DAST Findings */}
                {filteredFindings.length > 0 && (
                  <div style={{ marginTop: "6px", borderTop: "1px solid var(--line)", paddingTop: "6px" }}>
                    <div className="eyebrow" style={{ fontSize: "9.5px", padding: "4px 10px", color: "var(--ink2)" }}>
                      SECURITY FINDINGS
                    </div>
                    {filteredFindings.map((f) => (
                      <div
                        key={f.path}
                        onClick={() => handleSelectSearchResult(f.path)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "7px 10px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          transition: "background 90ms ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <div>
                          <b style={{ fontSize: "12px", color: "var(--ink)" }}>{f.title}</b>
                          <div className="mono" style={{ fontSize: "10.5px", color: "var(--ink2)" }}>
                            {f.desc}
                          </div>
                        </div>
                        <span className="mono" style={{ fontSize: "10px", color: "var(--brand)" }}>
                          Inspect
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Interactive Guide / Tour Button */}
      <button
        type="button"
        className="btn sm sec"
        onClick={() => setIsTourGuideOpen(true)}
        style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "6px" }}
        title="Open interactive 5-step onboarding guide"
      >
        <svg style={{ width: "13px", height: "13px", color: "var(--brand)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
        Guide / Tour
      </button>

      {/* Functional + New Scan / Ingest button */}
      {roleDef.canIngestTask && (
        <button
          type="button"
          className="btn acc"
          onClick={onOpenNewTaskModal}
          style={{ cursor: "pointer" }}
        >
          <svg className="i" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          + New Scan / Ingest
        </button>
      )}

      {/* Accessible Theme Selector (Light / Dark / System) */}
      <ThemeSelector compact={true} />

      {/* Working Notification Bell Dropdown */}
      <div style={{ position: "relative" }} ref={notifRef}>
        <button
          type="button"
          className="iconbtn"
          onClick={() => setIsNotifOpen(!isNotifOpen)}
          title="Notifications"
          aria-label="Notifications"
          style={{ cursor: "pointer" }}
        >
          <svg className="i" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "3px",
                right: "3px",
                background: "var(--accent)",
                color: "var(--accent-ink)",
                fontSize: "9px",
                fontWeight: 700,
                width: "16px",
                height: "16px",
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                lineHeight: 1,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        {/* Notifications Popover Panel */}
        {isNotifOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "360px",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "10px",
              boxShadow: "0 14px 34px rgba(0,0,0,0.2)",
              zIndex: 100,
              overflow: "hidden",
              animation: "fadeIn 120ms ease-out",
            }}
          >
            <div
              style={{
                padding: "12px 14px",
                borderBottom: "1px solid var(--line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "var(--surface2)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <b style={{ fontSize: "13px" }}>Notifications</b>
                {unreadCount > 0 && (
                  <span className="chip brand" style={{ fontSize: "10px", padding: "1px 6px" }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllAsRead}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--brand)",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Mark read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAll}
                    style={{
                      background: "none",
                      border: "none",
                      color: "var(--ink2)",
                      fontSize: "11px",
                      cursor: "pointer",
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "24px 16px", textAlign: "center", color: "var(--ink2)", fontSize: "12px" }}>
                  No notifications yet.
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    style={{
                      padding: "10px 14px",
                      borderBottom: "1px solid var(--line)",
                      background: n.read ? "transparent" : "color-mix(in srgb, var(--brand) 4%, var(--surface))",
                      cursor: "pointer",
                      transition: "background 100ms",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = n.read
                        ? "transparent"
                        : "color-mix(in srgb, var(--brand) 4%, var(--surface))")
                    }
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "6px" }}>
                      <b style={{ fontSize: "12px", color: n.read ? "var(--ink)" : "var(--brand)" }}>
                        {n.title}
                      </b>
                      <span className="mono" style={{ fontSize: "10px", color: "var(--ink3)", whiteSpace: "nowrap" }}>
                        {n.time}
                      </span>
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--ink2)", marginTop: "3px", lineHeight: 1.4 }}>
                      {n.detail}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Authenticated User Account Menu */}
      <div style={{ position: "relative" }} ref={memberSwitcherRef}>
        <button
          type="button"
          onClick={() => setIsMemberSwitcherOpen(!isMemberSwitcherOpen)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "0 10px",
            height: "32px",
            borderRadius: "9999px",
            background: "var(--surface)",
            border: "1px solid var(--line)",
            cursor: "pointer",
            transition: "all 120ms ease",
          }}
          title={`${activeMember.name} (${roleDef.label}) — Account Options`}
          aria-expanded={isMemberSwitcherOpen}
        >
          <span style={{ fontSize: "15px", lineHeight: 1 }}>{activeMember.avatar}</span>
          <b style={{ fontSize: "12px", color: "var(--ink)", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {activeMember.name}
          </b>
          <span
            className="chip brand"
            style={{ fontSize: "9px", padding: "1px 5px", textTransform: "uppercase" }}
          >
            {roleDef.label}
          </span>
          <span style={{ fontSize: "9px", color: "var(--ink3)" }}>▾</span>
        </button>

        {/* Authenticated User Profile Dropdown */}
        {isMemberSwitcherOpen && (
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              right: 0,
              width: "280px",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              borderRadius: "12px",
              boxShadow: "0 18px 40px rgba(0, 0, 0, 0.28)",
              zIndex: 1100,
              padding: "12px",
              animation: "fadeIn 120ms ease-out",
            }}
          >
            {/* User Identity Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                paddingBottom: "10px",
                borderBottom: "1px solid var(--line)",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "var(--surface2)",
                  border: "1px solid var(--line)",
                  display: "grid",
                  placeItems: "center",
                  fontSize: "18px",
                  flexShrink: 0,
                }}
              >
                {activeMember.avatar}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <b style={{ fontSize: "13px", color: "var(--ink)", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {activeMember.name}
                </b>
                <div style={{ fontSize: "11px", color: "var(--ink2)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {activeMember.title || roleDef.label}
                </div>
                <div style={{ fontSize: "10.5px", color: "var(--ink3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontFamily: "var(--f-mono)" }}>
                  {activeMember.email}
                </div>
              </div>
            </div>

            {/* Account Metadata Strip */}
            <div
              style={{
                fontSize: "10.5px",
                fontFamily: "var(--f-mono)",
                color: "var(--ink2)",
                padding: "6px 8px",
                background: "var(--surface2)",
                borderRadius: "6px",
                marginBottom: "8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Workspace:</span>
              <strong style={{ color: "var(--ink)" }}>ProofStack Enterprise</strong>
            </div>

            {/* Quick Navigation Items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", marginBottom: "8px" }}>
              <button
                type="button"
                onClick={() => {
                  setIsMemberSwitcherOpen(false);
                  router.push(roleDef.primaryRoute || "/dashboard");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 9px",
                  borderRadius: "6px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "var(--ink)",
                  textAlign: "left",
                  width: "100%",
                  transition: "background 100ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px", color: "var(--brand)" }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>My Role Portal ({roleDef.label})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMemberSwitcherOpen(false);
                  router.push("/settings");
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 9px",
                  borderRadius: "6px",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "12px",
                  color: "var(--ink)",
                  textAlign: "left",
                  width: "100%",
                  transition: "background 100ms ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface2)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <svg className="i" viewBox="0 0 24 24" style={{ width: "14px", height: "14px", color: "var(--ink2)" }}>
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
                <span>Account Settings &amp; Preferences</span>
              </button>
            </div>

            {/* Developer Identity Switcher */}
            {role === "developer" && (
              <div style={{ paddingTop: "6px", borderTop: "1px solid var(--line)", marginBottom: "6px" }}>
                <div style={{ fontSize: "10px", color: "var(--ink3)", textTransform: "uppercase", padding: "2px 8px 4px", fontWeight: 600 }}>
                  Switch Developer Identity
                </div>
                <button
                  type="button"
                  onClick={() => {
                    switchMember("nitin-pandey");
                    setIsMemberSwitcherOpen(false);
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
                    setIsMemberSwitcherOpen(false);
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
            {/* Sign Out Button */}
            <div style={{ paddingTop: "8px", borderTop: "1px solid var(--line)" }}>
              <button
                type="button"
                onClick={() => {
                  setIsMemberSwitcherOpen(false);
                  logout();
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  width: "100%",
                  padding: "7px",
                  borderRadius: "7px",
                  background: "transparent",
                  border: "1px solid color-mix(in srgb, var(--fail) 30%, transparent)",
                  color: "var(--fail)",
                  cursor: "pointer",
                  fontSize: "12px",
                  fontWeight: 600,
                  transition: "all 120ms ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "color-mix(in srgb, var(--fail) 10%, transparent)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <svg className="i" viewBox="0 0 24 24" style={{ width: "13px", height: "13px" }}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 5-Step Interactive Tour Guide Modal */}
      <TourGuideModal
        isOpen={isTourGuideOpen}
        onClose={() => setIsTourGuideOpen(false)}
      />
    </header>
  );
}
