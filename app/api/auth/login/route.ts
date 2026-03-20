import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_API_BASE_URL, DEFAULT_AUTH_LOGIN_PATH } from "@/lib/constants";

/**
 * POST /api/auth/login
 * Server-side proxy that forwards login credentials to the backend.
 * This avoids CORS issues since the browser only talks to the same origin.
 */

export function GET() {
  return NextResponse.json(
    { message: "Use POST with JSON body { email, password }." },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;

  const loginPath =
    process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH?.trim() || DEFAULT_AUTH_LOGIN_PATH;

  const normalizedPath = loginPath.startsWith("/") ? loginPath : `/${loginPath}`;
  const url = `${baseUrl.replace(/\/+$/, "")}${normalizedPath}`;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    return NextResponse.json(data ?? {}, { status: response.status });
  } catch (err) {
    console.error("POST /api/auth/login proxy error:", err);
    return NextResponse.json(
      { message: "Unable to reach backend. Please check API configuration." },
      { status: 502 }
    );
  }
}
