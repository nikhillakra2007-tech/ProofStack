"use client";

import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showWordmark?: boolean;
  showSubtitle?: boolean;
  className?: string;
}

export function BrandLogo({
  size = "md",
  showWordmark = true,
  showSubtitle = false,
  className = "",
}: BrandLogoProps) {
  const dimensions = {
    sm: { icon: 26, text: "15px", sub: "9px", gap: "8px" },
    md: { icon: 34, text: "17px", sub: "10px", gap: "10px" },
    lg: { icon: 44, text: "22px", sub: "11px", gap: "12px" },
    xl: { icon: 60, text: "28px", sub: "12px", gap: "14px" },
  }[size];

  return (
    <div
      className={`inline-flex items-center select-none ${className}`}
      style={{ gap: dimensions.gap }}
    >
      {/* Precision Geometric Shield & Invariant Quantum Gate SVG */}
      <svg
        width={dimensions.icon}
        height={dimensions.icon}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: "drop-shadow(0 0 12px rgba(215, 190, 130, 0.35))" }}
      >
        <defs>
          {/* Rich Metallic Gradient */}
          <linearGradient id="goldMetallic" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F5E6BE" />
            <stop offset="45%" stopColor="#D7BE82" />
            <stop offset="85%" stopColor="#9C5A23" />
            <stop offset="100%" stopColor="#7A4419" />
          </linearGradient>

          {/* Deep Ebony Core Shadow */}
          <linearGradient id="ebonyDepth" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1E271B" />
            <stop offset="100%" stopColor="#0B0F0B" />
          </linearGradient>

          {/* Soft Amber Glow */}
          <radialGradient id="amberCoreGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#D7BE82" stopOpacity="0.8" />
            <stop offset="60%" stopColor="#7A4419" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#0E120D" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Core Radial Glow */}
        <circle cx="24" cy="24" r="18" fill="url(#amberCoreGlow)" />

        {/* Outer Chamfered Sentinel Shield Base */}
        <path
          d="M24 3L40 9V22C40 32.5 33.2 41.5 24 45C14.8 41.5 8 32.5 8 22V9L24 3Z"
          fill="url(#ebonyDepth)"
          stroke="url(#goldMetallic)"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />

        {/* Inner Faceted Guard Lines */}
        <path
          d="M24 7L36 11.5V21.5C36 29.8 30.8 37 24 40C17.2 37 12 29.8 12 21.5V11.5L24 7Z"
          stroke="rgba(215, 190, 130, 0.35)"
          strokeWidth="1"
          strokeDasharray="2 2"
        />

        {/* Central Oracle Gate / AST Diamond Node */}
        <path
          d="M24 13L32 24L24 35L16 24L24 13Z"
          fill="url(#goldMetallic)"
          opacity="0.9"
        />

        {/* Inner Laser Aperture Crosshair */}
        <circle cx="24" cy="24" r="3.2" fill="#0E120D" stroke="#FFFFFF" strokeWidth="1" />
        <path d="M24 17V21M24 27V31M17 24H21M27 24H31" stroke="#0E120D" strokeWidth="1.2" strokeLinecap="round" />
      </svg>

      {/* Brand Typography */}
      {showWordmark && (
        <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.15 }}>
          <div
            style={{
              fontSize: dimensions.text,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            <span style={{ color: "var(--ink)", fontWeight: 800 }}>SENTINEL</span>
            <span
              style={{
                color: "transparent",
                backgroundImage: "linear-gradient(135deg, #D7BE82 0%, #E8CFA0 50%, #B86A2D 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                fontWeight: 800,
              }}
            >
              GATE
            </span>
          </div>

          {showSubtitle && (
            <span
              style={{
                fontSize: dimensions.sub,
                color: "var(--fawn)",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 600,
                marginTop: "1px",
                opacity: 0.85,
              }}
            >
              NVIDIA Nemotron 70B Defense
            </span>
          )}
        </div>
      )}
    </div>
  );
}
