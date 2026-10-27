"use client";

import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "icon";
  showTagline?: boolean;
  className?: string;
}

export default function BrandLogo({
  size = "md",
  showTagline = true,
  className = "",
}: BrandLogoProps) {
  // Dimensions
  const iconSize = size === "sm" ? 24 : size === "lg" ? 40 : 32;
  const titleSize = size === "sm" ? "14.5px" : size === "lg" ? "20px" : "16px";
  const badgeSize = size === "sm" ? "8.5px" : size === "lg" ? "10.5px" : "9.5px";

  const LogoIcon = (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
      aria-label="ProofStack Logo"
    >
      {/* Background soft geometric pill / rounded shield */}
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="#E8F1EE"
        stroke="#DCE3E0"
        strokeWidth="1"
      />
      
      {/* Outer Verification Hex-Shield */}
      <path
        d="M16 6L25 10.5V17C25 21.8 21.2 25.8 16 27C10.8 25.8 7 21.8 7 17V10.5L16 6Z"
        fill="#FFFFFF"
        stroke="#344E48"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      
      {/* Connected Neural Interlock Matrix & Central Cryptographic Diamond */}
      <path
        d="M16 11V16M16 16L12.5 19.5M16 16L19.5 19.5"
        stroke="#344E48"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      
      {/* Verification Checkpoint Diamond */}
      <path
        d="M16 13.5L18.5 16L16 18.5L13.5 16L16 13.5Z"
        fill="#20C9A6"
        stroke="#17AF91"
        strokeWidth="1.2"
      />
      
      {/* Vertex Nodes */}
      <circle cx="16" cy="10.5" r="1.5" fill="#344E48" />
      <circle cx="12" cy="20.5" r="1.5" fill="#20C9A6" />
      <circle cx="20" cy="20.5" r="1.5" fill="#20C9A6" />
    </svg>
  );

  if (size === "icon") {
    return <div className={`inline-flex items-center ${className}`}>{LogoIcon}</div>;
  }

  return (
    <div
      className={`inline-flex items-center gap-2.5 ${className}`}
      style={{ userSelect: "none" }}
    >
      {LogoIcon}
      <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span
            style={{
              fontFamily: "var(--f-display, 'Inter', sans-serif)",
              fontWeight: 600,
              fontSize: titleSize,
              letterSpacing: "-0.02em",
              color: "var(--heading-primary, #344E48)",
            }}
          >
            ProofStack
          </span>
          <span
            style={{
              fontFamily: "var(--f-mono, monospace)",
              fontSize: badgeSize,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "1.5px 5px",
              borderRadius: "4px",
              background: "var(--surface-green, #E8F1EE)",
              color: "var(--heading-primary, #344E48)",
              border: "1px solid var(--line, #DCE3E0)",
            }}
          >
            NVIDIA MODEL
          </span>
        </div>
        {showTagline && size !== "sm" && (
          <span
            style={{
              fontFamily: "var(--f-ui, 'Inter', sans-serif)",
              fontSize: "10.5px",
              color: "var(--ink-muted, #71807A)",
              fontWeight: 400,
              marginTop: "2px",
            }}
          >
            Autonomous DevSecOps & Evidence Ledger
          </span>
        )}
      </div>
    </div>
  );
}
