"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

interface IngestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SavedTaskItem {
  id: string;
  name: string;
  target: string;
  type: string;
  status: "ACCEPTED" | "REJECTED";
  speedup: string;
  runtime: string;
  date: string;
}

const PRESET_TASKS: SavedTaskItem[] = [
  {
    id: "TASK9142",
    name: "INV-4821 Checkout Pricing Cache & IDOR",
    target: "orders.py:get_orders",
    type: "Performance + Security",
    status: "ACCEPTED",
    speedup: "4.8x faster p95",
    runtime: "4.1s",
    date: "Today, 11:34 AM",
  },
  {
    id: "TASKC02A",
    name: "INV-3104 Order DB Query N+1 & SQLi",
    target: "billing/pricing.py:calc_cart",
    type: "Database Optimization",
    status: "ACCEPTED",
    speedup: "12.1x faster p95",
    runtime: "3.8s",
    date: "Today, 10:15 AM",
  },
  {
    id: "TASK771B",
    name: "INV-5901 JWT Auth Header Bypass Attempt",
    target: "auth/jwt.py:verify_token",
    type: "Security Hardening",
    status: "REJECTED",
    speedup: "15.0x faster p95",
    runtime: "2.4s",
    date: "Yesterday, 04:20 PM",
  },
  {
    id: "TASK248E",
    name: "INV-1209 ReDoS Catastrophic Backtracking",
    target: "parser/sanitize.py:clean_text",
    type: "Regex Security",
    status: "ACCEPTED",
    speedup: "9.4x faster p95",
    runtime: "1.9s",
    date: "Oct 18, 08:45 PM",
  },
];

