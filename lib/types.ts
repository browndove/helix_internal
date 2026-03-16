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
  /** From API: primary_contact_email; also used as adminEmail when adminEmail not provided */
  primaryContactEmail?: string;
  primaryContactFirstName?: string;
  primaryContactLastName?: string;
  primaryContactPhone?: string;
  subscriptionType?: string;
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
  token?: string;
  loggedInAt: string;
}
