import { internalAdminFetchHeaders, internalAdminJsonHeaders } from "@/lib/internalFacilityContext";
import { buildQuery, getErrorMessage, unwrapV1List } from "@/lib/v1ClientHelpers";

export type RolesListResult =
  | { ok: true; items: unknown[] }
  | { ok: false; status: number; message: string };

export async function fetchRolesList(
  token: string | undefined,
  facilityId: string | null | undefined,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<RolesListResult> {
  if (!facilityId?.trim()) {
    return { ok: false, status: 400, message: "Facility ID is required to load roles." };
  }

  const response = await fetch(`/api/roles${buildQuery(params)}`, {
    method: "GET",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: getErrorMessage(data, `Failed to load roles (${response.status}).`),
    };
  }
  return { ok: true, items: unwrapV1List(data) };
}

export async function listRoles(
  token: string | undefined,
  facilityId: string | null | undefined,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<unknown[]> {
  const result = await fetchRolesList(token, facilityId, params);
  return result.ok ? result.items : [];
}

export async function getRole(
  token: string | undefined,
  facilityId: string | null | undefined,
  roleId: string
): Promise<unknown | null> {
  if (!token?.trim() || !facilityId?.trim() || !roleId) return null;

  const response = await fetch(`/api/roles/${encodeURIComponent(roleId)}`, {
    method: "GET",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) return null;
  return data;
}

export async function createRole(
  token: string | undefined,
  facilityId: string | null | undefined,
  body: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!facilityId?.trim()) {
    return { ok: false, message: "Facility context is required." };
  }

  const payload = { ...body, facility_id: body.facility_id ?? facilityId };
  const response = await fetch("/api/roles", {
    method: "POST",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: getErrorMessage(data, "Failed to create role.") };
  }
  return { ok: true, data };
}

export async function updateRole(
  token: string | undefined,
  facilityId: string | null | undefined,
  roleId: string,
  body: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!facilityId?.trim() || !roleId) {
    return { ok: false, message: "Missing facility context or role id." };
  }

  const response = await fetch(`/api/roles/${encodeURIComponent(roleId)}`, {
    method: "PUT",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: getErrorMessage(data, "Failed to update role.") };
  }
  return { ok: true, data };
}

export async function deleteRole(
  token: string | undefined,
  facilityId: string | null | undefined,
  roleId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!facilityId?.trim() || !roleId) {
    return { ok: false, message: "Missing facility context or role id." };
  }

  const response = await fetch(`/api/roles/${encodeURIComponent(roleId)}`, {
    method: "DELETE",
    headers: internalAdminJsonHeaders({ token, facilityId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    return { ok: false, message: getErrorMessage(data, "Failed to delete role.") };
  }
  return { ok: true };
}

/**
 * POST /api/roles/bulk with JSON or multipart body.
 * For FormData, pass contentType: null so fetch sets multipart boundary.
 */
export async function bulkRoles(
  token: string | undefined,
  facilityId: string | null | undefined,
  body: BodyInit,
  contentType?: string | null
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!facilityId?.trim()) {
    return { ok: false, message: "Missing facility context." };
  }

  const response = await fetch("/api/roles/bulk", {
    method: "POST",
    headers: internalAdminFetchHeaders({
      token,
      facilityId,
      contentType: contentType === undefined ? "application/json" : contentType,
    }),
    body,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: getErrorMessage(data, "Bulk roles request failed.") };
  }
  return { ok: true, data };
}
