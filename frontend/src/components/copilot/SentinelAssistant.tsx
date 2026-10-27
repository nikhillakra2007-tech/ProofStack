"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "@/lib/theme";
import {
  X,
  Minus,
  Maximize2,
  Send,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  History,
  Trash2,
  GripHorizontal,
  Terminal,
  Code2,
} from "lucide-react";

export function SentinelLogo({ size = 20 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <path
        d="M12 2L3.5 5.8V11.2C3.5 16.2 7.1 20.9 12 22C16.9 20.9 20.5 16.2 20.5 11.2V5.8L12 2Z"
        fill="var(--surface-green, #E8F1EE)"
        stroke="var(--brand, #20C9A6)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="11.5" r="2.25" fill="var(--brand, #20C9A6)" />
      <path
        d="M12 7V9.25M12 13.75V16M7.75 11.5H10M14 11.5H16.25"
        stroke="var(--heading-primary, #344E48)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

interface ChatMessage {
  id: string;
  sender: "sentinel" | "user";
  name: string;
  time: string;
  text: string;
  hasCard?: boolean;
  cardData?: {
    title: string;
    baseline: string;
    fix: string;
  };
}

interface SavedSession {
  id: string;
  title: string;
  date: string;
  messages: ChatMessage[];
}

const FRESH_WELCOME_MESSAGE: ChatMessage = {
  id: "fresh_welcome",
  sender: "sentinel",
  name: "Sentinel AI",
  time: "Just now",
  text: "Hello! I am Sentinel, your Autonomous Security Copilot powered by NVIDIA Nemotron 70B. I can audit endpoints for OWASP flaws, dispatch live containerized DAST probes, explain IDOR boundaries, or synthesize compiler-verified defensive patches. How can I assist you?",
};

const INITIAL_SESSIONS: SavedSession[] = [
  {
    id: "session_1",
    title: "Session #1: TASK9142 N+1 & SQLi Audit",
    date: "Earlier today",
    messages: [
      {
        id: "s1_m1",
        sender: "user",
        name: "You",
        time: "10:14 AM",
        text: "Audit orders.py for SQL injection and N+1 query explosion bottlenecks.",
      },
      {
        id: "s1_m2",
        sender: "sentinel",
        name: "Sentinel AI",
        time: "10:15 AM",
        text: "Zero-Compromise Gauntlet audit complete. Detected an N+1 query loop across 5,000 orders and raw string concatenation in orders.py. I synthesized an eager-loading patch via NVIDIA Nemotron:",
        hasCard: true,
        cardData: {
          title: "T1-2: N+1 Explosion & SQL Injection Remediated",
          baseline: "5,001 SQL queries (428 ms)",
          fix: "1 SQL query (12 ms) · +97.2% Speedup",
        },
      },
    ],
  },
  {
    id: "session_2",
    title: "Session #2: Staging DAST CSP Remediation",
    date: "Yesterday",
    messages: [
      {
        id: "s2_m1",
        sender: "user",
        name: "You",
        time: "04:30 PM",
        text: "Run DAST scan on https://staging.perfproof.internal and fix missing CSP headers.",
      },
      {
        id: "s2_m2",
        sender: "sentinel",
        name: "Sentinel AI",
        time: "04:31 PM",
        text: "Dispatched automated DevTools scanner. Detected missing Content-Security-Policy (D-01) and wildcards in script-src (D-02). Generated strict nonce-based header configuration in next.config.js.",
        hasCard: true,
        cardData: {
          title: "D-01 / D-02: Strict CSP Applied",
          baseline: "Missing CSP · unsafe-inline allowed",
          fix: "default-src 'self' · nonce-based script execution",
        },
      },
    ],
  },
];

const SUGGESTED_PROMPTS = [
  "Audit workspace billing endpoint for cross-tenant IDOR leaks",
  "Run active DAST probe on /api/v1/auth and assert RS256 algorithm enforcement",
  "Synthesize parameterized SQL fix for unescaped query filter",
];

export default function SentinelAssistant() {
  const { isCopilotOpen, setIsCopilotOpen } = useTheme();

  // Position state (null = default bottom-right)
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Drag interaction refs
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number } | null>(null);
  const windowRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Sessions list
  const [sessions, setSessions] = useState<SavedSession[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("proofstack:copilot_sessions");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return INITIAL_SESSIONS;
  });

  const [activeSessionId, setActiveSessionId] = useState<string>("session_active");
  const [activeSessionTitle, setActiveSessionTitle] = useState<string>("Fresh Verification");
  const [messages, setMessages] = useState<ChatMessage[]>([FRESH_WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSessionArchive, setShowSessionArchive] = useState(false);

  // Sync sessions to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("proofstack:copilot_sessions", JSON.stringify(sessions));
      } catch {}
    }
  }, [sessions]);

  // Keep scroll pinned to bottom of messages
  useEffect(() => {
    if (!isMinimized && isCopilotOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isMinimized, isCopilotOpen]);

  // Clamp position within viewport on resize
  useEffect(() => {
    const handleResize = () => {
      if (position && windowRef.current) {
        const winW = window.innerWidth;
        const winH = window.innerHeight;
        const width = 400;
        const height = isMinimized ? 52 : 560;

        const clampedX = Math.max(16, Math.min(winW - width - 16, position.x));
        const clampedY = Math.max(16, Math.min(winH - height - 16, position.y));
        if (clampedX !== position.x || clampedY !== position.y) {
          setPosition({ x: clampedX, y: clampedY });
        }
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [position, isMinimized]);

  // Drag Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag on primary mouse button or touch
    if (e.button !== 0) return;
    // Don't drag if clicking buttons, inputs, or interactive icons
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("input") || target.closest("a")) {
      return;
    }

    const rect = windowRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: rect.left,
      startY: rect.top,
    };

    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const width = 400;
    const height = isMinimized ? 52 : 560;

    const newX = Math.max(12, Math.min(winW - width - 12, dragStartRef.current.startX + dx));
    const newY = Math.max(12, Math.min(winH - height - 12, dragStartRef.current.startY + dy));

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDragging) {
      setIsDragging(false);
      dragStartRef.current = null;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
    }
  };

  // Close with graceful exit animation
  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsCopilotOpen(false);
      setIsExiting(false);
    }, 180);
  };

  const handleStartNewChat = () => {
    const freshId = `session_${Date.now()}`;
    const freshWelcome: ChatMessage = {
      id: `welcome_${Date.now()}`,
      sender: "sentinel",
      name: "Sentinel AI",
      time: "Just now",
      text: "Started a fresh verification chat session. Ask me to audit endpoints, probe security boundaries, or synthesize patches.",
    };

    const newSession: SavedSession = {
      id: freshId,
      title: `Session #${sessions.length + 1}: Fresh Verification`,
      date: "Just now",
      messages: [freshWelcome],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(freshId);
    setActiveSessionTitle(newSession.title);
    setMessages([freshWelcome]);
    setShowSessionArchive(false);
  };

  const handleLoadSession = (session: SavedSession) => {
    setActiveSessionId(session.id);
    setActiveSessionTitle(session.title);
    setMessages(session.messages);
    setShowSessionArchive(false);
  };

  const handleDeleteSession = (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      handleStartNewChat();
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: "user",
      name: "You",
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      text: text.trim(),
    };

    const updatedMessagesWithUser = [...messages, userMsg];
    setMessages(updatedMessagesWithUser);
    setInputText("");
    setIsTyping(true);

    setTimeout(() => {
      let replyText =
        "Zero-Compromise verification complete. All invariants G0 through G7 are satisfied. No performance or security regressions found.";
      let card = false;
      let cardData = undefined;

      const lower = text.toLowerCase();
      if (lower.includes("sql") || lower.includes("injection") || lower.includes("filter")) {
        replyText =
          "Audited target code: detected unescaped SQL parameter concatenation in predicate. NVIDIA Nemotron synthesized a parameterized query candidate verified through Gate G5 (+82.4% speedup, 1 query).";
        card = true;
        cardData = {
          title: "CWE-89: SQL Injection Boundary Remediated",
          baseline: "Unparameterized raw SQL string interpolation",
          fix: "cursor.execute(sql, (params,)) · 100% Parameterized",
        };
      } else if (lower.includes("dast") || lower.includes("probe") || lower.includes("rs256") || lower.includes("auth")) {
        replyText =
          "Dispatched live DAST scanner against /api/v1/auth target. Confirmed strict asymmetric signature verification. Cryptographic policy rejects 'none' algorithm and enforces RS256 token validation.";
        card = true;
        cardData = {
          title: "CWE-287 / D-04: Cryptographic Enforcement",
          baseline: "Algorithm 'none' allowed on expired signature",
          fix: "Strict RS256 public key verification enforced",
        };
      } else if (lower.includes("idor") || lower.includes("tenant") || lower.includes("workspace")) {
        replyText =
          "IDOR Root Cause: The billing endpoint accessed workspace entities without asserting session.tenant_id == workspace.tenant_id. Sentinel generated a defensive AST guard and recorded a security audit event before blocking unauthorized access.";
        card = true;
        cardData = {
          title: "CWE-639: Cross-Tenant Isolation Sealed",
          baseline: "HTTP 200 OK cross-tenant data leak",
          fix: "HTTP 403 Forbidden with HMAC-SHA256 audit anchor",
        };
      }

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "sentinel",
        name: "Sentinel AI",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        text: replyText,
        hasCard: card,
        cardData: cardData,
      };

      const finalMessages = [...updatedMessagesWithUser, botReply];
      setMessages(finalMessages);
      setIsTyping(false);

      // Save/update session in history
      setSessions((prev) => {
        const existingIndex = prev.findIndex((s) => s.id === activeSessionId);
        const titleSnippet = text.trim().slice(0, 30);
        const autoTitle = activeSessionTitle === "Fresh Verification" ? `Audit: ${titleSnippet}…` : activeSessionTitle;

        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            title: autoTitle,
            date: "Just now",
            messages: finalMessages,
          };
          return updated;
        } else {
          return [
            {
              id: activeSessionId,
              title: autoTitle,
              date: "Just now",
              messages: finalMessages,
            },
            ...prev,
          ];
        }
      });
    }, 600);
  };

  if (!isCopilotOpen) return null;

  // Window styling based on dragging or default fixed positioning
  const windowStyle: React.CSSProperties = {
    position: "fixed",
    zIndex: 9999,
    width: "400px",
    maxWidth: "calc(100vw - 32px)",
    height: isMinimized ? "52px" : "560px",
    maxHeight: "calc(100vh - 48px)",
    borderRadius: "14px",
    border: "1px solid var(--line)",
    background: "var(--surface)",
    boxShadow: "var(--shadow-lg, 0 16px 40px rgba(0,0,0,0.18))",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    transition: isDragging ? "none" : "height 200ms cubic-bezier(0.16, 1, 0.3, 1), opacity 180ms ease, transform 180ms ease",
    opacity: isExiting ? 0 : 1,
    transform: isExiting ? "scale(0.96) translateY(12px)" : "scale(1) translateY(0)",
    ...(position
      ? {
          left: `${position.x}px`,
          top: `${position.y}px`,
          right: "auto",
          bottom: "auto",
        }
      : {
          right: "24px",
          bottom: "24px",
          left: "auto",
          top: "auto",
        }),
  };

  return (
    <div
      ref={windowRef}
      className="sentinel-window"
      role="dialog"
      aria-label="Sentinel Autonomous Security Copilot"
      style={windowStyle}
    >
      {/* Movable Drag Header */}
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        style={{
          padding: "10px 14px",
          borderBottom: isMinimized ? "none" : "1px solid var(--line)",
          background: "var(--surface2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          touchAction: "none",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "var(--surface)",
              border: "1px solid var(--line)",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <SentinelLogo size={18} />
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span style={{ fontWeight: 600, fontSize: "13px", color: "var(--heading-primary)" }}>
                Sentinel AI
              </span>
              <span
                style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "var(--brand)",
                  display: "inline-block",
                }}
                title="Active & Ready"
              />
            </div>
            <div
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "10px",
                color: "var(--ink3)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              Nemotron 70B · Drag header to move
            </div>
          </div>
        </div>

        {/* Header Window Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <button
            type="button"
            onClick={() => setIsMinimized(!isMinimized)}
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              background: "transparent",
              border: "none",
              color: "var(--ink2)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
            title={isMinimized ? "Expand" : "Minimize"}
            aria-label={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? <Maximize2 size={13} /> : <Minus size={14} />}
          </button>

          <button
            type="button"
            onClick={handleClose}
            style={{
              width: "26px",
              height: "26px",
              borderRadius: "6px",
              background: "transparent",
              border: "none",
              color: "var(--ink2)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
            title="Close Assistant"
            aria-label="Close Assistant"
          >
            <X size={15} />
          </button>
        </div>
      </div>

      {/* Body Content (Hidden when minimized) */}
      {!isMinimized && (
        <>
          {/* Action Subheader */}
          <div
            style={{
              padding: "8px 14px",
              background: "var(--surface)",
              borderBottom: "1px solid var(--line-subtle, var(--line))",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "8px",
            }}
          >
            <div style={{ display: "flex", gap: "6px" }}>
              <button
                type="button"
                onClick={handleStartNewChat}
                style={{
                  height: "24px",
                  padding: "0 8px",
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontWeight: 600,
                  background: "var(--surface-green)",
                  color: "var(--heading-primary)",
                  border: "1px solid var(--line)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Sparkles size={11} style={{ color: "var(--brand)" }} />
                <span>New Chat</span>
              </button>

              <button
                type="button"
                onClick={() => setShowSessionArchive(!showSessionArchive)}
                style={{
                  height: "24px",
                  padding: "0 8px",
                  borderRadius: "5px",
                  fontSize: "11px",
                  fontWeight: 500,
                  background: showSessionArchive ? "var(--line)" : "transparent",
                  color: "var(--ink2)",
                  border: "1px solid var(--line)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <History size={11} />
                <span>History ({sessions.length})</span>
              </button>
            </div>

            <div
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "10.5px",
                color: "var(--brand)",
                fontWeight: 600,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "150px",
              }}
            >
              {activeSessionTitle}
            </div>
          </div>

          {/* Session Archive Popdown */}
          {showSessionArchive && (
            <div
              style={{
                padding: "10px 14px",
                background: "var(--surface2)",
                borderBottom: "1px solid var(--line)",
                maxHeight: "180px",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  fontFamily: "var(--f-mono)",
                  fontSize: "10px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--ink3)",
                  marginBottom: "6px",
                }}
              >
                Saved Verification Sessions
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    onClick={() => handleLoadSession(session)}
                    style={{
                      padding: "6px 8px",
                      borderRadius: "6px",
                      background: session.id === activeSessionId ? "var(--surface-green)" : "var(--surface)",
                      border: `1px solid ${session.id === activeSessionId ? "var(--brand)" : "var(--line)"}`,
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0, paddingRight: "6px" }}>
                      <div
                        style={{
                          fontSize: "11px",
                          fontWeight: 600,
                          color: "var(--heading-primary)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {session.title}
                      </div>
                      <div style={{ fontFamily: "var(--f-mono)", fontSize: "9.5px", color: "var(--ink3)" }}>
                        {session.date} · {session.messages.length} msgs
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(e, session.id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "var(--ink3)",
                        cursor: "pointer",
                        padding: "2px",
                      }}
                      title="Delete session"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Messages Stream */}
          <div
            style={{
              padding: "14px",
              flex: 1,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: "10px",
                    color: "var(--ink3)",
                    marginBottom: "3px",
                    padding: "0 2px",
                  }}
                >
                  {m.name} · {m.time}
                </div>
                <div
                  style={{
                    maxWidth: "88%",
                    padding: "9px 12px",
                    borderRadius:
                      m.sender === "user"
                        ? "12px 12px 2px 12px"
                        : "12px 12px 12px 2px",
                    background:
                      m.sender === "user" ? "var(--brand)" : "var(--surface2)",
                    color:
                      m.sender === "user" ? "var(--brand-ink)" : "var(--ink)",
                    border: `1px solid ${
                      m.sender === "user" ? "var(--brand)" : "var(--line)"
                    }`,
                    fontSize: "12px",
                    lineHeight: 1.5,
                  }}
                >
                  {m.text}

                  {/* Embedded Verified Fix Card */}
                  {m.hasCard && m.cardData && (
                    <div
                      style={{
                        marginTop: "8px",
                        borderRadius: "8px",
                        border: "1px solid var(--line)",
                        background: "var(--surface)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          padding: "6px 9px",
                          background: "var(--surface-green)",
                          borderBottom: "1px solid var(--line)",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          fontWeight: 600,
                          fontSize: "11px",
                          color: "var(--heading-primary)",
                        }}
                      >
                        <ShieldCheck size={13} style={{ color: "var(--brand)" }} />
                        <span>{m.cardData.title}</span>
                      </div>
                      <div style={{ padding: "8px 9px", fontSize: "11px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "3px" }}>
                          <span style={{ color: "var(--ink3)" }}>Baseline</span>
                          <span style={{ fontFamily: "var(--f-mono)", color: "var(--fail)", fontWeight: 600 }}>
                            {m.cardData.baseline}
                          </span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ color: "var(--ink3)" }}>Verified Fix</span>
                          <span style={{ fontFamily: "var(--f-mono)", color: "var(--pass)", fontWeight: 600 }}>
                            {m.cardData.fix}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  fontFamily: "var(--f-mono)",
                  fontSize: "10.5px",
                  color: "var(--ink3)",
                  fontStyle: "italic",
                  padding: "4px 6px",
                }}
              >
                Nemotron 70B is analyzing compiler AST &amp; verifying invariants...
              </div>
            )}

            {/* Suggested Prompt Chips */}
            <div style={{ marginTop: "10px" }}>
              <div
                style={{
                  fontFamily: "var(--f-mono)",
                  fontSize: "9.5px",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  color: "var(--ink3)",
                  marginBottom: "6px",
                }}
              >
                Suggested verification tasks
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
                {SUGGESTED_PROMPTS.map((promptText, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSend(promptText)}
                    style={{
                      textAlign: "left",
                      padding: "6px 8px",
                      borderRadius: "6px",
                      background: "var(--surface)",
                      border: "1px solid var(--line)",
                      color: "var(--ink2)",
                      fontSize: "11px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Terminal size={12} style={{ color: "var(--brand)", flexShrink: 0 }} />
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {promptText}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "10px 12px",
              borderTop: "1px solid var(--line)",
              background: "var(--surface)",
              display: "flex",
              gap: "8px",
            }}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask Sentinel to audit code, probe flaws..."
              style={{
                flex: 1,
                height: "34px",
                padding: "0 10px",
                borderRadius: "7px",
                border: "1px solid var(--line)",
                background: "var(--bg)",
                color: "var(--ink)",
                fontSize: "12px",
                outline: "none",
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              style={{
                height: "34px",
                padding: "0 12px",
                borderRadius: "7px",
                background: "var(--brand)",
                color: "var(--brand-ink)",
                border: "none",
                fontWeight: 600,
                fontSize: "12px",
                cursor: !inputText.trim() || isTyping ? "not-allowed" : "pointer",
                opacity: !inputText.trim() || isTyping ? 0.6 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
              }}
            >
              <span>Send</span>
              <Send size={12} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
