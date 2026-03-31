import { internalAdminJsonHeaders } from "@/lib/internalFacilityContext";
import { buildQuery, getErrorMessage, unwrapV1List } from "@/lib/v1ClientHelpers";

export type DepartmentsListResult =
  | { ok: true; items: unknown[] }
  | { ok: false; status: number; message: string };

/**
 * List departments for a facility (X-Facility-Id). Token optional if backend allows.
 */
export async function fetchDepartmentsList(
  token: string | undefined,
  facilityId: string | null | undefined,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<DepartmentsListResult> {
  if (!facilityId?.trim()) {
    return { ok: false, status: 400, message: "Facility ID is required to load departments." };
  }

  const response = await fetch(`/api/departments${buildQuery(params)}`, {
    method: "GET",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: getErrorMessage(data, `Failed to load departments (${response.status}).`),
    };
  }
  return { ok: true, items: unwrapV1List(data) };
}

/**
 * List departments for the facility. Returns [] on error (legacy helper).
 */
export async function fetchDepartments(
  token: string | undefined,
  facilityId: string | null | undefined,
  query?: Record<string, string | number | boolean | undefined | null>
): Promise<unknown[]> {
  const result = await fetchDepartmentsList(token, facilityId, query);
  return result.ok ? result.items : [];
}
