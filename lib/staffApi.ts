import { internalAdminFetchHeaders, internalAdminJsonHeaders } from "@/lib/internalFacilityContext";
import { buildQuery, getErrorMessage, unwrapV1List } from "@/lib/v1ClientHelpers";

export type StaffListResult =
  | { ok: true; items: unknown[] }
  | { ok: false; status: number; message: string };

/**
 * GET /api/staff for a facility. Internal admin: pass facilityId (X-Facility-Id); token optional if backend allows.
 */
export async function fetchStaffList(
  token: string | undefined,
  facilityId: string | null | undefined,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<StaffListResult> {
  if (!facilityId?.trim()) {
    return { ok: false, status: 400, message: "Facility ID is required to load staff." };
  }

  const response = await fetch(`/api/staff${buildQuery(params)}`, {
    method: "GET",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      message: getErrorMessage(data, `Failed to load staff (${response.status}).`),
    };
  }
  return { ok: true, items: unwrapV1List(data) };
}

export async function listStaff(
  token: string | undefined,
  facilityId: string | null | undefined,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<unknown[]> {
  const result = await fetchStaffList(token, facilityId, params);
  return result.ok ? result.items : [];
}

export async function getStaffMember(
  token: string | undefined,
  facilityId: string | null | undefined,
  staffId: string
): Promise<unknown | null> {
  if (!token?.trim() || !facilityId?.trim() || !staffId) return null;

  const response = await fetch(`/api/staff/${encodeURIComponent(staffId)}`, {
    method: "GET",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) return null;
  return data;
}

export async function createStaff(
  token: string | undefined,
  facilityId: string | null | undefined,
  body: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!facilityId?.trim()) {
    return { ok: false, message: "Facility context is required." };
  }

  const payload = { ...body, facility_id: body.facility_id ?? facilityId };
  const response = await fetch("/api/staff", {
    method: "POST",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: getErrorMessage(data, "Failed to create staff.") };
  }
  return { ok: true, data };
}

/**
 * Create staff via POST /api/proxy/staff (same upstream as /api/staff).
 * Sets `role: 'staff'` unless already present in body.
 */
export async function createStaffViaProxy(
  token: string | undefined,
  facilityId: string | null | undefined,
  body: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!facilityId?.trim()) {
    return { ok: false, message: "Facility context is required." };
  }

  const payload = {
    ...body,
    facility_id: body.facility_id ?? facilityId,
    role: body.role ?? "staff",
  };
  const response = await fetch("/api/proxy/staff", {
    method: "POST",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: getErrorMessage(data, "Failed to create staff.") };
  }
  return { ok: true, data };
}

export async function updateStaffMember(
  token: string | undefined,
  facilityId: string | null | undefined,
  staffId: string,
  body: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!facilityId?.trim() || !staffId) {
    return { ok: false, message: "Missing facility context or staff id." };
  }

  const response = await fetch(`/api/staff/${encodeURIComponent(staffId)}`, {
    method: "PUT",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: getErrorMessage(data, "Failed to update staff.") };
  }
  return { ok: true, data };
}

export async function deleteStaffMember(
  token: string | undefined,
  facilityId: string | null | undefined,
  staffId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!facilityId?.trim() || !staffId) {
    return { ok: false, message: "Missing facility context or staff id." };
  }

  const response = await fetch(`/api/staff/${encodeURIComponent(staffId)}`, {
    method: "DELETE",
    headers: internalAdminJsonHeaders({ token, facilityId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    return { ok: false, message: getErrorMessage(data, "Failed to delete staff.") };
  }
  return { ok: true };
}

export async function assignStaffRole(
  token: string | undefined,
  facilityId: string | null | undefined,
  staffId: string,
  body: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!facilityId?.trim() || !staffId) {
    return { ok: false, message: "Missing facility context or staff id." };
  }

  const response = await fetch(`/api/staff/${encodeURIComponent(staffId)}/assign-role`, {
    method: "POST",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: getErrorMessage(data, "Failed to assign role.") };
  }
  return { ok: true, data };
}

export async function bulkStaff(
  token: string | undefined,
  facilityId: string | null | undefined,
  body: BodyInit,
  contentType?: string | null
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!facilityId?.trim()) {
    return { ok: false, message: "Missing facility context." };
  }

  const response = await fetch("/api/staff/bulk", {
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
    return { ok: false, message: getErrorMessage(data, "Bulk staff request failed.") };
  }
  return { ok: true, data };
}
