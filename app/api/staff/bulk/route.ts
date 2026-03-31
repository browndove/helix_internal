import { NextRequest } from "next/server";
import { proxyUpstreamBody, resolveStaffPath } from "@/lib/upstreamV1";

/**
 * POST /api/staff/bulk → upstream .../staff/bulk?facility_id=… (facility_id from X-Facility-Id if missing).
 */
export async function POST(request: NextRequest) {
  return proxyUpstreamBody(request, "POST", `${resolveStaffPath()}/bulk`, {
    defaultErrorMessage: "Failed bulk staff operation.",
  });
}
