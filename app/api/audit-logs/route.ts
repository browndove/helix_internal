import { NextRequest, NextResponse } from "next/server";
import { AuditLogEntry } from "@/lib/types";

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

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    return NextResponse.json([]);
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const primaryPath = normalizePath(
    process.env.NEXT_PUBLIC_AUDIT_LOGS_PATH?.trim() || "/internal/audit-logs"
  );
  const fallbackPath = normalizePath(
    process.env.AUDIT_LOGS_FALLBACK_PATH?.trim() || "/api/v1/audit-logs"
  );
  const candidatePaths = Array.from(new Set([primaryPath, fallbackPath]));

  const authorization = request.headers.get("authorization");
  const headers: HeadersInit = authorization ? { Authorization: authorization } : {};

  for (const path of candidatePaths) {
    try {
      const response = await fetch(`${normalizedBaseUrl}${path}`, {
        headers,
        cache: "no-store"
      });

      if (response.status === 404) {
        continue;
      }

      if (response.status === 401 || response.status === 403) {
        return NextResponse.json([]);
      }

      if (!response.ok) {
        return NextResponse.json([]);
      }

      const payload = await response.json().catch(() => null);
      return NextResponse.json(normalizePayload(payload));
    } catch {
      continue;
    }
  }

  return NextResponse.json([]);
}
