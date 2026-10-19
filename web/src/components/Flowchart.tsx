"use client";

import React from "react";
import { motion } from "framer-motion";

interface FlowNode {
  id: string;
  label: string;
  sublabel?: string;
  color: string;
  x: number;
  y: number;
}

interface FlowEdge {
  from: string;
  to: string;
  label?: string;
}

const NODES: FlowNode[] = [
  { id: "intake", label: "Task Intake", sublabel: "orders.py:get_orders", color: "#19E3FF", x: 120, y: 40 },
  { id: "baseline", label: "Baseline Profile", sublabel: "428ms · 5,001 queries", color: "#00B8D4", x: 120, y: 120 },
  { id: "hypotheses", label: "Hypotheses", sublabel: "Nemotron-3-Super", color: "#B08CF0", x: 120, y: 200 },
  { id: "sandbox", label: "Sandbox Probing", sublabel: "network=none · 60s timeout", color: "#F2B04A", x: 120, y: 280 },
  { id: "gates", label: "G0–G7 Gates", sublabel: "8 gates · all must pass", color: "#FF7A70", x: 120, y: 360 },
  { id: "verdict", label: "Verdict", sublabel: "ACCEPT / REJECT", color: "#5BC98C", x: 120, y: 440 },
  { id: "ledger", label: "Evidence Ledger", sublabel: "SHA-256 hash chain", color: "#19E3FF", x: 120, y: 520 },
];

const EDGES: FlowEdge[] = [
  { from: "intake", to: "baseline" },
  { from: "baseline", to: "hypotheses" },
  { from: "hypotheses", to: "sandbox" },
  { from: "sandbox", to: "gates", label: "3 candidates" },
  { from: "gates", to: "verdict", label: "8/8 PASS" },
  { from: "verdict", to: "ledger" },
];

function getNode(id: string): FlowNode {
  return NODES.find((n) => n.id === id)!;
}

export default function Flowchart() {
  return (
    <div style={{ position: "relative", width: "360px", height: "580px" }}>
      <svg width="360" height="580" style={{ position: "absolute", inset: 0 }}>
        {EDGES.map((edge, i) => {
          const from = getNode(edge.from);
          const to = getNode(edge.to);
          const fromY = from.y + 20;
          const toY = to.y - 20;
          const midY = (fromY + toY) / 2;

          return (
            <g key={i}>
              <motion.path
                d={`M ${from.x} ${fromY} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${toY}`}
                fill="none"
                stroke="rgba(25, 227, 255, 0.25)"
                strokeWidth="2"
                strokeDasharray="6 4"
                className="flow-line"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: i * 0.15 }}
              />
              <motion.circle
                cx={to.x}
                cy={toY}
                r="4"
                fill={to.color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.15 + 0.3 }}
              />
              {edge.label && (
                <text
                  x={from.x + 16}
                  y={midY}
                  fill="#5F6F74"
                  fontSize="10"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {edge.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {NODES.map((node, i) => (
        <motion.div
          key={node.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          style={{
            position: "absolute",
            left: node.x - 50,
            top: node.y - 14,
            width: "180px",
            padding: "8px 12px",
            borderRadius: "10px",
            background: "rgba(14, 22, 25, 0.7)",
            border: `1px solid ${node.color}30`,
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <div style={{ fontSize: "12px", fontWeight: 600, color: node.color }}>{node.label}</div>
          {node.sublabel && (
            <div style={{ fontSize: "10px", color: "#5F6F74", marginTop: "2px", fontFamily: "JetBrains Mono, monospace" }}>
              {node.sublabel}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export function GateFlowchart() {
  const gates = [
    { id: "G0", label: "AST Integrity", color: "#19E3FF" },
    { id: "G1", label: "Unit Tests", color: "#00B8D4" },
    { id: "G2", label: "Exploit Oracle", color: "#FF7A70" },
    { id: "G3", label: "Identity Guard", color: "#F2B04A" },
    { id: "G4", label: "Concurrency", color: "#B08CF0" },
    { id: "G5", label: "Performance", color: "#5BC98C" },
    { id: "G6", label: "Memory", color: "#00B8D4" },
    { id: "G7", label: "Hygiene", color: "#19E3FF" },
  ];

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
      {gates.map((gate, i) => (
        <motion.div
          key={gate.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.06 }}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <div
            style={{
              padding: "8px 14px",
              borderRadius: "10px",
              background: `${gate.color}08`,
              border: `1px solid ${gate.color}25`,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 700, color: gate.color, fontFamily: "JetBrains Mono, monospace" }}>{gate.id}</div>
            <div style={{ fontSize: "10px", color: "#8FA5AC" }}>{gate.label}</div>
          </div>
          {i < gates.length - 1 && (
            <svg width="20" height="12" viewBox="0 0 20 12" style={{ opacity: 0.3 }}>
              <path d="M0 6h16M12 2l4 4-4 4" stroke="#19E3FF" strokeWidth="1.5" fill="none" strokeDasharray="3 2" className="flow-line" />
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
}
