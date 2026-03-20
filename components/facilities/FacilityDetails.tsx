import { useState } from "react";
import { Facility } from "@/lib/types";
import "./FacilityDetails.css";

interface FacilityDetailsProps {
  facility: Facility;
  onClose: () => void;
  onViewUsage?: () => void;
  onGenerateCode: (id: string) => void;
  onDelete: (id: string) => void | Promise<boolean>;
  onAddRole?: () => void;
  onAddStaff?: () => void;
  deleteError?: string | null;
}

const IconArrowLeft = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const IconBell = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
  </svg>
);

const IconGear = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const IconBarChart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="20" x2="12" y2="10" />
    <line x1="18" y1="20" x2="18" y2="4" />
    <line x1="6" y1="20" x2="6" y2="16" />
  </svg>
);

const IconPencil = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const IconMail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

const IconRole = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconUserPlus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="8.5" cy="7" r="4" />
    <line x1="20" y1="8" x2="20" y2="14" />
    <line x1="23" y1="11" x2="17" y2="11" />
  </svg>
);

const IconTrash = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

export function FacilityDetails({
  facility,
  onClose,
  onViewUsage,
  onGenerateCode,
  onDelete,
  onAddRole,
  onAddStaff,
  deleteError
}: FacilityDetailsProps) {
  const [activeTab, setActiveTab] = useState("Actions");

  const tabs = ["Overview", "Users", "Usage", "Actions"];

  return (
    <div className="fd-page">
      <header className="fd-page-header">
        <div className="fd-title-row">
          <div className="fd-title-left-group">
            <button type="button" className="fd-back-btn" onClick={onClose} aria-label="Back">
              <IconArrowLeft />
            </button>
            <div className="fd-title-titles">
              <div className="fd-breadcrumb">
                <span>Facilities &gt; {facility.name}</span>
              </div>
              <div className="fd-title-left">
                <h1>{facility.name}</h1>
                {facility.code ? (
                  <span className="fd-code-badge">{facility.code}</span>
                ) : (
                  <span className="fd-code-badge">PENDING</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="fd-header-actions">
            <button type="button" className="fd-btn-outline">Edit Facility</button>
            <button type="button" className="fd-btn-primary">New Action</button>
            <button type="button" className="fd-icon-btn" aria-label="Notifications">
              <IconBell />
            </button>
            <button type="button" className="fd-icon-btn" aria-label="Settings">
              <IconGear />
            </button>
          </div>
        </div>
        
        <div className="fd-tabs">
          {tabs.map(tab => (
            <button
              key={tab}
              type="button"
              className={`fd-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <div className="fd-page-content">
        {activeTab === "Actions" && (
          <>
            <div className="fd-actions-grid">
              {onViewUsage && (
                <div className="fd-action-card" onClick={onViewUsage}>
                  <div className="fd-action-icon"><IconBarChart /></div>
                  <div>
                    <h3>View Usage</h3>
                    <p>Detailed reports on facility-wide operational metrics and consumption.</p>
                  </div>
                </div>
              )}
              
              <div className="fd-action-card">
                <div className="fd-action-icon"><IconPencil /></div>
                <div>
                  <h3>Edit Details</h3>
                  <p>Modify organizational metadata, contact information, and addressing.</p>
                </div>
              </div>
              
              <div className="fd-action-card">
                <div className="fd-action-icon"><IconMail /></div>
                <div>
                  <h3>Resend Invite</h3>
                  <p>Trigger a new verification link for pending administrative users.</p>
                </div>
              </div>
              
              <div className="fd-action-card" onClick={onAddRole}>
                <div className="fd-action-icon"><IconRole /></div>
                <div>
                  <h3>Add Role</h3>
                  <p>Define custom permission sets for this specific facility node.</p>
                </div>
              </div>
              
              <div className="fd-action-card" onClick={onAddStaff}>
                <div className="fd-action-icon"><IconUserPlus /></div>
                <div>
                  <h3>Add Staff</h3>
                  <p>Provision new staff accounts with pre-defined security roles.</p>
                </div>
              </div>
            </div>

            <div className="fd-danger-zone">
              <h3>DANGER ZONE</h3>
              <p>Irreversible operations that affect facility state and historical data logs.</p>
              
              <button 
                type="button" 
                className="fd-btn-danger"
                onClick={() => void Promise.resolve(onDelete(facility.id))}
              >
                <IconTrash />
                DELETE FACILITY
              </button>
              
              {deleteError && (
                <div className="fd-delete-error" role="alert">
                  {deleteError}
                </div>
              )}
            </div>
          </>
        )}
        
        {activeTab === "Overview" && (
          <div style={{ color: "var(--text-muted)" }}>Overview content pending...</div>
        )}
        {activeTab === "Users" && (
          <div style={{ color: "var(--text-muted)" }}>Users content pending...</div>
        )}
        {activeTab === "Usage" && (
          <div style={{ color: "var(--text-muted)" }}>Usage content pending...</div>
        )}
      </div>
    </div>
  );
}
