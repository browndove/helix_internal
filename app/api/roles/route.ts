import { NextRequest } from "next/server";
import { proxyUpstreamJson, resolveRolesPath } from "@/lib/upstreamV1";

/**
 * GET /api/roles → upstream list (query forwarded; facility_id from X-Facility-Id if missing).
 * POST /api/roles → create role.
 */
export async function GET(request: NextRequest) {
  return proxyUpstreamJson(request, "GET", resolveRolesPath(), {
    defaultErrorMessage: "Failed to load roles.",
  });
}

export async function POST(request: NextRequest) {
  return proxyUpstreamJson(request, "POST", resolveRolesPath(), {
    defaultErrorMessage: "Failed to create role.",
  });
}
