/** Row shape for facility Users / active directory table. */
export interface StaffDirectoryRow {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  patientAccess: boolean;
  status: "ACTIVE" | "INACTIVE";
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
    const name = o.name ?? o.title;
    if (typeof name === "string") return name;
  }
  return str(raw, "department_name", "departmentName");
}

function pickPatientAccess(raw: Record<string, unknown>): boolean {
  if (raw.patient_access === true || raw.can_access_patients === true || raw.patientAccess === true) {
    return true;
  }
  if (raw.patient_access === false || raw.can_access_patients === false || raw.patientAccess === false) {
    return false;
  }
  return false;
}

function pickStatus(raw: Record<string, unknown>): "ACTIVE" | "INACTIVE" {
  const s = str(raw, "status").toUpperCase();
  if (
    s === "INACTIVE" ||
    s === "DISABLED" ||
    s === "SUSPENDED" ||
    s === "ARCHIVED"
  ) {
    return "INACTIVE";
  }
  return "ACTIVE";
}

/**
 * Map a v1 staff API object (snake_case or camelCase) to directory table fields.
 */
export function normalizeStaffDirectoryRow(raw: unknown): StaffDirectoryRow | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const id = str(r, "id");
  if (!id) return null;

  const employeeId =
    str(r, "employee_id", "employeeId", "staff_number", "staffNumber") || id.slice(0, 12);
  const firstName = str(r, "first_name", "firstName") || "—";
  const lastName = str(r, "last_name", "lastName") || "—";
  const email = str(r, "email") || "—";
  const jobTitle = str(r, "job_title", "jobTitle", "title") || "—";
  const department = pickDepartment(r) || "—";

  return {
    id,
    employeeId,
    firstName,
    lastName,
    email,
    jobTitle,
    department,
    patientAccess: pickPatientAccess(r),
    status: pickStatus(r),
  };
}
