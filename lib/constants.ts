import { Facility } from "@/lib/types";

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
    createdAt: "2026-02-27T09:20:00.000Z"
  }
];
