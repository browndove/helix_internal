"use client";

import { AuditLogEntry } from "@/lib/types";

interface AuditLogPageProps {
  entries: AuditLogEntry[];
}

function formatTimestamp(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getActionBadgeClass(action: string): string {
  switch (action) {
    case "Facility Created":
      return "audit-badge audit-badge-create";
    case "Code Generated":
      return "audit-badge audit-badge-code";
    case "Facility Deleted":
      return "audit-badge audit-badge-delete";
    default:
      return "audit-badge";
  }
}

export function AuditLogPage({ entries }: AuditLogPageProps) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <section className="content-area">
      <section className="surface section-block">
        <div className="section-title-row">
          <h2>Audit Log</h2>
          <p className="meta-text">{sorted.length} entries</p>
        </div>

        {sorted.length === 0 ? (
          <div className="empty-state">
            <p>No audit log entries recorded yet.</p>
          </div>
        ) : (
          <div className="table-wrap audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>Details</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry) => (
                  <tr key={entry.id}>
                    <td className="audit-time-cell">{formatTimestamp(entry.timestamp)}</td>
                    <td>
                      <span className={getActionBadgeClass(entry.action)}>
                        {entry.action}
                      </span>
                    </td>
                    <td className="audit-target-cell">{entry.target}</td>
                    <td className="audit-details-cell">
                      {entry.details ? entry.details : <span className="audit-empty">—</span>}
                    </td>
                    <td>
                      <span className="audit-actor">{entry.actor}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
}
