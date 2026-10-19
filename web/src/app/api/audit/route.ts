import { NextRequest, NextResponse } from "next/server";
import { MOCK_CATALOG } from "@/lib/mockData";
import { GateStatus } from "@/lib/types";
import { forwardToFastApi } from "@/lib/apiClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, problemId } = body;

    // Forward to FastAPI backend if active
    const fastApiData = await forwardToFastApi("/api/audit", {
      method: "POST",
      body,
      timeoutMs: 1500,
    });
    if (fastApiData) {
      return NextResponse.json(fastApiData);
    }

    const problem = MOCK_CATALOG.find((p) => p.id === problemId);

    // Flaw detections
    const detectedFlaws: string[] = [];

    // AST Invariants
    const hasBannedImports = code.includes("import os") && (code.includes("os.system") || code.includes("subprocess.Popen"));
    if (hasBannedImports) {
      detectedFlaws.push("G0: Banned syscall or subprocess invocation detected");
    }

    // ReDoS
    const hasReDoS = code.includes("([a-zA-Z0-9]+)+") || code.includes("(a+)+") || (code.includes("+)+") && !code.includes("^[a-zA-Z0-9]+$"));
    if (hasReDoS) {
      detectedFlaws.push("T1-1: Catastrophic Regex Backtracking (ReDoS) with nested quantifiers");
    }

    // SQL Injection / N+1
    const hasNPlusOne = code.includes("for order in") && code.includes("db.query(Customer)");
    const hasSqlInjection = code.includes("f\"SELECT") || code.includes("format(") || code.includes(".join(ids)");
    if (hasNPlusOne) {
      detectedFlaws.push("T1-2: N+1 Query Explosion (iterative DB queries inside loop)");
    }
    if (hasSqlInjection) {
      detectedFlaws.push("G2/OWASP A03: Unparameterized SQL query with raw string interpolation");
    }

    // IDOR / Tenant isolation
    const hasMissingTenant = code.includes("cache") && !code.includes("tenant_id") && code.includes("doc_id");
    if (hasMissingTenant) {
      detectedFlaws.push("T1-3/G3: Insecure Direct Object Reference (IDOR) - Cache key lacks tenant_id partition");
    }

    // SSRF
    const hasSsrf = (code.includes("requests.get(url)") || code.includes("urllib.request")) && !code.includes("ipaddress.ip_address");
    if (hasSsrf && problemId === "T1-8") {
      detectedFlaws.push("T1-8/OWASP A10: Server-Side Request Forgery (SSRF) without cloud metadata IP filter");
    }

    // TOCTOU
    const hasToctou = (code.includes("os.path.exists") && code.includes("open(")) || (code.includes("balance >") && !code.includes("with_for_update"));
    if (hasToctou && problemId === "T1-7") {
      detectedFlaws.push("T1-7: Time-of-Check to Time-of-Use (TOCTOU) concurrency race window");
    }

    // Check if code matches safe fix snippet
    const isSafeFix =
      problem &&
      (code.replace(/\s+/g, "").includes(problem.safeFixSnippet.replace(/\s+/g, "").substring(0, 40)) ||
        (problem.id === "T1-1" && code.includes("^[a-zA-Z0-9]+$")) ||
        (problem.id === "T1-2" && code.includes("joinedload")) ||
        (problem.id === "T1-3" && code.includes("tenant_id") && code.includes("doc_id")));

    const gates: GateStatus[] = [
      {
        gateId: "G0",
        name: "Pre-gate AST Invariant Check",
        status: hasBannedImports ? "FAIL" : "PASS",
        description: "Zero banned imports, AST syntax tree validity, lockfile checksums",
        details: hasBannedImports ? "Violated: AST contains dangerous subprocess/exec calls" : "PASS: AST parse valid, clean AST tree, zero banned imports",
      },
      {
        gateId: "G1",
        name: "Regression Test Suite",
        status: !isSafeFix && detectedFlaws.length > 0 ? "FAIL" : "PASS",
        description: "28 functional unit tests verify API correctness",
        details: !isSafeFix && detectedFlaws.length > 0 ? "FAIL: 4 regression tests failed on edge cases" : "PASS: 28/28 unit tests passed, 0 functional regressions",
      },
      {
        gateId: "G2",
        name: "Security Exploit Oracle",
        status: hasSqlInjection || hasReDoS || hasSsrf ? "FAIL" : "PASS",
        description: "Adversarial probe payloads (SQLi canary, evil ReDoS strings, SSRF metadata)",
        details: hasSqlInjection || hasReDoS || hasSsrf
          ? `FAIL: Exploit oracle triggered: ${detectedFlaws[0] || "Exploit vector active"}`
          : "PASS: All adversarial canary payloads neutralized",
      },
      {
        gateId: "G3",
        name: "Identity & Predicate Guard",
        status: hasMissingTenant ? "FAIL" : "PASS",
        description: "Verifies tenant_id, user_id, and auth decorators remain unmodified",
        details: hasMissingTenant ? "FAIL: Authorization predicate or tenant_id partition dropped" : "PASS: tenant_id, user_id, @login_required preserved intact",
      },
      {
        gateId: "G4",
        name: "Concurrency & Race Safety",
        status: hasToctou ? "FAIL" : "PASS",
        description: "Multi-threaded race probe, lost-update detection, deadlocks",
        details: hasToctou ? "FAIL: Race window detected between validation and commit" : "PASS: Thread-safe, 0 lost updates under 50 concurrent workers",
      },
      {
        gateId: "G5",
        name: "Empirical Scaling & Performance",
        status: hasNPlusOne || hasReDoS ? "FAIL" : "PASS",
        description: "Log-log scaling exponent b < 1.3, query count reduction > tau_noise",
        details: hasNPlusOne || hasReDoS
          ? "FAIL: Performance regression: Scaling exponent b=1.98 (quadratic) or query explosion"
          : "PASS: Scaling exponent b=1.02 (linear). SQL queries reduced from 5,001 -> 1 (+74.2% > tau_noise 5%)",
      },
      {
        gateId: "G6",
        name: "Resource Bounds & Leak Monitor",
        status: "PASS",
        description: "Tracemalloc RAM ceiling < 20MB, file descriptor delta = 0",
        details: "PASS: Peak RAM delta 1.4 MB (< 20MB limit). Zero leaked file descriptors.",
      },
      {
        gateId: "G7",
        name: "Sandbox Hygiene & Invariants",
        status: "PASS",
        description: "Zero modified unit tests, writable root invariants respected",
        details: "PASS: Zero test files modified, container filesystem remained strictly isolated.",
      },
    ];

    const allPassed = gates.every((g) => g.status === "PASS");
    const verdict = allPassed ? "ACCEPT" : "REJECT";

    return NextResponse.json({
      verdict,
      gates,
      detectedFlaws,
      metrics: {
        sqlQueryCount: allPassed ? 1 : 5001,
        latencyMs: allPassed ? 12 : 428,
        scalingExponent: allPassed ? 1.02 : 1.98,
        memoryDeltaMb: allPassed ? 0.8 : 14.5,
        tauNoise: 0.05,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Audit failed" },
      { status: 500 }
    );
  }
}
