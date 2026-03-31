export interface DepartmentOption {
  id: string;
  name: string;
}

function coerceStr(v: unknown): string {
  if (typeof v === "string" && v.trim()) return v.trim();
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
}

function pickField(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const s = coerceStr(raw[k]);
    if (s) return s;
  }
  return "";
}

export function normalizeDepartmentOption(raw: unknown): DepartmentOption | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = pickField(r, "id", "department_id", "departmentId", "uuid", "_id");
  const name = pickField(r, "name", "department_name", "departmentName", "title");
  if (!id || !name) return null;
  return { id, name };
}
