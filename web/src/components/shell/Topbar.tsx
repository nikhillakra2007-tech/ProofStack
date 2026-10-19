"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/lib/theme";
import { ROLES } from "@/lib/roles";

interface TopbarProps {
  onOpenCommandPalette: () => void;
  onOpenNewTaskModal: () => void;
  onToggleCopilot: () => void;
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

export default function Topbar({
  onOpenCommandPalette,
  onOpenNewTaskModal,
  onToggleCopilot,
}: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { role } = useAuth();
  const { resolvedTheme, toggleTheme } = useTheme();
  const roleDef = ROLES[role] || ROLES.developer;

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotifOpen]);

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
    if (pathname === "/") {
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
          Reference <span>/</span> <b>19-Catalog</b>
        </div>
      );
    }
    if (pathname.startsWith("/control-plane")) {
      return (
        <div className="crumb">
          Administration <span>/</span> <b>Control Plane</b>
        </div>
      );
    }
    if (pathname.startsWith("/settings")) {
      return (
        <div className="crumb">
          Administration <span>/</span> <b>Settings</b>
        </div>
      );
    }
    return (
      <div className="crumb">
        Workspace <span>/</span> <b>ProofStack</b>
      </div>
    );
  };

  return (
    <header className="top">
      {/* Breadcrumb */}
      {getBreadcrumb()}

      {/* Clean Search Input Bar (No Ctrl K Gimmick Badge - Module 3 #1) */}
      <div
        className="search"
        onClick={onOpenCommandPalette}
        style={{ cursor: "pointer", width: "240px" }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onOpenCommandPalette();
          }
        }}
      >
        <svg className="i" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <span>Search tasks, hashes, files…</span>
      </div>

      {/* Functional + New Scan / Ingest button (Module 3 #2) */}
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

      {/* Public Site Link (Module 3 #2) */}
      <Link
        href="/home"
        className="btn sm sec"
        style={{ display: "inline-flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
      >
        <svg className="i" style={{ width: "13px", height: "13px" }} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        Public Site
      </Link>

      {/* Clean AI Co-Pilot top-bar button (Module 3 #1) */}
      <button
        type="button"
        className="btn sec"
        onClick={onToggleCopilot}
        style={{ cursor: "pointer" }}
      >
        <svg className="i" viewBox="0 0 24 24">
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
          <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" />
        </svg>
        AI Co-Pilot <span className="dot" style={{ marginLeft: "2px" }} />
      </button>

      {/* Working Notification Bell Dropdown (Module 3 #3) */}
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
              boxShadow: "0 16px 36px rgba(0,0,0,0.18)",
              zIndex: 300,
              overflow: "hidden",
              animation: "fadeIn 120ms ease-out",
            }}
          >
            {/* Panel Header */}
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
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <b style={{ fontSize: "13px" }}>Notifications</b>
                {unreadCount > 0 && (
                  <span className="chip brand" style={{ fontSize: "9px", height: "18px", padding: "0 6px" }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  onClick={handleMarkAllAsRead}
                  style={{
                    fontSize: "11px",
                    color: "var(--brand)",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: "2px 4px",
                  }}
                >
                  Mark read
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  style={{
                    fontSize: "11px",
                    color: "var(--ink2)",
                    cursor: "pointer",
                    padding: "2px 4px",
                  }}
                >
                  Clear
                </button>
              </div>
            </div>

            {/* Notification items list */}
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              {notifications.length === 0 ? (
                <div style={{ padding: "24px 14px", textAlign: "center", color: "var(--ink2)", fontSize: "12px" }}>
                  No active notifications
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

      {/* Sun/Moon Theme Toggle */}
      <button
        type="button"
        className="iconbtn"
        onClick={toggleTheme}
        title={`Switch to ${resolvedTheme === "light" ? "dark" : "light"} mode`}
        aria-label="Toggle color theme"
      >
        {resolvedTheme === "light" ? (
          <svg className="i" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        ) : (
          <svg className="i" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
            <line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
            <line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
            <line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
          </svg>
        )}
      </button>
    </header>
  );
}
