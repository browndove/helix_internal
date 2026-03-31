import { NextRequest, NextResponse } from "next/server";
import { proxyUpstreamJson, resolveEscalationPoliciesPath } from "@/lib/upstreamV1";

/**
 * POST /api/escalation-policies/[id]/steps → add one escalation step.
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Policy ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(
    request,
    "POST",
    `${resolveEscalationPoliciesPath()}/${encodeURIComponent(id)}/steps`,
    { defaultErrorMessage: "Failed to add escalation step." }
  );
}
