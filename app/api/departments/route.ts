import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_API_BASE_URL, DEFAULT_DEPARTMENTS_PATH } from "@/lib/constants";
import { upstreamHeadersFromRequest } from "@/lib/proxyUpstreamHeaders";

function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

/**
 * GET /api/departments
 * Proxies to backend GET /api/v1/departments.
 * Internal admins must send X-Facility-Id (or facility_id query); this route forwards both.
 */
export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;

  const path =
    process.env.NEXT_PUBLIC_DEPARTMENTS_PATH?.trim() ||
    process.env.DEPARTMENTS_PATH?.trim() ||
    DEFAULT_DEPARTMENTS_PATH;
  const normalizedPath = normalizePath(path);
  const upstream = new URL(`${baseUrl.replace(/\/+$/, "")}${normalizedPath}`);

  request.nextUrl.searchParams.forEach((value, key) => {
    upstream.searchParams.set(key, value);
  });

  const headerFacilityId = request.headers.get("x-facility-id")?.trim();
  if (!upstream.searchParams.get("facility_id") && headerFacilityId) {
    upstream.searchParams.set("facility_id", headerFacilityId);
  }

  try {
    const response = await fetch(upstream.toString(), {
      method: "GET",
      headers: upstreamHeadersFromRequest(request),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data && typeof data === "object" && typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : "Failed to load departments.";
      return NextResponse.json(
        { message, ...(data && typeof data === "object" ? data : {}) },
        { status: response.status }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err) {
    console.error("GET /api/departments proxy error:", err);
    return NextResponse.json(
      { message: "Unable to reach the server. Please try again." },
      { status: 502 }
    );
  }
}
