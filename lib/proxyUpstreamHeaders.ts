import { NextRequest } from "next/server";
import { X_FACILITY_ID_HEADER } from "@/lib/internalFacilityContext";

/** Authorization + X-Facility-Id only (use when Content-Type must be preserved, e.g. multipart). */
export function upstreamAuthFacilityHeaders(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  const auth = request.headers.get("authorization");
  if (auth) {
    headers.Authorization = auth;
  }
  const facilityId = request.headers.get("x-facility-id")?.trim();
  if (facilityId) {
    headers[X_FACILITY_ID_HEADER] = facilityId;
  }
  return headers;
}

/**
 * Forward Authorization and X-Facility-Id from the browser → Next route → upstream API.
 */
export function upstreamHeadersFromRequest(request: NextRequest): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...upstreamAuthFacilityHeaders(request),
  };
}