export default function IngestModal({ isOpen, onClose }: IngestModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<"zip" | "git" | "live" | "saved">("zip");

  // Tab 1: ZIP Upload state
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    size: string;
    entrypoints: string[];
  } | null>({
    name: "ecommerce-backend-v2.zip",
    size: "4.2 MB",
    entrypoints: [
      "orders.py:get_orders (SQLAlchemy N+1)",
      "cache/store.py:get_doc (IDOR Boundary)",
      "api/export.py:stream (Async Freeze)",
    ],
  });

  // Tab 2: GitHub repo state
  const [repoUrl, setRepoUrl] = useState("https://github.com/perfproof/ecommerce-backend");
  const [branch, setBranch] = useState("main");
  const [commitSha, setCommitSha] = useState("c8a94e1");
  const [verificationMode, setVerificationMode] = useState("OPTIMIZE (Performance + Security Gates)");

  // Tab 3: Live Hosted Website state
  const [liveUrl, setLiveUrl] = useState("https://staging-api.perfproof.internal");
  const [scanProfile, setScanProfile] = useState("OWASP Top-10 & Active IDOR (12 Probes)");
  const [concurrency, setConcurrency] = useState("4 concurrent workers (Safe non-destructive)");

  // Tab 4: Saved tasks state
  const [savedTasks, setSavedTasks] = useState<SavedTaskItem[]>(PRESET_TASKS);
  const [searchFilter, setSearchFilter] = useState("");

  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const f = e.dataTransfer.files[0];
      handleFileSelected(f);
    }
  };

  const handleFileSelected = (file: File) => {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    setSelectedFile({
      name: file.name,
      size: `${sizeMb} MB`,
      entrypoints: [
        "orders.py:get_orders (Auto-detected)",
        "api/checkout.py:calculate (Auto-detected)",
        "utils/auth.py:verify_jwt (Auto-detected)",
      ],
    });
  };

  const handleStartZip = () => {
    if (!selectedFile) {
      setErrorMsg("Please select or drop a valid .zip repository archive.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);
    setSubmitStep("Bootstrapping Nebius Token Factory MicroVM sandbox...");
    setTimeout(() => {
      setSubmitStep("Unpacking archive and building AST call-graph...");
    }, 600);
    setTimeout(() => {
      setSubmitStep("Injecting Zero-Compromise Gauntlet (G0–G7)...");
    }, 1100);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      router.push("/cockpit/TASK9142");
    }, 1600);
  };

  const handleStartGit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repoUrl.trim()) {
      setErrorMsg("Repository URL is required.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);
    setSubmitStep("Cloning repository into zero-egress sandbox...");
    setTimeout(() => {
      setSubmitStep("Pinning commit SHA " + commitSha + " and isolating dependencies...");
    }, 700);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      router.push("/cockpit/TASK9142");
    }, 1400);
  };

  const handleStartLive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!liveUrl.trim()) {
      setErrorMsg("Live website target URL is required.");
      return;
    }
    setErrorMsg("");
    setIsSubmitting(true);
    setSubmitStep("Synthesizing dynamic exploit payloads...");
    setTimeout(() => {
      setSubmitStep("Dispatching active DAST probes against target endpoint...");
    }, 700);
    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
      router.push("/cockpit/TASK9142?tab=dast");
    }, 1400);
  };

  const filteredTasks = savedTasks.filter(
    (t) =>
      t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      t.target.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div
      className="scrim"
      onClick={onClose}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "16px",
      }}
    >
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        style={{
          width: "100%",
          maxWidth: "720px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: "12px",
          background: "var(--surface)",
          border: "1px solid var(--line)",
          boxShadow: "0 24px 48px -12px rgba(0, 0, 0, 0.45)",
          overflow: "hidden",
        }}
      >
        {/* Modal Header */}
        <div
          className="hd"
          style={{
            padding: "18px 24px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "var(--brand)",
              color: "var(--brand-ink)",
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <svg className="i" viewBox="0 0 24 24" style={{ width: "20px", height: "20px" }}>
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h2 id="modal-title" className="disp" style={{ fontSize: "20px", fontWeight: 700, margin: 0 }}>
                Ingest Workspace / Start New Task
              </h2>
              <span className="chip brand" style={{ fontSize: "10px", height: "18px" }}>
                Zero-Compromise Engine
              </span>
            </div>
            <p className="sub" style={{ margin: "4px 0 0", fontSize: "12.5px", color: "var(--ink2)" }}>
              Select a source to verify code through Gates G0–G7 in isolated Nebius MicroVMs.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--ink2)",
              cursor: "pointer",
              padding: "6px",
              borderRadius: "6px",
            }}
            aria-label="Close modal"
          >
            <svg className="i" viewBox="0 0 24 24" style={{ width: "20px", height: "20px" }}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 4-Source Tab Switcher */}
        <div
          style={{
            display: "flex",
            borderBottom: "1px solid var(--line)",
            background: "var(--surface2)",
            padding: "6px 20px 0",
            gap: "8px",
            overflowX: "auto",
          }}
        >
          <button
            type="button"
            onClick={() => { setActiveTab("zip"); setErrorMsg(""); }}
            style={{
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: activeTab === "zip" ? 600 : 500,
              background: activeTab === "zip" ? "var(--surface)" : "transparent",
              borderTop: activeTab === "zip" ? "2px solid var(--brand)" : "2px solid transparent",
              borderLeft: activeTab === "zip" ? "1px solid var(--line)" : "1px solid transparent",
              borderRight: activeTab === "zip" ? "1px solid var(--line)" : "1px solid transparent",
              borderBottom: "none",
              borderRadius: "7px 7px 0 0",
              color: activeTab === "zip" ? "var(--ink)" : "var(--ink2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg className="i" viewBox="0 0 24 24" style={{ width: "15px", height: "15px" }}>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
            1. Upload ZIP Archive
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("git"); setErrorMsg(""); }}
            style={{
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: activeTab === "git" ? 600 : 500,
              background: activeTab === "git" ? "var(--surface)" : "transparent",
              borderTop: activeTab === "git" ? "2px solid var(--brand)" : "2px solid transparent",
              borderLeft: activeTab === "git" ? "1px solid var(--line)" : "1px solid transparent",
              borderRight: activeTab === "git" ? "1px solid var(--line)" : "1px solid transparent",
              borderBottom: "none",
              borderRadius: "7px 7px 0 0",
              color: activeTab === "git" ? "var(--ink)" : "var(--ink2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg className="i" viewBox="0 0 24 24" style={{ width: "15px", height: "15px" }}>
              <circle cx="12" cy="18" r="3" />
              <circle cx="6" cy="6" r="3" />
              <circle cx="18" cy="6" r="3" />
              <path d="M18 9v1a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V9" />
              <path d="M12 12v3" />
            </svg>
            2. GitHub / Git Repo
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("live"); setErrorMsg(""); }}
            style={{
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: activeTab === "live" ? 600 : 500,
              background: activeTab === "live" ? "var(--surface)" : "transparent",
              borderTop: activeTab === "live" ? "2px solid var(--brand)" : "2px solid transparent",
              borderLeft: activeTab === "live" ? "1px solid var(--line)" : "1px solid transparent",
              borderRight: activeTab === "live" ? "1px solid var(--line)" : "1px solid transparent",
              borderBottom: "none",
              borderRadius: "7px 7px 0 0",
              color: activeTab === "live" ? "var(--ink)" : "var(--ink2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg className="i" viewBox="0 0 24 24" style={{ width: "15px", height: "15px" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            3. Live Hosted Website
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("saved"); setErrorMsg(""); }}
            style={{
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: activeTab === "saved" ? 600 : 500,
              background: activeTab === "saved" ? "var(--surface)" : "transparent",
              borderTop: activeTab === "saved" ? "2px solid var(--brand)" : "2px solid transparent",
              borderLeft: activeTab === "saved" ? "1px solid var(--line)" : "1px solid transparent",
              borderRight: activeTab === "saved" ? "1px solid var(--line)" : "1px solid transparent",
              borderBottom: "none",
              borderRadius: "7px 7px 0 0",
              color: activeTab === "saved" ? "var(--ink)" : "var(--ink2)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              whiteSpace: "nowrap",
            }}
          >
            <svg className="i" viewBox="0 0 24 24" style={{ width: "15px", height: "15px" }}>
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
            4. Saved / Existing Tasks ({savedTasks.length})
          </button>
        </div>

        {/* Modal Content Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {errorMsg && (
            <div
              style={{
                border: "1px solid var(--fail)",
                background: "color-mix(in srgb, var(--fail) 10%, var(--surface))",
                color: "var(--fail)",
                padding: "10px 14px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontFamily: "var(--f-mono)",
                marginBottom: "16px",
              }}
            >
              ✕ {errorMsg}
            </div>
          )}

          {isSubmitting && (
            <div
              style={{
                border: "1px solid var(--brand)",
                background: "color-mix(in srgb, var(--brand) 8%, var(--surface))",
                padding: "16px 20px",
                borderRadius: "10px",
                marginBottom: "16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="chip brand" style={{ animation: "pulse 1.2s infinite" }}>
                  Active Orchestration
                </span>
                <span className="mono" style={{ fontSize: "12px", color: "var(--brand)" }}>
                  {submitStep}
                </span>
              </div>
              <div
                style={{
                  height: "4px",
                  borderRadius: "2px",
                  background: "var(--surface2)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: "70%",
                    background: "var(--brand)",
                    animation: "shimmer 1.5s infinite linear",
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB 1: ZIP ARCHIVE */}
          {activeTab === "zip" && (
            <div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: dragOver ? "2px dashed var(--brand)" : "2px dashed var(--line)",
                  borderRadius: "10px",
                  padding: "28px 20px",
                  textAlign: "center",
                  background: dragOver ? "color-mix(in srgb, var(--brand) 6%, var(--surface))" : "var(--bg)",
                  cursor: "pointer",
                  transition: "all 150ms ease",
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  style={{ display: "none" }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileSelected(e.target.files[0]);
                    }
                  }}
                />
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "50%",
                    background: "var(--surface)",
                    border: "1px solid var(--line)",
                    display: "grid",
                    placeItems: "center",
                    margin: "0 auto 12px",
                    color: "var(--brand)",
                  }}
                >
                  <svg className="i" viewBox="0 0 24 24" style={{ width: "24px", height: "24px" }}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <b style={{ fontSize: "14px", display: "block" }}>
                  Drag &amp; drop repository .zip file here, or click to browse
                </b>
                <span className="sub" style={{ fontSize: "12px", display: "block", marginTop: "4px" }}>
                  Supports Python 3.11/3.12 Django, FastAPI, Flask, and Next.js / Node codebases.
                </span>
              </div>

              {selectedFile && (
                <div
                  style={{
                    marginTop: "16px",
                    border: "1px solid var(--line)",
                    borderRadius: "9px",
                    padding: "14px 16px",
                    background: "var(--surface)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="chip brand">Archive Ready</span>
                      <b className="mono" style={{ fontSize: "13px" }}>{selectedFile.name}</b>
                      <span className="sub mono" style={{ fontSize: "11.5px" }}>({selectedFile.size})</span>
                    </div>
                    <button
                      type="button"
                      className="btn sm sec"
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                    >
                      Clear
                    </button>
                  </div>

                  <div style={{ marginTop: "12px" }}>
                    <div className="eyebrow" style={{ fontSize: "10px", marginBottom: "6px" }}>
                      Auto-Detected Entrypoints &amp; Hotspots:
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      {selectedFile.entrypoints.map((ep, i) => (
                        <div
                          key={i}
                          className="mono"
                          style={{
                            fontSize: "12px",
                            padding: "6px 10px",
                            borderRadius: "6px",
                            background: "var(--surface2)",
                            border: "1px solid var(--line)",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <svg className="i" viewBox="0 0 24 24" style={{ width: "13px", height: "13px", color: "var(--brand)" }}>
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                          {ep}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: GITHUB / GIT REPO */}
          {activeTab === "git" && (
            <form onSubmit={handleStartGit} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="field">
                <label htmlFor="repo-url">Repository URL (GitHub / GitLab / Bitbucket) *</label>
                <div className="input mono focus" style={{ padding: 0 }}>
                  <input
                    id="repo-url"
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/org/repo"
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      padding: "0 12px",
                      fontFamily: "var(--f-mono)",
                      fontSize: "12.5px",
                      color: "var(--ink)",
                    }}
                  />
                </div>
                <div className="hint">Cloned inside isolated MicroVM with zero egress (network=none) after clone</div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div className="field">
                  <label htmlFor="repo-branch">Branch</label>
                  <div className="input mono" style={{ padding: 0 }}>
                    <input
                      id="repo-branch"
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        padding: "0 12px",
                        fontFamily: "var(--f-mono)",
                        fontSize: "12.5px",
                        color: "var(--ink)",
                      }}
                    />
                  </div>
                </div>

                <div className="field">
                  <label htmlFor="scan-commit">Target Commit SHA</label>
                  <div className="input mono" style={{ padding: 0 }}>
                    <input
                      id="scan-commit"
                      type="text"
                      value={commitSha}
                      onChange={(e) => setCommitSha(e.target.value)}
                      style={{
                        width: "100%",
                        height: "100%",
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        padding: "0 12px",
                        fontFamily: "var(--f-mono)",
                        fontSize: "12.5px",
                        color: "var(--ink)",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="field">
                <label>Verification Mode</label>
                <select
                  value={verificationMode}
                  onChange={(e) => setVerificationMode(e.target.value)}
                  style={{
                    height: "36px",
                    background: "var(--surface2)",
                    border: "1px solid var(--line)",
                    borderRadius: "7px",
                    padding: "0 12px",
                    color: "var(--ink)",
                    fontSize: "12.5px",
                    fontFamily: "var(--f-mono)",
                  }}
                >
                  <option value="OPTIMIZE (Performance + Security Gates)">
                    OPTIMIZE — Dual Speedup &amp; IDOR Security Gauntlet
                  </option>
                  <option value="HARDEN (Security Defense & Exploit Oracle)">
                    HARDEN — Aggressive Vulnerability Elimination
                  </option>
                  <option value="AUDIT (Read-only G0-G7 Gauntlet)">
                    AUDIT — Zero-Modification Compliance Verification
                  </option>
                </select>
              </div>
            </form>
          )}

          {/* TAB 3: LIVE HOSTED WEBSITE */}
          {activeTab === "live" && (
            <form onSubmit={handleStartLive} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="field">
                <label htmlFor="live-target-url">Live Target Application URL *</label>
                <div className="input mono focus" style={{ padding: 0 }}>
                  <input
                    id="live-target-url"
                    type="url"
                    value={liveUrl}
                    onChange={(e) => setLiveUrl(e.target.value)}
                    placeholder="https://staging.my-company.com"
                    style={{
                      width: "100%",
                      height: "100%",
                      background: "transparent",
                      border: "none",
                      outline: "none",
                      padding: "0 12px",
                      fontFamily: "var(--f-mono)",
                      fontSize: "12.5px",
                      color: "var(--ink)",
                    }}
                  />
                </div>
                <div className="hint">Direct dynamic security &amp; latency probe without touching source code</div>
              </div>

              <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr", gap: "14px" }}>
                <div className="field">
                  <label>Scan Profile</label>
                  <select
                    value={scanProfile}
                    onChange={(e) => setScanProfile(e.target.value)}
                    style={{
                      height: "36px",
                      background: "var(--surface2)",
                      border: "1px solid var(--line)",
                      borderRadius: "7px",
                      padding: "0 12px",
                      color: "var(--ink)",
                      fontSize: "12.5px",
                    }}
                  >
                    <option value="OWASP Top-10 & Active IDOR (12 Probes)">
                      OWASP Top-10 &amp; Active IDOR (12 Probes)
                    </option>
                    <option value="Full Active DAST & Exploit Suite (28 Probes)">
                      Full Active DAST &amp; Exploit Suite (28 Probes)
                    </option>
                    <option value="Latency & Resource Concurrency Test (50 req/s)">
                      Latency &amp; Resource Concurrency Test (50 req/s)
                    </option>
                  </select>
                </div>

                <div className="field">
                  <label>Worker Concurrency</label>
                  <select
                    value={concurrency}
                    onChange={(e) => setConcurrency(e.target.value)}
                    style={{
                      height: "36px",
                      background: "var(--surface2)",
                      border: "1px solid var(--line)",
                      borderRadius: "7px",
                      padding: "0 12px",
                      color: "var(--ink)",
                      fontSize: "12.5px",
                    }}
                  >
                    <option value="4 concurrent workers (Safe non-destructive)">
                      4 workers (Safe Non-Destructive)
                    </option>
                    <option value="8 concurrent workers (Standard Staging)">
                      8 workers (Standard Staging)
                    </option>
                    <option value="1 worker (Gentle Production Probe)">
                      1 worker (Gentle Production Probe)
                    </option>
                  </select>
                </div>
              </div>
            </form>
          )}

          {/* TAB 4: SAVED / EXISTING TASKS */}
          {activeTab === "saved" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <input
                  type="text"
                  placeholder="Filter saved tasks by ID, name or function..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  style={{
                    flex: 1,
                    height: "36px",
                    background: "var(--surface2)",
                    border: "1px solid var(--line)",
                    borderRadius: "7px",
                    padding: "0 12px",
                    color: "var(--ink)",
                    fontSize: "12.5px",
                  }}
                />
                <span className="sub mono" style={{ fontSize: "11px" }}>
                  {filteredTasks.length} tasks
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "280px", overflowY: "auto" }}>
                {filteredTasks.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onClose();
                      router.push(`/cockpit/${t.id}`);
                    }}
                    style={{
                      border: "1px solid var(--line)",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      background: "var(--surface)",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "border-color 120ms ease",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--brand)")}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--line)")}
                  >
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="chip brand mono" style={{ fontSize: "10.5px" }}>{t.id}</span>
                        <b style={{ fontSize: "13px" }}>{t.name}</b>
                        <span
                          className={`chip ${t.status === "ACCEPTED" ? "pass" : "fail"}`}
                          style={{ fontSize: "10px", height: "18px" }}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="mono sub" style={{ fontSize: "11.5px", marginTop: "4px" }}>
                        {t.target} · {t.speedup} · {t.runtime} · {t.date}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="btn sm sec"
                      onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                        router.push(`/cockpit/${t.id}`);
                      }}
                    >
                      Open Cockpit →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Zero-Compromise Invariant Box */}
          <div
            style={{
              marginTop: "20px",
              border: "1px solid var(--line)",
              borderRadius: "9px",
              padding: "12px 14px",
              background: "var(--bg)",
            }}
          >
            <div className="row" style={{ fontWeight: 600, fontSize: "12.5px" }}>
              <svg className="i" viewBox="0 0 24 24" style={{ color: "var(--brand)" }}>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Zero-Compromise Verification Invariant
            </div>
            <div className="sub" style={{ marginTop: "4px", fontSize: "11.5px" }}>
              A patch ships only if ΔPerf &gt; τ_noise with zero correctness and zero security regressions. Critical safety gates cannot be bypassed.
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div
          className="ft"
          style={{
            padding: "14px 24px",
            borderTop: "1px solid var(--line)",
            background: "var(--surface2)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            className="btn sec"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            {activeTab === "zip" && (
              <button
                type="button"
                className="btn acc"
                onClick={handleStartZip}
                disabled={isSubmitting || !selectedFile}
              >
                {isSubmitting ? "Bootstrapping MicroVM..." : "Start Verification & Ingest ZIP"}
              </button>
            )}

            {activeTab === "git" && (
              <button
                type="button"
                className="btn acc"
                onClick={handleStartGit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Cloning Repo..." : "Dispatch Remote Verification"}
              </button>
            )}

            {activeTab === "live" && (
              <button
                type="button"
                className="btn acc"
                onClick={handleStartLive}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Launching DAST..." : "Launch DAST Verification Probe"}
              </button>
            )}

            {activeTab === "saved" && (
              <button
                type="button"
                className="btn acc"
                onClick={() => {
                  onClose();
                  router.push("/cockpit/TASK9142");
                }}
              >
                Open Current Run (TASK9142) →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
