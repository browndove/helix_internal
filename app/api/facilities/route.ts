import { NextRequest, NextResponse } from "next/server";
import { Facility } from "@/lib/types";

function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

function parseFacility(raw: Record<string, unknown>): Facility {
  const facility: Facility = {
    id: typeof raw.id === "string" ? raw.id : "",
    name: typeof raw.name === "string" ? raw.name : "",
    adminEmail: typeof raw.adminEmail === "string" ? raw.adminEmail : "",
    city: typeof raw.city === "string" ? raw.city : "",
    region: typeof raw.region === "string" ? raw.region : "",
    address: typeof raw.address === "string" ? raw.address : "",
    userCount: typeof raw.userCount === "number" ? raw.userCount : 0,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
  };
  if (typeof raw.code === "string") {
    facility.code = raw.code;
  }
  return facility;
}

/**
 * GET /api/facilities
 * List all facilities. No authentication required.
 * Proxies to backend GET /facilities.
 */
export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { message: "API URL is not configured." },
      { status: 503 }
    );
  }

  const path =
    process.env.NEXT_PUBLIC_FACILITIES_PATH?.trim() ||
    process.env.FACILITIES_PATH?.trim() ||
    "/api/v1/facilities";
  const normalizedPath = normalizePath(path);
  const url = `${baseUrl.replace(/\/+$/, "")}${normalizedPath}`;

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data && typeof data === "object" && typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : "Failed to load facilities.";
      return NextResponse.json(
        { message, ...(data && typeof data === "object" ? data : {}) },
        { status: response.status }
      );
    }

    const list = Array.isArray(data)
      ? data
      : data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)
        ? (data as { data: unknown[] }).data
        : [];
    const facilities: Facility[] = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
      .map(parseFacility)
      .filter((f) => f.id && f.name);

    return NextResponse.json(facilities);
  } catch (err) {
    console.error("GET /api/facilities proxy error:", err);
    return NextResponse.json(
      { message: "Unable to reach the server. Please try again." },
      { status: 502 }
    );
  }
}

/**
 * POST /api/facilities
 * Creates a new facility. Proxies to backend POST /facilities.
 * Requires admin role (enforced by backend via Authorization header).
 */
export async function POST(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json(
      { message: "API URL is not configured." },
      { status: 503 }
    );
  }

  const authorization = request.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json(
      { message: "Authorization required." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  const path =
    process.env.NEXT_PUBLIC_FACILITIES_PATH?.trim() ||
    process.env.FACILITIES_PATH?.trim() ||
    "/api/v1/facilities";
  const normalizedPath = normalizePath(path);
  const url = `${baseUrl.replace(/\/+$/, "")}${normalizedPath}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        (data && typeof data === "object" && typeof (data as { message?: string }).message === "string")
          ? (data as { message: string }).message
          : "Failed to create facility.";
      return NextResponse.json(
        { message, ...(data && typeof data === "object" ? data : {}) },
        { status: response.status }
      );
    }

    return NextResponse.json(parseFacility(data as Record<string, unknown>));
  } catch (err) {
    console.error("POST /api/facilities proxy error:", err);
    return NextResponse.json(
      { message: "Unable to reach the server. Please try again." },
      { status: 502 }
    );
  }
}
