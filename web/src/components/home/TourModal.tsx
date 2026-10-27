"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function extractYouTubeId(urlOrId: string): string {
  const trimmed = urlOrId.trim();
  if (!trimmed) return "7X8II6J-6mU";
  const match = trimmed.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/
  );
  if (match && match[1]) {
    return match[1];
  }
  if (/^[\w-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

export default function TourModal({ isOpen, onClose }: TourModalProps) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"video" | "interactive">("video");
  
  // YouTube video state
  const [youtubeInput, setYoutubeInput] = useState<string>("https://www.youtube.com/watch?v=7X8II6J-6mU");
  const [activeVideoId, setActiveVideoId] = useState<string>("7X8II6J-6mU");
  const [videoStatusMessage, setVideoStatusMessage] = useState<string | null>(null);

  // Interactive step state
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const steps = [
    {
      title: "1. Slow Endpoint Profiling",
      subtitle: "Baseline profiled: checkout pricing cache p95 = 412 ms",
      code: `def get_pricing_summary(tenant_id: str, cart_id: str):\n    # SLOW: 14 un-indexed DB queries per checkout calculation\n    rates = db.query(TaxRate).filter_by(tenant_id=tenant_id).all()\n    items = db.query(CartItem).filter_by(cart_id=cart_id).all()\n    return calculate_totals(rates, items)`,
      badge: "PROFILED",
      badgeColor: "brand",
      metrics: "p95: 412 ms · 14 SQL queries · CPU: 82%",
    },
    {
      title: "2. Competing Hypotheses Drafted",
      subtitle: "Nemotron 70B generates 2 candidate caching strategies",
      code: `# Candidate A: naive redis cache keyed by cart_id\ncache_key = f"cart:{cart_id}"\n\n# Candidate B: tenant-isolated cache with salted tenant token\ncache_key = f"{tenant_id}:{cart_id}"`,
      badge: "HYPOTHESES READY",
      badgeColor: "warn",
      metrics: "Nemotron 70B synthesis · 2 container sandboxes booted",
    },
    {
      title: "3. Gate 1 Correctness & Gate 2 Performance",
      subtitle: "Both candidates accelerate endpoint dramatically and pass unit tests",
      code: `Candidate A: 15.0x faster (p95: 27 ms) ✓ 28 tests pass\nCandidate B:  4.8x faster (p95: 86 ms) ✓ 28 tests pass`,
      badge: "G1 & G2 PASSED",
      badgeColor: "pass",
      metrics: "Both speedup gates cleared without functional regressions",
    },
    {
      title: "4. Gate 3 Security (Tenant Isolation Invariant)",
      subtitle: "Candidate A caught leaking tenant data; Candidate B verified safe",
      code: `[GATE G3 SECURITY]\nCandidate A · naive cache:\n  FAIL: Exploit probe demonstrated tenant B can read tenant A pricing!\n  REJECTED: IDOR Vulnerability (CWE-639 / T1-3)\n\nCandidate B · tenant-isolated:\n  PASS: Exploit probe confirmed zero cross-tenant leakage.\n  ACCEPTED: 3/3 Gates passed!`,
      badge: "IDOR BLOCKED",
      badgeColor: "fail",
      metrics: "Candidate A REJECTED · Candidate B ACCEPTED",
    },
    {
      title: "5. Hash-Chained Evidence Ledger Sealed",
      subtitle: "Every profile, candidate, and gate outcome cryptographically sealed",
      code: `Block #0: TASK_INTAKE (8f4b238e...)\nBlock #1: BASELINE_PROFILE (318cb929...)\nBlock #2: HYPOTHESIS_SYNTHESIS (45a89df0...)\nBlock #3: CANDIDATE_PATCH_B (e8901238...)\nBlock #4: GATE_RESULT (d9012389...)\nBlock #5: VERIFIED_COMMIT (b3e94a8f...) -> HEAD #5`,
      badge: "LEDGER VERIFIED",
      badgeColor: "pass",
      metrics: "SHA-256 Chain Intact · Non-repudiable Proof Generated",
    },
  ];

  useEffect(() => {
    if (!isPlaying || !isOpen || activeTab !== "interactive") return;
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % steps.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [isPlaying, isOpen, steps.length, activeTab]);

  if (!isOpen) return null;

  const handleApplyCustomVideo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const id = extractYouTubeId(youtubeInput);
    setActiveVideoId(id);
    setVideoStatusMessage(`Loaded video ID: ${id}`);
    setTimeout(() => setVideoStatusMessage(null), 3000);
  };

  const handleSelectPreset = (url: string) => {
    setYoutubeInput(url);
    const id = extractYouTubeId(url);
    setActiveVideoId(id);
    setVideoStatusMessage(`Switched to demo video (${id})`);
    setTimeout(() => setVideoStatusMessage(null), 3000);
  };

  const handleLaunch = () => {
    onClose();
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login?redirect=/dashboard");
    }
  };

  const step = steps[currentStep];

  return (
    <div
      className="scrim"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.78)",
        backdropFilter: "blur(6px)",
        display: "grid",
        placeItems: "center",
        zIndex: 10000,
        padding: "16px",
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: "840px",
          width: "100%",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          padding: 0,
          boxShadow: "0 24px 60px rgba(0,0,0,0.5)",
          borderRadius: "12px",
          border: "1px solid var(--line)",
          background: "var(--surface)",
        }}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "14px 20px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="chip brand">2-Min Platform Tour</span>
            <b style={{ fontSize: "14px" }}>ProofStack Autonomous Verification</b>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="seg" style={{ margin: 0 }}>
            <span
              className={activeTab === "video" ? "on" : ""}
              onClick={() => setActiveTab("video")}
              style={{ cursor: "pointer", fontSize: "11.5px", padding: "4px 10px" }}
            >
              ▶ YouTube Player
            </span>
            <span
              className={activeTab === "interactive" ? "on" : ""}
              onClick={() => setActiveTab("interactive")}
              style={{ cursor: "pointer", fontSize: "11.5px", padding: "4px 10px" }}
            >
              ⚡ Interactive Flow
            </span>
          </div>

          <button
            type="button"
            className="iconbtn"
            onClick={onClose}
            aria-label="Close modal"
            style={{ width: "28px", height: "28px" }}
          >
            <svg style={{ width: "14px", height: "14px", fill: "none", stroke: "currentColor", strokeWidth: 2 }} viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "18px 20px", overflowY: "auto", flex: 1 }}>
          {activeTab === "video" ? (
            <div>
              {/* 16:9 Responsive Video Container */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "56.25%", // 16:9 aspect ratio
                  height: 0,
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#000",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
                  border: "1px solid var(--line)",
                }}
              >
                <iframe
                  src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&rel=0&modestbranding=1`}
                  title="ProofStack 2-Minute Architecture Tour"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    border: "none",
                  }}
                />
              </div>

              {/* URL Customization Bar */}
              <form
                onSubmit={handleApplyCustomVideo}
                style={{
                  marginTop: "14px",
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <div style={{ flex: 1, position: "relative" }}>
                  <input
                    type="text"
                    value={youtubeInput}
                    onChange={(e) => setYoutubeInput(e.target.value)}
                    placeholder="Paste YouTube Video URL or ID (e.g. https://www.youtube.com/watch?v=...)"
                    style={{
                      width: "100%",
                      height: "36px",
                      padding: "0 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--line)",
                      background: "var(--surface2)",
                      color: "var(--ink)",
                      fontSize: "12px",
                      fontFamily: "var(--f-mono)",
                      outline: "none",
                    }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn sm"
                  style={{ height: "36px", padding: "0 14px", flexShrink: 0 }}
                >
                  Load Video
                </button>
              </form>

              {videoStatusMessage && (
                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "11px",
                    color: "var(--brand)",
                    fontFamily: "var(--f-mono)",
                  }}
                >
                  ✓ {videoStatusMessage}
                </div>
              )}

              {/* Preset Video Chips */}
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flexWrap: "wrap",
                }}
              >
                <span style={{ fontSize: "11px", color: "var(--ink2)" }}>Demo presets:</span>
                <button
                  type="button"
                  className="chip brand"
                  onClick={() => handleSelectPreset("https://www.youtube.com/watch?v=7X8II6J-6mU")}
                  style={{ cursor: "pointer", fontSize: "10.5px" }}
                >
                  ⚡ NVIDIA Nimbus Architecture
                </button>
                <button
                  type="button"
                  className="chip pass"
                  onClick={() => handleSelectPreset("https://www.youtube.com/watch?v=dQw4w9WgXcQ")}
                  style={{ cursor: "pointer", fontSize: "10.5px" }}
                >
                  🔒 Zero-Compromise Security
                </button>
                <button
                  type="button"
                  className="chip mono"
                  onClick={() => handleSelectPreset("https://www.youtube.com/watch?v=3JZ_D3ELwOQ")}
                  style={{ cursor: "pointer", fontSize: "10.5px" }}
                >
                  📊 Hash-Chained Ledger
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Progress Indicators */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "14px" }}>
                {steps.map((s, idx) => (
                  <div
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    style={{
                      flex: 1,
                      height: "4px",
                      borderRadius: "2px",
                      background:
                        idx === currentStep
                          ? "var(--brand)"
                          : idx < currentStep
                          ? "var(--pass)"
                          : "var(--line)",
                      cursor: "pointer",
                      transition: "background 200ms",
                    }}
                  />
                ))}
              </div>

              {/* Current Step Content */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <div>
                  <div className="eyebrow" style={{ fontSize: "11px", color: "var(--brand)" }}>
                    Step {currentStep + 1} of {steps.length}
                  </div>
                  <h3 style={{ fontSize: "16px", margin: "4px 0", fontFamily: "var(--f-display)" }}>
                    {step.title}
                  </h3>
                  <p style={{ margin: "2px 0 0", color: "var(--ink2)", fontSize: "12px" }}>
                    {step.subtitle}
                  </p>
                </div>
                <span className={`chip ${step.badgeColor}`}>{step.badge}</span>
              </div>

              {/* Terminal / Code Box */}
              <div
                style={{
                  background: "var(--term-bg, #12151F)",
                  border: "1px solid #282E44",
                  borderRadius: "8px",
                  padding: "12px 14px",
                  marginTop: "12px",
                  color: "#E2E7F5",
                  fontFamily: "var(--f-mono)",
                  fontSize: "11.5px",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  minHeight: "140px",
                }}
              >
                {step.code}
              </div>

              <div
                style={{
                  marginTop: "10px",
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: "var(--surface2)",
                  fontSize: "11.5px",
                  fontFamily: "var(--f-mono)",
                  color: "var(--ink2)",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Telemetry:</span>
                <b style={{ color: "var(--ink)" }}>{step.metrics}</b>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div
          style={{
            padding: "12px 20px",
            borderTop: "1px solid var(--line)",
            background: "var(--surface)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {activeTab === "interactive" ? (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                type="button"
                className="btn sm sec"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? "Pause" : "Auto-Play"}
              </button>
              <button
                type="button"
                className="btn sm sec"
                onClick={() => setCurrentStep((prev) => (prev > 0 ? prev - 1 : steps.length - 1))}
              >
                Back
              </button>
              <button
                type="button"
                className="btn sm sec"
                onClick={() => setCurrentStep((prev) => (prev + 1) % steps.length)}
              >
                Next
              </button>
            </div>
          ) : (
            <div style={{ fontSize: "12px", color: "var(--ink2)" }}>
              High-definition demo player with instant live stream controls
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button type="button" className="btn sm ghost" onClick={onClose}>
              Close
            </button>
            <button type="button" className="btn sm" onClick={handleLaunch}>
              Open live demo →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
