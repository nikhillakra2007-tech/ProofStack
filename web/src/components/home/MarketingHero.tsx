"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Play,
  Cpu,
} from "lucide-react";
import HeroShowcaseTriad from "./HeroShowcaseTriad";

interface MarketingHeroProps {
  onOpenTour?: () => void;
}

export default function MarketingHero({ onOpenTour }: MarketingHeroProps) {
  return (
    <section
      id="overview"
      className="hero-marketing-container"
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
        padding: "60px 24px 90px",
        scrollMarginTop: "80px",
      }}
    >
      {/* Floating Radial Shader Blobs */}
      <div
        className="hero-blob-glow"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
        }}
        aria-hidden="true"
      >
        {/* Blob 1 (Top-Left): Sage Teal */}
        <div
          style={{
            position: "absolute",
            top: "-8%",
            left: "-5%",
            width: "560px",
            height: "560px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(20, 83, 67, 0.16) 0%, rgba(20, 83, 67, 0.04) 65%, transparent 75%)",
            filter: "blur(80px)",
            animation: "floatBlob1 18s ease-in-out infinite",
          }}
        />

        {/* Blob 2 (Center-Right): Soft Terracotta / Burgundy Glow */}
        <div
          style={{
            position: "absolute",
            top: "20%",
            right: "-6%",
            width: "520px",
            height: "520px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(194, 65, 12, 0.12) 0%, rgba(159, 18, 57, 0.06) 60%, transparent 75%)",
            filter: "blur(80px)",
            animation: "floatBlob2 22s ease-in-out infinite",
          }}
        />

        {/* Blob 3 (Bottom-Center): Emerald Mint */}
        <div
          style={{
            position: "absolute",
            bottom: "8%",
            left: "22%",
            width: "600px",
            height: "460px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.14) 0%, rgba(32, 201, 166, 0.05) 60%, transparent 75%)",
            filter: "blur(80px)",
            animation: "floatBlob3 20s ease-in-out infinite",
          }}
        />
      </div>

      {/* Architectural Dot/Grid Pattern Overlay */}
      <div
        className="hero-grid-dots-overlay"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
        }}
      />

      {/* Foreground Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: "1280px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {/* 1. Eyebrow Badge */}
        <div
          className="hero-anim-badge"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "5px 14px 5px 10px",
            borderRadius: "9999px",
            background: "rgba(16, 185, 129, 0.08)",
            border: "1px solid #10B981",
            color: "#065F46",
            marginBottom: "24px",
            backdropFilter: "blur(6px)",
            boxShadow: "0 2px 8px rgba(16, 185, 129, 0.12)",
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "18px",
              height: "18px",
              borderRadius: "50%",
              background: "#10B981",
              color: "#FFFFFF",
            }}
          >
            <Cpu size={11} />
          </span>
          <span
            style={{
              fontFamily: "var(--f-mono, monospace)",
              fontSize: "11px",
              fontWeight: 600,
              letterSpacing: "0.04em",
              color: "#065F46",
            }}
          >
            NVIDIA Nemotron 70B · Compiler &amp; Test Verified Gates
          </span>
        </div>

        {/* 2. Semgrep-Inspired Centered Headline */}
        <div
          className="hero-anim-title"
          style={{
            maxWidth: "880px",
            textAlign: "center",
            marginBottom: "20px",
          }}
        >
          <h1
            className="headline-semgrep hero-headline-title"
            style={{
              fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
              margin: 0,
              letterSpacing: "-0.03em",
              fontWeight: 800,
            }}
          >
            <span>Security findings backed by evidence.</span>
            <br />
            <span className="headline-accent" style={{ color: "#10B981" }}>
              Fixes verified by compiler gates and live tests.
            </span>
          </h1>
        </div>

        {/* 3. Supporting Paragraph */}
        <p
          className="hero-anim-subtitle hero-subtext-para"
          style={{
            maxWidth: "700px",
            textAlign: "center",
            fontFamily: "var(--f-ui, 'Inter', sans-serif)",
            fontSize: "16px",
            lineHeight: 1.55,
            margin: "0 0 32px 0",
          }}
        >
          ProofStack identifies security flaws, proves them with live container probes,
          and synthesizes scoped patches using NVIDIA Nemotron. Before anything merges,
          8 deterministic compiler, linter, and test gates verify that the vulnerability
          is gone and existing code still works.
        </p>

        {/* 4. Action Buttons (Pill CTAs) */}
        <div
          className="hero-anim-actions"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "14px",
            flexWrap: "wrap",
            marginBottom: "36px",
          }}
        >
          <Link
            href="/login"
            className="btn-pill-primary hero-primary-cta"
            style={{
              height: "44px",
              padding: "0 24px",
              fontSize: "14px",
              fontWeight: 700,
              background: "#059669",
              color: "#FFFFFF",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              borderRadius: "9999px",
              boxShadow: "0 4px 16px rgba(5, 150, 105, 0.35)",
              textDecoration: "none",
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#047857";
              e.currentTarget.style.boxShadow = "0 6px 20px rgba(4, 120, 87, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#059669";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(5, 150, 105, 0.35)";
            }}
          >
            <span>Open Remediation Cockpit</span>
            <ArrowRight size={15} />
          </Link>

          {onOpenTour ? (
            <button
              type="button"
              onClick={onOpenTour}
              className="btn-pill-secondary hero-pill-secondary"
              style={{
                height: "44px",
                padding: "0 22px",
                fontSize: "14px",
                backdropFilter: "blur(8px)",
              }}
            >
              <Play size={14} style={{ fill: "currentColor", opacity: 0.8 }} />
              <span>2-Minute Interactive Tour</span>
            </button>
          ) : (
            <a
              href="#showcase"
              className="btn-pill-secondary hero-pill-secondary"
              style={{
                height: "44px",
                padding: "0 22px",
                fontSize: "14px",
                backdropFilter: "blur(8px)",
              }}
            >
              <span>Explore Product Showcase</span>
            </a>
          )}
        </div>

        {/* 5. Toolchain Trust Chips */}
        <div
          className="hero-anim-chips"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "20px",
            flexWrap: "wrap",
            marginBottom: "44px",
            color: "var(--ink3, #71807A)",
            fontSize: "12px",
            fontFamily: "var(--f-mono, monospace)",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={13} style={{ color: "#10B981" }} />
            12 CWE Container Probes
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={13} style={{ color: "#10B981" }} />
            8 Compiler &amp; Test Gates
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={13} style={{ color: "#10B981" }} />
            Signed Audit Ledger
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle2 size={13} style={{ color: "#10B981" }} />
            Isolated Container Sandboxes
          </span>
        </div>

        {/* 6. Elevated 3D Browser Mockup Container */}
        <div
          id="product"
          className="hero-anim-showcase"
          style={{
            width: "100%",
            scrollMarginTop: "80px",
            padding: "12px",
            borderRadius: "20px",
            background: "linear-gradient(180deg, rgba(255, 255, 255, 0.85) 0%, rgba(241, 245, 249, 0.65) 100%)",
            border: "1px solid rgba(15, 23, 42, 0.12)",
            boxShadow:
              "0 30px 60px -15px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(16, 185, 129, 0.15), 0 10px 30px rgba(0, 0, 0, 0.04)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            boxSizing: "border-box",
          }}
        >
          <HeroShowcaseTriad />
        </div>
      </div>
    </section>
  );
}
