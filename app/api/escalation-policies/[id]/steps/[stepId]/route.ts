import { NextRequest, NextResponse } from "next/server";
import { proxyUpstreamJson, resolveEscalationPoliciesPath } from "@/lib/upstreamV1";

/**
 * DELETE /api/escalation-policies/[id]/steps/[stepId]
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; stepId: string }> }
) {
  const { id, stepId } = await context.params;
  if (!id || !stepId) {
    return NextResponse.json(
      { message: "Policy ID and step ID are required." },
      { status: 400 }
    );
  }
  return proxyUpstreamJson(
    request,
    "DELETE",
    `${resolveEscalationPoliciesPath()}/${encodeURIComponent(id)}/steps/${encodeURIComponent(stepId)}`,
    { defaultErrorMessage: "Failed to delete escalation step." }
  );
}
