"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What is ProofStack?",
    answer:
      "ProofStack is a security verification platform designed to remediate code vulnerabilities with evidence. It uses NVIDIA Nemotron to generate candidate repairs, and subjects every candidate to deterministic compiler gates, linter rules, and containerized exploit tests before creating a pull request.",
  },
  {
    question: "How does ProofStack verify candidate patches?",
    answer:
      "Generative models only propose fixes; deterministic tools decide whether code is accepted. Each candidate patch is compiled, checked for style regressions with Ruff, re-tested against the original exploit payload in an isolated container, and verified against unit test suites. If any check fails, the patch is rejected.",
  },
  {
    question: "What vulnerability types are tested?",
    answer:
      "The platform includes dynamic DAST exploit probes for 12 common CWE vectors, including SQL injection (CWE-89), IDOR/broken object-level authorization (CWE-639), path traversal (CWE-22), SSRF (CWE-918), and hardcoded credentials (CWE-798).",
  },
  {
    question: "What is the cryptographic evidence ledger?",
    answer:
      "Every test run, container probe result, and accepted patch diff is hashed and recorded with HMAC-SHA256 signatures in an append-only audit trail. This provides auditors with a verifiable record of why a fix was accepted and proves that the evidence has not been modified after the fact.",
  },
  {
    question: "How can reviewers evaluate the platform?",
    answer:
      "You can inspect findings and diffs directly in the Remediation Cockpit or sign in using pre-configured evaluation personas (Developer, Auditor, Admin, Super Admin) to test role-based access control and live features without manual setup.",
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
      <div className="scroll-reveal" style={{ textAlign: "center", marginBottom: "40px" }}>
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
          Frequently Asked Questions
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
          Technical answers on how deterministic verification, containerized DAST probes, and audit logging work.
        </p>
      </div>

      {/* Accordion Container (All closed by default with dual-direction animated transitions) */}
      <div className="scroll-reveal scroll-reveal-stagger-1" style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
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
                  transition: "color 180ms ease",
                }}
              >
                <span style={{ paddingRight: "16px" }}>{faq.question}</span>
                <span className={`faq-chevron-icon ${isOpen ? "rotated" : ""}`}>
                  <ChevronDown
                    size={16}
                    style={{ color: isOpen ? "var(--brand)" : "var(--ink2)" }}
                  />
                </span>
              </button>

              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                className={`faq-answer-wrapper ${isOpen ? "is-open" : ""}`}
              >
                <div className="faq-answer-inner">
                  <div
                    style={{
                      padding: "0 20px 20px",
                      fontSize: "13.5px",
                      lineHeight: 1.6,
                      color: "var(--ink2)",
                    }}
                  >
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
