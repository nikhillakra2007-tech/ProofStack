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
      style={{
        padding: "60px 24px 80px",
        maxWidth: "1280px",
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        scrollMarginTop: "80px",
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
          background: "var(--surface-green, #E8F1EE)",
          border: "1px solid var(--line, #DCE3E0)",
          marginBottom: "24px",
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
            background: "var(--brand, #20C9A6)",
            color: "#172E27",
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
            color: "var(--heading-primary, #344E48)",
          }}
        >
          NVIDIA Nemotron 70B Reasoning · 8-Gate Interlock
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
          className="headline-semgrep"
          style={{
            fontSize: "clamp(2.4rem, 4.5vw, 3.8rem)",
            margin: 0,
            letterSpacing: "-0.03em",
          }}
        >
          <span>Code security without false positives.</span>
          <br />
          <span className="headline-accent">
            Verified evidence developers and auditors trust.
          </span>
        </h1>
      </div>

      {/* 3. Supporting Paragraph */}
      <p
        className="hero-anim-subtitle"
        style={{
          maxWidth: "700px",
          textAlign: "center",
          fontFamily: "var(--f-ui, 'Inter', sans-serif)",
          fontSize: "16px",
          lineHeight: 1.55,
          color: "var(--ink2, #42534E)",
          margin: "0 0 32px 0",
        }}
      >
        ProofStack pairs 12-vector active DAST exploitation with an 8-gate
        deterministic AST interlock and HMAC-SHA256 evidence ledger — turning
        speculative AI suggestions into mathematically verified, regression-free fixes.
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
          href="/cockpit/TASK9142"
          className="btn-pill-primary"
          style={{
            height: "44px",
            padding: "0 24px",
            fontSize: "14px",
          }}
        >
          <span>Launch Live Cockpit</span>
          <ArrowRight size={15} />
        </Link>

        {onOpenTour ? (
          <button
            type="button"
            onClick={onOpenTour}
            className="btn-pill-secondary"
            style={{
              height: "44px",
              padding: "0 22px",
              fontSize: "14px",
            }}
          >
            <Play size={14} style={{ fill: "currentColor", opacity: 0.8 }} />
            <span>2-Minute Interactive Tour</span>
          </button>
        ) : (
          <a
            href="#showcase"
            className="btn-pill-secondary"
            style={{
              height: "44px",
              padding: "0 22px",
              fontSize: "14px",
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
          <CheckCircle2 size={13} style={{ color: "var(--brand, #20C9A6)" }} />
          12 CWE DAST Probes
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <CheckCircle2 size={13} style={{ color: "var(--brand, #20C9A6)" }} />
          Zero-Hallucination 8-Gate Interlock
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <CheckCircle2 size={13} style={{ color: "var(--brand, #20C9A6)" }} />
          HMAC-SHA256 Merkle Ledger
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
          <CheckCircle2 size={13} style={{ color: "var(--brand, #20C9A6)" }} />
          Python 3.11 / 3.12 Sandboxes
        </span>
      </div>

      {/* 6. Massive Semgrep-Style Product Visual Showcase (Triad Panels) */}
      <div id="product" className="hero-anim-showcase" style={{ width: "100%", scrollMarginTop: "80px" }}>
        <HeroShowcaseTriad />
      </div>
    </section>
  );
}
