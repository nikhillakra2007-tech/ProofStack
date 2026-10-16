"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, Run } from "@/lib/api";

export default function RunListPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .listRuns()
      .then(setRuns)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="panel m-4">Loading runs...</div>;
  if (error) return <div className="panel m-4 text-ps-breach">Error: {error}</div>;
  if (runs.length === 0) return <div className="panel m-4 text-ps-ink-2">No runs yet. Create a project and task to start.</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">ProofStack Runs</h1>
      <div className="space-y-2">
        {runs.map((run) => (
          <Link
            key={run.id}
            href={`/runs/${run.id}`}
            className="panel flex items-center justify-between hover:border-ps-focus transition-colors no-underline text-ps-ink"
          >
            <div>
              <div className="font-mono text-sm">{run.id.slice(0, 8)}</div>
              <div className="text-ps-ink-2 text-xs">{run.current_stage}</div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={run.status} />
              {run.final_verdict && <VerdictBadge verdict={run.final_verdict} />}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color =
    status === "COMPLETED" ? "text-ps-seated" :
    status === "FAILED" || status === "CANCELLED" ? "text-ps-breach" :
    "text-ps-hold";
  return <span className={`badge ${color}`}>{status}</span>;
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const color =
    verdict === "ACCEPTED" ? "badge-seated" :
    verdict === "REJECTED" ? "badge-breach" :
    "badge-hold";
  return <span className={`badge ${color}`}>{verdict}</span>;
}
