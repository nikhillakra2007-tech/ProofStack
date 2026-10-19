"use client";

import React, { useState } from "react";
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

const SAVED_SESSIONS: SavedSession[] = [
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

  // Active chat messages start CLEAN (Fresh start)
  const [messages, setMessages] = useState<ChatMessage[]>([FRESH_WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSessionArchive, setShowSessionArchive] = useState(false);
  const [activeSessionTitle, setActiveSessionTitle] = useState("Fresh Chat");

  if (!isCopilotOpen) return null;

  const handleStartNewChat = () => {
    setMessages([
      {
        id: `welcome_${Date.now()}`,
        sender: "copilot",
        name: "ProofStack Co-Pilot",
        time: "Just now",
        text: "Started a fresh verification chat session. Ask me to audit endpoints, probe security boundaries, or synthesize patches.",
      },
    ]);
    setActiveSessionTitle("Fresh Chat");
    setShowSessionArchive(false);
  };

  const handleLoadSession = (session: SavedSession) => {
    setMessages(session.messages);
    setActiveSessionTitle(session.title);
    setShowSessionArchive(false);
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

    setMessages((prev) => [...prev, userMsg]);
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

      setMessages((prev) => [...prev, botReply]);
      setIsTyping(false);
    }, 600);
  };

  return (
    <aside
      className="drawer"
      role="complementary"
      aria-label="AI Co-Pilot Drawer"
      style={{
        zIndex: 45,
        display: "flex",
        flexDirection: "column",
        width: "420px",
      }}
    >
      {/* Drawer Header with [+ New Chat] & [Previous Chats (2)] (Module 4 #2) */}
      <div
        className="hd"
        style={{
          padding: "14px 16px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
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
            }}
          >
            <svg className="i" viewBox="0 0 24 24">
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
              display: "grid",
              placeItems: "center",
            }}
            aria-label="Close drawer"
          >
            <svg className="i" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Action Bar: [+ New Chat] and [Previous Chats (2)] buttons */}
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
            Previous Chats (2)
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
          }}
        >
          <div className="eyebrow" style={{ fontSize: "10px", marginBottom: "8px" }}>
            Saved Chat Sessions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {SAVED_SESSIONS.map((session) => (
              <div
                key={session.id}
                onClick={() => handleLoadSession(session)}
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  background: "var(--surface)",
                  border: "1px solid var(--line)",
                  cursor: "pointer",
                  transition: "background 100ms",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
              >
                <b style={{ fontSize: "12px", display: "block" }}>{session.title}</b>
                <span className="mono" style={{ fontSize: "10px", color: "var(--ink2)" }}>
                  {session.date} · {session.messages.length} messages
                </span>
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
            <div className={`bub ${m.sender === "user" ? "me" : ""}`}>
              {m.text}

              {m.hasCard && m.cardData && (
                <div
                  style={{
                    marginTop: "10px",
                    border: "1px solid var(--line)",
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
                      <svg className="i" viewBox="0 0 24 24">
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
            style={{ cursor: "pointer" }}
            title={promptText}
          >
            <svg className="i" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {promptText}
            </span>
          </div>
        ))}
      </div>

      {/* Composer Input Bar */}
      <div
        style={{
          padding: "12px 18px",
          borderTop: "1px solid var(--line)",
          display: "flex",
          gap: "8px",
          background: "var(--surface)",
        }}
      >
        <div className="input" style={{ flex: 1, height: "38px", padding: 0 }}>
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask Co-Pilot to audit code, scan target, or explain flaws…"
            style={{
              width: "100%",
              height: "100%",
              background: "transparent",
              border: "none",
              outline: "none",
              padding: "0 12px",
              fontSize: "12.5px",
              color: "var(--ink)",
              fontFamily: "var(--f-ui)",
            }}
          />
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => handleSend()}
          style={{
            width: "38px",
            height: "38px",
            padding: 0,
            justifyContent: "center",
            cursor: "pointer",
          }}
          aria-label="Send message to Co-Pilot"
        >
          <svg className="i" viewBox="0 0 24 24">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </div>
    </aside>
  );
}
