import { internalAdminJsonHeaders } from "@/lib/internalFacilityContext";
import { buildQuery, getErrorMessage, unwrapV1List } from "@/lib/v1ClientHelpers";

export async function listEscalationPolicies(
  token: string | undefined,
  facilityId: string | null | undefined,
  params?: Record<string, string | number | boolean | undefined | null>
): Promise<unknown[]> {
  if (!token?.trim() || !facilityId?.trim()) return [];

  const response = await fetch(`/api/escalation-policies${buildQuery(params)}`, {
    method: "GET",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) return [];
  return unwrapV1List(data);
}

export async function getEscalationPolicy(
  token: string | undefined,
  facilityId: string | null | undefined,
  policyId: string
): Promise<unknown | null> {
  if (!token?.trim() || !facilityId?.trim() || !policyId) return null;

  const response = await fetch(`/api/escalation-policies/${encodeURIComponent(policyId)}`, {
    method: "GET",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    cache: "no-store",
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) return null;
  return data;
}

export async function getEscalationPolicyByRole(
  token: string | undefined,
  facilityId: string | null | undefined,
  roleId: string
): Promise<unknown | null> {
  if (!token?.trim() || !facilityId?.trim() || !roleId) return null;

  const response = await fetch(
    `/api/escalation-policies/by-role/${encodeURIComponent(roleId)}`,
    {
      method: "GET",
      headers: internalAdminJsonHeaders({ token, facilityId }),
      cache: "no-store",
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) return null;
  return data;
}

export async function createEscalationPolicy(
  token: string | undefined,
  facilityId: string | null | undefined,
  body: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!token?.trim() || !facilityId?.trim()) {
    return { ok: false, message: "Missing token or facility context." };
  }

  const response = await fetch("/api/escalation-policies", {
    method: "POST",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: getErrorMessage(data, "Failed to create escalation policy.") };
  }
  return { ok: true, data };
}

export async function updateEscalationPolicy(
  token: string | undefined,
  facilityId: string | null | undefined,
  policyId: string,
  body: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!token?.trim() || !facilityId?.trim() || !policyId) {
    return { ok: false, message: "Missing token, facility context, or policy id." };
  }

  const response = await fetch(`/api/escalation-policies/${encodeURIComponent(policyId)}`, {
    method: "PUT",
    headers: internalAdminJsonHeaders({ token, facilityId }),
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: getErrorMessage(data, "Failed to update escalation policy.") };
  }
  return { ok: true, data };
}

export async function deleteEscalationPolicy(
  token: string | undefined,
  facilityId: string | null | undefined,
  policyId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!token?.trim() || !facilityId?.trim() || !policyId) {
    return { ok: false, message: "Missing token, facility context, or policy id." };
  }

  const response = await fetch(`/api/escalation-policies/${encodeURIComponent(policyId)}`, {
    method: "DELETE",
    headers: internalAdminJsonHeaders({ token, facilityId }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    return { ok: false, message: getErrorMessage(data, "Failed to delete escalation policy.") };
  }
  return { ok: true };
}

export async function addEscalationStep(
  token: string | undefined,
  facilityId: string | null | undefined,
  policyId: string,
  body: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!token?.trim() || !facilityId?.trim() || !policyId) {
    return { ok: false, message: "Missing token, facility context, or policy id." };
  }

  const response = await fetch(
    `/api/escalation-policies/${encodeURIComponent(policyId)}/steps`,
    {
      method: "POST",
      headers: internalAdminJsonHeaders({ token, facilityId }),
      body: JSON.stringify(body),
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: getErrorMessage(data, "Failed to add escalation step.") };
  }
  return { ok: true, data };
}

export async function bulkEscalationSteps(
  token: string | undefined,
  facilityId: string | null | undefined,
  policyId: string,
  body: Record<string, unknown>
): Promise<{ ok: true; data: unknown } | { ok: false; message: string }> {
  if (!token?.trim() || !facilityId?.trim() || !policyId) {
    return { ok: false, message: "Missing token, facility context, or policy id." };
  }

  const response = await fetch(
    `/api/escalation-policies/${encodeURIComponent(policyId)}/steps/bulk`,
    {
      method: "POST",
      headers: internalAdminJsonHeaders({ token, facilityId }),
      body: JSON.stringify(body),
    }
  );

  const data = await response.json().catch(() => null);
  if (!response.ok) {
    return { ok: false, message: getErrorMessage(data, "Failed to bulk-create escalation steps.") };
  }
  return { ok: true, data };
}

export async function deleteEscalationStep(
  token: string | undefined,
  facilityId: string | null | undefined,
  policyId: string,
  stepId: string
): Promise<{ ok: true } | { ok: false; message: string }> {
  if (!token?.trim() || !facilityId?.trim() || !policyId || !stepId) {
    return { ok: false, message: "Missing token, facility context, policy id, or step id." };
  }

  const response = await fetch(
    `/api/escalation-policies/${encodeURIComponent(policyId)}/steps/${encodeURIComponent(stepId)}`,
    {
      method: "DELETE",
      headers: internalAdminJsonHeaders({ token, facilityId }),
    }
  );

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    return { ok: false, message: getErrorMessage(data, "Failed to delete escalation step.") };
  }
  return { ok: true };
}
