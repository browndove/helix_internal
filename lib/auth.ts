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

function normalizePath(path: string): string {
  if (!path.startsWith("/")) {
    return `/${path}`;
  }
  return path;
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

export async function loginAdmin(email: string, password: string): Promise<AuthLoginResult> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("API URL is not configured.");
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const configuredPath = process.env.NEXT_PUBLIC_AUTH_LOGIN_PATH?.trim();
  const defaultCandidatePaths = [
    "/api/v1/auth/internal/login",
    "/auth/internal/login",
    "/auth/admin/login",
    "/admin/login",
    "/auth/login",
    "/api/auth/login",
    "/login"
  ];
  const candidatePaths = configuredPath
    ? [normalizePath(configuredPath), ...defaultCandidatePaths]
    : defaultCandidatePaths;
  const uniquePaths = Array.from(new Set(candidatePaths));

  let notFoundCount = 0;

  for (const loginPath of uniquePaths) {
    let response: Response;
    try {
      response = await fetch(`${normalizedBaseUrl}${loginPath}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password
        })
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

    if (response.status === 404) {
      notFoundCount += 1;
      continue;
    }

    if (!response.ok) {
      const backendMessage = getErrorMessage(payload);
      if (backendMessage) {
        throw new Error(backendMessage);
      }
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
        payload?.jwt
    };
  }

  if (notFoundCount === uniquePaths.length) {
    throw new Error("Login endpoint not found on API host. Check NEXT_PUBLIC_AUTH_LOGIN_PATH.");
  }

  throw new Error("Login failed. Please try again.");
}
