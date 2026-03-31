/** Duty role row for Roles panel (from v1 /roles list). */
export interface RoleTableRow {
  id: string;
  name: string;
  department: string;
  priority: "CRITICAL" | "STANDARD";
  mandatory: boolean;
  escalation: string;
}

function str(raw: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = raw[k];
    if (typeof v === "string") return v;
  }
  return "";
}

function pickDepartment(raw: Record<string, unknown>): string {
  const d = raw.department;
  if (typeof d === "string") return d;
  if (d && typeof d === "object") {
    const o = d as Record<string, unknown>;
    const n = o.name ?? o.title;
    if (typeof n === "string") return n;
  }
  return str(raw, "department_name", "departmentName") || "Unassigned";
}

export function normalizeRoleTableRow(raw: unknown): RoleTableRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = str(r, "id");
  const name = str(r, "name");
  if (!id || !name) return null;

  const priorityRaw = str(r, "priority").toLowerCase();
  const mandatory =
    r.mandatory === true ||
    priorityRaw === "critical" ||
    r.is_mandatory === true ||
    r.isMandatory === true;

  const priority: "CRITICAL" | "STANDARD" =
    mandatory || priorityRaw === "critical" ? "CRITICAL" : "STANDARD";

  return {
    id,
    name,
    department: pickDepartment(r),
    priority,
    mandatory,
    escalation: "No policy",
  };
}
