import { NextRequest } from "next/server";
import { proxyUpstreamJson, resolveEscalationPoliciesPath } from "@/lib/upstreamV1";

/**
 * GET /api/escalation-policies → list policies for facility.
 * POST /api/escalation-policies → create policy.
 */
export async function GET(request: NextRequest) {
  return proxyUpstreamJson(request, "GET", resolveEscalationPoliciesPath(), {
    defaultErrorMessage: "Failed to load escalation policies.",
  });
}

export async function POST(request: NextRequest) {
  return proxyUpstreamJson(request, "POST", resolveEscalationPoliciesPath(), {
    defaultErrorMessage: "Failed to create escalation policy.",
  });
}
