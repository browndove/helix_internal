import { NextRequest, NextResponse } from "next/server";
import { Facility } from "@/lib/types";
import { DEFAULT_API_BASE_URL, DEFAULT_FACILITIES_PATH } from "@/lib/constants";

function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

function str(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === "string") return v;
  }
  return "";
}

function num(raw: Record<string, unknown>, ...keys: string[]): number {
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === "number") return v;
  }
  return 0;
}

/** Map backend snake_case response to Facility (camelCase). */
function parseFacility(raw: Record<string, unknown>): Facility {
  const createdAt = str(raw, "createdAt", "created_at") || new Date().toISOString();
  const primaryContactEmail = str(raw, "primaryContactEmail", "primary_contact_email");
  const adminEmail = str(raw, "adminEmail", "admin_email") || primaryContactEmail;

  const facility: Facility = {
    id: str(raw, "id"),
    name: str(raw, "name"),
    adminEmail,
    city: str(raw, "city"),
    region: str(raw, "region"),
    address: str(raw, "address"),
    userCount: num(raw, "userCount", "user_count"),
    createdAt,
  };

  if (str(raw, "code")) facility.code = str(raw, "code");
  if (primaryContactEmail) facility.primaryContactEmail = primaryContactEmail;
  if (str(raw, "primary_contact_first_name")) facility.primaryContactFirstName = str(raw, "primaryContactFirstName", "primary_contact_first_name");
  if (str(raw, "primary_contact_last_name")) facility.primaryContactLastName = str(raw, "primaryContactLastName", "primary_contact_last_name");
  if (str(raw, "primary_contact_phone")) facility.primaryContactPhone = str(raw, "primaryContactPhone", "primary_contact_phone");
  if (str(raw, "subscription_type")) facility.subscriptionType = str(raw, "subscriptionType", "subscription_type");

  return facility;
}

/**
 * GET /api/facilities
 * List all facilities. No authentication required.
 * Proxies to backend GET /facilities.
 */
export async function GET() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;

  const path =
    process.env.NEXT_PUBLIC_FACILITIES_PATH?.trim() ||
    process.env.FACILITIES_PATH?.trim() ||
    DEFAULT_FACILITIES_PATH;
  const normalizedPath = normalizePath(path);
  const url = `${baseUrl.replace(/\/+$/, "")}${normalizedPath}`;

  const timeoutMs = 8_000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

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

    const obj = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
    const list: unknown[] = Array.isArray(data)
      ? data
      : obj && Array.isArray(obj.data)
        ? (obj.data as unknown[])
        : obj && Array.isArray(obj.facilities)
          ? (obj.facilities as unknown[])
          : obj && Array.isArray(obj.results)
            ? (obj.results as unknown[])
            : obj && Array.isArray(obj.items)
              ? (obj.items as unknown[])
              : [];
    const facilities: Facility[] = list
      .filter((item): item is Record<string, unknown> => item != null && typeof item === "object")
      .map(parseFacility)
      .filter((f) => f.id && f.name);

    return NextResponse.json(facilities);
  } catch (err) {
    clearTimeout(timeoutId);
    console.error("GET /api/facilities proxy error:", err);
    // Return empty array so the app still loads when backend is unreachable (timeout, DNS, etc.)
    return NextResponse.json([]);
  }
}

/**
 * POST /api/facilities
 * Creates a new facility. Proxies to backend POST /facilities.
 * Requires admin role (enforced by backend via Authorization header).
 */
export async function POST(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;

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
    DEFAULT_FACILITIES_PATH;
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

    const raw = data as Record<string, unknown>;
    const bodyObj = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    const facility = parseFacility(raw);
    if (!facility.adminEmail && typeof bodyObj.adminEmail === "string") {
      facility.adminEmail = bodyObj.adminEmail;
    }
    return NextResponse.json(facility);
  } catch (err) {
    console.error("POST /api/facilities proxy error:", err);
    return NextResponse.json(
      { message: "Unable to reach the server. Please try again." },
      { status: 502 }
    );
  }
}
