export interface Facility {
  id: string;
  code?: string;
  name: string;
  adminEmail: string;
  city: string;
  region: string;
  address: string;
  createdAt: string;
}

export interface FacilityInput {
  name: string;
  adminEmail: string;
  city: string;
  region: string;
  address: string;
}

export interface UserSession {
  username: string;
  loggedInAt: string;
}
