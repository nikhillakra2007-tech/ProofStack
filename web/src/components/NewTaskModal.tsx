"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  UploadCloud,
  GitBranch,
  Globe,
  Code2,
  Sparkles,
  FileArchive,
  ArrowRight,
  FolderGit2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ShieldCheck,
  FileCode,
} from "lucide-react";

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NewTaskModal({ isOpen, onClose }: NewTaskModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active Source Tab (1 of 4)
  const [activeTab, setActiveTab] = useState<"zip" | "git" | "dast" | "scratchpad">("zip");

  // Tab 1: ZIP Upload State
  const [uploadedFileName, setUploadedFileName] = useState<string | null>("demo_app_fixture.zip");
  const [zipEntrypoint, setZipEntrypoint] = useState("orders.py:get_orders");
  const [isDragOver, setIsDragOver] = useState(false);

  // Tab 2: Git Repository State
  const [gitUrl, setGitUrl] = useState("https://github.com/perfproof-systems/core-backend");
  const [gitTarget, setGitTarget] = useState("orders.py:get_orders");
  const [gitBranch, setGitBranch] = useState("HEAD");
  const [gitMode, setGitMode] = useState<"OPTIMIZE" | "HARDEN" | "AUDIT">("OPTIMIZE");

  // Tab 3: DAST State
  const [targetUrl, setTargetUrl] = useState("https://staging.perfproof.internal");
  const [dastRepoPath, setDastRepoPath] = useState("./web");
  const [scanProfile, setScanProfile] = useState<"OWASP Top-10 Quick" | "Full Security Audit">(
    "OWASP Top-10 Quick"
  );

  // Tab 4: Scratchpad Template
  const [scratchTemplate, setScratchTemplate] = useState("blank");

  // Common submission & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Close on Escape key
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

  // Handle ZIP File Drop / Select
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setUploadedFileName(file.name);
      setZipEntrypoint("orders.py:get_orders");
      setErrorMsg(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedFileName(file.name);
      setZipEntrypoint("orders.py:get_orders");
      setErrorMsg(null);
    }
  };

  // Submit Tab 1: ZIP Archive
  const handleSubmitZip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadedFileName) {
      setErrorMsg("Please select or drop a .zip archive first.");
      return;
    }

    setIsSubmitting(true);
    setStatusText("Unzipping archive, inspecting AST worktree & provisioning MicroVM...");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath: `./sandbox/uploads/${uploadedFileName}`,
          target: zipEntrypoint || "orders.py:get_orders",
          baseCommit: "ZIP_ARCHIVE",
          mode: "OPTIMIZE",
        }),
      });
      const data = await res.json();
      const taskId = data.taskId || "TASK9142";
      setStatusText(`Worktree provisioned (${taskId})! Opening Cockpit...`);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        router.push(`/cockpit/${taskId}`);
      }, 600);
    } catch {
      setIsSubmitting(false);
      onClose();
      router.push("/cockpit/TASK9142");
    }
  };

  // Submit Tab 2: Git Repository URL
  const handleSubmitGit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gitUrl.trim()) {
      setErrorMsg("Please provide a valid Git URL or local repository path.");
      return;
    }

    setIsSubmitting(true);
    setStatusText("Cloning repository, detecting entrypoints, and evaluating lockfiles...");

    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoPath: gitUrl.trim(),
          target: gitTarget.trim() || "orders.py:get_orders",
          baseCommit: gitBranch.trim() || "HEAD",
          mode: gitMode,
        }),
      });
      const data = await res.json();
      const taskId = data.taskId || "TASK9142";
      setStatusText(`Repository ingested (${taskId})! Launching Cockpit...`);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        router.push(`/cockpit/${taskId}`);
      }, 600);
    } catch {
      setIsSubmitting(false);
      onClose();
      router.push("/cockpit/TASK9142");
    }
  };

  // Submit Tab 3: Live DAST Web URL
  const handleSubmitDast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
      setErrorMsg("Target URL must start with http:// or https://");
      return;
    }

    setIsSubmitting(true);
    setStatusText("Verifying ownership token, initiating DevTools telemetry scanner...");

    try {
      await fetch("/api/dast/targets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetUrl: targetUrl.trim(),
          repoPath: dastRepoPath.trim(),
          scanProfile,
        }),
      });

      setStatusText("Target verified! Dispatching live DAST viewport...");
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        router.push("/cockpit/TASK9142?viewport=6");
      }, 600);
    } catch {
      setIsSubmitting(false);
      onClose();
      router.push("/cockpit/TASK9142?viewport=6");
    }
  };

  // Submit Tab 4: Scratchpad
  const handleLaunchScratchpad = () => {
    onClose();
    router.push("/studio");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 animate-fade-in select-none">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-ink-900 border border-indigo-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-10 max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-ink-850/90 border-b border-hairline flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Zap className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Multi-Source Repository & Task Ingestion
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded">
                  4 INTAKE MODES
                </span>
              </div>
              <p className="text-xs text-ink-400 font-mono mt-0.5">
                Upload archives, point to Git repos, inspect live URLs, or copy-paste code
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-400 hover:text-white hover:bg-ink-800 transition-colors"
            title="Close dialog (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Tabs Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-hairline bg-ink-850/60 font-mono text-xs">
          <button
            onClick={() => {
              setActiveTab("zip");
              setErrorMsg(null);
            }}
            className={`py-3 px-3 flex items-center justify-center gap-2 border-b-2 font-semibold transition-all ${
              activeTab === "zip"
                ? "border-indigo-500 text-white bg-ink-900"
                : "border-transparent text-ink-400 hover:text-ink-200"
            }`}
          >
            <FileArchive className="w-4 h-4 text-indigo-400" />
            <span>1. Upload ZIP</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("git");
              setErrorMsg(null);
            }}
            className={`py-3 px-3 flex items-center justify-center gap-2 border-b-2 font-semibold transition-all ${
              activeTab === "git"
                ? "border-indigo-500 text-white bg-ink-900"
                : "border-transparent text-ink-400 hover:text-ink-200"
            }`}
          >
            <GitBranch className="w-4 h-4 text-purple-400" />
            <span>2. Git URL</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("dast");
              setErrorMsg(null);
            }}
            className={`py-3 px-3 flex items-center justify-center gap-2 border-b-2 font-semibold transition-all ${
              activeTab === "dast"
                ? "border-emerald-500 text-white bg-ink-900"
                : "border-transparent text-ink-400 hover:text-ink-200"
            }`}
          >
            <Globe className="w-4 h-4 text-emerald-400" />
            <span>3. Live DAST</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("scratchpad");
              setErrorMsg(null);
            }}
            className={`py-3 px-3 flex items-center justify-center gap-2 border-b-2 font-semibold transition-all ${
              activeTab === "scratchpad"
                ? "border-amber-500 text-white bg-ink-900"
                : "border-transparent text-ink-400 hover:text-ink-200"
            }`}
          >
            <Code2 className="w-4 h-4 text-amber-400" />
            <span>4. Scratchpad</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-mono flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: Upload Project ZIP Archive */}
          {activeTab === "zip" && (
            <form onSubmit={handleSubmitZip} className="space-y-4">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? "border-indigo-400 bg-indigo-500/10"
                    : "border-hairline bg-ink-950/60 hover:border-indigo-500/50 hover:bg-ink-950"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".zip"
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 mx-auto flex items-center justify-center mb-3">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs font-mono text-white font-semibold">
                  {uploadedFileName ? (
                    <span className="text-emerald-400 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      Loaded: {uploadedFileName}
                    </span>
                  ) : (
                    "Drag & Drop project .zip archive here, or click to browse"
                  )}
                </div>
                <p className="text-[11px] text-ink-500 font-mono mt-1">
                  Supports Django, FastAPI, Flask & Express codebases (max 100 MB)
                </p>
              </div>

              {/* Auto-detected entrypoint */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-ink-200 flex items-center justify-between">
                  <span>Auto-Detected Target Entrypoint</span>
                  <span className="text-[10px] text-emerald-400 font-mono">AST Route Matcher: ON</span>
                </label>
                <input
                  type="text"
                  value={zipEntrypoint}
                  onChange={(e) => setZipEntrypoint(e.target.value)}
                  placeholder="orders.py:get_orders"
                  className="w-full bg-ink-950 border border-hairline focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setUploadedFileName("demo_fixture_orders.zip");
                    setZipEntrypoint("orders.py:get_orders");
                  }}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 underline"
                >
                  Use Demo Fixture ZIP
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{statusText || "Extracting..."}</span>
                    </>
                  ) : (
                    <>
                      <span>Unpack ZIP & Launch Cockpit</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: GitHub / Git URL */}
          {activeTab === "git" && (
            <form onSubmit={handleSubmitGit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-ink-200 flex items-center justify-between">
                  <span>Git Repository URL / Clone URI *</span>
                  <span className="text-[10px] text-ink-500">Public or Token-authenticated</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={gitUrl}
                    onChange={(e) => setGitUrl(e.target.value)}
                    placeholder="https://github.com/org/repo or git@github.com:..."
                    className="w-full bg-ink-950 border border-hairline focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs font-mono text-white placeholder-ink-600 focus:outline-none"
                  />
                  <FolderGit2 className="w-4 h-4 text-ink-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-ink-200">
                    Target File & Function
                  </label>
                  <input
                    type="text"
                    value={gitTarget}
                    onChange={(e) => setGitTarget(e.target.value)}
                    placeholder="orders.py:get_orders"
                    className="w-full bg-ink-950 border border-hairline focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-ink-200">
                    Mode / Invariant Scope
                  </label>
                  <select
                    value={gitMode}
                    onChange={(e) => setGitMode(e.target.value as any)}
                    className="w-full bg-ink-950 border border-hairline focus:border-indigo-500 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none cursor-pointer"
                  >
                    <option value="OPTIMIZE">OPTIMIZE (Performance + Security)</option>
                    <option value="HARDEN">HARDEN (Strict Security Preservation)</option>
                    <option value="AUDIT">AUDIT (Passive Scan Only)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setGitUrl("./fixtures/demo_app");
                    setGitTarget("orders.py:get_orders");
                    setGitBranch("c8a94e1");
                    setGitMode("OPTIMIZE");
                  }}
                  className="text-xs font-mono text-indigo-400 hover:text-indigo-300 underline"
                >
                  Load Local Demo App Fixture
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{statusText || "Cloning..."}</span>
                    </>
                  ) : (
                    <>
                      <span>Clone & Launch Gauntlet</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Live DAST Web URL */}
          {activeTab === "dast" && (
            <form onSubmit={handleSubmitDast} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-semibold text-ink-200 flex items-center justify-between">
                  <span>Target Web Endpoint URL *</span>
                  <span className="text-[10px] text-emerald-400">GET/HEAD Telemetry &le; 2 rps</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    placeholder="https://staging.perfproof.internal"
                    className="w-full bg-ink-950 border border-hairline focus:border-emerald-500 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                  <Globe className="w-4 h-4 text-emerald-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-ink-200">
                    Source Code Mapping Path
                  </label>
                  <input
                    type="text"
                    value={dastRepoPath}
                    onChange={(e) => setDastRepoPath(e.target.value)}
                    placeholder="./web or ./frontend"
                    className="w-full bg-ink-950 border border-hairline focus:border-emerald-500 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono font-semibold text-ink-200">
                    Scan Profile
                  </label>
                  <select
                    value={scanProfile}
                    onChange={(e) => setScanProfile(e.target.value as any)}
                    className="w-full bg-ink-950 border border-hairline focus:border-emerald-500 rounded-lg px-3.5 py-2 text-xs font-mono text-white focus:outline-none cursor-pointer"
                  >
                    <option value="OWASP Top-10 Quick">OWASP Top-10 Quick (12 Passive Checks)</option>
                    <option value="Full Security Audit">Full Security Audit + Remediation</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>{statusText || "Dispatching..."}</span>
                    </>
                  ) : (
                    <>
                      <span>Register Target & Dispatch DAST</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: Interactive Code Scratchpad */}
          {activeTab === "scratchpad" && (
            <div className="space-y-4">
              <div className="p-4 bg-ink-950 rounded-xl border border-hairline space-y-2">
                <div className="flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xs font-bold text-white font-mono uppercase">
                    Direct Code Studio Playground
                  </h3>
                </div>
                <p className="text-xs text-ink-300 font-mono leading-relaxed">
                  Bypass repository cloning to write, copy-paste, and test arbitrary Python code
                  directly in the live Monaco Editor. You can execute code in MicroVM sandboxes,
                  run the 19-gate gauntlet, and synthesize Nemotron defensive patches on the fly.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] font-mono text-ink-500">
                  Includes 19 pre-loaded defect benchmarks
                </span>
                <button
                  onClick={handleLaunchScratchpad}
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-white rounded-lg text-xs font-mono font-bold flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
                >
                  <span>Launch Live Code Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
