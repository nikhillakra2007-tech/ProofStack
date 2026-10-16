"use client";

import { useState } from "react";
import { Report, api } from "@/lib/api";

interface ReportViewerProps {
  runId: string;
  reports: Report[];
  onReportGenerated: () => void;
  runStatus: string;
}

export function ReportViewer({ runId, reports, onReportGenerated, runStatus }: ReportViewerProps) {
  const [selectedFormat, setSelectedFormat] = useState<"markdown" | "json">("markdown");
  const [generating, setGenerating] = useState(false);
  const [activeReportId, setActiveReportId] = useState<string | null>(
    reports.length > 0 ? reports[0].id : null
  );
  const [error, setError] = useState<string | null>(null);

  const activeReport = reports.find((r) => r.id === activeReportId) || reports[0];

  const handleGenerate = async (format: "markdown" | "json") => {
    setGenerating(true);
    setError(null);
    try {
      const rep = await api.createReport(runId, format, "1.0");
      onReportGenerated();
      setActiveReportId(rep.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to generate report");
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!activeReport) return;
    const isMd = activeReport.format === "markdown";
    const content = isMd
      ? activeReport.content || ""
      : JSON.stringify(activeReport.content_json, null, 2);
    const mime = isMd ? "text/markdown;charset=utf-8" : "application/json;charset=utf-8";
    const filename = `proofstack_report_${runId.slice(0, 8)}.${isMd ? "md" : "json"}`;

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isTerminal = ["COMPLETED", "FAILED", "CANCELLED"].includes(runStatus);

  return (
    <div className="panel border border-ps-rule bg-ps-sheet space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-ps-rule">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-ps-ink-2">Verification Audit Reports</span>
          <span className="text-[11px] text-ps-ink-2 font-mono ml-2">Authoritative Export</span>
        </div>

        <div className="flex items-center gap-2">
          {reports.length > 0 && (
            <button
              onClick={handleDownload}
              className="text-xs border border-ps-rule px-3 py-1 rounded-sm bg-ps-paper hover:bg-ps-sheet text-ps-ink cursor-pointer font-medium"
            >
              📥 Download Report
            </button>
          )}

          <button
            onClick={() => handleGenerate(selectedFormat)}
            disabled={generating || !isTerminal}
            className="badge badge-focus text-xs px-3 py-1 cursor-pointer font-medium disabled:opacity-50"
            title={!isTerminal ? "Run must complete before generating report" : ""}
          >
            {generating ? "Generating..." : `+ Generate ${selectedFormat.toUpperCase()} Report`}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2.5 bg-ps-breach/10 border border-ps-breach/30 text-ps-breach text-xs rounded-sm">
          {error}
        </div>
      )}

      {/* Report Format Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs">
          {reports.map((rep) => (
            <button
              key={rep.id}
              onClick={() => setActiveReportId(rep.id)}
              className={`px-3 py-1 rounded-sm border cursor-pointer font-mono ${
                activeReport?.id === rep.id
                  ? "bg-ps-focus text-white border-ps-focus font-bold"
                  : "bg-ps-paper border-ps-rule text-ps-ink hover:bg-ps-sheet"
              }`}
            >
              {rep.format.toUpperCase()} (v{rep.schema_version})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-ps-ink-2">Format:</span>
          <select
            value={selectedFormat}
            onChange={(e) => setSelectedFormat(e.target.value as "markdown" | "json")}
            className="border border-ps-rule bg-ps-paper rounded-sm px-2 py-0.5 text-xs text-ps-ink"
          >
            <option value="markdown">Markdown</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>

      {/* Report Content View */}
      {activeReport ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-ps-ink-2 bg-ps-paper p-2 rounded-sm border border-ps-rule">
            <div>
              <span>Generated: </span>
              <span className="text-ps-ink">{new Date(activeReport.generated_at).toLocaleString()}</span>
            </div>
            {activeReport.deterministic_hash && (
              <div className="truncate max-w-[280px]">
                <span>Hash: </span>
                <span className="text-ps-ink">{activeReport.deterministic_hash.slice(0, 16)}...</span>
              </div>
            )}
          </div>

          <div className="bg-ps-paper p-4 rounded-sm border border-ps-rule max-h-96 overflow-y-auto font-mono text-xs text-ps-ink whitespace-pre-wrap leading-relaxed">
            {activeReport.format === "markdown"
              ? activeReport.content || "Report generated but content empty."
              : JSON.stringify(activeReport.content_json, null, 2)}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center border border-dashed border-ps-rule rounded-sm text-xs text-ps-ink-2">
          {isTerminal ? (
            <div>
              <p className="mb-2">No report generated for this run yet.</p>
              <button
                onClick={() => handleGenerate("markdown")}
                disabled={generating}
                className="badge badge-focus text-xs px-3 py-1 cursor-pointer"
              >
                Generate Markdown Audit Report
              </button>
            </div>
          ) : (
            <p>Reports will become available once the run reaches a terminal state.</p>
          )}
        </div>
      )}
    </div>
  );
}
