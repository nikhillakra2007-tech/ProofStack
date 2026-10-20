"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrandLogo } from "@/components/brand-logo/BrandLogo";

interface BootSequenceProps {
  forceOpen?: boolean;
  onComplete?: () => void;
}

const BOOT_STAGES = [
  { step: 1, label: "Initializing Deterministic Defense Engine", detail: "Entropy Pool 4096-bit SHA-256 Validated" },
  { step: 2, label: "Loading AST Sentinel Enforcement Engine", detail: "8/8 Autonomous Invariant Gates Armed" },
  { step: 3, label: "Establishing Neural Remediation Pipeline", detail: "NVIDIA Nemotron 70B AST Model Online" },
  { step: 4, label: "Syncing Cryptographic Evidence Ledger", detail: "Block #9482 Hash 7f3a...e829 Validated" },
  { step: 5, label: "Autonomous Security Cockpit Live", detail: "Zero-Compromise DevSecOps Operational" },
];

export function BootSequence({ forceOpen = false, onComplete }: BootSequenceProps) {
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
    if (typeof window !== "undefined") {
      sessionStorage.setItem("sentinel_boot_seen", "true");
    }
    if (onComplete) onComplete();
  }, [onComplete]);

  // Handle first-visit or manual forceOpen trigger
  useEffect(() => {
    if (forceOpen) {
      startBoot();
      return;
    }
    if (typeof window !== "undefined") {
      const seen = sessionStorage.getItem("sentinel_boot_seen");
      if (!seen) {
        startBoot();
      } else {
        if (onComplete) onComplete();
      }
    }
  }, [forceOpen, startBoot, onComplete]);

  // Tick the progress bar
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(finishBoot, 250);
          return 100;
        }
        const next = prev + 3;
        const currentStage = Math.min(
          Math.floor((next / 100) * BOOT_STAGES.length),
          BOOT_STAGES.length - 1
        );
        setStageIndex(currentStage);
        return next;
      });
    }, 35);

    return () => clearInterval(interval);
  }, [isActive, finishBoot]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99998,
            background: "radial-gradient(ellipse at center, #151B13 0%, #0E120D 100%)",
            backdropFilter: "blur(24px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            color: "#FDFBF7",
            fontFamily: "var(--font-mono, 'JetBrains Mono', monospace)",
          }}
        >
          <div
            style={{
              position: "relative",
              maxWidth: "520px",
              width: "100%",
              borderRadius: "18px",
              padding: "36px 32px",
              background: "rgba(21, 27, 19, 0.95)",
              border: "1px solid rgba(215, 190, 130, 0.35)",
              boxShadow: "0 0 60px rgba(215, 190, 130, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
              textAlign: "center",
            }}
          >
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "20px" }}>
              <BrandLogo size="lg" showWordmark={true} showSubtitle={true} />
            </div>

            <div style={{ fontSize: "14px", fontWeight: 600, color: "#D7BE82", marginBottom: "6px" }}>
              {BOOT_STAGES[stageIndex]?.label}
            </div>

            <div style={{ fontSize: "11px", color: "#9E9889", marginBottom: "24px" }}>
              {BOOT_STAGES[stageIndex]?.detail}
            </div>

            {/* Progress Bar in Soft Fawn & Saddle Brown Palette */}
            <div
              style={{
                width: "100%",
                height: "6px",
                borderRadius: "999px",
                background: "rgba(81, 90, 71, 0.4)",
                overflow: "hidden",
                position: "relative",
                marginBottom: "16px",
              }}
            >
              <motion.div
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  background: "linear-gradient(90deg, #7A4419 0%, #D7BE82 60%, #EAD6B0 100%)",
                  boxShadow: "0 0 12px rgba(215, 190, 130, 0.8)",
                  borderRadius: "999px",
                  transition: "width 0.04s linear",
                }}
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "10.5px",
                color: "#9E9889",
              }}
            >
              <span>TELEMETRY_LOAD: {progress}%</span>
              <button
                type="button"
                onClick={finishBoot}
                style={{
                  background: "none",
                  border: "none",
                  color: "#D7BE82",
                  cursor: "pointer",
                  fontSize: "11px",
                  fontWeight: 600,
                  textDecoration: "underline",
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

export default BootSequence;
