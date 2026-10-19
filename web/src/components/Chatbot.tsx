"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "How does ProofStack verify patches?",
  "What gates does G0-G7 check?",
  "Explain the evidence ledger",
  "Show me a sample verdict",
];

const KNOWLEDGE_BASE: Record<string, string> = {
  "how does proofstack verify patches": `ProofStack uses a 5-step verification pipeline:

1. **Baseline Profile** — cProfile + pyperf measure p95 latency, SQL queries, memory
2. **Hypotheses** — Nemotron-3-Super generates 3 competing fix approaches
3. **Sandbox Probing** — Each candidate runs in an isolated microVM with network=none
4. **Patch Synthesis** — Nemotron-3.5-Lightning writes the defensive code patch
5. **Zero-Compromise Gates** — G0-G7 checks correctness, security, performance, concurrency

A patch is only accepted if ALL gates pass. Any security regression = instant REJECT.`,

  "what gates does g0-g7 check": `**G0–G7 Verification Gates:**

| Gate | Check | Fail Action |
|------|-------|-------------|
| G0 | AST integrity & lockfile diff | Reject |
| G1 | Unit test regression (28/28) | Reject |
| G2 | Exploit oracle probe (IDOR, SQLi, ReDoS) | Reject |
| G3 | Identity/authorization preservation | Reject |
| G4 | Concurrency safety (race conditions) | Reject |
| G5 | Performance speedup > τ_noise (5%) | Reject |
| G6 | Tracemalloc < 20MB growth | Reject |
| G7 | Code hygiene & supply chain | Reject |

All 8 gates must pass for ACCEPT verdict.`,

  "explain the evidence ledger": `**Cryptographic Evidence Ledger:**

Every state transition is appended to a SHA-256 hash chain:

\`\`\`
entry_hash = SHA256(prev_hash + canonical_json(body))
\`\`\`

- Block 0: Genesis / Task Intake
- Block 1: Baseline Profile
- Block 2: Candidate Patch
- Block 3: Gate Results
- Block 4: Final Verdict

Tamper any block → chain breaks → VERDICT: TAMPERED.
Ledger is append-only, non-repudiable, and exportable.`,

  "show me a sample verdict": `**Sample Verdict — TASK9142**

\`\`\`
Task: orders.py:get_orders
Mode: OPTIMIZE

Baseline: 428ms p95 · 5,001 SQL queries
Candidate B: 12ms p95 · 1 SQL query

Gates: G0 ✓ G1 ✓ G2 ✓ G3 ✓ G4 ✓ G5 ✓ G6 ✓ G7 ✓

Verdict: ACCEPT
ΔPerf: +74.2% (τ_noise = 5.0%)
Ledger: 6/6 blocks sealed · chain intact ✓
\`\`\``,
};

function findAnswer(input: string): string {
  const lower = input.toLowerCase();
  for (const [key, value] of Object.entries(KNOWLEDGE_BASE)) {
    if (lower.includes(key) || key.includes(lower)) return value;
  }
  return `I can help you understand ProofStack's verification pipeline, gates (G0-G7), evidence ledger, and sample verdicts.

Try asking:
- "How does ProofStack verify patches?"
- "What gates does G0-G7 check?"
- "Explain the evidence ledger"
- "Show me a sample verdict"`;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hey! I'm the ProofStack assistant. Ask me about verification gates, the evidence ledger, or how patches get verified.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (text?: string) => {
    const content = (text || input).trim();
    if (!content) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const answer = findAnswer(content);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* Floating chat button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: "fixed",
          bottom: "24px",
          right: "24px",
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          background: "linear-gradient(135deg, #0E1619, #152126)",
          border: "1px solid rgba(25, 227, 255, 0.3)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4), 0 0 20px rgba(25, 227, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
          cursor: "pointer",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle chatbot"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-6 h-6" style={{ color: "#19E3FF" }}>
          {isOpen ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </>
          )}
        </svg>
      </motion.button>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              position: "fixed",
              bottom: "92px",
              right: "24px",
              width: "400px",
              height: "520px",
              borderRadius: "16px",
              background: "rgba(6, 11, 13, 0.95)",
              backdropFilter: "blur(24px) saturate(1.8)",
              WebkitBackdropFilter: "blur(24px) saturate(1.8)",
              border: "1px solid rgba(25, 227, 255, 0.15)",
              boxShadow: "0 24px 64px rgba(0, 0, 0, 0.5), 0 0 40px rgba(25, 227, 255, 0.05)",
              display: "flex",
              flexDirection: "column",
              zIndex: 9998,
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 20px",
                borderBottom: "1px solid rgba(25, 227, 255, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, rgba(25, 227, 255, 0.15), rgba(91, 201, 140, 0.1))",
                  border: "1px solid rgba(25, 227, 255, 0.2)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-5 h-5" style={{ color: "#19E3FF" }}>
                  <path d="M12 2a7 7 0 0 1 7 7c0 2.4-1.2 4.5-3 5.7V17a1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1v-2.3C6.2 13.5 5 11.4 5 9a7 7 0 0 1 7-7z" />
                  <path d="M9 21h6" />
                </svg>
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600 }}>ProofStack AI</div>
                <div style={{ fontSize: "11px", color: "#5F6F74" }}>Ask about gates, ledger, verdicts</div>
              </div>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: "flex",
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "85%",
                      padding: "10px 14px",
                      borderRadius: msg.role === "user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px",
                      background: msg.role === "user" ? "rgba(25, 227, 255, 0.1)" : "rgba(255, 255, 255, 0.04)",
                      border: msg.role === "user" ? "1px solid rgba(25, 227, 255, 0.2)" : "1px solid rgba(255, 255, 255, 0.06)",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: "12px 12px 12px 4px",
                      background: "rgba(255, 255, 255, 0.04)",
                      border: "1px solid rgba(255, 255, 255, 0.06)",
                      display: "flex",
                      gap: "4px",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#19E3FF" }}
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts */}
            {messages.length <= 1 && (
              <div style={{ padding: "0 16px 8px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    style={{
                      fontSize: "11px",
                      padding: "5px 10px",
                      borderRadius: "8px",
                      border: "1px solid rgba(25, 227, 255, 0.15)",
                      color: "#8FA5AC",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#19E3FF"; e.currentTarget.style.color = "#19E3FF"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(25, 227, 255, 0.15)"; e.currentTarget.style.color = "#8FA5AC"; }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid rgba(25, 227, 255, 0.08)" }}>
              <form
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                style={{ display: "flex", gap: "8px" }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about ProofStack..."
                  style={{
                    flex: 1,
                    padding: "10px 14px",
                    borderRadius: "10px",
                    background: "rgba(255, 255, 255, 0.03)",
                    border: "1px solid rgba(255, 255, 255, 0.08)",
                    color: "#E9F4F6",
                    fontSize: "13px",
                    outline: "none",
                    fontFamily: "inherit",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "rgba(25, 227, 255, 0.1)",
                    border: "1px solid rgba(25, 227, 255, 0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" style={{ color: "#19E3FF" }}>
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
