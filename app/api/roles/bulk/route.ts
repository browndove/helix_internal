import { NextRequest } from "next/server";
import { proxyUpstreamBody, resolveRolesPath } from "@/lib/upstreamV1";

/**
 * POST /api/roles/bulk → upstream POST .../roles/bulk (JSON or multipart).
 */
export async function POST(request: NextRequest) {
  return proxyUpstreamBody(request, "POST", `${resolveRolesPath()}/bulk`, {
    defaultErrorMessage: "Failed bulk roles operation.",
  });
}
