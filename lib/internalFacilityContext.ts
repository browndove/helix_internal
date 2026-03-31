/**
 * Internal admin facility context for routes that use RequireAppUserOrInternalAdminWithFacility.
 * Prefer sending X-Facility-Id on same-origin calls to Next.js API routes; the proxy forwards it upstream.
 */
export const X_FACILITY_ID_HEADER = "X-Facility-Id";

export function internalAdminFetchHeaders(options: {
  token?: string;
  /** Backend UUID for the tenant facility being acted on */
  facilityId?: string | null;
  /**
   * undefined → application/json
   * null → omit Content-Type (e.g. FormData multipart)
   * string → set explicitly (e.g. multipart with boundary from File)
   */
  contentType?: string | null;
}): HeadersInit {
  const headers: Record<string, string> = {};
  if (options.token) {
    const t = options.token.trim();
    headers.Authorization = t.startsWith("Bearer ") ? t : `Bearer ${t}`;
  }
  const fid = options.facilityId?.trim();
  if (fid) {
    headers[X_FACILITY_ID_HEADER] = fid;
  }
  if (options.contentType === undefined) {
    headers["Content-Type"] = "application/json";
  } else if (options.contentType !== null) {
    headers["Content-Type"] = options.contentType;
  }
  return headers;
}

export function internalAdminJsonHeaders(options: {
  token?: string;
  facilityId?: string | null;
}): HeadersInit {
  return internalAdminFetchHeaders({ ...options, contentType: undefined });
}
