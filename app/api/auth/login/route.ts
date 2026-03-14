import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_API_BASE_URL, DEFAULT_AUTH_LOGIN_PATH } from "@/lib/constants";

function normalizePath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

/**
 * POST /api/auth/login
 * Proxies login to the backend so the browser never hits the API directly (avoids CORS in prod).
 */
export async function POST(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const configuredPath = process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH?.trim();
  const candidatePaths = configuredPath
    ? [normalizePath(configuredPath)]
    : [
        DEFAULT_AUTH_LOGIN_PATH,
        "/api/v1/auth/internal/login",
        "/auth/internal/login",
        "/auth/admin/login",
        "/admin/login",
        "/auth/login",
        "/api/auth/login",
        "/login",
      ];
  const uniquePaths = Array.from(new Set(candidatePaths));

  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: "Invalid request body." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ message: "Email and password are required." }, { status: 400 });
  }

  let lastStatus = 0;
  let lastPayload: unknown = null;
  let lastTriedUrl = "";

  for (const loginPath of uniquePaths) {
    const url = `${normalizedBaseUrl}${loginPath}`;
    lastTriedUrl = url;
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });

      lastStatus = response.status;
      lastPayload = await response.json().catch(() => null);

      if (response.status === 404) continue;

      if (!response.ok) {
        const msg =
          lastPayload &&
          typeof lastPayload === "object" &&
          typeof (lastPayload as { message?: string }).message === "string"
            ? (lastPayload as { message: string }).message
            : "Login failed.";
        return NextResponse.json(
          { message: response.status === 401 || response.status === 403 ? "Invalid credentials." : msg },
          { status: response.status === 401 || response.status === 403 ? 401 : 400 }
        );
      }

      const p = lastPayload as Record<string, unknown>;
      const username =
        (p?.user as Record<string, unknown>)?.fullName ??
        (p?.user as Record<string, unknown>)?.name ??
        (p?.user as Record<string, unknown>)?.username ??
        (p?.user as Record<string, unknown>)?.email ??
        p?.fullName ??
        p?.name ??
        p?.username ??
        p?.email ??
        email;
      const token =
        (typeof p?.token === "string" && p.token) ||
        (typeof p?.accessToken === "string" && p.accessToken) ||
        (typeof p?.access_token === "string" && p.access_token) ||
        (typeof p?.jwt === "string" && p.jwt);

      return NextResponse.json({
        username: String(username),
        ...(token ? { token } : {}),
      });
    } catch {
      continue;
    }
  }

  const isDev = process.env.NODE_ENV === "development";
  const allowDevLogin = process.env.ALLOW_DEV_LOGIN === "true" || process.env.ALLOW_DEV_LOGIN === "1";

  if (isDev && allowDevLogin) {
    return NextResponse.json({
      username: email.split("@")[0] || "dev",
      token: "dev-token",
    });
  }

  if (lastStatus === 404) {
    return NextResponse.json(
      {
        message: "Login endpoint not found. Check API configuration.",
        tried: lastTriedUrl || undefined,
      },
      { status: 502 }
    );
  }

  return NextResponse.json(
    {
      message: "Unable to reach backend. Please try again.",
      tried: lastTriedUrl || undefined,
    },
    { status: 502 }
  );
}
