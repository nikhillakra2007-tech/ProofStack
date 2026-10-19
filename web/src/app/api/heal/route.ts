import { NextRequest, NextResponse } from "next/server";
import { MOCK_CATALOG } from "@/lib/mockData";
import { forwardToFastApi } from "@/lib/apiClient";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, problemId } = body;

    // Forward to FastAPI backend if active
    const fastApiData = await forwardToFastApi("/api/heal", {
      method: "POST",
      body,
      timeoutMs: 1500,
    });
    if (fastApiData) {
      return NextResponse.json(fastApiData);
    }

    const problem = MOCK_CATALOG.find((p) => p.id === problemId) || MOCK_CATALOG[1]; // default to T1-2

    return NextResponse.json({
      model: "nvidia/nemotron-3-super-120b",
      hypothesis: {
        id: "H1",
        claim: `Replace algorithmic bottleneck in ${problem.id} with verified defensive implementation while preserving authorization invariants.`,
        confidence: 0.96,
        computedSupport: 0.94,
        experimentKind: "counter_probe",
      },
      originalCode: code || problem.bugSnippet,
      patchedCode: problem.safeFixSnippet,
      explanation: problem.safeReason,
      truthRank: problem.truthRank,
      probeMethod: problem.probeMethod,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Self-healing generation failed" },
      { status: 500 }
    );
  }
}
