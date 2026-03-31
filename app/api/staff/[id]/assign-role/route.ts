import { NextRequest, NextResponse } from "next/server";
import { proxyUpstreamJson, resolveStaffPath } from "@/lib/upstreamV1";

/**
 * POST /api/staff/[id]/assign-role → upstream assign-role (e.g. admin vs staff).
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Staff ID is required." }, { status: 400 });
  }
  return proxyUpstreamJson(
    request,
    "POST",
    `${resolveStaffPath()}/${encodeURIComponent(id)}/assign-role`,
    { defaultErrorMessage: "Failed to assign role." }
  );
}
