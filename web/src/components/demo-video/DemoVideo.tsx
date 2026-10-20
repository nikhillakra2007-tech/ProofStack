"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const CHAPTERS = [
  {
    id: "ch1",
    title: "1. Intake & Baseline Pinning",
    duration: "00:45",
    desc: "Isolated microVM spins up and captures baseline p95 latency and memory metrics.",
    logs: [
      "[00:00] Initializing isolated microVM container #9142",
      "[00:08] Pinning golden baseline: 5,001 SQL queries in orders.py:get_orders",
      "[00:14] Capturing p95 execution latency: 428ms (noise floor 5%)",
      "[00:22] Memory footprint: 18.4MB tracemalloc peak",
    ],
  },
  {
    id: "ch2",
    title: "2. Neural Nemotron AST Synthesis",
    duration: "01:20",
    desc: "NVIDIA Nemotron 70B inspects AST parse tree and extracts tenant identity predicates.",
    logs: [
      "[00:28] Querying Nemotron 70B AST model via local hardware enclave",
      "[00:35] AST invariant extracted: tenant_id predicate must survive refactoring",
      "[00:42] Synthesizing minimal non-breaking diff with eager joinedload",
      "[00:50] Code patch candidate compiled without external dependencies",
    ],
  },
  {
    id: "ch3",
    title: "3. 8-Gate Sentinel Gauntlet",
    duration: "00:55",
    desc: "Every candidate patch runs through 8 verification gates with live exploit oracles.",
    logs: [
      "[00:58] Gate G0 AST Integrity: PASS (0.12s)",
      "[01:05] Gate G1 Regression Suite: 28/28 assertions PASS (1.42s)",
      "[01:14] Gate G2 Exploit Oracle: IDOR, SQLi & ReDoS attack payloads REBUFFED",
      "[01:22] Gate G3 Identity Guard: Tenant equality predicates intact",
      "[01:30] Gate G5 Performance: 34ms (-394ms speedup · 12.4x)",
    ],
  },
  {
    id: "ch4",
    title: "4. Merkle Ledger Attestation",
    duration: "00:40",
    desc: "Cryptographically binds the execution trace to SHA-256 Merkle Block #5.",
    logs: [
      "[01:38] Assembling canonical JSON evidence manifest",
      "[01:45] Computing SHA-256 block hash linked to Block #4 (0x7F3A...)",
      "[01:52] Block #5 sealed: 0xb3e94a81c0451e04cf8d743a1290bb3457102e3a1294801e0fa389dc129034aa",
      "[02:00] Pull request automatically verified, approved, and merged",
    ],
  },
];

