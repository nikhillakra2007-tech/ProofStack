"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Calculator, DollarSign, Clock, ShieldAlert, Zap } from "lucide-react";

export const ResilienceCalc: React.FC = () => {
  const [prsPerMonth, setPrsPerMonth] = useState<number>(350);
  const [devCount, setDevCount] = useState<number>(45);
  const [hourlyRate, setHourlyRate] = useState<number>(85);

  // Calculations
  const vulnProbabilityPerPr = 0.08;
  const totalFlaws = Math.round(prsPerMonth * vulnProbabilityPerPr);
  const manualTriageHoursPerFlaw = 4.5;
  const automatedTriageHoursPerFlaw = 0.15;

  const hoursSaved = Math.round(totalFlaws * (manualTriageHoursPerFlaw - automatedTriageHoursPerFlaw));
  const moneySaved = Math.round(hoursSaved * hourlyRate);
  const mttdManual = "14.2 Days";
  const mttdSentinel = "3.8 Seconds";

  return (
    <section className="py-20 px-4 max-w-5xl mx-auto">
      <div className="rounded-3xl border border-[#515A47]/40 bg-gradient-to-b from-[#151B13]/90 to-[#0E120D]/95 p-8 md:p-12 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#D7BE82]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#7A4419]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#D7BE82]/10 border border-[#D7BE82]/30 text-xs font-mono text-[#D7BE82] mb-3">
            <Calculator className="w-3.5 h-3.5" />
            ROI &amp; RESILIENCE CALCULATOR
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-[#FDFBF7]">
            Calculate Your DevSecOps Velocity
          </h2>
          <p className="text-sm text-[#D6D1C4] mt-2">
            See how autonomous AST patch verification slashes security backlog overhead and eliminates developer context switching.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Sliders Area (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Slider 1: Monthly PRs */}
            <div>
              <div className="flex justify-between text-sm font-mono mb-2">
                <span className="text-[#D6D1C4]">Monthly Pull Requests</span>
                <span className="text-[#D7BE82] font-bold">{prsPerMonth} PRs</span>
              </div>
              <input
                type="range"
                min="50"
                max="2000"
                step="25"
                value={prsPerMonth}
                onChange={(e) => setPrsPerMonth(Number(e.target.value))}
                className="w-full h-2 bg-[#222A1F] rounded-lg appearance-none cursor-pointer accent-[#D7BE82]"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#9E9889] mt-1">
                <span>50 PRs</span>
                <span>1,000 PRs</span>
                <span>2,000 PRs</span>
              </div>
            </div>

            {/* Slider 2: Dev count */}
            <div>
              <div className="flex justify-between text-sm font-mono mb-2">
                <span className="text-[#D6D1C4]">Engineering Team Size</span>
                <span className="text-[#E9B086] font-bold">{devCount} Engineers</span>
              </div>
              <input
                type="range"
                min="5"
                max="300"
                step="5"
                value={devCount}
                onChange={(e) => setDevCount(Number(e.target.value))}
                className="w-full h-2 bg-[#222A1F] rounded-lg appearance-none cursor-pointer accent-[#7A4419]"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#9E9889] mt-1">
                <span>5 Devs</span>
                <span>150 Devs</span>
                <span>300+ Devs</span>
              </div>
            </div>

            {/* Slider 3: Hourly Rate */}
            <div>
              <div className="flex justify-between text-sm font-mono mb-2">
                <span className="text-[#D6D1C4]">Blended Engineering Rate ($/hr)</span>
                <span className="text-[#D7BE82] font-bold">${hourlyRate} / hr</span>
              </div>
              <input
                type="range"
                min="50"
                max="180"
                step="5"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full h-2 bg-[#222A1F] rounded-lg appearance-none cursor-pointer accent-[#D7BE82]"
              />
              <div className="flex justify-between text-[11px] font-mono text-[#9E9889] mt-1">
                <span>$50/hr</span>
                <span>$115/hr</span>
                <span>$180/hr</span>
              </div>
            </div>
          </div>

          {/* Results Card (5 cols) */}
          <div className="lg:col-span-5 rounded-2xl border border-[#D7BE82]/35 bg-[#0E120D] p-6 space-y-6 shadow-xl relative">
            <div className="text-xs font-mono uppercase tracking-wider text-[#D7BE82] font-semibold border-b border-[#515A47]/40 pb-2">
              Projected Monthly Savings
            </div>

            <div>
              <div className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#D7BE82] via-[#EAD6B0] to-[#E9B086]">
                ${moneySaved.toLocaleString()}
              </div>
              <div className="text-xs text-[#9E9889] font-mono mt-1">
                Est. monthly triage &amp; patching savings
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-3 rounded-xl bg-[#151B13] border border-[#515A47]/40">
                <div className="flex items-center gap-1.5 text-xs text-[#9E9889] mb-1">
                  <Clock className="w-3.5 h-3.5 text-[#D7BE82]" />
                  <span>Hours Saved</span>
                </div>
                <div className="text-lg font-bold text-[#FDFBF7] font-mono">{hoursSaved} hrs</div>
              </div>

              <div className="p-3 rounded-xl bg-[#151B13] border border-[#515A47]/40">
                <div className="flex items-center gap-1.5 text-xs text-[#9E9889] mb-1">
                  <Zap className="w-3.5 h-3.5 text-[#E9B086]" />
                  <span>MTTD Drop</span>
                </div>
                <div className="text-lg font-bold text-[#E9B086] font-mono">-99.9%</div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#151B13]/70 border border-[#D7BE82]/20 text-xs font-mono space-y-1">
              <div className="flex justify-between text-[#9E9889]">
                <span>Manual MTTD:</span>
                <span className="text-red-400 font-bold">{mttdManual}</span>
              </div>
              <div className="flex justify-between text-[#D6D1C4] font-semibold">
                <span>Sentinel Gate MTTD:</span>
                <span className="text-[#D7BE82] font-bold">{mttdSentinel}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResilienceCalc;
