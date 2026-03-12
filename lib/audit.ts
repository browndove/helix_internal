import { AuditLogEntry } from "@/lib/types";

export async function fetchAuditLogs(): Promise<AuditLogEntry[]> {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    console.error("NEXT_PUBLIC_API_BASE_URL is not configured");
    return [];
  }

  try {
    const response = await fetch(`${baseUrl}/audit-logs`);

    if (!response.ok) {
      console.error(`Failed to fetch audit logs: ${response.status} ${response.statusText}`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return [];
  }
}
