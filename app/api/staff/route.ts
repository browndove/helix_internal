import { NextRequest } from "next/server";
import { proxyUpstreamJson, resolveStaffPath } from "@/lib/upstreamV1";

/**
 * GET /api/staff → list (query + facility_id from X-Facility-Id when missing).
 * POST /api/staff → create staff.
 */
export async function GET(request: NextRequest) {
  return proxyUpstreamJson(request, "GET", resolveStaffPath(), {
    defaultErrorMessage: "Failed to load staff.",
  });
}

export async function POST(request: NextRequest) {
  return proxyUpstreamJson(request, "POST", resolveStaffPath(), {
    defaultErrorMessage: "Failed to create staff.",
  });
}
