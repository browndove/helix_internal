export interface Facility {
  id: string;
  code?: string;
  name: string;
  adminEmail: string;
  city: string;
  region: string;
  address: string;
  userCount: number;
  createdAt: string;
}

export interface FacilityInput {
  name: string;
  adminEmail: string;
  city: string;
  region: string;
  address: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  target: string;
  details?: string;
}

export interface UserSession {
  username: string;
  loggedInAt: string;
}
