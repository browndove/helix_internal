"use client";

import { useState, useMemo } from "react";
import { AuditLogEntry } from "@/lib/types";

interface AuditLogPageProps {
  entries: AuditLogEntry[];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
}

function normalizeAction(action: string): string {
  return action.trim().toUpperCase().replace(/\s+/g, " ");
}

function getActionBadgeClass(action: string): string {
  const n = normalizeAction(action);
  if (n.includes("CREATED")) return "audit-badge audit-badge-created";
  if (n.includes("CODE") && n.includes("GENERATED")) return "audit-badge audit-badge-code";
  if (n.includes("UPDATED")) return "audit-badge audit-badge-updated";
  if (n.includes("DELETED")) return "audit-badge audit-badge-deleted";
  return "audit-badge";
}

function getActionAccentClass(action: string): string {
  const n = normalizeAction(action);
  if (n.includes("CREATED") && !n.includes("DELETED") && !n.includes("UPDATED")) return "audit-row-accent-created";
  if (n.includes("CODE") && n.includes("GENERATED")) return "audit-row-accent-code";
  if (n.includes("UPDATED")) return "audit-row-accent-updated";
  if (n.includes("DELETED")) return "audit-row-accent-deleted";
  return "";
}

function getActionLabel(action: string): string {
  const n = normalizeAction(action);
  if (n.includes("FACILITY") && n.includes("CREATED")) return "FACILITY CREATED";
  if (n.includes("CODE") && n.includes("GENERATED")) return "CODE GENERATED";
  if (n.includes("FACILITY") && n.includes("UPDATED")) return "FACILITY UPDATED";
  if (n.includes("FACILITY") && n.includes("DELETED")) return "FACILITY DELETED";
  return action.trim().toUpperCase();
}

function IconShield() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="audit-actor-icon audit-actor-icon-shield" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconPerson() {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="audit-actor-icon" aria-hidden>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="audit-empty-icon">
      <rect x="8" y="4" width="8" height="4" rx="1" ry="1" />
      <path d="M8 8H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2h-2" />
    </svg>
  );
}

export function AuditLogPage({ entries }: AuditLogPageProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const sorted = useMemo(
    () =>
      [...entries].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [entries]
  );

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return sorted;
    const q = searchQuery.trim().toLowerCase();
    return sorted.filter(
      (e) =>
        e.action.toLowerCase().includes(q) ||
        (e.target || "").toLowerCase().includes(q) ||
        (e.details || "").toLowerCase().includes(q) ||
        (e.actor || "").toLowerCase().includes(q)
    );
  }, [sorted, searchQuery]);

  const isAdmin = (actor: string) =>
    actor.trim().toLowerCase() === "admin";

  return (
    <section className="content-area audit-log-page">
      <header className="audit-log-header">
        <h2 className="audit-log-title">Audit Log</h2>
        <div className="audit-log-controls">
          <span className="audit-log-count">{filtered.length} entries</span>
          <input
            type="search"
            className="audit-log-search"
            placeholder="Search logs…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search logs"
          />
          <button type="button" className="audit-log-date-btn">
            Date range
          </button>
        </div>
      </header>

      <section className="surface section-block audit-log-block">
        {filtered.length === 0 ? (
          <div className="audit-log-empty">
            <IconClipboard />
            <p className="audit-log-empty-text">No activity recorded yet</p>
          </div>
        ) : (
          <div className="table-wrap audit-table-wrap">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>TIMESTAMP</th>
                  <th>ACTION</th>
                  <th>TARGET</th>
                  <th>DETAILS</th>
                  <th>ACTOR</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((entry) => (
                  <tr
                    key={entry.id}
                    className={`audit-row ${getActionAccentClass(entry.action)}`}
                  >
                    <td className="audit-cell-timestamp">
                      <span className="audit-date">{formatDate(entry.timestamp)}</span>
                      <span className="audit-time">{formatTime(entry.timestamp)}</span>
                    </td>
                    <td className="audit-cell-action">
                      <span className={getActionBadgeClass(entry.action)}>
                        {getActionLabel(entry.action)}
                      </span>
                    </td>
                    <td className="audit-cell-target">{entry.target}</td>
                    <td className="audit-cell-details">
                      {entry.details ?? "—"}
                    </td>
                    <td className="audit-cell-actor">
                      <span className="audit-actor-pill">
                        {isAdmin(entry.actor) ? (
                          <IconShield />
                        ) : (
                          <IconPerson />
                        )}
                        <span>{entry.actor}</span>
                      </span>
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
