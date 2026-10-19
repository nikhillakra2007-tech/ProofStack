"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Chatbot from "@/components/Chatbot";
import Flowchart, { GateFlowchart } from "@/components/Flowchart";

export default function PublicHomePage() {
  const router = useRouter();
  const { loginAs } = useAuth();
  const [activeProblem, setActiveProblem] = useState<"idor" | "redos" | "nplusone">("idor");

  const handleLaunchDemo = () => {
    loginAs("developer");
    router.push("/cockpit/TASK9142");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#060B0D", color: "#E9F4F6", overflowX: "hidden" }}>
      {/* Navbar */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(6, 11, 13, 0.8)",
          backdropFilter: "blur(16px) saturate(1.5)",
          WebkitBackdropFilter: "blur(16px) saturate(1.5)",
          borderBottom: "1px solid rgba(25, 227, 255, 0.06)",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 24px",
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, rgba(25, 227, 255, 0.2), rgba(91, 201, 140, 0.1))",
                border: "1px solid rgba(25, 227, 255, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4" style={{ color: "#19E3FF" }}>
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <span style={{ fontSize: "16px", fontWeight: 700, letterSpacing: "-0.02em" }}>ProofStack</span>
          </div>

          <nav style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <a href="#how-it-works" style={{ fontSize: "13px", color: "#8FA5AC", transition: "color 0.2s" }}>How it works</a>
            <a href="#gates" style={{ fontSize: "13px", color: "#8FA5AC", transition: "color 0.2s" }}>Gates</a>
            <a href="#ledger" style={{ fontSize: "13px", color: "#8FA5AC", transition: "color 0.2s" }}>Ledger</a>
            <button onClick={() => router.push("/login")} style={{ fontSize: "13px", color: "#8FA5AC" }}>Sign in</button>
            <motion.button
              onClick={handleLaunchDemo}
              className="btn-primary"
              style={{ height: "36px", padding: "0 18px", fontSize: "12px" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Live demo
            </motion.button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ position: "relative", padding: "80px 24px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Background gradient */}
        <div
          aria-hidden
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "800px",
            height: "600px",
            background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(25, 227, 255, 0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ textAlign: "center", position: "relative" }}
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              fontWeight: 600,
              color: "#19E3FF",
              padding: "5px 14px",
              borderRadius: "20px",
              background: "rgba(25, 227, 255, 0.08)",
              border: "1px solid rgba(25, 227, 255, 0.15)",
              marginBottom: "24px",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            Nebius Token Factory · NVIDIA Nemotron 3
          </motion.span>

          <h1
            style={{
              fontSize: "56px",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              fontWeight: 700,
              margin: "0 0 20px",
              fontFamily: "'Space Grotesk', 'Inter', sans-serif",
            }}
          >
            Ship AI patches.
            <br />
            <span className="text-gradient">Prove they&apos;re safe.</span>
          </h1>

          <p
            style={{
              fontSize: "17px",
              lineHeight: 1.6,
              color: "#8FA5AC",
              maxWidth: "580px",
              margin: "0 auto 36px",
            }}
          >
            ProofStack runs every candidate patch through correctness, security, and performance
            gates in isolated sandboxes. Only zero-compromise fixes get accepted — sealed on a
            tamper-evident hash chain.
          </p>

          <div style={{ display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
            <motion.button
              onClick={handleLaunchDemo}
              className="btn-primary"
              style={{ height: "48px", padding: "0 28px", fontSize: "14px" }}
              whileHover={{ scale: 1.03, boxShadow: "0 0 32px rgba(25, 227, 255, 0.3)" }}
              whileTap={{ scale: 0.97 }}
            >
              Open live demo
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </motion.button>
            <motion.button
              onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
              className="btn-secondary"
              style={{ height: "48px", padding: "0 24px", fontSize: "14px" }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              See how it works
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Flowchart Section */}
      <section id="how-it-works" style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", marginBottom: "40px" }}
        >
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#19E3FF", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Pipeline
          </div>
          <h2 style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            From slow endpoint to verified verdict.
          </h2>
        </motion.div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "24px",
            borderRadius: "16px",
            background: "rgba(14, 22, 25, 0.5)",
            border: "1px solid rgba(25, 227, 255, 0.08)",
          }}
        >
          <Flowchart />
        </div>
      </section>

      {/* Gates Section */}
      <section id="gates" style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: "center", marginBottom: "32px" }}
        >
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#FF7A70", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Zero-Compromise
          </div>
          <h2 style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            8 gates. All must pass.
          </h2>
          <p style={{ fontSize: "15px", color: "#8FA5AC", marginTop: "12px", maxWidth: "520px", margin: "12px auto 0" }}>
            Any single gate failure = instant REJECT. No exceptions, no &quot;probably fine&quot;.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "32px",
            borderRadius: "16px",
            background: "rgba(14, 22, 25, 0.5)",
            border: "1px solid rgba(25, 227, 255, 0.08)",
          }}
        >
          <GateFlowchart />
        </motion.div>
      </section>

      {/* Problem Comparison Section */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: "center", marginBottom: "32px" }}
        >
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#F2B04A", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Real Cases
          </div>
          <h2 style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            Fast patches that break security.
          </h2>
        </motion.div>

        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "24px" }}>
          {[
            { id: "idor" as const, label: "Cache IDOR" },
            { id: "redos" as const, label: "ReDoS Trap" },
            { id: "nplusone" as const, label: "N+1 + SQLi" },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => setActiveProblem(tab.id)}
              style={{
                padding: "8px 16px",
                borderRadius: "10px",
                fontSize: "12px",
                fontWeight: 600,
                background: activeProblem === tab.id ? "rgba(25, 227, 255, 0.1)" : "transparent",
                border: `1px solid ${activeProblem === tab.id ? "rgba(25, 227, 255, 0.3)" : "rgba(255, 255, 255, 0.08)"}`,
                color: activeProblem === tab.id ? "#19E3FF" : "#8FA5AC",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              whileHover={{ scale: 1.02 }}
            >
              {tab.label}
            </motion.button>
          ))}
        </div>

        <motion.div
          key={activeProblem}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
            maxWidth: "900px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              padding: "20px",
              borderRadius: "14px",
              background: "rgba(255, 122, 112, 0.05)",
              border: "1px solid rgba(255, 122, 112, 0.2)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#FF7A70", marginBottom: "8px" }}>AI PATCH — REJECTED</div>
            <pre
              style={{
                fontSize: "12px",
                lineHeight: 1.6,
                color: "#FF7A70",
                fontFamily: "'JetBrains Mono', monospace",
                margin: 0,
                overflowX: "auto",
              }}
            >
              {activeProblem === "idor"
                ? `def get_cached(doc_id):\n    return redis.get(f"doc:{doc_id}")\n    # Missing tenant_id = IDOR!`
                : activeProblem === "redos"
                ? `EMAIL_REGEX = r"^([a-zA-Z0-9]+)*@([a-zA-Z0-9]+)*$"\n    # Catastrophic backtracking`
                : `db.execute(f"SELECT * FROM orders\n    WHERE tenant = '{tenant_id}'")\n    # SQL injection`}
            </pre>
          </div>

          <div
            style={{
              padding: "20px",
              borderRadius: "14px",
              background: "rgba(91, 201, 140, 0.05)",
              border: "1px solid rgba(91, 201, 140, 0.2)",
            }}
          >
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#5BC98C", marginBottom: "8px" }}>PROOFSTACK PATCH — ACCEPTED</div>
            <pre
              style={{
                fontSize: "12px",
                lineHeight: 1.6,
                color: "#5BC98C",
                fontFamily: "'JetBrains Mono', monospace",
                margin: 0,
                overflowX: "auto",
              }}
            >
              {activeProblem === "idor"
                ? `def get_cached(tenant_id, doc_id):\n    key = f"{tenant_id}:{hash(doc_id)}"\n    return redis.get(key)`
                : activeProblem === "redos"
                ? `EMAIL_REGEX = r"^[a-zA-Z0-9_.+-]+@\\n    [a-zA-Z0-9-]+\\.[a-zA-Z0-9-.]+$"\n    # Linear time guaranteed`
                : `db.query(Order).options(\n    joinedload(Order.customer))\\n    .filter(Order.tenant_id == tenant_id).all()`}
            </pre>
          </div>
        </motion.div>
      </section>

      {/* Evidence Ledger Section */}
      <section id="ledger" style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 24px" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          style={{ textAlign: "center", marginBottom: "32px" }}
        >
          <div style={{ fontSize: "11px", fontWeight: 600, color: "#5BC98C", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
            Cryptographic Proof
          </div>
          <h2 style={{ fontSize: "36px", fontWeight: 700, letterSpacing: "-0.02em", margin: 0 }}>
            Every verdict, hash-chained.
          </h2>
          <p style={{ fontSize: "15px", color: "#8FA5AC", marginTop: "12px", maxWidth: "500px", margin: "12px auto 0" }}>
            SHA-256 append-only ledger. Tamper any block → chain breaks → verdict invalidated.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            padding: "24px",
            borderRadius: "16px",
            background: "rgba(14, 22, 25, 0.5)",
            border: "1px solid rgba(25, 227, 255, 0.08)",
          }}
        >
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "12px", lineHeight: 1.8 }}>
            {[
              { block: 0, label: "TASK_INTAKE", hash: "8f4b238e89c1…", color: "#19E3FF" },
              { block: 1, label: "BASELINE", hash: "318cb92931ea…", color: "#00B8D4" },
              { block: 2, label: "CANDIDATE_PATCH", hash: "45a89df0123b…", color: "#B08CF0" },
              { block: 3, label: "GATE_RESULTS", hash: "e89012389012…", color: "#F2B04A" },
              { block: 4, label: "FINAL_VERDICT", hash: "d4e1529a… [HEAD]", color: "#5BC98C" },
            ].map((entry, i) => (
              <motion.div
                key={entry.block}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "10px 14px",
                  borderRadius: "8px",
                  background: "rgba(255, 255, 255, 0.02)",
                  marginBottom: "6px",
                  border: `1px solid ${entry.color}15`,
                }}
              >
                <span style={{ color: entry.color, fontWeight: 600 }}>
                  BLOCK #{entry.block}
                </span>
                <span style={{ color: "#5F6F74" }}>{entry.label}</span>
                <span style={{ color: "#8FA5AC" }}>{entry.hash}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
        >
          <h2 style={{ fontSize: "40px", fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 16px" }}>
            Stop guessing. Start proving.
          </h2>
          <p style={{ fontSize: "16px", color: "#8FA5AC", maxWidth: "500px", margin: "0 auto 32px" }}>
            Run your first verification in under 2 minutes. No sign-up required.
          </p>
          <motion.button
            onClick={handleLaunchDemo}
            className="btn-primary"
            style={{ height: "52px", padding: "0 36px", fontSize: "15px" }}
            whileHover={{ scale: 1.03, boxShadow: "0 0 40px rgba(25, 227, 255, 0.3)" }}
            whileTap={{ scale: 0.97 }}
          >
            Launch ProofStack
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(25, 227, 255, 0.06)", padding: "32px 24px" }}>
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "14px", fontWeight: 600 }}>ProofStack</span>
            <span style={{ fontSize: "11px", color: "#5F6F74" }}>v1.0 · Apache-2.0</span>
          </div>
          <div style={{ fontSize: "12px", color: "#5F6F74" }}>
            © 2026 · Built for Nebius × NVIDIA AI Hackathon
          </div>
        </div>
      </footer>

      <Chatbot />
    </div>
  );
}