export function DemoVideo() {
  const [activeChapterIndex, setActiveChapterIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [progress, setProgress] = useState(35);

  const activeChapter = CHAPTERS[activeChapterIndex];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setActiveChapterIndex((c) => (c + 1) % CHAPTERS.length);
          return 0;
        }
        return prev + 2;
      });
    }, 200);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div
      style={{
        borderRadius: "20px",
        background: "rgba(21, 27, 19, 0.95)",
        border: "1px solid rgba(81, 90, 71, 0.4)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
        overflow: "hidden",
      }}
    >
      {/* Video Player Header Bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          background: "rgba(14, 18, 13, 0.98)",
          borderBottom: "1px solid rgba(81, 90, 71, 0.4)",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ display: "flex", gap: "6px" }}>
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#7A4419" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#D7BE82" }} />
            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#515A47" }} />
          </div>
          <span style={{ fontSize: "13px", fontWeight: 700, color: "#FDFBF7", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ color: "#D7BE82" }}>● REC</span>
            <span>Sentinel Gate Autonomous Remediation Walkthrough</span>
          </span>
        </div>

        <span
          style={{
            fontSize: "11px",
            fontFamily: "var(--font-mono, monospace)",
            padding: "2px 8px",
            borderRadius: "6px",
            background: "rgba(215, 190, 130, 0.12)",
            color: "#D7BE82",
            border: "1px solid rgba(215, 190, 130, 0.35)",
          }}
        >
          CHAPTER {activeChapterIndex + 1} OF 4
        </span>
      </div>

      {/* Main Video Viewport Screen */}
      <div
        style={{
          position: "relative",
          aspectRatio: "16 / 9",
          minHeight: "340px",
          background: "radial-gradient(ellipse at center, #151B13 0%, #0E120D 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "28px",
        }}
      >
        {/* Top Overlay Badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "11px", fontFamily: "var(--font-mono, monospace)", color: "#D7BE82", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              ACTIVE WORKFLOW SIMULATION
            </div>
            <h4 style={{ fontSize: "20px", fontWeight: 700, color: "#FDFBF7", marginTop: "4px" }}>
              {activeChapter.title}
            </h4>
            <p style={{ fontSize: "13px", color: "#D6D1C4", marginTop: "4px", maxWidth: "540px" }}>
              {activeChapter.desc}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: "8px 16px",
              borderRadius: "10px",
              background: isPlaying ? "rgba(21, 27, 19, 0.85)" : "linear-gradient(135deg, #D7BE82 0%, #7A4419 100%)",
              color: isPlaying ? "#FDFBF7" : "#0E120D",
              fontWeight: 700,
              fontSize: "12px",
              border: isPlaying ? "1px solid rgba(215, 190, 130, 0.3)" : "none",
              cursor: "pointer",
            }}
          >
            {isPlaying ? "❚❚ Pause" : "▶ Play Video"}
          </button>
        </div>

        {/* Live Telemetry Terminal Window Inside Video */}
        <div
          style={{
            maxWidth: "680px",
            width: "100%",
            borderRadius: "10px",
            background: "rgba(14, 18, 13, 0.9)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(81, 90, 71, 0.4)",
            padding: "16px 20px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "12px",
            lineHeight: 1.8,
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.7)",
          }}
        >
          {activeChapter.logs.map((log, i) => (
            <div key={i} style={{ color: i === activeChapter.logs.length - 1 ? "#D7BE82" : "#9E9889" }}>
              {log}
            </div>
          ))}
        </div>

        {/* Video Scrubber & Playback Controls */}
        <div>
          <div
            style={{
              width: "100%",
              height: "5px",
              borderRadius: "999px",
              background: "rgba(81, 90, 71, 0.4)",
              overflow: "hidden",
              marginBottom: "12px",
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: "100%",
                background: "linear-gradient(90deg, #7A4419 0%, #D7BE82 70%, #EAD6B0 100%)",
                boxShadow: "0 0 10px rgba(215, 190, 130, 0.8)",
                transition: "width 0.2s linear",
              }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "11px", color: "#9E9889" }}>
            <span>{activeChapter.duration} / 03:00</span>
            <span>1080p 60fps · Sentinel Hardware Secure Enclave</span>
          </div>
        </div>
      </div>

      {/* Chapter Selection Bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          background: "rgba(14, 18, 13, 0.95)",
          borderTop: "1px solid rgba(81, 90, 71, 0.4)",
        }}
      >
        {CHAPTERS.map((ch, idx) => {
          const isActive = activeChapterIndex === idx;
          return (
            <button
              key={ch.id}
              type="button"
              onClick={() => {
                setActiveChapterIndex(idx);
                setProgress(0);
              }}
              style={{
                padding: "14px 16px",
                border: "none",
                background: isActive ? "rgba(215, 190, 130, 0.15)" : "transparent",
                borderRight: "1px solid rgba(81, 90, 71, 0.3)",
                borderBottom: isActive ? "2px solid #D7BE82" : "2px solid transparent",
                color: isActive ? "#D7BE82" : "#9E9889",
                textAlign: "left",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ fontSize: "12px", fontWeight: 700 }}>{ch.title}</div>
              <div style={{ fontSize: "10.5px", color: "#736E62", marginTop: "2px" }}>{ch.duration}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default DemoVideo;
