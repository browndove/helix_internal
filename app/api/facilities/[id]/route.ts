import { NextRequest, NextResponse } from "next/server";
import { DEFAULT_API_BASE_URL, DEFAULT_FACILITIES_PATH } from "@/lib/constants";

function normalizePath(path: string): string {
  if (!path.startsWith("/")) return `/${path}`;
  return path;
}

/**
 * DELETE /api/facilities/[id]
 * Permanently deletes a facility. Proxies to backend DELETE /facilities/{id}.
 * Requires admin role (Authorization header).
 */
export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ message: "Facility ID is required." }, { status: 400 });
  }

  const authorization = _request.headers.get("authorization");
  if (!authorization) {
    return NextResponse.json(
      { message: "Authorization required." },
      { status: 401 }
    );
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    DEFAULT_API_BASE_URL;
  const path =
    process.env.NEXT_PUBLIC_FACILITIES_PATH?.trim() ||
    process.env.FACILITIES_PATH?.trim() ||
    DEFAULT_FACILITIES_PATH;
  const normalizedPath = normalizePath(path);
  const url = `${baseUrl.replace(/\/+$/, "")}${normalizedPath}/${encodeURIComponent(id)}`;

  try {
    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
      },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data && typeof data === "object" && typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : "Failed to delete facility.";
      return NextResponse.json(
        { message, ...(data && typeof data === "object" ? data : {}) },
        { status: response.status }
      );
    }

    return NextResponse.json(data ?? { ok: true });
  } catch (err) {
    console.error("DELETE /api/facilities/[id] proxy error:", err);
    return NextResponse.json(
      { message: "Unable to reach the server. Please try again." },
      { status: 502 }
    );
  }
}
