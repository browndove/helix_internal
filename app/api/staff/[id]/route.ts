import { NextRequest, NextResponse } from "next/server";
import { proxyUpstreamJson, resolveStaffPath } from "@/lib/upstreamV1";

/**
 * GET /api/staff/[id]
 * PUT /api/staff/[id]
 * DELETE /api/staff/[id]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Staff ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(request, "GET", `${resolveStaffPath()}/${encodeURIComponent(id)}`, {
    defaultErrorMessage: "Failed to load staff member.",
  });
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Staff ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(request, "PUT", `${resolveStaffPath()}/${encodeURIComponent(id)}`, {
    defaultErrorMessage: "Failed to update staff member.",
  });
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Staff ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(request, "DELETE", `${resolveStaffPath()}/${encodeURIComponent(id)}`, {
    defaultErrorMessage: "Failed to delete staff member.",
  });
}
