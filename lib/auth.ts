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

  const maybeMessage = (payload as { message?: unknown; error?: unknown }).message;
  if (typeof maybeMessage === "string" && maybeMessage.trim().length > 0) {
    return maybeMessage;
  }

  const maybeError = (payload as { message?: unknown; error?: unknown }).error;
  if (typeof maybeError === "string" && maybeError.trim().length > 0) {
    return maybeError;
  }

  return null;
}

function getAuthLoginUrl(): string {
  const base = typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL?.trim();
  const origin = base ? base.replace(/\/$/, "") : DEFAULT_API_BASE_URL;
  return `${origin}${DEFAULT_AUTH_LOGIN_PATH}`;
}

/**
 * Login via backend auth endpoint: /auth/internal/login.
 */
export async function loginAdmin(email: string, password: string): Promise<AuthLoginResult> {
  let response: Response;
  try {
    response = await fetch(getAuthLoginUrl(), {
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
    throw new Error("Login failed. Please try again.");
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
