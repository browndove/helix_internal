import { AuditLogEntry } from "@/lib/types";

function authHeaders(token?: string): HeadersInit {
  if (!token) {
    return {};
  }

  return {
    Authorization: `Bearer ${token}`
  };
}

export async function fetchAuditLogs(token?: string): Promise<AuditLogEntry[]> {
  try {
    const response = await fetch("/api/audit-logs", {
      headers: authHeaders(token)
    });

    if (!response.ok) {
      console.error(`Failed to fetch audit logs: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === "object" && Array.isArray((data as { data?: unknown }).data)) {
      return (data as { data: AuditLogEntry[] }).data;
    }
    return [];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}
