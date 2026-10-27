"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What is NVIDIA MODEL (ProofStack)?",
    answer:
      "ProofStack is an autonomous DevSecOps verification engine engineered for the Nebius x NVIDIA Global AI Hackathon. It pairs NVIDIA Nemotron 70B reasoning with an uncompromising 8-gate deterministic interlock. The core invariant is simple: generative models propose candidate code repairs, while deterministic compilers, AST diff analyzers, and active exploit oracles make the authoritative pass/fail decisions.",
  },
  {
    question: "What kinds of security workflows does it support?",
    answer:
      "ProofStack automates full-lifecycle vulnerability remediation: dynamic adversarial exploit probing (12 CWE vectors against live ephemeral containers), AST-guided patch synthesis for SQL injection (CWE-89), cross-site scripting (CWE-79), path traversal (CWE-22), and hardcoded secrets (CWE-798), zero-regression verification, and notarization in an immutable HMAC-SHA256 Merkle evidence ledger.",
  },
  {
    question: "How does the Sentinel AI assistant help developers and auditors?",
    answer:
      "Sentinel AI is a movable, floating intelligent assistant accessible throughout the platform. It provides contextual root-cause vulnerability analysis, dispatches automated DAST test suites, asserts RBAC and tenant isolation invariants, explains unified diffs, and synthesizes parameterized AST patch recommendations on demand.",
  },
  {
    question: "How can users inspect findings and cryptographic evidence?",
    answer:
      "Users can explore active vulnerability findings in the Findings Explorer or launch the 6-tab Remediation Cockpit to inspect Monaco side-by-side diffs, AST safety reports, and live curl probe logs. Every verified remediation is notarized in the Cryptographic Ledger with parent block hashes, HMAC-SHA256 signatures, and interactive tamper-detection simulation.",
  },
  {
    question: "What authentication and access options are supported?",
    answer:
      "ProofStack supports instant 1-click Role-Based Access Control (RBAC) personas (Developer, Auditor, Admin, Super Admin) for hackathon evaluation, standard work email and operator key sign-in, and OAuth 2.0 integration via Google and GitHub.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="faq"
      style={{
        padding: "60px 24px 80px",
        maxWidth: "960px",
        margin: "0 auto",
        scrollMarginTop: "80px",
      }}
    >
      {/* Section Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "7px",
            padding: "4px 12px",
            borderRadius: "9999px",
            background: "var(--surface-green)",
            color: "var(--heading-primary)",
            fontSize: "11px",
            fontFamily: "var(--f-mono)",
            fontWeight: 600,
            marginBottom: "14px",
            border: "1px solid var(--line)",
          }}
        >
          <HelpCircle size={13} style={{ color: "var(--brand)" }} />
          <span>Frequently Asked Questions</span>
        </div>

        <h2
          style={{
            fontSize: "clamp(1.8rem, 3.2vw, 2.5rem)",
            fontFamily: "var(--f-display)",
            fontWeight: 700,
            color: "var(--heading-primary)",
            margin: "0 0 12px 0",
            letterSpacing: "-0.025em",
          }}
        >
          Everything you need to know about ProofStack.
        </h2>

        <p
          style={{
            fontSize: "15px",
            color: "var(--ink2)",
            maxWidth: "600px",
            margin: "0 auto",
            lineHeight: 1.5,
          }}
        >
          Clear answers on deterministic verification, live DAST exploit testing, and cryptographic evidence notarization.
        </p>
      </div>

      {/* Accordion Container (All closed by default) */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {FAQS.map((faq, index) => {
          const isOpen = openIndex === index;
          return (
            <div
              key={faq.question}
              className={`faq-accordion-item ${isOpen ? "open" : ""}`}
            >
              <button
                type="button"
                onClick={() => toggleItem(index)}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                style={{
                  width: "100%",
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  color: isOpen ? "var(--brand)" : "var(--heading-primary)",
                  fontFamily: "var(--f-ui)",
                  fontSize: "15px",
                  fontWeight: 600,
                  transition: "color 150ms ease",
                }}
              >
                <span style={{ paddingRight: "16px" }}>{faq.question}</span>
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: "28px",
                    height: "28px",
                    borderRadius: "50%",
                    background: isOpen ? "var(--surface-green)" : "var(--bg)",
                    border: "1px solid var(--line)",
                    flexShrink: 0,
                    transition: "transform 200ms cubic-bezier(0.16, 1, 0.3, 1), background 150ms ease",
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronDown
                    size={16}
                    style={{ color: isOpen ? "var(--brand)" : "var(--ink2)" }}
                  />
                </span>
              </button>

              {isOpen && (
                <div
                  id={`faq-answer-${index}`}
                  role="region"
                  aria-labelledby={`faq-question-${index}`}
                  className="faq-content-enter"
                  style={{
                    padding: "0 20px 20px",
                    fontSize: "13.5px",
                    lineHeight: 1.6,
                    color: "var(--ink2)",
                  }}
                >
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
