"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BootSequenceProps {
  forceOpen?: boolean;
  onComplete?: () => void;
}

const BOOT_STAGES = [
  { step: 1, label: "Initializing Quantum Aurora Crypto Node", detail: "Entropy Pool 4096-bit SHA-256 Verified" },
  { step: 2, label: "Loading AST Sentinel Enforcement Engine", detail: "8/8 Autonomous Gates Armed (No Bypasses)" },
  { step: 3, label: "Synthesizing Neural Remediation Pipeline", detail: "NVIDIA Nemotron AST Guided Healing Ready" },
  { step: 4, label: "Verifying Merkle Evidence Ledger", detail: "Block #9482 Hash: 7f3a...e829 Validated" },
  { step: 5, label: "Autonomous Security Cockpit Live", detail: "Zero-Compromise DevSecOps Operational" },
];

export default function BootSequence({ forceOpen = false, onComplete }: BootSequenceProps) {
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageIndex, setStageIndex] = useState(0);

  const startBoot = useCallback(() => {
    setIsActive(true);
    setProgress(0);
    setStageIndex(0);
  }, []);

  const finishBoot = useCallback(() => {
    setIsActive(false);
    if (onComplete) onComplete();
  }, [onComplete]);

  // Handle first session trigger or forceOpen prop
  useEffect(() => {
    if (forceOpen) {
      startBoot();
      return;
    }
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("proofstack_boot_seen");
      if (!seen) {
        startBoot();
        sessionStorage.setItem("proofstack_boot_seen", "true");
      }
    }
  }, [forceOpen, startBoot]);

  // Keyboard shortcut: Escape to skip
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isActive) {
        finishBoot();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isActive, finishBoot]);

  // Progression timer
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            finishBoot();
          }, 350);
          return 100;
        }
        const next = prev + 4;
        const currentStage = Math.min(
          Math.floor((next / 100) * BOOT_STAGES.length),
          BOOT_STAGES.length - 1
        );
        setStageIndex(currentStage);
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [isActive, finishBoot]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.3 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "radial-gradient(ellipse at center, #0B1120 0%, #07090E 100%)",
            backdropFilter: "blur(24px)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            color: "#F8FAFC",
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          }}
        >
          {/* Subtle Ambient Scanline Grid */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(56, 189, 248, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.03) 1px, transparent 1px)",
              backgroundSize: "32px 32px",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              position: "relative",
              maxWidth: "520px",
              width: "100%",
              borderRadius: "16px",
              padding: "36px 32px",
              background: "rgba(15, 23, 42, 0.75)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
              boxShadow: "0 0 60px rgba(56, 189, 248, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
              textAlign: "center",
            }}
          >
            {/* Logo & Node Pulsing Indicator */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #00F0FF 0%, #6366F1 100%)",
                  display: "grid",
                  placeItems: "center",
                  color: "#07090E",
                  boxShadow: "0 0 20px rgba(0, 240, 255, 0.4)",
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "0.08em", color: "#FFFFFF" }}>
                PROOFSTACK BOOT
              </span>
            </div>

            {/* Stage Title */}
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#38BDF8",
                letterSpacing: "-0.01em",
                minHeight: "22px",
                marginBottom: "6px",
              }}
            >
              {BOOT_STAGES[stageIndex]?.label}
            </div>

            {/* Stage Detail Subtitle */}
            <div
              style={{
                fontSize: "11px",
                color: "rgba(226, 232, 240, 0.65)",
                minHeight: "18px",
                marginBottom: "24px",
              }}
            >
              {BOOT_STAGES[stageIndex]?.detail}
            </div>

            {/* Progress Bar with Cyan/Indigo Glow */}
            <div
              style={{
                position: "relative",
                width: "100%",
                height: "6px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.08)",
                overflow: "hidden",
                marginBottom: "16px",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  borderRadius: "999px",
                  background: "linear-gradient(90deg, #00F0FF 0%, #818CF8 50%, #10B981 100%)",
                  boxShadow: "0 0 16px rgba(0, 240, 255, 0.8)",
                  width: `${progress}%`,
                }}
                transition={{ ease: "easeOut", duration: 0.05 }}
              />
            </div>

            {/* Percentage & Bypasser */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                fontSize: "11px",
                color: "rgba(148, 163, 184, 0.8)",
              }}
            >
              <span>SYS_TELEMETRY: {progress}%</span>
              <button
                type="button"
                onClick={finishBoot}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#38BDF8",
                  cursor: "pointer",
                  fontSize: "11px",
                  textDecoration: "underline",
                  padding: "2px 6px",
                }}
              >
                Skip [Esc]
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
