"use client";

interface FamilyStatus {
  status: string;
  caption: string;
}

interface InterlockProps {
  families: Record<string, FamilyStatus>;
  verdict: string | null;
}

export function Interlock({ families, verdict }: InterlockProps) {
  const order = ["PERF", "SEC", "CORR", "CONC"];
  const allSeated = order.every((f) => families[f]?.status === "PASS");
  const engaged = allSeated && verdict === "ACCEPTED";

  return (
    <div className="panel">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-ps-ink-2">Interlock</h2>
        <div className={`text-lg font-bold ${engaged ? "text-ps-seated" : "text-ps-breach"}`}>
          {verdict || "PENDING"}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1">
        {order.map((fam) => {
          const fs = families[fam] || { status: "NOT_RUN", caption: fam };
          const colorClass =
            fs.status === "PASS" ? "border-ps-seated bg-ps-seated/10" :
            fs.status === "FAIL" ? "border-ps-breach bg-ps-breach/10" :
            fs.status === "INCONCLUSIVE" ? "border-ps-hold bg-ps-hold/10" :
            fs.status === "NOT_APPLICABLE" ? "border-ps-ink-2" :
            "border-ps-notrun border-dashed";
          return (
            <div key={fam} className={`border-2 rounded-sm p-2 text-center ${colorClass}`}>
              <div className="text-xs font-semibold">{fam}</div>
              <div className="text-xs text-ps-ink-2">{fs.status.replace(/_/g, " ")}</div>
            </div>
          );
        })}
      </div>
      <div className={`mt-2 h-1 rounded-sm ${engaged ? "bg-ps-seated" : "bg-ps-rule"}`}>
        <div className={`h-full rounded-sm transition-all ${engaged ? "w-full bg-ps-seated" : "w-0"}`} />
      </div>
      <p className="text-xs text-ps-ink-2 mt-1">
        {engaged ? "Bolt engaged: all families seated" : "Bolt retracted: not all families seated"}
      </p>
    </div>
  );
}
