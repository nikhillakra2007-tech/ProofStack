"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/lib/theme";

export default function CopilotFab() {
  const { isCopilotOpen, setIsCopilotOpen } = useTheme();

  return (
    <div style={{ position: "absolute", right: 24, bottom: 46, zIndex: 5 }}>
      <AnimatePresence>
        {isCopilotOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.94 }}
            transition={{ duration: 0.2 }}
            style={{
              position: "absolute",
              right: 0,
              bottom: 64,
              width: 220,
              padding: "12px 14px",
              borderRadius: "14px",
              background: "rgba(14, 22, 25, 0.92)",
              backdropFilter: "blur(20px) saturate(1.6)",
              WebkitBackdropFilter: "blur(20px) saturate(1.6)",
              border: "1px solid rgba(25, 227, 255, 0.18)",
              boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#5BC98C" }} />
              <span style={{ fontSize: "12px", fontWeight: 600 }}>Nemotron 3 Super</span>
            </div>
            <div style={{ fontSize: "11.5px", color: "#8FA5AC", lineHeight: 1.5 }}>
              Ready. Ask about a candidate patch, a failing gate, or the ledger.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setIsCopilotOpen(!isCopilotOpen)}
        aria-label="Toggle AI Co-Pilot"
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: "relative",
          width: "52px",
          height: "52px",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0E1619, #152126)",
          border: "1px solid rgba(25, 227, 255, 0.25)",
          boxShadow: "0 8px 28px rgba(0,0,0,0.45), 0 0 20px rgba(25, 227, 255, 0.08)",
          cursor: "pointer",
        }}
      >
        {/* Pulsing ring */}
        {!isCopilotOpen && (
          <motion.span
            aria-hidden
            style={{
              position: "absolute",
              inset: -1,
              borderRadius: "17px",
              border: "1px solid rgba(25, 227, 255, 0.4)",
              pointerEvents: "none",
            }}
            animate={{ opacity: [0.5, 0, 0.5], scale: [1, 1.18, 1] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ position: "relative", color: "#19E3FF" }}>
          <path
            d="M12 3l1.7 4.6L18.3 9.3l-4.6 1.7L12 15.6l-1.7-4.6L5.7 9.3l4.6-1.7z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          <path
            d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </svg>
      </motion.button>
    </div>
  );
}
