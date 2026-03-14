import { NextRequest, NextResponse } from "next/server";
import { AuditLogEntry } from "@/lib/types";
import { DEFAULT_API_BASE_URL, DEFAULT_AUDIT_LOGS_PATH } from "@/lib/constants";

function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
}

function normalizePayload(data: unknown): AuditLogEntry[] {
  if (Array.isArray(data)) {
    return data as AuditLogEntry[];
  }

  if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) {
    return (data as { data: AuditLogEntry[] }).data;
  }

  return [];
}

/**
 * GET /api/audit-logs
 * Proxies to backend GET /internal/audit-logs (internal dashboard only).
 */
export async function GET(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const path = normalizePath(
    process.env.NEXT_PUBLIC_AUDIT_LOGS_PATH?.trim() || DEFAULT_AUDIT_LOGS_PATH
  );
  const url = `${normalizedBaseUrl}${path}`;

  const authorization = request.headers.get("authorization");
  const headers: HeadersInit = authorization ? { Authorization: authorization } : {};

  try {
    const response = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (response.status === 401 || response.status === 403) {
      return NextResponse.json([]);
    }

    if (!response.ok) {
      return NextResponse.json([]);
    }

    const payload = await response.json().catch(() => null);
    return NextResponse.json(normalizePayload(payload));
  } catch {
    return NextResponse.json([]);
  }
}
