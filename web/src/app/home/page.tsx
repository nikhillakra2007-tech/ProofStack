"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { MOCK_CATALOG } from "@/lib/mockData";
import HorizonNav from "@/components/horizon-nav/HorizonNav";
import { useCurtain } from "@/components/layout/CurtainTransition";
import ScrollReveal from "@/components/animations/ScrollReveal";
import HeroVisual from "@/components/hero-visual/HeroVisual";
import PhilosophyVisual from "@/components/philosophy-visual/PhilosophyVisual";
import PipelineVisual from "@/components/pipeline-visual/PipelineVisual";
import LedgerVisual from "@/components/ledger-visual/LedgerVisual";

const NAV = [
  { label: "Philosophy", href: "#philosophy" },
  { label: "Pipeline", href: "#pipeline" },
  { label: "Gates", href: "#gates" },
  { label: "Detectors", href: "#detectors" },
  { label: "Ledger", href: "#ledger" },
  { label: "Pricing", href: "#pricing" },
];

const TIERS = [
  {
    id: "Tier 1",
    name: "Performance",
    count: 8,
    body: "Latency, query amplification and memory regressions that a reviewer would miss under time pressure.",
  },
  {
    id: "Tier 2",
    name: "Security",
    count: 7,
    body: "Authorisation, injection, deserialisation and secret-handling invariants with live exploit oracles.",
  },
  {
    id: "Tier 3",
    name: "Concurrency",
    count: 4,
    body: "Lost updates, blocking calls, deadlocks and descriptor leaks detected under contention.",
  },
];

