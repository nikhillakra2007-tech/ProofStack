"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api, getApiKey, setApiKey } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [dbStatus, setDbStatus] = useState<string>("unknown");
  const [isSeedingDemo, setIsSeedingDemo] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);

  const checkConnectivity = async () => {
    try {
      const ready = await api.getReady();
      setBackendOnline(ready.ready);
      setDbStatus(ready.database);
    } catch {
      setBackendOnline(false);
      setDbStatus("disconnected");
    }
  };

  useEffect(() => {
    checkConnectivity();
    const interval = setInterval(checkConnectivity, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSeedDemo = async () => {
    setIsSeedingDemo(true);
    setFeedback(null);
    try {
      const res = await api.seedDemo(true);
      setFeedback(`Seeded demo fixture: ${res.run_id}`);
      window.location.href = `/runs/${res.run_id}`;
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : "Failed to seed demo");
    } finally {
      setIsSeedingDemo(false);
    }
  };

  const handleSaveKey = () => {
    setApiKey(keyInput.trim());
    setShowKeyModal(false);
    checkConnectivity();
  };

  return (
    <header className="border-b border-ps-rule bg-ps-sheet sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 no-underline text-ps-ink">
            <div className="w-5 h-5 bg-ps-focus rounded-sm flex items-center justify-center font-mono font-bold text-white text-xs">
              P
            </div>
            <div>
              <span className="font-bold tracking-tight text-base">PROOFSTACK</span>
              <span className="text-ps-ink-2 text-xs ml-2 hidden sm:inline">Verification Gauntlet</span>
            </div>
          </Link>

          <nav className="flex items-center gap-1 text-sm">
            <Link
              href="/"
              className={`px-3 py-1.5 rounded-sm transition-colors no-underline ${
                pathname === "/" ? "bg-ps-paper font-semibold text-ps-ink" : "text-ps-ink-2 hover:text-ps-ink"
              }`}
            >
              Overview
            </Link>
            <Link
              href="/projects"
              className={`px-3 py-1.5 rounded-sm transition-colors no-underline ${
                pathname.startsWith("/projects") ? "bg-ps-paper font-semibold text-ps-ink" : "text-ps-ink-2 hover:text-ps-ink"
              }`}
            >
              Projects & Tasks
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Backend Connectivity Status */}
          <div
            className="flex items-center gap-1.5 text-xs font-mono px-2 py-1 rounded-sm border border-ps-rule bg-ps-paper cursor-pointer"
            onClick={checkConnectivity}
            title="Click to re-ping backend"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline === true
                  ? "bg-ps-seated"
                  : backendOnline === false
                  ? "bg-ps-breach"
                  : "bg-ps-hold"
              }`}
            />
            <span className="text-ps-ink">
              {backendOnline === true ? `API 8765 (DB: ${dbStatus})` : backendOnline === false ? "Backend Offline" : "Checking..."}
            </span>
          </div>

          {/* Seed Walkthrough Action */}
          <button
            onClick={handleSeedDemo}
            disabled={isSeedingDemo || backendOnline === false}
            className="badge badge-focus hover:opacity-90 disabled:opacity-50 text-xs py-1 px-2.5 cursor-pointer"
            title="Deterministic Walkthrough: Seeds a pre-computed IDOR verification fixture"
          >
            {isSeedingDemo ? "Seeding..." : "⚡ Seed Demo Fixture"}
          </button>

          {/* Auth Key Modal Trigger */}
          <button
            onClick={() => {
              setKeyInput(getApiKey());
              setShowKeyModal(true);
            }}
            className="text-xs text-ps-ink-2 hover:text-ps-ink border border-ps-rule px-2 py-1 rounded-sm"
            title="Configure X-API-Key"
          >
            Key
          </button>
        </div>
      </div>

      {feedback && (
        <div className="bg-ps-seated/10 text-ps-seated text-xs py-1 px-4 text-center border-t border-ps-seated/20">
          {feedback}
        </div>
      )}

      {showKeyModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="panel max-w-md w-full bg-ps-sheet shadow-lg border border-ps-rule">
            <h3 className="font-semibold text-base mb-2">API Key Configuration</h3>
            <p className="text-xs text-ps-ink-2 mb-3">
              Protected endpoints require the <code className="bg-ps-paper px-1 py-0.5 rounded">X-API-Key</code> header. Default dev key is <code className="bg-ps-paper px-1 py-0.5 rounded">change-me-in-production</code>.
            </p>
            <input
              type="text"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              placeholder="Enter API Key"
              className="w-full text-sm font-mono border border-ps-rule rounded-sm px-2.5 py-1.5 mb-4 bg-ps-paper text-ps-ink"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-xs px-3 py-1.5 border border-ps-rule rounded-sm text-ps-ink-2 hover:bg-ps-paper"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveKey}
                className="badge badge-focus text-xs px-3 py-1.5"
              >
                Save Key
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
