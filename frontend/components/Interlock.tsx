"use client";

interface FamilyStatus {
  status: string;
  caption: string;
}

interface InterlockProps {
  families: Record<string, FamilyStatus>;
  verdict: string | null;
  blockerReason?: string | null;
}

export function Interlock({ families, verdict, blockerReason }: InterlockProps) {
  const order = ["PERF", "SEC", "CORR", "CONC"];
  
  // A family is seated if it passed or was deemed not applicable
  const allSeated = order.every((f) => {
    const st = families[f]?.status;
    return st === "PASS" || st === "NOT_APPLICABLE";
  });
  
  const engaged = allSeated && verdict === "ACCEPTED";
  const isRejected = verdict === "REJECTED";

  const getBlockerText = () => {
    if (engaged) return "Bolt engaged: Zero-Compromise policy satisfied across all four dimensions";
    if (blockerReason) return `Bolt retracted: Blocked by ${blockerReason}`;
    for (const f of order) {
      if (families[f]?.status === "FAIL") {
        return `Bolt retracted: Blocked by ${families[f].caption || f} failure`;
      }
    }
    for (const f of order) {
      if (families[f]?.status === "INCONCLUSIVE") {
        return `Bolt retracted: Blocked by ${families[f].caption || f} (inconclusive)`;
      }
    }
    return "Bolt retracted: Awaiting empirical verification results";
  };

  return (
    <div className="panel border border-ps-rule bg-ps-sheet space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-ps-rule">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ps-ink-2">Zero-Compromise Interlock</span>
          <span className="text-[11px] text-ps-ink-2 font-mono">Conjunctive Invariant</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-ps-ink-2">Verdict:</span>
          <span
            className={`font-mono font-bold text-sm px-2 py-0.5 rounded-sm ${
              engaged
                ? "bg-ps-seated/15 text-ps-seated border border-ps-seated"
                : isRejected
                ? "bg-ps-breach/15 text-ps-breach border border-ps-breach"
                : "bg-ps-hold/15 text-ps-hold border border-ps-hold"
            }`}
          >
            {verdict || "PENDING"}
          </span>
        </div>
      </div>

      {/* The 4-segment gauge */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {order.map((fam) => {
          const fs = families[fam] || { status: "NOT_RUN", caption: fam };
          const isPass = fs.status === "PASS";
          const isFail = fs.status === "FAIL";
          const isHeld = fs.status === "INCONCLUSIVE";
          const isNA = fs.status === "NOT_APPLICABLE";

          const colorClass = isPass
            ? "border-ps-seated bg-ps-seated/10 text-ps-seated"
            : isFail
            ? "border-ps-breach bg-ps-breach/10 text-ps-breach"
            : isHeld
            ? "border-ps-hold bg-ps-hold/10 text-ps-hold"
            : isNA
            ? "border-ps-rule bg-ps-paper text-ps-ink-2"
            : "border-ps-notrun border-dashed bg-ps-paper text-ps-ink-2";

          return (
            <div
              key={fam}
              className={`border-2 rounded-sm p-2.5 flex flex-col justify-between transition-all ${colorClass}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-tight">
                  {fam === "PERF" ? "Performance" : fam === "SEC" ? "Security" : fam === "CORR" ? "Correctness" : "Concurrency"}
                </span>
                <span className="text-[10px] font-mono uppercase px-1 py-0.2 rounded bg-white/40">
                  {fs.status.replace(/_/g, " ")}
                </span>
              </div>
              <div className="text-xs font-mono mt-2 truncate text-ps-ink">
                {fs.caption || (isPass ? "Seated" : isFail ? "Breached" : isNA ? "Not Applicable" : "Pending")}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bolt Mechanism Visualization */}
      <div className="pt-1">
        <div className={`h-2 rounded-full overflow-hidden border border-ps-rule bg-ps-paper`}>
          <div
            className={`h-full transition-all duration-300 ${
              engaged
                ? "w-full bg-ps-seated"
                : isRejected
                ? "w-1/4 bg-ps-breach"
                : "w-1/6 bg-ps-hold"
            }`}
          />
        </div>
        <div className="flex items-center justify-between text-xs mt-1.5 font-mono text-ps-ink-2">
          <span>{getBlockerText()}</span>
          <span className="font-bold">{engaged ? "BOLT SEATED [ENGAGED]" : "BOLT OPEN [RETRACTED]"}</span>
        </div>
      </div>
    </div>
  );
}
