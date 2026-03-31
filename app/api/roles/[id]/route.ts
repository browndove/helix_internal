import { NextRequest, NextResponse } from "next/server";
import { proxyUpstreamJson, resolveRolesPath } from "@/lib/upstreamV1";

/**
 * GET /api/roles/[id]
 * PUT /api/roles/[id]
 * DELETE /api/roles/[id]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Role ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(request, "GET", `${resolveRolesPath()}/${encodeURIComponent(id)}`, {
    defaultErrorMessage: "Failed to load role.",
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Role ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(request, "PUT", `${resolveRolesPath()}/${encodeURIComponent(id)}`, {
    defaultErrorMessage: "Failed to update role.",
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Role ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(request, "DELETE", `${resolveRolesPath()}/${encodeURIComponent(id)}`, {
    defaultErrorMessage: "Failed to delete role.",
  });
}
