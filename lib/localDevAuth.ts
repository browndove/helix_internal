import type { UserSession } from "@/lib/types";

/** Hostnames where the UI may skip the login gate (development only). */
export function isLocalDevHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]" ||
    hostname === "::1"
  );
}

/**
 * Ephemeral session for local UI-only use. Optional `NEXT_PUBLIC_DEV_BEARER_TOKEN` is sent to API proxies.
 */
export function createLocalSyntheticSession(): UserSession {
  const token = process.env.NEXT_PUBLIC_DEV_BEARER_TOKEN?.trim();
  return {
    username: "Local dev",
    loggedInAt: new Date().toISOString(),
    ...(token ? { token } : {}),
  };
}
