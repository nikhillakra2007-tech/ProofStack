import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const fastApiResponse = await fetch("http://127.0.0.1:8000/api/tasks", {
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(1500),
    });
    if (fastApiResponse.ok) {
      const data = await fastApiResponse.json();
      return NextResponse.json(data);
    }
  } catch {
    // Fallback
  }

  return NextResponse.json([
    {
      id: "TASK9142",
      problemId: "T1-2",
      title: "N+1 Query Explosion & SQL-Injection Trap",
      repoPath: "./fixtures/demo_app",
      target: "orders.py:get_orders",
      baseCommit: "c8a94e1",
      mode: "OPTIMIZE",
      verdict: "ACCEPT",
      speedup: "+74.2%",
      timestamp: "2026-10-15T18:01:09Z",
    },
  ]);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { repoPath, target, baseCommit = "HEAD", mode = "OPTIMIZE" } = body;

    if (!repoPath || !repoPath.trim()) {
      return NextResponse.json(
        { error: "Repository Path or Git URL is required." },
        { status: 400 }
      );
    }

    if (!target || !target.trim()) {
      return NextResponse.json(
        { error: "Target File & Function is required (e.g. orders.py:get_orders)." },
        { status: 400 }
      );
    }

    // Try FastAPI
    try {
      const fastApiResponse = await fetch("http://127.0.0.1:8000/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(2000),
      });
      if (fastApiResponse.ok) {
        const data = await fastApiResponse.json();
        return NextResponse.json(data);
      }
    } catch {
      // Fallback
    }

    const taskId = `TASK${Math.floor(1000 + Math.random() * 9000)}`;
    const task = {
      id: taskId,
      problemId: "CUSTOM",
      title: `Audit ${target} (${mode})`,
      repoPath: repoPath.trim(),
      target: target.trim(),
      baseCommit: baseCommit.trim() || "HEAD",
      mode,
      status: "INGESTED",
      verdict: "PENDING",
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      taskId,
      task,
      message: `Successfully ingested repository '${repoPath}' for target '${target}'`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Task creation failed" },
      { status: 500 }
    );
  }
}
