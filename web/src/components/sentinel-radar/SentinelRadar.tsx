"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, Activity, CheckCircle, AlertCircle, 
  Terminal, X, ChevronRight, Zap, Lock 
} from "lucide-react";
import { MOCK_SENTINEL_GATES } from "@/lib/mockData";

export const SentinelRadar: React.FC = () => {
  const [selectedGate, setSelectedGate] = useState<typeof MOCK_SENTINEL_GATES[0] | null>(null);

  return (
    <section className="py-20 px-4 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D7BE82]/10 border border-[#D7BE82]/30 text-xs font-mono text-[#D7BE82] mb-3">
            <Activity className="w-3.5 h-3.5 animate-pulse" />
            TELEMETRY &amp; GATES
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-[#FDFBF7] tracking-tight">
            The 8 Sentinel Validation Gates
          </h2>
          <p className="text-[#D6D1C4] text-sm md:text-base mt-2 max-w-2xl">
            Every candidate pull request must pass all 8 non-negotiable gates in pipeline sequence before automated deployment or merge.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#D7BE82] bg-[#D7BE82]/10 px-3 py-1.5 rounded-lg border border-[#D7BE82]/30">
          <span className="w-2 h-2 rounded-full bg-[#D7BE82] animate-ping inline-block" />
          <span>8/8 GATES PASSING (100% HEALTH)</span>
        </div>
      </div>

      {/* Grid of 8 Gates */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {MOCK_SENTINEL_GATES.map((gate) => (
          <motion.div
            key={gate.id}
            whileHover={{ y: -4 }}
            onClick={() => setSelectedGate(gate)}
            className="cursor-pointer rounded-xl border border-[#515A47]/40 bg-[#151B13]/80 hover:border-[#D7BE82]/50 p-5 transition-all duration-200 group flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-mono text-[#D7BE82] font-bold bg-[#0E120D] px-2 py-0.5 rounded border border-[#515A47]/40">
                  {gate.id}
                </span>
                <span className="text-[11px] font-mono text-[#E8CFA0] flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-[#D7BE82]" />
                  {gate.timing}
                </span>
              </div>

              <h4 className="text-base font-bold text-[#FDFBF7] group-hover:text-[#D7BE82] transition-colors">
                {gate.name}
              </h4>
              
              <p className="text-xs text-[#9E9889] mt-2 line-clamp-2">
                {gate.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#515A47]/30 flex items-center justify-between text-[11px] font-mono text-[#9E9889] group-hover:text-[#D7BE82] transition-colors">
              <span>Inspect Telemetry</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Gate Inspection Modal */}
      <AnimatePresence>
        {selectedGate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg rounded-2xl border border-[#D7BE82]/40 bg-[#151B13] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#515A47]/40">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-[#D7BE82] font-bold bg-[#0E120D] px-2 py-0.5 rounded border border-[#515A47]/40">
                    {selectedGate.id}
                  </span>
                  <h3 className="text-lg font-bold text-[#FDFBF7]">{selectedGate.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedGate(null)}
                  className="p-1 rounded-lg text-[#9E9889] hover:text-[#FDFBF7] hover:bg-[#1E261B]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-sm text-[#D6D1C4] leading-relaxed">
                {selectedGate.description}
              </p>

              <div className="p-4 rounded-xl bg-[#0E120D] border border-[#515A47]/40 font-mono text-xs space-y-2">
                <div className="flex justify-between text-[#9E9889]">
                  <span>Execution Latency:</span>
                  <span className="text-[#D7BE82]">{selectedGate.timing}</span>
                </div>
                <div className="flex justify-between text-[#9E9889]">
                  <span>Gate Status:</span>
                  <span className="text-[#D7BE82] font-bold uppercase">{selectedGate.status}</span>
                </div>
                <div className="flex justify-between text-[#9E9889]">
                  <span>Bypass Tolerance:</span>
                  <span className="text-[#FDFBF7]">0.00% (Strict Hard Fail)</span>
                </div>
              </div>

              <button
                onClick={() => setSelectedGate(null)}
                className="w-full py-2.5 rounded-lg bg-[#D7BE82] hover:bg-[#EAD6B0] text-[#0E120D] font-mono text-xs font-bold transition-colors"
              >
                Close Telemetry Inspection
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default SentinelRadar;
