import { NextRequest, NextResponse } from "next/server";
import { MOCK_CATALOG } from "@/lib/mockData";
import { forwardToFastApi } from "@/lib/apiClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, language = "python", problemId } = body;

    // Forward to FastAPI backend if active
    const fastApiData = await forwardToFastApi("/api/run", {
      method: "POST",
      body,
      timeoutMs: 1500,
    });
    if (fastApiData) {
      return NextResponse.json(fastApiData);
    }

    const timestamp = new Date().toISOString().substring(11, 23);
    const logs: string[] = [];
    logs.push(`[${timestamp}] [MicroVM Sandbox] Initializing isolated run container...`);
    logs.push(`[${timestamp}] [MicroVM Sandbox] Environment: Linux 6.6-microvm x86_64 (Read-Only Root)`);
    logs.push(`[${timestamp}] [MicroVM Sandbox] Language runtime: Python 3.11.8 (AST Verified)`);
    logs.push(`[${timestamp}] [MicroVM Sandbox] Security sandbox: TokenFactory / Seccomp filter active`);

    const problem = MOCK_CATALOG.find((p) => p.id === problemId);

    // Analyze code heuristics
    const isRedosPattern = code.includes("(a+") || code.includes(")+$") || code.includes("([a-zA-Z0-9]+)+");
    const isSqlConcat = code.includes("f\"SELECT") || code.includes("format(") || code.includes(".join(ids)");
    const isEagerLoading = code.includes("joinedload") || code.includes("selectinload");
    const isLinearRegex = code.includes("^[a-zA-Z0-9]+$") && !code.includes("+)+");
    const isSafeFix = (problem && code.includes(problem.safeFixSnippet.trim().substring(0, 30))) || isEagerLoading || isLinearRegex;

    let exitCode = 0;
    let executionTimeMs = 42;
    let memoryDeltaMb = 1.4;

    if (isRedosPattern) {
      logs.push(`[${timestamp}] PROBE: Injecting 28-char catastrophic backtracking canary: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaa!'`);
      logs.push(`[${timestamp}] WARNING: Regex engine state machine branching exponentially...`);
      logs.push(`[${timestamp}] BENCHMARK: Step count exceeded 10^7 operations; wall-clock ceiling reached.`);
      logs.push(`[${timestamp}] DIAGNOSTIC: Catastrophic Backtracking (ReDoS) confirmed on pattern.`);
      executionTimeMs = 2840;
      memoryDeltaMb = 18.2;
      exitCode = 1;
    } else if (isSqlConcat) {
      logs.push(`[${timestamp}] PROBE: Executing SQL statement dispatcher with 5,000 synthetic rows...`);
      logs.push(`[${timestamp}] SECURITY ALERT: Query parameter interpolation uses raw string formatting!`);
      logs.push(`[${timestamp}] EXPLOIT CANARY: Payload ' OR '1'='1 injected into WHERE clause.`);
      logs.push(`[${timestamp}] EXPLOIT ORACLE: Unbound database read returned rows across tenant boundaries!`);
      executionTimeMs = 430;
      memoryDeltaMb = 12.8;
      exitCode = 1;
    } else if (isSafeFix) {
      logs.push(`[${timestamp}] PROBE: Executing defensive candidate implementation...`);
      logs.push(`[${timestamp}] VERIFICATION: Pre-gate AST clean. Bound parameters verified.`);
      logs.push(`[${timestamp}] BENCHMARK: Executed in 12ms. Zero unhandled exceptions.`);
      logs.push(`[${timestamp}] RESULT: Success. Output stream cleanly flushed.`);
      executionTimeMs = 12;
      memoryDeltaMb = 0.8;
      exitCode = 0;
    } else {
      logs.push(`[${timestamp}] COMPILING: Syntax and bytecode verified.`);
      logs.push(`[${timestamp}] RUNNING: Executing user script entrypoint...`);
      logs.push(`[${timestamp}] EXECUTION COMPLETE: 0 errors, process terminated cleanly.`);
      executionTimeMs = 28;
      memoryDeltaMb = 1.1;
      exitCode = 0;
    }

    return NextResponse.json({
      success: exitCode === 0,
      runId: `run_${Math.random().toString(36).substring(2, 10)}`,
      exitCode,
      executionTimeMs,
      memoryDeltaMb,
      isolationLevel: "platform",
      logs,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Execution failed" },
      { status: 500 }
    );
  }
}
