import { NextRequest } from "next/server";
import { proxyUpstreamJson, resolveStaffPath } from "@/lib/upstreamV1";

/**
 * POST /api/proxy/staff — same upstream as POST /api/staff (create staff).
 * Client path expected by internal-admin flows that call `/api/proxy/staff`.
 */
export async function POST(request: NextRequest) {
  return proxyUpstreamJson(request, "POST", resolveStaffPath(), {
    defaultErrorMessage: "Failed to create staff.",
  });
}
