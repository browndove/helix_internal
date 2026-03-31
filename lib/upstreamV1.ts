import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_API_BASE_URL,
  DEFAULT_ESCALATION_POLICIES_PATH,
  DEFAULT_ROLES_PATH,
  DEFAULT_STAFF_PATH,
} from "@/lib/constants";
import {
  upstreamAuthFacilityHeaders,
  upstreamHeadersFromRequest,
} from "@/lib/proxyUpstreamHeaders";

export function v1BaseUrl(): string {
  const base =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  return base.replace(/\/+$/, "");
}

export function normalizeApiPath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export function resolveRolesPath(): string {
  return normalizeApiPath(
    process.env.NEXT_PUBLIC_ROLES_PATH?.trim() ||
      process.env.ROLES_PATH?.trim() ||
      DEFAULT_ROLES_PATH
  );
}

export function resolveStaffPath(): string {
  return normalizeApiPath(
    process.env.NEXT_PUBLIC_STAFF_PATH?.trim() ||
      process.env.STAFF_PATH?.trim() ||
      DEFAULT_STAFF_PATH
  );
}

export function resolveEscalationPoliciesPath(): string {
  return normalizeApiPath(
    process.env.NEXT_PUBLIC_ESCALATION_POLICIES_PATH?.trim() ||
      process.env.ESCALATION_POLICIES_PATH?.trim() ||
      DEFAULT_ESCALATION_POLICIES_PATH
  );
}

/**
 * Upstream URL: copy query from the incoming Next request; optionally set facility_id from X-Facility-Id.
 */
export function buildV1Url(
  request: NextRequest,
  upstreamPath: string,
  injectFacilityId = true
): URL {
  const url = new URL(`${v1BaseUrl()}${normalizeApiPath(upstreamPath)}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  if (injectFacilityId) {
    const fid = request.headers.get("x-facility-id")?.trim();
    if (fid && !url.searchParams.get("facility_id")) {
      url.searchParams.set("facility_id", fid);
    }
  }
  return url;
}

export async function proxyUpstreamJson(
  request: NextRequest,
  method: string,
  upstreamPath: string,
  options?: {
    injectFacilityId?: boolean;
    defaultErrorMessage?: string;
  }
): Promise<NextResponse> {
  const url = buildV1Url(request, upstreamPath, options?.injectFacilityId !== false);
  const headers = upstreamHeadersFromRequest(request);
  const init: RequestInit = { method, headers, cache: "no-store" };

  const writeBody = ["POST", "PUT", "PATCH"].includes(method);
  if (writeBody) {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      body = {};
    }
    init.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(url.toString(), init);
    const text = await res.text();

    if (!res.ok) {
      let payload: Record<string, unknown> | null = null;
      if (text) {
        try {
          const parsed = JSON.parse(text) as unknown;
          payload = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : { detail: parsed };
        } catch {
          payload = { message: text };
        }
      }
      const message =
        (payload?.message as string | undefined) ||
        options?.defaultErrorMessage ||
        "Request failed.";
      return NextResponse.json(payload ? { ...payload, message } : { message }, { status: res.status });
    }

    if (!text) {
      return new NextResponse(null, { status: res.status });
    }

    try {
      return NextResponse.json(JSON.parse(text) as unknown, { status: res.status });
    } catch {
      return NextResponse.json({ message: "Upstream returned non-JSON." }, { status: 502 });
    }
  } catch (err) {
    console.error("proxyUpstreamJson:", upstreamPath, err);
    return NextResponse.json(
      { message: "Unable to reach the server. Please try again." },
      { status: 502 }
    );
  }
}

/** POST bulk or multipart: forward body bytes and Content-Type. */
export async function proxyUpstreamBody(
  request: NextRequest,
  method: string,
  upstreamPath: string,
  options?: { injectFacilityId?: boolean; defaultErrorMessage?: string }
): Promise<NextResponse> {
  const url = buildV1Url(request, upstreamPath, options?.injectFacilityId !== false);
  const ct = request.headers.get("content-type");
  const headers: Record<string, string> = {
    ...upstreamAuthFacilityHeaders(request),
  };
  if (ct) {
    headers["Content-Type"] = ct;
  } else {
    headers["Content-Type"] = "application/json";
  }

  const body = await request.arrayBuffer();

  try {
    const res = await fetch(url.toString(), {
      method,
      headers,
      body: body.byteLength ? body : undefined,
      cache: "no-store",
    });
    const text = await res.text();

    if (!res.ok) {
      let payload: Record<string, unknown> | null = null;
      if (text) {
        try {
          const parsed = JSON.parse(text) as unknown;
          payload = parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : { detail: parsed };
        } catch {
          payload = { message: text };
        }
      }
      const message =
        (payload?.message as string | undefined) ||
        options?.defaultErrorMessage ||
        "Request failed.";
      return NextResponse.json(payload ? { ...payload, message } : { message }, { status: res.status });
    }

    if (!text) {
      return new NextResponse(null, { status: res.status });
    }

    try {
      return NextResponse.json(JSON.parse(text) as unknown, { status: res.status });
    } catch {
      return NextResponse.json({ message: text }, { status: res.status });
    }
  } catch (err) {
    console.error("proxyUpstreamBody:", upstreamPath, err);
    return NextResponse.json(
      { message: "Unable to reach the server. Please try again." },
      { status: 502 }
    );
  }
}
