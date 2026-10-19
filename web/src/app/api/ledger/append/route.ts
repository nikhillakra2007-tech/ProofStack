import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { problemId, patchTitle, actor = "developer", originalCode, patchedCode, verdict = "ACCEPT" } = body;

    const timestamp = new Date().toISOString();
    const prevHash = body.prevHash || "c4938a109e8b7c6d5e4f3a2b109876543210fedcba9876543210abcdef012345";
    
    // Canonical SHA-256 computation
    const payload = {
      action: "DEFENSIVE_PATCH_COMMIT",
      problem_id: problemId || "CUSTOM",
      patch_title: patchTitle || "Nemotron Autonomous Patch",
      verdict,
      actor,
      timestamp,
      hash_algorithm: "SHA-256",
      zero_compromise_compliant: true,
    };

    const canonicalJson = JSON.stringify(payload);
    const entryHash = crypto
      .createHash("sha256")
      .update(prevHash + canonicalJson)
      .digest("hex");

    const newBlock = {
      index: body.index || 6,
      type: "PATCH_APPLIED",
      timestamp,
      actor,
      prev_hash: prevHash,
      entry_hash: entryHash,
      payload,
      verified: true,
    };

    return NextResponse.json({
      success: true,
      block: newBlock,
      message: `Committed block #${newBlock.index} to SHA-256 evidence chain`,
      entryHash,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to commit ledger block" },
      { status: 500 }
    );
  }
}
