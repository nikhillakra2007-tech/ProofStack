import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const t0 = Date.now();
  try {
    const body = await req.json().catch(() => ({}));
    const apiKey =
      body.apiKey ||
      body.nebiusKey ||
      body.nemotronKey ||
      req.headers.get("x-nebius-api-key") ||
      req.headers.get("x-api-key") ||
      process.env.NEBIUS_API_KEY ||
      process.env.NVIDIA_API_KEY;

    if (!apiKey || typeof apiKey !== "string" || apiKey.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No API key provided. Please enter a valid Nebius Token Factory or NVIDIA API key.",
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
          signal: AbortSignal.timeout(1500),
        });
        if (fastApiRes.ok) {
          const fastApiData = await fastApiRes.json();
          const latency = Date.now() - t0;
          return NextResponse.json({
            success: true,
            provider: `FastAPI Backend (Port ${port}) & Nebius Token Factory`,
            models: fastApiData.models || {
              diagnosis: "nvidia/nemotron-3-super-120b",
              patch: "nvidia/nemotron-3.5-lightning",
            },
            message: `✓ Connected via FastAPI (Port ${port}) · NVIDIA Nemotron 3 Ready (${latency}ms roundtrip)`,
            latencyMs: latency,
          });
        }
      } catch {
        // Fall through to direct cloud verify
      }
    }

    // 2. Build list of candidate endpoints
    const customUrl = (body.endpointUrl || process.env.TOKEN_FACTORY_BASE_URL || "").trim().replace(/\/+$/, "");
    
    // Normalize known typo: api.tokenfactory.nebius.ai does not exist; real is .com or api.studio.nebius.ai
    const normalizedCustom = customUrl.replace("api.tokenfactory.nebius.ai", "api.studio.nebius.ai");

    const candidateUrls: string[] = [];
    if (normalizedCustom) {
      candidateUrls.push(normalizedCustom);
    }
    // Official Nebius AI Studio OpenAI-compatible endpoint
    candidateUrls.push("https://api.studio.nebius.ai/v1");
    // Official Nebius Token Factory endpoint
    candidateUrls.push("https://api.tokenfactory.nebius.com/v1");

    // If key starts with nvapi-, also add official NVIDIA NIM endpoint
    if (trimmedKey.startsWith("nvapi-")) {
      candidateUrls.unshift("https://integrate.api.nvidia.com/v1");
    }

    // De-duplicate endpoints
    const uniqueCandidates = Array.from(new Set(candidateUrls));

    let lastError = "";
    let lastStatusCode = 0;

    for (const base of uniqueCandidates) {
      try {
        const modelsRes = await fetch(`${base}/models`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${trimmedKey}`,
            "Content-Type": "application/json",
          },
          signal: AbortSignal.timeout(6000),
        });

        const latency = Date.now() - t0;

        if (modelsRes.status === 401 || modelsRes.status === 403) {
          return NextResponse.json(
            {
              success: false,
              error: `Authentication failed (HTTP ${modelsRes.status}): Invalid API key or unauthorized permissions for ${base}.`,
              latencyMs: latency,
            },
            { status: 401 }
          );
        }

        if (modelsRes.ok) {
          const data = await modelsRes.json().catch(() => ({}));
          const modelList = Array.isArray(data.data)
            ? data.data.map((m: any) => m.id).slice(0, 8)
            : ["nvidia/nemotron-3-super-120b", "nvidia/nemotron-3.5-lightning"];

          const isNvidiaNim = base.includes("nvidia.com");
          const providerName = isNvidiaNim ? "NVIDIA NIM (Direct)" : "Nebius Token Factory (Direct)";

          return NextResponse.json({
            success: true,
            provider: providerName,
            endpoint: base,
            models: modelList,
            message: `✓ Connected: ${providerName} (${latency}ms roundtrip) · NVIDIA Nemotron Models Active`,
            latencyMs: latency,
          });
        }

        // If /models returned 404 or method not allowed, test minimal dry-run completion
        const targetModel = body.model || "nvidia/nemotron-3-super-120b";
        const completionRes = await fetch(`${base}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${trimmedKey}`,
          },
          body: JSON.stringify({
            model: targetModel,
            messages: [{ role: "user", content: "ping" }],
            max_tokens: 1,
          }),
          signal: AbortSignal.timeout(7000),
        });

        const compLatency = Date.now() - t0;
        if (completionRes.status === 401 || completionRes.status === 403) {
          return NextResponse.json(
            {
              success: false,
              error: `Authentication failed (HTTP ${completionRes.status}): Invalid API key for ${base}.`,
              latencyMs: compLatency,
            },
            { status: 401 }
          );
        }

        if (completionRes.ok) {
          return NextResponse.json({
            success: true,
            provider: "Nebius Token Factory (Direct Completion)",
            endpoint: base,
            models: [targetModel, "nvidia/nemotron-3.5-lightning"],
            message: `✓ Connected: Nebius Token Factory (${compLatency}ms roundtrip) · Live NVIDIA NIM Verified`,
            latencyMs: compLatency,
          });
        }

        lastStatusCode = completionRes.status;
        const errTxt = await completionRes.text().catch(() => "");
        lastError = `${base} returned HTTP ${completionRes.status}: ${errTxt.slice(0, 120)}`;
      } catch (err: any) {
        lastError = err?.message || "Connection timeout";
        // Continue to next candidate
      }
    }

    const totalLatency = Date.now() - t0;
    return NextResponse.json(
      {
        success: false,
        error: `Could not verify credentials across candidate endpoints: ${lastError}`,
        latencyMs: totalLatency,
      },
      { status: lastStatusCode || 502 }
    );
  } catch (err: any) {
    const totalLatency = Date.now() - t0;
    return NextResponse.json(
      {
        success: false,
        error: `Verification error: ${err?.message || "Failed to process request"}`,
        latencyMs: totalLatency,
      },
      { status: 500 }
    );
  }
}
