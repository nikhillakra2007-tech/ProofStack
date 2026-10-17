"use client";

interface Hypothesis {
  id: string;
  hypothesis_id: string;
  category: string;
  statement: string;
  validation_status: string;
  falsifiable_prediction?: string;
  model_metadata?: {
    provenance?: string;
    provider?: string;
    model_id?: string;
    fallback_reason?: string;
    latency_ms?: number;
    tokens_in?: number;
    tokens_out?: number;
  };
}

interface Experiment {
  id: string;
  experiment_id: string;
  experiment_type: string;
  result_status: string | null;
  actual_observations?: Record<string, unknown>;
  duration_s?: number;
}

interface HypothesisViewProps {
  hypotheses: Hypothesis[];
  experiments?: Experiment[];
  onTriggerAnalysis?: () => void;
  analyzing?: boolean;
}

export function HypothesisView({
  hypotheses,
  experiments = [],
  onTriggerAnalysis,
  analyzing = false,
}: HypothesisViewProps) {
  if (hypotheses.length === 0) {
    return (
      <div className="panel border border-ps-rule bg-ps-sheet space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-ps-ink-2">2. Hypotheses & Experimentation</h2>
          {onTriggerAnalysis && (
            <button
              onClick={onTriggerAnalysis}
              disabled={analyzing}
              className="px-2.5 py-1 text-xs font-mono font-medium rounded border border-ps-focus bg-ps-paper hover:bg-ps-focus/10 transition-colors"
            >
              {analyzing ? "Analyzing..." : "Trigger AI Diagnosis"}
            </button>
          )}
        </div>
        <p className="text-xs text-ps-ink-2 italic">Awaiting AI diagnostic proposal or local rule evaluation...</p>
      </div>
    );
  }

  const firstMetadata = hypotheses[0]?.model_metadata;
  const isLive = firstMetadata?.provenance === "live_inference";
  const modelId = firstMetadata?.model_id || "nvidia/nemotron-3-super-120b";
  const fallbackReason = firstMetadata?.fallback_reason;

  return (
    <div className="panel border border-ps-rule bg-ps-sheet space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-ps-rule">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ps-ink-2">2. Hypotheses & Experimentation</span>
          <span className="text-[11px] text-ps-ink-2 font-mono">Scientific Elimination</span>
        </div>
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="badge text-[11px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-600/50">
              Live AI Inference ({modelId})
            </span>
          ) : (
            <span className="badge text-[11px] font-mono bg-amber-950/70 text-amber-300 border border-amber-600/50">
              Deterministic Rule Engine (Local Fallback)
            </span>
          )}
          {onTriggerAnalysis && (
            <button
              onClick={onTriggerAnalysis}
              disabled={analyzing}
              className="px-2 py-0.5 text-[11px] font-mono rounded border border-ps-rule hover:bg-ps-focus/10 transition-colors"
              title="Re-run evidence-grounded diagnosis"
            >
              {analyzing ? "..." : "Re-diagnose"}
            </button>
          )}
        </div>
      </div>

      {fallbackReason && (
        <div className="text-[11px] font-mono p-2 rounded bg-ps-paper/80 border border-ps-rule text-ps-ink-2">
          <span className="font-bold text-amber-400">Provenance Note:</span> {fallbackReason}
        </div>
      )}

      {/* Hypotheses List */}
      <div className="space-y-2.5">
        {hypotheses.map((h) => {
          const isSupported = h.validation_status === "SUPPORTED";
          const isFalsified = h.validation_status === "FALSIFIED";

          return (
            <div
              key={h.id}
              className={`p-2.5 rounded-sm border transition-all ${
                isSupported
                  ? "border-ps-seated bg-ps-seated/5"
                  : isFalsified
                  ? "border-ps-rule bg-ps-paper/40 opacity-75"
                  : "border-ps-focus bg-ps-paper"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-xs">{h.hypothesis_id}</span>
                  <span className="badge badge-focus text-[10px] py-0">{h.category}</span>
                </div>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    isSupported ? "text-ps-seated" : isFalsified ? "text-ps-ink-2 line-through" : "text-ps-focus"
                  }`}
                >
                  {h.validation_status}
                </span>
              </div>
              <p
                className={`text-xs mt-1.5 ${
                  isFalsified ? "line-through text-ps-ink-2" : "text-ps-ink"
                }`}
              >
                {h.statement}
              </p>
              {h.falsifiable_prediction && (
                <div className="text-[11px] text-ps-ink-2 font-mono mt-1 italic">
                  Prediction: {h.falsifiable_prediction}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Experiments Timeline */}
      {experiments.length > 0 && (
        <div className="pt-2 border-t border-ps-rule">
          <div className="text-[11px] font-bold text-ps-ink-2 uppercase tracking-wide mb-2">
            Executed Discriminating Experiments ({experiments.length})
          </div>
          <div className="space-y-1.5">
            {experiments.map((exp) => (
              <div
                key={exp.id}
                className="flex items-center justify-between text-xs bg-ps-paper p-2 rounded-sm font-mono border border-ps-rule"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-ps-focus">{exp.experiment_id}</span>
                  <span className="text-ps-ink-2">[{exp.experiment_type}]</span>
                  <span className="text-ps-ink truncate max-w-[200px]">
                    {exp.actual_observations ? JSON.stringify(exp.actual_observations) : "executed"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {exp.duration_s && <span className="text-ps-ink-2">{exp.duration_s.toFixed(1)}s</span>}
                  <span className="badge badge-seated text-[10px] py-0">{exp.result_status || "DONE"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
