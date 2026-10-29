import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const body = await req.json();
    const apiKey = body.apiKey || req.headers.get("x-nebius-api-key") || process.env.NEBIUS_API_KEY;

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No API key provided. Please enter a valid Nebius Token Factory API key.",
          latencyMs: 0,
        },
        { status: 400 }
      );
    }

    const trimmedKey = apiKey.trim();

    // 1. If local FastAPI backend is active on 8765 or 8000, check it
    for (const port of ["8765", "8000"]) {
      try {
        const backendBase = process.env.BACKEND_API_URL || `http://127.0.0.1:${port}`;
        const fastApiRes = await fetch(`${backendBase}/api/model/status`, {
          method: "GET",
          headers: {
            "x-nebius-api-key": trimmedKey,
            "x-api-key": trimmedKey,
          },
          signal: AbortSignal.timeout(2500),
        });
        if (fastApiRes.ok) {
          const fastApiData = await fastApiRes.json();
          const latency = Date.now() - t0;
          return NextResponse.json({
            success: true,
            provider: "FastAPI Backend (Port " + port + ") & Nebius Token Factory",
            models: fastApiData.models || {
              diagnosis: "nvidia/nemotron-3-super-120b",
              patch: "nvidia/nemotron-3.5-lightning",
            },
            message: `✓ Connected via FastAPI (Port ${port}) · NVIDIA Nemotron 3 Ready (${latency}ms roundtrip)`,
            latencyMs: latency,
          });
        }
      } catch {
        // Try next
      }
    }

    // 2. Direct verification against Nebius Token Factory
    const baseUrl = process.env.TOKEN_FACTORY_BASE_URL
      ? process.env.TOKEN_FACTORY_BASE_URL.replace(/\/+$/, "")
      : "https://api.tokenfactory.nebius.ai/v1";

    const nebiusRes = await fetch(`${baseUrl}/models`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${trimmedKey}`,
      },
      signal: AbortSignal.timeout(8000),
    });

    const latency = Date.now() - t0;

    if (nebiusRes.status === 401 || nebiusRes.status === 403) {
      return NextResponse.json(
        {
          success: false,
          error: `Authentication failed (HTTP ${nebiusRes.status}): Invalid Nebius API key or unauthorized permissions.`,
          latencyMs: latency,
        },
        { status: 401 }
      );
    }

    if (nebiusRes.ok) {
      const data = await nebiusRes.json();
      const modelList = Array.isArray(data.data)
        ? data.data.map((m: any) => m.id).slice(0, 5)
        : ["nvidia/nemotron-3-super-120b", "nvidia/nemotron-3.5-lightning"];

      return NextResponse.json({
        success: true,
        provider: "Nebius Token Factory (Direct)",
        models: modelList,
        message: `✓ Connected: Nebius Token Factory (${latency}ms roundtrip) · NVIDIA Nemotron Models Active`,
        latencyMs: latency,
      });
    }

    // If models endpoint returned another code, test with a minimal dry-run completion
    const testCompletion = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${trimmedKey}`,
      },
      body: JSON.stringify({
        model: "nvidia/nemotron-3.5-lightning",
        messages: [{ role: "user", content: "ping" }],
        max_tokens: 1,
      }),
      signal: AbortSignal.timeout(8000),
    });

    const compLatency = Date.now() - t0;
    if (testCompletion.ok) {
      return NextResponse.json({
        success: true,
        provider: "Nebius Token Factory (Direct Inference)",
        models: ["nvidia/nemotron-3-super-120b", "nvidia/nemotron-3.5-lightning"],
        message: `✓ Connected: Nebius Token Factory (${compLatency}ms roundtrip) · Live NVIDIA NIM Verified`,
        latencyMs: compLatency,
      });
    }

    const errText = await testCompletion.text().catch(() => "");
    return NextResponse.json(
      {
        success: false,
        error: `Nebius API returned status ${testCompletion.status}: ${errText.slice(0, 150)}`,
        latencyMs: compLatency,
      },
      { status: testCompletion.status || 502 }
    );
  } catch (err: any) {
    const latency = Date.now() - t0;
    return NextResponse.json(
      {
        success: false,
        error: `Connection error: ${err?.message || "Failed to reach Nebius Token Factory"}`,
        latencyMs: latency,
      },
      { status: 504 }
    );
  }
}
