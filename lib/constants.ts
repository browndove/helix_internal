import { Facility, AuditLogEntry } from "@/lib/types";

export const ADMIN_LOGIN_USERNAME = "admin";
export const ADMIN_LOGIN_PASSWORD = "admin123";

export const SEED_FACILITIES: Facility[] = [
  {
    id: "fac-101",
    code: "CCTH",
    name: "Cape Coast Teaching Hospital",
    adminEmail: "admin@hospital.org",
    city: "Cape Coast",
    region: "Central Region",
    address: "University Avenue, Cape Coast",
    userCount: 24,
    createdAt: "2026-01-12T10:30:00.000Z"
  },
  {
    id: "fac-102",
    code: "KTRH",
    name: "Komfo Anokye Regional Hospital",
    adminEmail: "regional.admin@ktrh.org",
    city: "Kumasi",
    region: "Ashanti Region",
    address: "Bantama Road, Kumasi",
    userCount: 18,
    createdAt: "2026-02-02T15:00:00.000Z"
  },
  {
    id: "fac-103",
    code: "TMAH",
    name: "Tamale Municipal Health Center",
    adminEmail: "tamale.ops@health.org",
    city: "Tamale",
    region: "Northern Region",
    address: "Education Ridge, Tamale",
    userCount: 7,
    createdAt: "2026-02-21T08:40:00.000Z"
  },
  {
    id: "fac-104",
    code: "ACMH",
    name: "Accra Central Medical Hub",
    adminEmail: "ops@accrahub.org",
    city: "Accra",
    region: "Greater Accra Region",
    address: "Independence Avenue, Accra",
    userCount: 31,
    createdAt: "2026-02-27T09:20:00.000Z"
  }
];

export const SEED_AUDIT_LOG: AuditLogEntry[] = [
  {
    id: "audit-001",
    timestamp: "2026-01-12T10:30:00.000Z",
    action: "Facility Created",
    actor: "admin",
    target: "Cape Coast Teaching Hospital",
    details: "New facility registered in the Central Region."
  },
  {
    id: "audit-002",
    timestamp: "2026-01-12T11:05:00.000Z",
    action: "Code Generated",
    actor: "admin",
    target: "Cape Coast Teaching Hospital",
    details: "Facility code CCTH assigned."
  },
  {
    id: "audit-003",
    timestamp: "2026-02-02T15:00:00.000Z",
    action: "Facility Created",
    actor: "admin",
    target: "Komfo Anokye Regional Hospital",
    details: "New facility registered in the Ashanti Region."
  },
  {
    id: "audit-004",
    timestamp: "2026-02-02T15:45:00.000Z",
    action: "Code Generated",
    actor: "admin",
    target: "Komfo Anokye Regional Hospital",
    details: "Facility code KTRH assigned."
  },
  {
    id: "audit-005",
    timestamp: "2026-02-21T08:40:00.000Z",
    action: "Facility Created",
    actor: "admin",
    target: "Tamale Municipal Health Center",
    details: "New facility registered in the Northern Region."
  },
  {
    id: "audit-006",
    timestamp: "2026-02-27T09:20:00.000Z",
    action: "Facility Created",
    actor: "admin",
    target: "Accra Central Medical Hub",
    details: "New facility registered in the Greater Accra Region."
  }
];
