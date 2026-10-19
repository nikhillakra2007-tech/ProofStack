"use client";

import React, { useState, useEffect, useRef } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const QUICK = [
  "How does ProofStack verify patches?",
  "What do gates G0–G7 check?",
  "Explain the evidence ledger",
  "Show a sample verdict",
];

const KB: Record<string, string> = {
  "verify patches": `ProofStack runs a five-step pipeline.

1. Baseline Profile — cProfile + pyperf measure p95 latency, SQL query count, memory.
2. Hypotheses — Nemotron-3-Super drafts three competing fixes.
3. Sandbox Probing — each candidate runs in an isolated microVM (network=none, 60s cap).
4. Patch Synthesis — Nemotron-3.5-Lightning writes the defensive patch.
5. Zero-Compromise Gates — G0–G7 verify correctness, security, performance, concurrency.

One failing gate means the patch is rejected. No partial credit.`,

  "g0": `G0–G7 verification gates

G0  AST integrity + lockfile diff
G1  Unit test regression (28/28 must pass)
G2  Exploit oracle — IDOR, SQLi, ReDoS
G3  Identity / authorization preservation
G4  Concurrency safety, race conditions
G5  Performance speedup above τ_noise (5.0%)
G6  Tracemalloc growth under 20 MB
G7  Code hygiene and supply chain

All eight must pass for an ACCEPT verdict.`,

  "ledger": `The evidence ledger is an append-only SHA-256 hash chain.

entry_hash = SHA256(prev_hash + canonical_json(body))

Block 0  Task intake
Block 1  Baseline profile
Block 2  Candidate patch
Block 3  Gate results
Block 4  Final verdict

Mutate any block and the chain breaks. The verdict becomes TAMPERED and the whole run is
discarded. Nothing is ever edited in place.`,

  "sample verdict": `Sample verdict — TASK9142

Target   orders.py:get_orders
Mode     OPTIMIZE

Baseline  428 ms p95 · 5,001 SQL queries
Candidate 12 ms p95 · 1 SQL query

Gates  G0 ✓ G1 ✓ G2 ✓ G3 ✓ G4 ✓ G5 ✓ G6 ✓ G7 ✓
Verdict ACCEPT · ΔPerf +74.2% (τ_noise 5.0%)
Ledger  6/6 blocks sealed · chain intact`,
};

function answer(input: string): string {
  const q = input.toLowerCase();
  for (const [k, v] of Object.entries(KB)) {
    if (q.includes(k) || k.includes(q)) return v;
  }
  return `I can explain how ProofStack verifies patches, what the G0–G7 gates check, how the
evidence ledger works, and what a sample verdict looks like.

Try: "How does ProofStack verify patches?" or "What do gates G0–G7 check?"`;
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Message[]>([
    {
      id: "0",
      role: "assistant",
      content: "Hello. Ask me about verification gates, the evidence ledger, or a sample verdict.",
    },
  ]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  const send = (t?: string) => {
    const content = (t ?? text).trim();
    if (!content) return;
    setMsgs((m) => [...m, { id: String(Date.now()), role: "user", content }]);
    setText("");
    setTyping(true);
    setTimeout(() => {
      setMsgs((m) => [
        ...m,
        { id: String(Date.now() + 1), role: "assistant", content: answer(content) },
      ]);
      setTyping(false);
    }, 700);
  };

  return (
    <>
      <button className="cb-fab" onClick={() => setOpen((o) => !o)} aria-label="Toggle assistant">
        <span className="cb-ring" />
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          {open ? (
            <path d="M18 6L6 18M6 6l12 12" />
          ) : (
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          )}
        </svg>
      </button>

      {open && (
        <div className="cb-panel">
          <div className="cb-hd">
            <div
              style={{
                width: "30px", height: "30px", borderRadius: "8px",
                background: "rgba(142,90,54,.2)", border: "1px solid rgba(142,90,54,.4)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#c98d5e",
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3l1.7 4.6L18.3 9.3l-4.6 1.7L12 15.6l-1.7-4.6L5.7 9.3l4.6-1.7z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 500 }}>ProofStack Assistant</div>
              <div style={{ fontSize: "11px", color: "#7a766c" }}>Nemotron-3 Super 120B</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
            {msgs.map((m) => (
              <div key={m.id} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div className={`cb-msg ${m.role === "user" ? "cb-msg--me" : "cb-msg--ai"}`}>{m.content}</div>
              </div>
            ))}
            {typing && (
              <div style={{ display: "flex" }}>
                <div className="cb-msg cb-msg--ai" style={{ display: "flex", gap: "4px", alignItems: "center" }}>
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      style={{
                        width: "4px", height: "4px", borderRadius: "50%", background: "#7a766c",
                        animation: `cbBlink 1.2s ${i * 0.18}s infinite`,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {msgs.length <= 1 && (
            <div style={{ padding: "0 16px 10px", display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {QUICK.map((q) => (
                <button key={q} className="cb-chip" onClick={() => send(q)}>{q}</button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => { e.preventDefault(); send(); }}
            style={{ padding: "12px 16px", borderTop: "1px solid #2a2825", display: "flex", gap: "8px" }}
          >
            <input
              className="cb-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything…"
            />
            <button type="submit" style={{ color: "#e9e5da", display: "flex", alignItems: "center" }} aria-label="Send">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </form>
        </div>
      )}

      <style jsx global>{`
        @keyframes cbBlink { 0%,100% { opacity: .25 } 50% { opacity: 1 } }
      `}</style>
    </>
  );
}
