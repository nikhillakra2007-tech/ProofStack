"use client";

import React from "react";
import { useTheme } from "@/lib/theme";

export default function Footer() {
  const { isTampered } = useTheme();

  return (
    <footer className="foot">
      {/* Clean status indicator */}
      {isTampered ? (
        <span>
          <i className="dot fail" />
          <span style={{ color: "var(--fail)", fontWeight: 600 }}>
            Ledger Integrity Alert (Block #2)
          </span>
        </span>
      ) : (
        <span>
          <i className="dot" />
          Ledger Valid · SHA-256 Head #5
        </span>
      )}

      {/* Right section: Runtime & version */}
      <span className="sp">Nebius Token Factory · NVIDIA Nemotron 3</span>
      <span>ProofStack v1.0</span>
    </footer>
  );
}
