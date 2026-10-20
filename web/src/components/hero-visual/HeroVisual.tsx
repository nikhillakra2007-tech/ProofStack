"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface NodeData {
  id: string;
  step: string;
  title: string;
  desc: string;
  status: "idle" | "running" | "passed" | "blocked";
  metric: string;
}

export default function HeroVisual() {
  const [activeMode, setActiveMode] = useState<"safe" | "naive">("safe");
  const [activeStep, setActiveStep] = useState<string>("gates");

  const nodes: NodeData[] = [
    {
      id: "intake",
      step: "01",
      title: "Task Intake",
      desc: "N+1 query bottleneck in orders.py:get_orders",
      status: "passed",
      metric: "5,001 queries · 428ms",
    },
    {
      id: "sandbox",
      step: "02",
      title: "Isolated MicroVM",
      desc: "Rootless sandbox, network=none, 1GB quota",
      status: "passed",
      metric: "12/16 workers idle",
    },
    {
      id: "gates",
      step: "03",
      title: "8-Gate Sentinel",
      desc: activeMode === "safe" ? "All 8 invariant checks passed" : "G2 Exploit Oracle caught IDOR cache leak",
      status: activeMode === "safe" ? "passed" : "blocked",
      metric: activeMode === "safe" ? "8/8 PASS" : "G2 FAIL (Leak)",
    },
    {
      id: "ledger",
      step: "04",
      title: "SHA-256 Ledger",
      desc: activeMode === "safe" ? "Cryptographically sealed in Block #4" : "Rejection logged · Ship aborted",
      status: activeMode === "safe" ? "passed" : "blocked",
      metric: activeMode === "safe" ? "Head #4 · Sealed" : "Aborted · No Sign",
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: "1080px",
        margin: "calc(40 * var(--u)) auto 0",
        padding: "calc(24 * var(--u))",
        borderRadius: "16px",
        border: "1px solid var(--line)",
        background: "radial-gradient(ellipse 90% 60% at 50% 0%, rgba(35, 33, 28, 0.45), rgba(10, 10, 9, 0.95))",
        backdropFilter: "blur(16px)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(233, 229, 218, 0.08)",
        position: "relative",
        overflow: "hidden",
      }}
      data-rv
    >
      {/* Subtle ambient light */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: "-40%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "480px",
          height: "280px",
          background: activeMode === "safe"
            ? "radial-gradient(circle, rgba(127, 174, 122, 0.12) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(194, 107, 94, 0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          transition: "background 0.5s ease",
        }}
      />

      {/* Top Controller Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          paddingBottom: "calc(18 * var(--u))",
          borderBottom: "1px solid var(--line)",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: activeMode === "safe" ? "var(--pass)" : "var(--fail)",
              boxShadow: `0 0 10px ${activeMode === "safe" ? "var(--pass)" : "var(--fail)"}`,
            }}
          />
          <span style={{ fontFamily: "var(--f-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink2)" }}>
            Autonomous Verification Engine · Live Flow
          </span>
        </div>

        {/* Interactive Mode Toggle */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            padding: "3px",
            borderRadius: "20px",
            background: "rgba(255, 255, 255, 0.04)",
            border: "1px solid var(--line)",
          }}
        >
          <button
            type="button"
            onClick={() => setActiveMode("safe")}
            style={{
              padding: "4px 14px",
              borderRadius: "16px",
              fontSize: "12px",
              fontWeight: 500,
              background: activeMode === "safe" ? "var(--surface)" : "transparent",
              color: activeMode === "safe" ? "var(--ink)" : "var(--ink3)",
              border: activeMode === "safe" ? "1px solid var(--line)" : "none",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ color: "var(--pass)" }}>✓</span> Hardened Fix
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("naive")}
            style={{
              padding: "4px 14px",
              borderRadius: "16px",
              fontSize: "12px",
              fontWeight: 500,
              background: activeMode === "naive" ? "var(--surface)" : "transparent",
              color: activeMode === "naive" ? "var(--ink)" : "var(--ink3)",
              border: activeMode === "naive" ? "1px solid var(--line)" : "none",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span style={{ color: "var(--fail)" }}>⚠</span> Naive LLM Patch
          </button>
        </div>
      </div>

      {/* Nodes Flowchart Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: "16px",
          marginTop: "calc(22 * var(--u))",
          position: "relative",
          zIndex: 2,
        }}
      >
        {nodes.map((node) => {
          const isSelected = activeStep === node.id;
          const isPassed = node.status === "passed";

          return (
            <motion.div
              key={node.id}
              onClick={() => setActiveStep(node.id)}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              style={{
                padding: "16px",
                borderRadius: "12px",
                border: `1px solid ${isSelected ? "rgba(233, 229, 218, 0.35)" : "var(--line)"}`,
                background: isSelected ? "rgba(233, 229, 218, 0.05)" : "rgba(18, 18, 16, 0.5)",
                cursor: "pointer",
                position: "relative",
                transition: "border-color 0.25s ease, background 0.25s ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: "10.5px",
                    letterSpacing: "0.12em",
                    color: "var(--ink3)",
                  }}
                >
                  {node.step}
                </span>
                <span
                  style={{
                    fontFamily: "var(--f-mono)",
                    fontSize: "10px",
                    padding: "2px 7px",
                    borderRadius: "4px",
                    background: isPassed ? "rgba(127, 174, 122, 0.12)" : "rgba(194, 107, 94, 0.15)",
                    color: isPassed ? "var(--pass)" : "var(--fail)",
                    border: `1px solid ${isPassed ? "rgba(127, 174, 122, 0.25)" : "rgba(194, 107, 94, 0.3)"}`,
                  }}
                >
                  {node.metric}
                </span>
              </div>

              <div style={{ fontSize: "14px", fontWeight: 500, color: "var(--ink)", marginBottom: "4px" }}>
                {node.title}
              </div>

              <div style={{ fontSize: "11.5px", color: "var(--ink2)", lineHeight: 1.5 }}>
                {node.desc}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Interactive Detail Drawer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeStep}-${activeMode}`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          style={{
            marginTop: "calc(20 * var(--u))",
            padding: "16px 20px",
            borderRadius: "10px",
            border: "1px solid var(--line)",
            background: "rgba(14, 14, 12, 0.7)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ maxWidth: "700px" }}>
            <div style={{ fontFamily: "var(--f-mono)", fontSize: "11px", color: "var(--ink3)", marginBottom: "3px" }}>
              TELEMETRY &amp; PROOF LOG
            </div>
            <div style={{ fontSize: "12.5px", color: "var(--ink)", lineHeight: 1.6 }}>
              {activeMode === "safe" ? (
                <>
                  <strong style={{ color: "var(--pass)" }}>Verified: </strong>
                  Batch query optimization eliminated 5,000 subqueries without touching permission checks.
                  Candidate B passed <strong>G2 Exploit Oracle</strong> (0 leaks) and <strong>G5 Latency Gate</strong> (428ms → 12ms, +74.2% speedup).
                </>
              ) : (
                <>
                  <strong style={{ color: "var(--fail)" }}>Invariant Breach: </strong>
                  Naive LLM removed the tenant authorization check to gain 15× speed.
                  <strong> Gate G2 (Exploit Oracle)</strong> executed IDOR cross-tenant test vector and intercepted unauthorized document retrieval. <strong>Patch rejected before shipping.</strong>
                </>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <span
              style={{
                fontFamily: "var(--f-mono)",
                fontSize: "11px",
                padding: "6px 12px",
                borderRadius: "6px",
                background: "var(--surface2)",
                color: "var(--ink2)",
                border: "1px solid var(--line)",
              }}
            >
              SHA-256: d4e1529a1b2c…
            </span>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
