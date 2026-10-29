"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  Sliders, Server, Cpu, Database, Users, Shield,
  ArrowRight, Activity, Zap, CheckCircle2, AlertTriangle,
  RefreshCw, Settings2, BarChart3
} from "lucide-react";

interface ManagedMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  tokenUsed: number;
  tokenQuota: number;
  activeTasks: number;
  status: "Active" | "Suspended";
}

export default function AdminRolePage() {
  const { session, activeMember } = useAuth();
  const [members, setMembers] = useState<ManagedMember[]>([
    {
      id: "nitin-pandey",
      name: "Nitin Pandey",
      email: "nitin.dev@perfproof.internal",
      role: "Lead Developer",
      avatar: "👨‍💻",
      tokenUsed: 42000,
      tokenQuota: 100000,
      activeTasks: 5,
      status: "Active",
    },
    {
      id: "elena-rostova",
      name: "Elena Rostova",
      email: "auditor@perfproof.internal",
      role: "Security Auditor",
      avatar: "🛡️",
      tokenUsed: 22000,
      tokenQuota: 120000,
      activeTasks: 7,
      status: "Active",
    },
    {
      id: "nikhil-lakra",
      name: "Nikhil Lakra",
      email: "nikhil.dev@perfproof.internal",
      role: "Senior Autonomous Security Engineer",
      avatar: "👨‍💻",
      tokenUsed: 29000,
      tokenQuota: 85000,
      activeTasks: 4,
      status: "Active",
    },
    {
      id: "marcus-vance",
      name: "Marcus Vance",
      email: "admin@perfproof.internal",
      role: "Workspace Admin",
      avatar: "⚙️",
      tokenUsed: 98000,
      tokenQuota: 250000,
      activeTasks: 8,
      status: "Active",
    },
  ]);

  const [runnerPools, setRunnerPools] = useState([
    { id: "pool-iad1", name: "US-East (iad1) MicroVM Cluster", activePods: 8, maxPods: 16, cpuUsage: "34%", memoryUsage: "48%", isolation: "gVisor seccomp-v2", status: "Healthy" },
    { id: "pool-ord2", name: "US-Central (ord2) Runner Pool", activePods: 4, maxPods: 8, cpuUsage: "18%", memoryUsage: "29%", isolation: "Firecracker MicroVM", status: "Healthy" },
    { id: "pool-dast", name: "Ephemeral DAST Exploit Sandbox", activePods: 6, maxPods: 12, cpuUsage: "52%", memoryUsage: "61%", isolation: "Network-Isolated Pod", status: "Healthy" },
    { id: "pool-wasm", name: "Wasm Compiler Gate Isolate", activePods: 2, maxPods: 4, cpuUsage: "12%", memoryUsage: "15%", isolation: "Wasmtime Sandbox", status: "Healthy" },
  ]);

  const toggleMemberStatus = (id: string) => {
    setMembers((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, status: m.status === "Active" ? "Suspended" : "Active" } : m
      )
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Role Header Banner */}
      <div className="card" style={{ background: "var(--surface)", border: "1px solid var(--line-strong)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, right: 0, width: "320px", height: "320px", background: "radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div style={{ display: "flex", flexDirection: "column", gap: "16px", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="chip brand" style={{ fontSize: "11px", padding: "4px 10px" }}>
                <Sliders className="w-3.5 h-3.5" />
                <span>ROLE PORTAL • WORKSPACE ADMIN</span>
              </span>
              <span className="chip pass" style={{ fontSize: "10.5px" }}>
                Admin: {activeMember?.name || "Marcus Vance"} (Platform &amp; Infrastructure)
              </span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
              <Link href="/control-plane" className="btn sm acc" style={{ textDecoration: "none" }}>
                <Server className="w-3.5 h-3.5" />
                <span>Open Fleet Control Plane</span>
              </Link>
              <Link href="/catalog" className="btn sm sec" style={{ textDecoration: "none" }}>
                <span>19-Benchmark Catalog</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div>
            <h1 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 6px 0", color: "var(--heading-primary)", letterSpacing: "-0.02em" }}>
              Workspace Admin &amp; Cloud Runner Fleet Management
            </h1>
            <p style={{ margin: 0, color: "var(--ink2)", fontSize: "13.5px", maxWidth: "800px", lineHeight: 1.55 }}>
              Manage team members, adjust AI token quotas, monitor isolated runner microVMs, and oversee enterprise workloads.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", paddingTop: "8px", borderTop: "1px solid var(--line)" }}>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Active Runner Pods</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--pass)", marginTop: "2px" }}>20 / 40 Pods Ready</div>
            </div>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Fleet Token Pool</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--brand)", marginTop: "2px" }}>193,000 / 510,000 Used (37.8%)</div>
            </div>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Broker Latency</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--pass)", marginTop: "2px" }}>14ms (Redis 7 Cluster)</div>
            </div>
            <div style={{ padding: "8px 12px", background: "var(--surface2)", borderRadius: "8px", border: "1px solid var(--line)" }}>
              <div style={{ fontSize: "11px", color: "var(--ink3)" }}>Active Operators</div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--ink)", marginTop: "2px" }}>4 Active Users (0 Suspended)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Team Member Token Quotas & Task Corridors */}
      <div className="card" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "12px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--heading-primary)" }}>
              Team Token Quotas &amp; Assigned Workflows
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--ink3)" }}>
              Manage developer and auditor inference consumption ceilings and active operational status
            </p>
          </div>
        </div>

        <div className="table-responsive">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--surface2)" }}>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Member</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Role</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Tasks</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Token Quota Usage</th>
                <th style={{ padding: "8px 12px", textAlign: "left", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Status</th>
                <th style={{ padding: "8px 12px", textAlign: "right", color: "var(--ink3)", fontWeight: 600, fontSize: "11px", textTransform: "uppercase" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const pct = Math.round((m.tokenUsed / m.tokenQuota) * 100);
                return (
                  <tr key={m.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "16px" }}>{m.avatar}</span>
                        <div>
                          <b style={{ color: "var(--heading-primary)" }}>{m.name}</b>
                          <div className="mono" style={{ fontSize: "11px", color: "var(--ink3)" }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span className="chip brand" style={{ fontSize: "10px" }}>{m.role}</span>
                    </td>
                    <td className="mono" style={{ padding: "10px 12px", fontWeight: 600, color: "var(--ink)" }}>
                      {m.activeTasks} Tasks
                    </td>
                    <td style={{ padding: "10px 12px", minWidth: "160px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                        <span className="mono" style={{ color: "var(--ink2)" }}>{m.tokenUsed.toLocaleString()} / {m.tokenQuota.toLocaleString()}</span>
                        <span className="mono" style={{ fontWeight: 700, color: pct > 80 ? "var(--warn)" : "var(--brand)" }}>{pct}%</span>
                      </div>
                      <div style={{ height: "6px", width: "100%", background: "var(--surface2)", borderRadius: "9999px", overflow: "hidden", border: "1px solid var(--line)" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct > 80 ? "var(--warn)" : "var(--brand)", borderRadius: "9999px" }} />
                      </div>
                    </td>
                    <td style={{ padding: "10px 12px" }}>
                      <span className={`chip ${m.status === "Active" ? "pass" : "fail"}`} style={{ fontSize: "10px" }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => toggleMemberStatus(m.id)}
                        className={`btn sm ${m.status === "Active" ? "sec" : "acc"}`}
                        style={{ fontSize: "11px" }}
                      >
                        {m.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. MicroVM Runner Pools & Ephemeral Sandboxes */}
      <div className="card" style={{ background: "var(--surface)", border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--heading-primary)" }}>
              Ephemeral Container &amp; MicroVM Runner Pools
            </h2>
            <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--ink3)" }}>
              Isolated execution environments hosting live DAST exploit replays and compiler validation
            </p>
          </div>
          <span className="chip pass" style={{ fontSize: "10px" }}>4 Pools Operational</span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
          {runnerPools.map((p) => (
            <div key={p.id} style={{ padding: "14px", borderRadius: "8px", background: "var(--surface2)", border: "1px solid var(--line)", display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <b style={{ fontSize: "12.5px", color: "var(--heading-primary)" }}>{p.name}</b>
                <span className="chip pass" style={{ fontSize: "9.5px" }}>{p.status}</span>
              </div>
              <div className="mono" style={{ fontSize: "11px", color: "var(--ink3)" }}>
                Isolation: <b style={{ color: "var(--ink)" }}>{p.isolation}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", paddingTop: "4px", borderTop: "1px solid var(--line)" }}>
                <span>Active Pods: <b className="mono" style={{ color: "var(--brand)" }}>{p.activePods} / {p.maxPods}</b></span>
                <span>CPU: <b className="mono" style={{ color: "var(--ink)" }}>{p.cpuUsage}</b></span>
                <span>RAM: <b className="mono" style={{ color: "var(--ink)" }}>{p.memoryUsage}</b></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
