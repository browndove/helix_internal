/** Backend list endpoints cap page size (e.g. PageSize ≤ 100). */
export const V1_LIST_MAX_PAGE_SIZE = 100;

type V1ListPageResult =
  | { ok: true; items: unknown[] }
  | { ok: false; status: number; message: string };

/**
 * Fetch all pages for a facility-scoped list API that supports `page` + `page_size`.
 * Stops when a page returns fewer than `page_size` items or after `maxPages` (safety).
 */
export async function gatherPagedList(
  fetchPage: (args: { page: number; page_size: number }) => Promise<V1ListPageResult>,
  options?: { maxPages?: number; pageSize?: number }
): Promise<V1ListPageResult> {
  const page_size = options?.pageSize ?? V1_LIST_MAX_PAGE_SIZE;
  const maxPages = options?.maxPages ?? 500;
  const items: unknown[] = [];
  let prevPageFingerprint: string | null = null;
  for (let page = 1; page <= maxPages; page += 1) {
    const result = await fetchPage({ page, page_size });
    if (!result.ok) return result;
    const fingerprint = JSON.stringify(result.items);
    if (page > 1 && fingerprint === prevPageFingerprint) {
      break;
    }
    prevPageFingerprint = fingerprint;
    items.push(...result.items);
    if (result.items.length < page_size) break;
  }
  return { ok: true, items };
}

/** Query string for same-origin /api/... calls. */
export function buildQuery(
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  const u = new URLSearchParams();
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      if (v === undefined || v === null || v === "") continue;
      u.set(k, String(v));
    }
  }
  const s = u.toString();
  return s ? `?${s}` : "";
}

/** Unwrap typical v1 list envelopes: items, data, roles, staff, policies, steps, results. */
export function unwrapV1List(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    const list =
      o.items ??
      o.data ??
      o.roles ??
      o.staff ??
      o.users ??
      o.departments ??
      o.policies ??
      o.results ??
      o.steps;
    if (Array.isArray(list)) return list;
  }
  return [];
}

export function getErrorMessage(data: unknown, fallback: string): string {
  if (data && typeof data === "object" && typeof (data as { message?: string }).message === "string") {
    return (data as { message: string }).message;
  }
  return fallback;
}
