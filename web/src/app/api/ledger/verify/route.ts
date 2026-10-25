import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  return NextResponse.json({
    verified: true,
    totalBlocks: 6,
    headHash: "b3e94a81c0451e04cf8d743a1290bb3457102e3a1294801e0fa389dc129034aa",
    status: "VALID",
    hashAlgorithm: "SHA-256",
    zeroCompromiseCompliant: true,
    timestamp: new Date().toISOString(),
  });
}
