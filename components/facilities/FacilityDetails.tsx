import { useRef, useState, useEffect } from "react";
import { Facility } from "@/lib/types";

interface FacilityDetailsProps {
  facility: Facility;
  onClose: () => void;
  onViewUsage?: () => void;
  onGenerateCode: (id: string) => void;
  onDelete: (id: string) => void;
}

function formatDateAdded(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
}

function initialsFromEmail(email: string): string {
  const local = email.split("@")[0] || "";
  return (local[0] ?? "").toUpperCase() + (local[1] ?? "").toUpperCase();
}

function displayNameFromEmail(email: string): string {
  const local = email.split("@")[0] || "";
  return local.charAt(0).toUpperCase() + local.slice(1).replace(/[._]/g, " ");
}

const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconEmail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconPerson = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconBarChart = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const IconPencil = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
  </svg>
);

const IconPaperPlane = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z" />
    <path d="M22 2 11 13" />
  </svg>
);

const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconBuilding = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fd-card-head-icon">
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6h20v-6a2 2 0 0 0-2-2h-2" />
    <path d="M10 12V8" />
    <path d="M14 12V8" />
    <path d="M10 8V6" />
    <path d="M14 8V6" />
  </svg>
);

export function FacilityDetails({
  facility,
  onClose,
  onViewUsage,
  onGenerateCode,
  onDelete
}: FacilityDetailsProps) {
  const [actionsOpen, setActionsOpen] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);

  const hasContact = Boolean(facility.adminEmail?.trim());
  const hasAdmin = Boolean(facility.adminEmail?.trim());
  const dateAdded = formatDateAdded(facility.createdAt);
  const cityRegion = [facility.city, facility.region].filter(Boolean).join(" · ") || "—";

  useEffect(() => {
    if (!actionsOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (actionsRef.current && !actionsRef.current.contains(e.target as Node)) {
        setActionsOpen(false);
      }
    };
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [actionsOpen]);

  return (
    <aside className="fd-panel">
      {/* Top bar: code pill + name | close; below: city · region */}
      <header className="fd-panel-header">
        <div className="fd-panel-header-left">
          <div className="fd-panel-title-row">
            {facility.code && (
              <span className="fd-panel-code-pill">{facility.code}</span>
            )}
            <h2 className="fd-panel-facility-name">{facility.name}</h2>
          </div>
          <p className="fd-panel-city-region">{cityRegion}</p>
        </div>
        <button
          type="button"
          className="fd-panel-close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </header>

      <div className="fd-panel-cards">
        {/* Card 1 — Overview */}
        <div className="fd-card">
          <div className="fd-card-label-row">
            <h3 className="fd-card-label">OVERVIEW</h3>
            <IconBuilding />
          </div>
          <div className="fd-card-row">
            <span className="fd-card-row-label">Address</span>
            <span className="fd-card-row-value fd-card-row-value-wrap">{facility.address || "—"}</span>
          </div>
          <div className="fd-card-divider" />
          <div className="fd-card-row">
            <span className="fd-card-row-label">Date Added</span>
            <span className="fd-card-row-value">{dateAdded}</span>
          </div>
          <div className="fd-card-divider" />
          <div className="fd-card-row">
            <span className="fd-card-row-label">Subscription</span>
            <span className="fd-card-subscription-pill">
              {facility.code ? "1 Year Subscription" : "Pending Setup"}
            </span>
          </div>
        </div>

        {/* Card 2 — Primary Contact */}
        <div className="fd-card">
          <div className="fd-card-label-row">
            <h3 className="fd-card-label">PRIMARY CONTACT</h3>
          </div>
          {hasContact ? (
            <>
              <div className="fd-contact-row">
                <span className="fd-contact-avatar">
                  {initialsFromEmail(facility.adminEmail!)}
                </span>
                <div>
                  <span className="fd-contact-name">
                    {displayNameFromEmail(facility.adminEmail!)}
                  </span>
                  <span className="fd-contact-role">Primary Contact</span>
                </div>
              </div>
              <div className="fd-contact-line">
                <IconEmail />
                <span>{facility.adminEmail}</span>
              </div>
            </>
          ) : (
            <div className="fd-empty-state">
              <span className="fd-empty-state-circle" aria-hidden>+</span>
              <div className="fd-empty-state-text">
                <span className="fd-empty-state-label">No contact assigned</span>
                <button type="button" className="fd-empty-state-link">+ Assign contact</button>
              </div>
            </div>
          )}
        </div>

        {/* Card 3 — Admin */}
        <div className="fd-card">
          <div className="fd-card-label-row">
            <h3 className="fd-card-label">ADMIN</h3>
          </div>
          {hasAdmin ? (
            <>
              <div className="fd-contact-line">
                <IconPerson />
                <span className="fd-admin-email">{facility.adminEmail}</span>
              </div>
              <p className="fd-admin-note">Has admin-level access to the facility portal</p>
              {facility.userCount === 0 && (
                <button type="button" className="fd-link">Resend invite →</button>
              )}
            </>
          ) : (
            <div className="fd-empty-state">
              <span className="fd-empty-state-circle" aria-hidden>+</span>
              <div className="fd-empty-state-text">
                <span className="fd-empty-state-label">No admin assigned</span>
                <button type="button" className="fd-empty-state-link">+ Assign admin</button>
              </div>
            </div>
          )}
        </div>

        {/* Card 4 — Users */}
        <div className="fd-card">
          <div className="fd-card-label-row">
            <h3 className="fd-card-label">USERS</h3>
          </div>
          <div className="fd-users-count-row">
            <span className="fd-users-num">{facility.userCount}</span>
            <span className="fd-users-label">registered users</span>
          </div>
          <div className="fd-users-progress">
            <div className="fd-users-progress-fill" style={{ width: "0%" }} />
          </div>
          <div className="fd-users-footer">
            <button type="button" className="fd-link fd-invite-link">Invite admin</button>
            <span className="fd-users-last">Last active: Never</span>
          </div>
        </div>
      </div>

      {/* Actions button + dropdown (dropdown opens above to avoid clipping) */}
      <footer className="fd-panel-actions" ref={actionsRef}>
        <div className="fd-actions-wrap">
          <button
            type="button"
            className="fd-actions-trigger"
            onClick={() => setActionsOpen((v) => !v)}
            aria-expanded={actionsOpen}
            aria-haspopup="true"
          >
            Actions <span className="fd-actions-chevron">▾</span>
          </button>
          {actionsOpen && (
            <div className="fd-actions-dropdown" role="menu">
              {onViewUsage && (
                <button
                  type="button"
                  className="fd-actions-item"
                  role="menuitem"
                  onClick={() => {
                    setActionsOpen(false);
                    onViewUsage();
                  }}
                >
                  <IconBarChart />
                  <span>View Usage</span>
                </button>
              )}
              <button type="button" className="fd-actions-item" role="menuitem">
                <IconPencil />
                <span>Edit Details</span>
              </button>
              <button type="button" className="fd-actions-item" role="menuitem">
                <IconPaperPlane />
                <span>Resend Invite</span>
              </button>
              <div className="fd-actions-divider" />
              <button
                type="button"
                className="fd-actions-item fd-actions-item-delete"
                role="menuitem"
                onClick={() => {
                  setActionsOpen(false);
                  onDelete(facility.id);
                }}
              >
                <IconTrash />
                <span>Delete Facility</span>
              </button>
            </div>
          )}
        </div>
      </footer>
    </aside>
  );
}
