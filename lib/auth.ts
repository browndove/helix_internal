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

/**
 * Login via same-origin proxy /api/auth/login (forwards to backend /auth/internal/login).
 * Avoids CORS: browser only talks to internal.helixhealth.app; server calls api.helixhealth.app.
 */
export async function loginAdmin(email: string, password: string): Promise<AuthLoginResult> {
  let response: Response;
  try {
    response = await fetch("/api/auth/login", {
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
