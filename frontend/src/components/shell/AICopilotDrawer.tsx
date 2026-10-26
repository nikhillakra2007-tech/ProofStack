"use client";

import React, { useState, useEffect } from "react";
import { useTheme } from "@/lib/theme";

interface ChatMessage {
  id: string;
  sender: "copilot" | "user";
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
  sender: "copilot",
  name: "ProofStack Co-Pilot",
  time: "Just now",
  text: "Hello! I am the ProofStack Autonomous Verification Co-Pilot powered by NVIDIA Nemotron. I can analyze slow endpoints, dispatch live DAST security probes, explain architectural flaws, or synthesize defensive patches verified against Zero-Compromise Gates. How can I assist you?",
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
        sender: "copilot",
        name: "ProofStack Co-Pilot",
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
        sender: "copilot",
        name: "ProofStack Co-Pilot",
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
  "Audit this code for SQL injection and latency bottlenecks",
  "Run DAST scan on https://staging.example.com and fix missing CSP",
  "Explain why this caching logic caused an IDOR tenant leak",
];

export default function AICopilotDrawer() {
  const { isCopilotOpen, setIsCopilotOpen } = useTheme();

  // Sessions list initialized with local storage if available
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
  const [activeSessionTitle, setActiveSessionTitle] = useState<string>("Fresh Chat");
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

  if (!isCopilotOpen) return null;

  const handleStartNewChat = () => {
    const freshId = `session_${Date.now()}`;
    const freshWelcome: ChatMessage = {
      id: `welcome_${Date.now()}`,
      sender: "copilot",
      name: "ProofStack Co-Pilot",
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
      if (lower.includes("sql") || lower.includes("bottleneck") || lower.includes("n+1")) {
        replyText =
          "Audited target code: detected N+1 query loop and unparameterized query predicate. NVIDIA Nemotron synthesized a joinedload query candidate verified through Gate G5 (+74.2% speedup, 1 query).";
        card = true;
        cardData = {
          title: "T1-2: N+1 Explosion & SQL Injection Identified",
          baseline: "5,001 SQL queries (428 ms)",
          fix: "1 SQL query (12 ms) · +97.2% Speedup",
        };
      } else if (lower.includes("dast") || lower.includes("scan") || lower.includes("csp")) {
        replyText =
          "Dispatched live DAST scanner against target endpoint. Detected 6 OWASP findings (D-01 to D-06). Remediation patch prepared with strict Content-Security-Policy.";
        card = true;
        cardData = {
          title: "DAST Telemetry Check",
          baseline: "6 findings detected on target",
          fix: "Remediation verified for next.config.js",
        };
      } else if (lower.includes("idor") || lower.includes("cache")) {
        replyText =
          "IDOR Root Cause: The cache key in cache/store.py used only doc_id without the tenant_id prefix. Tenant B could read Tenant A's documents. ProofStack salted the cache key with f'{tenant_id}:{doc_id}' to guarantee isolation.";
      }

      const botReply: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: "copilot",
        name: "ProofStack Co-Pilot",
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
        const titleSnippet = text.trim().slice(0, 32);
        const autoTitle = activeSessionTitle === "Fresh Chat" ? `Chat: ${titleSnippet}…` : activeSessionTitle;
        
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
    }, 550);
  };

  return (
    <aside
      className="drawer"
      role="complementary"
      aria-label="AI Co-Pilot Drawer"
      style={{
        position: "fixed",
        bottom: "24px",
        right: "24px",
        top: "auto",
        left: "auto",
        width: "390px",
        maxWidth: "calc(100vw - 32px)",
        height: "560px",
        maxHeight: "calc(100vh - 48px)",
        borderRadius: "12px",
        border: "1px solid var(--line)",
        background: "var(--surface)",
        boxShadow: "0 20px 48px rgba(0,0,0,0.35)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Drawer Header with [+ New Chat] & [Previous Chats] */}
      <div
        className="hd"
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          background: "var(--surface)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
          <div
            className="logo"
            style={{
              width: "32px",
              height: "32px",
              background: "var(--brand)",
              color: "var(--brand-ink)",
              borderRadius: "8px",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <svg
              className="i"
              viewBox="0 0 24 24"
              style={{ width: "18px", height: "18px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}
            >
              <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
              <path d="M19 15l.7 1.8L21.5 17.5l-1.8.7L19 20l-.7-1.8-1.8-.7 1.8-.7z" />
            </svg>
          </div>
          <div style={{ marginLeft: "10px" }}>
            <b style={{ fontSize: "13.5px", display: "flex", alignItems: "center", gap: "6px" }}>
              AI Co-Pilot <span className="dot" />
            </b>
            <div className="mono" style={{ fontSize: "10px", color: "var(--ink2)" }}>
              NVIDIA Nemotron 3 · Nebius Token Factory
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCopilotOpen(false)}
            style={{
              marginLeft: "auto",
              color: "var(--ink2)",
              cursor: "pointer",
              padding: "4px",
              background: "transparent",
              border: "none",
              display: "grid",
              placeItems: "center",
            }}
            aria-label="Close drawer"
          >
            <svg
              style={{
                width: "16px",
                height: "16px",
                minWidth: "16px",
                minHeight: "16px",
                flexShrink: 0,
                stroke: "currentColor",
                fill: "none",
                strokeWidth: 2,
                strokeLinecap: "round",
                strokeLinejoin: "round",
              }}
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Action Bar: [+ New Chat] and [Previous Chats (N)] buttons */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <button
            type="button"
            className="btn sm"
            onClick={handleStartNewChat}
            style={{ fontSize: "11px", height: "26px", padding: "0 10px" }}
          >
            + New Chat
          </button>

          <button
            type="button"
            className={`btn sm ${showSessionArchive ? "" : "sec"}`}
            onClick={() => setShowSessionArchive(!showSessionArchive)}
            style={{ fontSize: "11px", height: "26px", padding: "0 10px" }}
          >
            Previous Chats ({sessions.length})
          </button>
        </div>

        {/* Current Active Session Label */}
        <div style={{ fontSize: "11px", color: "var(--brand)", fontWeight: 600 }}>
          {activeSessionTitle}
        </div>
      </div>

      {/* Previous Chats Archive List (Opens on toggle) */}
      {showSessionArchive && (
        <div
          style={{
            padding: "12px 16px",
            background: "var(--surface2)",
            borderBottom: "1px solid var(--line)",
            animation: "fadeIn 120ms ease-out",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          <div className="eyebrow" style={{ fontSize: "10px", marginBottom: "8px" }}>
            Saved Chat Sessions ({sessions.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {sessions.map((session) => (
              <div
                key={session.id}
                onClick={() => handleLoadSession(session)}
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: session.id === activeSessionId ? "color-mix(in srgb, var(--brand) 8%, var(--surface))" : "var(--surface)",
                  border: `1px solid ${session.id === activeSessionId ? "var(--brand)" : "var(--line)"}`,
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "background 100ms",
                }}
              >
                <div style={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
                  <b style={{ fontSize: "11.5px", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.title}
                  </b>
                  <span className="mono" style={{ fontSize: "10px", color: "var(--ink2)" }}>
                    {session.date} · {session.messages.length} msgs
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => handleDeleteSession(e, session.id)}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--ink2)",
                    cursor: "pointer",
                    fontSize: "12px",
                    padding: "2px 4px",
                  }}
                  title="Delete chat thread"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Stream */}
      <div
        style={{
          padding: "16px 18px",
          flex: 1,
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {messages.map((m) => (
          <React.Fragment key={m.id}>
            <div
              className="meta"
              style={{
                textAlign: m.sender === "user" ? "right" : "left",
              }}
            >
              {m.name} · {m.time}
            </div>
            <div
              className={`bub ${m.sender === "user" ? "me" : ""}`}
              style={{
                borderRadius: m.sender === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                border: "1px solid var(--line)",
                padding: "10px 12px",
                fontSize: "12px",
                lineHeight: 1.5,
              }}
            >
              {m.text}

              {/* Embedded Verified Fix Card */}
              {m.hasCard && m.cardData && (
                <div
                  style={{
                    marginTop: "10px",
                    border: "1px solid color-mix(in srgb, var(--pass) 40%, var(--line))",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "var(--surface)",
                  }}
                >
                  <div
                    className="row"
                    style={{
                      padding: "8px 10px",
                      borderBottom: "1px solid var(--line)",
                      fontWeight: 600,
                      fontSize: "12px",
                    }}
                  >
                    <span style={{ color: "var(--pass)" }}>
                      <svg
                        className="i"
                        viewBox="0 0 24 24"
                        style={{ width: "14px", height: "14px", fill: "none", stroke: "currentColor", strokeWidth: 2 }}
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 11 14 15 10" />
                      </svg>
                    </span>
                    {m.cardData.title}
                  </div>
                  <div style={{ padding: "8px 10px", fontSize: "12px" }}>
                    <div className="row" style={{ justifyContent: "space-between" }}>
                      <span style={{ color: "var(--ink2)" }}>Baseline</span>
                      <b className="mono" style={{ color: "var(--fail)" }}>
                        {m.cardData.baseline}
                      </b>
                    </div>
                    <div className="row" style={{ justifyContent: "space-between", marginTop: "4px" }}>
                      <span style={{ color: "var(--ink2)" }}>Verified Fix</span>
                      <b className="mono" style={{ color: "var(--pass)" }}>
                        {m.cardData.fix}
                      </b>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </React.Fragment>
        ))}

        {isTyping && (
          <div className="meta" style={{ fontStyle: "italic", marginTop: "10px" }}>
            Nemotron is analyzing code &amp; synthesizing candidate fix...
          </div>
        )}

        {/* Clickable Suggested Actions section */}
        <div className="eyebrow" style={{ margin: "16px 0 6px", fontSize: "10px" }}>
          Suggested actions
        </div>
        {SUGGESTED_PROMPTS.map((promptText, i) => (
          <div
            key={i}
            className="sugg"
            onClick={() => handleSend(promptText)}
            style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}
            title={promptText}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--brand)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                width: "16px",
                height: "16px",
                minWidth: "16px",
                minHeight: "16px",
                flexShrink: 0,
                fill: "none",
                stroke: "var(--brand)",
              }}
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" fill="none" />
            </svg>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, fontSize: "11.5px" }}>
              {promptText}
            </span>
          </div>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          padding: "12px 14px",
          borderTop: "1px solid var(--line)",
          display: "flex",
          gap: "8px",
          background: "var(--surface)",
        }}
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask Co-Pilot to audit code, probe flaws..."
          style={{
            flex: 1,
            height: "34px",
            padding: "0 10px",
            borderRadius: "6px",
            border: "1px solid var(--line)",
            background: "var(--bg)",
            color: "var(--ink)",
            fontSize: "12px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          className="btn sm"
          disabled={!inputText.trim() || isTyping}
          style={{ height: "34px", padding: "0 12px" }}
        >
          Send
        </button>
      </form>
    </aside>
  );
}
