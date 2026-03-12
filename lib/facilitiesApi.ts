import { Facility, FacilityInput } from "@/lib/types";

function authHeaders(token?: string): HeadersInit {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export interface CreateFacilityResult {
  success: true;
  facility: Facility;
}

export interface CreateFacilityError {
  success: false;
  message: string;
}

export type CreateFacilityResponse = CreateFacilityResult | CreateFacilityError;

/**
 * List all facilities via GET /api/facilities.
 * No authentication required.
 */
export async function fetchFacilities(): Promise<Facility[]> {
  try {
    const response = await fetch("/api/facilities", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      return [];
    }

    if (Array.isArray(data)) {
      return data as Facility[];
    }
    if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) {
      return (data as { data: Facility[] }).data;
    }
    return [];
  } catch (err) {
    console.error("fetchFacilities error:", err);
    return [];
  }
}

/**
 * Creates a new facility via POST /api/facilities.
 * Requires admin role (token is sent as Bearer).
 */
export async function createFacility(
  token: string | undefined,
  input: FacilityInput
): Promise<CreateFacilityResponse> {
  if (!token) {
    return { success: false, message: "You must be logged in to create a facility." };
  }

  try {
    const response = await fetch("/api/facilities", {
      method: "POST",
      headers: authHeaders(token),
      body: JSON.stringify(input),
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const message =
        data && typeof data === "object" && typeof (data as { message?: string }).message === "string"
          ? (data as { message: string }).message
          : "Failed to create facility.";
      return { success: false, message };
    }

    if (data && typeof data === "object" && typeof (data as Facility).id === "string") {
      return { success: true, facility: data as Facility };
    }

    return { success: false, message: "Invalid response from server." };
  } catch (err) {
    console.error("createFacility error:", err);
    return {
      success: false,
      message: err instanceof Error ? err.message : "Unable to create facility. Please try again.",
    };
  }
}