export default function PublicHomePage() {
  const router = useRouter();
  const { loginAs } = useAuth();
  const { navigateWithCurtain } = useCurtain();
  const [heroReady, setHeroReady] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 120);
    return () => clearTimeout(t);
  }, []);

  const launch = () => {
    loginAs("developer");
    navigateWithCurtain("/cockpit/TASK9142", "Remediation Cockpit");
  };

  const detectors = useMemo(() => MOCK_CATALOG, []);

  return (
    <div className="ac-site" style={{ background: "var(--bg)", color: "var(--ink)" }}>
      <ScrollReveal />

      {/* Horizon Navigation Bar with Curtain Transitions */}
      <HorizonNav />

      {/* ============ HERO ============ */}
      <section className="hero" id="top">
        {/* ambient sphere */}
        <div className="bg-sphere" style={{ display: "grid", placeItems: "center" }}>
          <div
            aria-hidden
            style={{
              width: "min(70vh, 70vw)",
              height: "min(70vh, 70vw)",
              borderRadius: "50%",
              background:
                "radial-gradient(circle at 32% 28%, rgba(233,229,218,.20) 0%, rgba(142,90,54,.16) 38%, rgba(10,10,9,0) 68%)",
              filter: "blur(calc(2 * var(--u)))",
              animation: "markSpin 24s cubic-bezier(.45,0,.55,1) infinite",
            }}
          />
        </div>

        <div className="hero__inner">
          <div className="hero__kicker is-in" style={heroReady ? undefined : { opacity: 0 }}>
            <span className={heroReady ? "is-in" : ""}>Autonomous Verification Â· 2026</span>
          </div>

          <h1 className="hero__title">
            <span className="ln"><span className={`ln__in ${heroReady ? "is-in" : ""}`} style={{ "--li": 0 } as React.CSSProperties}>Between speed</span></span>
            <span className="ln"><span className={`ln__in ${heroReady ? "is-in" : ""}`} style={{ "--li": 1 } as React.CSSProperties}>and safety.</span></span>
          </h1>

          <p className={`hero__sub ${heroReady ? "is-in" : ""}`}>
            AI writes the patch. ProofStack decides whether it ships.
          </p>

          <HeroVisual />
        </div>

        {/* spinning mark */}
        <svg className={`hero__mark ${heroReady ? "is-in" : ""}`} viewBox="0 0 57.12 70.22" style={{ position: "absolute", left: "50%", bottom: "calc(90 * var(--u))", transform: "translateX(-50%)" }}>
          <path d="M28.56 2 2 19v32.2L28.56 68 55.12 51.2V19L28.56 2Zm0 5.6 21.2 13.6v27.6L28.56 62.4 7.36 48.8V21.2L28.56 7.6Z" fill="currentColor" />
          <path d="M28.56 14 8 27.6v15.2l20.56 13.6 20.56-13.6V27.6L28.56 14Zm0 4.3 16.9 11.2-6.1 4-10.8-7.2-10.8 7.2-6.1-4L28.56 18.3Z" fill="currentColor" opacity=".65" />
        </svg>

        <div className={`hero__foot ${heroReady ? "is-in" : ""}`}>
          <span className="hero__place">REMOTE Â· OPEN SOURCE Â· 2026</span>
          <a className="link-arrow" href="#philosophy">
            Scroll to explore
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="5" x2="12" y2="19" /><polyline points="19 12 12 19 5 12" />
            </svg>
          </a>
        </div>
      </section>

      {/* ============ PHILOSOPHY ============ */}
      <section className="sec wrap" id="philosophy">
        <div className="sec__label label" data-rv>
          Philosophy
        </div>
        <div className="sec__body">
          <h2 className="h-xl" data-rv style={{ maxWidth: "18em" }}>
            Delegate the work to a machine. Keep the judgement for yourself.
          </h2>
          <div className="prose" data-rv style={{ marginTop: "calc(40 * var(--u))", maxWidth: "46em" }}>
            <p>
              Large language models optimise for benchmark metrics. A patch that removes an
              authorisation check will look faster and score better. <strong>Nothing in the model
              stops it from shipping.</strong>
            </p>
            <p>
              ProofStack takes the decision away from the model. Every candidate is executed in an
              isolated microVM, measured against a reproducible baseline, and put through eight
              gates that must <strong>all</strong> pass. One security regression and the patch is
              dead â€” regardless of how fast it made things.
            </p>
            <p>
              Deterministic code decides. The model only proposes.
            </p>
          </div>
          <PhilosophyVisual />
        </div>
      </section>

      {/* ============ PIPELINE FLOW ============ */}
      <section className="sec wrap" id="pipeline">
        <div className="sec__label label" data-rv>
          Pipeline
        </div>
        <div className="sec__body">
          <h2 className="h-xl" data-rv style={{ maxWidth: "20em" }}>
            Five steps from a slow endpoint to a signed verdict.
          </h2>
          <PipelineVisual />
        </div>
        <ol className="flow">
          {[
            { no: "01", title: "Baseline Profile", body: "cProfile and pyperf measure p95 latency, SQL query count and memory footprint against a pinned commit." },
            { no: "02", title: "Hypotheses", body: "Nemotron-3-Super drafts three competing architectural approaches with explicit trade-offs." },
            { no: "03", title: "Sandbox Probing", body: "Each candidate runs in an isolated microVM with network=none, a 60 second cap and a 1 GB quota." },
            { no: "04", title: "Patch Synthesis", body: "Nemotron-3.5-Lightning writes the defensive patch, then the diff is pinned to the run." },
            { no: "05", title: "Verdict + Ledger", body: "Eight gates run. The result is sealed into a SHA-256 hash chain and cannot be edited afterwards." },
          ].map((s, i) => (
            <li key={s.no} data-rv>
              <div className="flow__no">{s.no}</div>
              <div className="flow__title">{s.title}</div>
              <div className="flow__body">{s.body}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* ============ GATES CARDS ============ */}
      <section className="sec wrap" id="gates">
        <div className="sec__label label" data-rv>
          Gates
        </div>
        <div className="sec__body">
          <h2 className="h-xl" data-rv style={{ maxWidth: "22em" }}>
            Eight gates. A single failure rejects the patch.
          </h2>
        </div>
        <div className="cards">
          {[
            { tag: "G0", title: "AST Integrity", body: "The diff must not touch the lockfile, weaken a type boundary or smuggle in an undeclared dependency." },
            { tag: "G1", title: "Unit Tests", body: "The original 28 unit and integration tests re-execute in the sandbox. Zero behavioural change is tolerated." },
            { tag: "G2", title: "Exploit Oracle", body: "IDOR, SQL injection and ReDoS probes run against the candidate. A leak is a leak, however small." },
            { tag: "G3", title: "Identity Guard", body: "Authorisation predicates are compared before and after. Removing a tenant check fails instantly." },
            { tag: "G4", title: "Concurrency", body: "Lost updates, blocking calls in async paths and pool deadlocks are detected under contention." },
            { tag: "G5", title: "Performance", body: "Wall clock and CPU time must beat the noise floor of 5 percent. Marginal wins are treated as noise." },
            { tag: "G6", title: "Memory", body: "tracemalloc growth stays under 20 MB. An in-process cache that leaks fails the gate." },
            { tag: "G7", title: "Hygiene", body: "No hardcoded secrets, no eval, no unvetted subprocess calls, no undeclared supply chain additions." },
          ].map((c) => (
            <article className="card" key={c.tag} data-rv>
              <div className="card__tag">{c.tag}</div>
              <div className="card__title">{c.title}</div>
              <div className="card__body">{c.body}</div>
            </article>
          ))}
        </div>
      </section>

      {/* ============ CODE CONTRAST ============ */}
      <section className="sec wrap">
        <div className="sec__label label" data-rv>
          Reality
        </div>
        <div className="sec__body">
          <h2 className="h-xl" data-rv style={{ maxWidth: "20em" }}>
            The patch that looked perfect and was not.
          </h2>
          <p className="prose" data-rv style={{ marginTop: "calc(32 * var(--u))", maxWidth: "40em" }}>
            An AI cached checkout documents by id alone. It was fifteen times faster. It also let
            Tenant B read Tenant A. The performance gate was green. The security gate was not.
          </p>
        </div>
        <div className="codeblock" data-rv>
          <span className="cmt">{"# AI candidate â€” REJECTED at gate G2"}</span>{"\n"}
          <span className="neg">{"- def get_cached(doc_id):"}</span>{"\n"}
          <span className="neg">{"-     return redis.get(f\"doc:{doc_id}\")"}</span>{"\n"}
          <span className="neg">{"-     # tenant principal missing from the cache key"}</span>{"\n\n"}
          <span className="cmt">{"# ProofStack candidate â€” ACCEPTED, 3/3 gates"}</span>{"\n"}
          <span className="pos">{"+ def get_cached(tenant_id, doc_id):"}</span>{"\n"}
          <span className="pos">{"+     key = f\"{tenant_id}:{sha256(doc_id)}\""}</span>{"\n"}
          <span className="pos">{"+     return redis.get(key)"}</span>
        </div>
      </section>

      {/* ============ LEDGER ROWS ============ */}
      <section className="sec wrap" id="ledger">
        <div className="sec__label label" data-rv>
          Ledger
        </div>
        <div className="sec__body">
          <h2 className="h-xl" data-rv style={{ maxWidth: "20em" }}>
            Every verdict, hash-chained and tamper-evident.
          </h2>
          <p className="prose" data-rv style={{ marginTop: "calc(32 * var(--u))", maxWidth: "40em" }}>
            Each state transition is appended to a SHA-256 chain. Mutate any block and every
            subsequent link breaks. The audit trail is the product.
          </p>
        </div>
        <ul className="topics">
          {[
            { no: "Block 0", label: "Task Intake", hash: "8f4b238e89c13289…", status: "Sealed" },
            { no: "Block 1", label: "Baseline Profile", hash: "318cb92931ea789d…", status: "Sealed" },
            { no: "Block 2", label: "Candidate Patch", hash: "45a89df0123bc890…", status: "Sealed" },
            { no: "Block 3", label: "Gate Results", hash: "e890123890123890…", status: "Sealed" },
            { no: "Block 4", label: "Final Verdict", hash: "d4e1529a1b2c3d4e…", status: "Head" },
          ].map((b) => (
            <li key={b.no} data-rv>
              <span className="topics__no">{b.no}</span>
              <span className="topics__label">{b.label}</span>
              <span className="topics__hash">{b.hash}</span>
              <span className="topics__status">{b.status}</span>
            </li>
          ))}
        </ul>
        <div className="sec__body">
          <LedgerVisual />
        </div>
      </section>

      {/* ============ DETECTORS ============ */}
      <section className="sec wrap" id="detectors">
        <div className="sec__label label" data-rv>
          Detectors
        </div>
        <div className="sec__body">
          <h2 className="h-xl" data-rv style={{ maxWidth: "18em" }}>
            Nineteen problem classes, each with a working exploit.
          </h2>
          <p className="prose" data-rv style={{ marginTop: "calc(28 * var(--u))", maxWidth: "42em" }}>
            Every class ships with a vulnerable fixture, the naive AI fix that a model will reach
            for, and the hardened patch that passes. The probe method is executable, not
            aspirational.
          </p>
        </div>

        <div className="cards cards--3">
          {TIERS.map((tier) => {
            const items = detectors.filter((d) => d.tier === tier.id);
            return (
              <article className="card" key={tier.id} data-rv>
                <div className="card__tag">
                  {tier.id} Â· {tier.count} classes
                </div>
                <div className="card__title">{tier.name}</div>
                <div className="card__body">{tier.body}</div>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "calc(20 * var(--u)) 0 0",
                    display: "flex",
                    flexDirection: "column",
                    gap: "calc(7 * var(--u))",
                  }}
                >
                  {items.map((d) => (
                    <li
                      key={d.id}
                      style={{
                        display: "flex",
                        gap: "calc(10 * var(--u))",
                        fontSize: "calc(12.5 * var(--u))",
                        lineHeight: 1.5,
                        color: "var(--ink2)",
                        borderTop: "1px solid var(--line)",
                        paddingTop: "calc(9 * var(--u))",
                      }}
                    >
                      <span
                        className="mono"
                        style={{ color: "var(--ink3)", flexShrink: 0, fontSize: "calc(11 * var(--u))" }}
                      >
                        {d.id}
                      </span>
                      <span>{d.title}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        <div style={{ marginTop: "calc(40 * var(--u))", display: "flex", gap: "calc(30 * var(--u))", flexWrap: "wrap" }} data-rv>
          <button className="link-arrow" onClick={() => router.push("/catalog")}>
            Browse the full catalogue
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </button>
        </div>
      </section>

      {/* ============ INTEGRATIONS ============ */}
      <section className="sec wrap" id="integrations">
        <div className="sec__label label" data-rv>
          Integrate
        </div>
        <div className="sec__body">
          <h2 className="h-xl" data-rv style={{ maxWidth: "16em" }}>
            Runs where your code already lives.
          </h2>
        </div>
        <div className="cards cards--4">
          {[
            { tag: "CLI", title: "proofstack verify", body: "Point it at a repo and a target. It profiles, patches, gates and writes the ledger locally. Exit code is the verdict." },
            { tag: "CI", title: "GitHub Action", body: "One step in a pull request workflow. Every gate is enforced before merge, and the evidence pack is attached to the run." },
            { tag: "API", title: "REST + SSE", body: "Trigger runs, stream live stage transitions, and pull reports programmatically. Every endpoint is documented in OpenAPI." },
            { tag: "Hooks", title: "Webhooks", body: "Signed HMAC callbacks on each gate verdict and final decision, so your incident tooling learns the verdict first." },
          ].map((c) => (
            <article className="card" key={c.tag} data-rv>
              <div className="card__tag">{c.tag}</div>
              <div className="card__title">{c.title}</div>
              <div className="card__body">{c.body}</div>
            </article>
          ))}
        </div>
      </section>

      {/* ============ PRICING / PLANS ============ */}
      <section className="sec wrap" id="pricing">
        <div className="sec__label label" data-rv>
          Pricing
        </div>
        <div className="sec__body">
          <h2 className="h-xl" data-rv style={{ maxWidth: "16em" }}>
            Start free. Enforce everywhere.
          </h2>
          <p className="prose" data-rv style={{ marginTop: "calc(28 * var(--u))", maxWidth: "40em" }}>
            The engine and the whole detector catalogue are open source. Paid tiers buy scale,
            isolation and governance.
          </p>
        </div>
        <div className="cards cards--3">
          {[
            {
              tag: "Community",
              title: "Free, forever",
              price: "$0",
              body: "All 19 detectors, local sandboxes, the full ledger, and the CLI. Runs on your own hardware with no telemetry leaving the box.",
              items: ["All 19 detector classes", "Local microVM sandboxes", "Unlimited local runs", "Markdown + JSON evidence export"],
            },
            {
              tag: "Team",
              title: "Shared control plane",
              price: "$15",
              body: "Per seat, billed monthly. Adds hosted sandboxes, shared projects, token budgets and the GitHub Action.",
              items: ["Hosted Nebius sandboxes", "GitHub Action + webhooks", "Shared projects and history", "Token budgets per member"],
            },
            {
              tag: "Enterprise",
              title: "Governed at scale",
              price: "Custom",
              body: "Self-hosted or dedicated tenancy, four-tier RBAC, immutable audit anchoring and a signed SLA.",
              items: ["4-tier RBAC and tenant isolation", "Immutable ledger anchoring", "SSO, SCIM and audit export", "Signed SLA and dedicated support"],
            },
          ].map((plan) => (
            <article className="card" key={plan.tag} data-rv>
              <div className="card__tag">{plan.tag}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: "calc(8 * var(--u))", marginTop: "calc(16 * var(--u))" }}>
                <div style={{ fontWeight: 300, fontSize: "calc(34 * var(--u))", lineHeight: 1 }}>{plan.price}</div>
                <div style={{ fontSize: "calc(12 * var(--u))", color: "var(--ink2)" }}>{plan.title}</div>
              </div>
              <div className="card__body">{plan.body}</div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "calc(20 * var(--u)) 0 0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "calc(8 * var(--u))",
                }}
              >
                {plan.items.map((it) => (
                  <li
                    key={it}
                    style={{
                      display: "flex",
                      gap: "calc(9 * var(--u))",
                      fontSize: "calc(12.5 * var(--u))",
                      color: "var(--ink2)",
                    }}
                  >
                    <span style={{ color: "var(--pass)" }}>âœ“</span>
                    {it}
                  </li>
                ))}
              </ul>
              <button
                className="link-arrow"
                style={{ marginTop: "auto", alignSelf: "flex-start", fontSize: "calc(13 * var(--u))" }}
                onClick={launch}
              >
                {plan.tag === "Community" ? "Run it now" : "Talk to us"}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
            </article>
          ))}
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="sec wrap">
        <div className="sec__label label" data-rv>
          Start
        </div>
        <div className="sec__body">
          <h2 className="h-xl" data-rv style={{ maxWidth: "14em" }}>
            Run the first verification in under two minutes.
          </h2>
          <p className="prose" data-rv style={{ marginTop: "calc(28 * var(--u))", maxWidth: "38em" }}>
            No sign-up. No credit card. Seeded repositories, live sandboxes, and a verdict you can
            export as evidence the moment it lands.
          </p>
          <div style={{ marginTop: "calc(40 * var(--u))", display: "flex", gap: "calc(30 * var(--u))", flexWrap: "wrap" }} data-rv>
            <button className="link-arrow" onClick={launch}>
              Open the live cockpit
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
            <button className="link-arrow" onClick={() => router.push("/login")}>
              Sign in with a role
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="site-footer">
        <div className="wrap">
          <div className="site-footer__cols">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "calc(16 * var(--u))" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
                <span style={{ fontSize: "15px" }}>ProofStack</span>
              </div>
              <p style={{ fontSize: "calc(13 * var(--u))", lineHeight: 1.9, color: "var(--ink2)", maxWidth: "26em" }}>
                Autonomous verification for AI-written fixes. Faster code, with proof it is still safe.
              </p>
            </div>
            <div>
              <div className="site-footer__title">Product</div>
              <ul>
                <li><a href="#pipeline">Pipeline</a></li>
                <li><a href="#gates">Gates</a></li>
                <li><a href="#ledger">Ledger</a></li>
                <li><a href="#pricing">Pricing</a></li>
              </ul>
            </div>
            <div>
              <div className="site-footer__title">Developers</div>
              <ul>
                <li><a href="#pipeline">Quickstart</a></li>
                <li><a href="#gates">API reference</a></li>
                <li><a href="#ledger">GitHub Action</a></li>
                <li><a href="#pricing">Changelog</a></li>
              </ul>
            </div>
            <div>
              <div className="site-footer__title">Elsewhere</div>
              <ul>
                <li><a href="#top">Repository</a></li>
                <li><a href="#top">Devpost</a></li>
                <li><a href="#top">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="site-footer__bar">
            <span>Â© 2026 ProofStack</span>
            <span>Built for the Nebius Ã— NVIDIA Global AI Hackathon</span>
            <span>Nemotron-3 Super 120B Â· Nebius Token Factory</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
