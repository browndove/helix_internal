import { DEFAULT_API_BASE_URL, DEFAULT_AUTH_LOGIN_PATH } from "@/lib/constants";

interface LoginApiResponse {
  username?: string;
  email?: string;
  name?: string;
  fullName?: string;
  token?: string;
  accessToken?: string;
  access_token?: string;
  jwt?: string;
  user?: {
    username?: string;
    email?: string;
    name?: string;
    fullName?: string;
  };
  message?: string;
  error?: string;
}

export interface AuthLoginResult {
  username: string;
  token?: string;
}

function getErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }
  const o = payload as Record<string, unknown>;
  const candidates = [
    o.message,
    o.error,
    o.detail,
    Array.isArray(o.errors) && o.errors[0] && typeof (o.errors[0] as { message?: string }).message === "string"
      ? (o.errors[0] as { message: string }).message
      : null,
  ];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) return c.trim();
  }
  return null;
}

const LOGIN_URL = `${DEFAULT_API_BASE_URL.replace(/\/+$/, "")}${DEFAULT_AUTH_LOGIN_PATH}`;

/**
 * Login by calling backend POST /api/v1/auth/internal/login directly.
 */
export async function loginAdmin(email: string, password: string): Promise<AuthLoginResult> {
  let response: Response;
  try {
    response = await fetch(LOGIN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim(), password }),
    });
  } catch {
    throw new Error("Unable to reach backend. Please check API configuration.");
  }

  let payload: LoginApiResponse | null = null;
  try {
    payload = (await response.json()) as LoginApiResponse;
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const msg = getErrorMessage(payload);
    if (msg) throw new Error(msg);
    if (response.status === 401 || response.status === 403) {
      throw new Error("Invalid credentials.");
    }
    throw new Error(`Login failed (${response.status}). Please try again.`);
  }

  return {
    username:
      payload?.user?.fullName ||
      payload?.user?.name ||
      payload?.user?.username ||
      payload?.user?.email ||
      payload?.fullName ||
      payload?.name ||
      payload?.username ||
      payload?.email ||
      email.trim(),
    token:
      payload?.token ||
      payload?.accessToken ||
      payload?.access_token ||
      payload?.jwt,
  };
}
