"use client";

interface Hypothesis {
  id: string;
  hypothesis_id: string;
  category: string;
  statement: string;
  validation_status: string;
}

export function HypothesisView({ hypotheses }: { hypotheses: Hypothesis[] }) {
  if (hypotheses.length === 0) {
    return (
      <div className="panel">
        <h2 className="text-lg font-semibold mb-2">Hypotheses & Experiments</h2>
        <p className="text-ps-ink-2 text-sm">Waiting for hypotheses...</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2 className="text-lg font-semibold mb-2">Hypotheses & Experiments</h2>
      <div className="space-y-2">
        {hypotheses.map((h) => (
          <div key={h.id} className="border-l-2 border-ps-focus pl-3">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold">{h.hypothesis_id}</span>
              <span className="badge badge-focus">{h.category}</span>
              <span className="text-xs text-ps-ink-2">{h.validation_status}</span>
            </div>
            <p className="text-sm text-ps-ink-2 mt-1">{h.statement}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
