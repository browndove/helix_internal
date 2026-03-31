import { NextRequest, NextResponse } from "next/server";
import { proxyUpstreamJson, resolveEscalationPoliciesPath } from "@/lib/upstreamV1";

/**
 * GET /api/escalation-policies/[id]
 * PUT /api/escalation-policies/[id]
 * DELETE /api/escalation-policies/[id]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Policy ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(
    request,
    "GET",
    `${resolveEscalationPoliciesPath()}/${encodeURIComponent(id)}`,
    { defaultErrorMessage: "Failed to load escalation policy." }
  );
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Policy ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(
    request,
    "PUT",
    `${resolveEscalationPoliciesPath()}/${encodeURIComponent(id)}`,
    { defaultErrorMessage: "Failed to update escalation policy." }
  );
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Policy ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(
    request,
    "DELETE",
    `${resolveEscalationPoliciesPath()}/${encodeURIComponent(id)}`,
    { defaultErrorMessage: "Failed to delete escalation policy." }
  );
}
