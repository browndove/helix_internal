import { NextRequest, NextResponse } from "next/server";
import { proxyUpstreamJson, resolveEscalationPoliciesPath } from "@/lib/upstreamV1";

/**
 * GET /api/escalation-policies/by-role/[roleId] → policy for a duty role.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ roleId: string }> }
) {
  const { roleId } = await context.params;
  if (!roleId) {
    return NextResponse.json({ message: "Role ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(
    request,
    "GET",
    `${resolveEscalationPoliciesPath()}/by-role/${encodeURIComponent(roleId)}`,
    { defaultErrorMessage: "Failed to load policy by role." }
  );
}
