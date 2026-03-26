import { useState } from "react";
import { Facility } from "@/lib/types";
import { FacilityDashboard } from "./FacilityDashboard";
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

const IconPhone = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, color: 'var(--accent)' }}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const IconEmail = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, color: 'var(--accent)' }}>
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

const IconShield = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconBuilding = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
    <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
    <path d="M6 12H4a2 2 0 0 0-2 2v6h20v-6a2 2 0 0 0-2-2h-2" />
    <path d="M10 12V8" />
    <path d="M14 12V8" />
    <path d="M10 8V6" />
    <path d="M14 8V6" />
  </svg>
);

const IconMapPin = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconUsersGroup = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const IconContactBadge = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
    <path d="M4 4h16v16H4z" />
    <circle cx="12" cy="10" r="3" />
    <path d="M7 20s1-4 5-4 5 4 5 4" />
  </svg>
);

const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="fd-dir-search-icon">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const IconCheckCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="fd-pat-access-true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
);

const IconXCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="fd-pat-access-false">
    <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" />
  </svg>
);

const MOCK_STAFF = [
  { id: "AMC-00124", firstName: "Kwame", lastName: "Mensah", email: "kwame.m@accramedical.com", jobTitle: "Clinical Director", department: "Administration", patientAccess: true, status: "ACTIVE" },
  { id: "AMC-00125", firstName: "Abena", lastName: "Osei", email: "a.osei@accramedical.com", jobTitle: "Senior Surgeon", department: "Surgery", patientAccess: true, status: "ACTIVE" },
  { id: "AMC-00128", firstName: "Kofi", lastName: "Adu", email: "kofi.adu@accramedical.com", jobTitle: "Staff Nurse", department: "Nursing", patientAccess: true, status: "INACTIVE" },
  { id: "AMC-00131", firstName: "Efua", lastName: "Serwaa", email: "efua.s@accramedical.com", jobTitle: "Pharmacist", department: "Pharmacy", patientAccess: false, status: "ACTIVE" },
  { id: "AMC-00135", firstName: "Ama", lastName: "Boateng", email: "ama.b@accramedical.com", jobTitle: "Receptionist", department: "Front Desk", patientAccess: false, status: "ACTIVE" },
  { id: "AMC-00140", firstName: "Yaw", lastName: "Gyan", email: "yaw.g@accramedical.com", jobTitle: "Technician", department: "Radiology", patientAccess: true, status: "ACTIVE" }
];

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
  const [activeTab, setActiveTab] = useState("Overview");
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteNameInput, setDeleteNameInput] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const tabs = ["Overview", "Users", "Usage", "Actions"];
  const isDeleteNameMatch = deleteNameInput.trim() === facility.name.trim();

  const handleDeleteClick = async () => {
    if (!showDeleteConfirmation) {
      setShowDeleteConfirmation(true);
      setDeleteNameInput("");
      return;
    }

    if (!isDeleteNameMatch || isDeleting) return;

    setIsDeleting(true);
    try {
      await Promise.resolve(onDelete(facility.id));
    } finally {
      setIsDeleting(false);
    }
  };
  
  const hasPrimaryContact =
    Boolean(facility.primaryContactEmail?.trim()) ||
    Boolean(facility.primaryContactFirstName?.trim() || facility.primaryContactLastName?.trim());
  const contactName = [facility.primaryContactFirstName, facility.primaryContactLastName]
    .filter(Boolean)
    .join(" ")
    .trim() || (facility.primaryContactEmail ? displayNameFromEmail(facility.primaryContactEmail) : "");
  const contactEmail = facility.primaryContactEmail?.trim() || "";
  const contactInitials = contactName
    ? (contactName.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2) || "—")
    : (contactEmail ? initialsFromEmail(contactEmail) : "—");
  const dateAdded = formatDateAdded(facility.createdAt);
  const cityRegion = [facility.city, facility.region].filter(Boolean).join(" · ") || "—";
  const subscriptionLabel =
    facility.subscriptionType === "1yr"
      ? "1 Year Subscription"
      : facility.subscriptionType === "2yr"
        ? "2 Year Subscription"
        : facility.subscriptionType === "trial"
          ? "Trial"
          : facility.code
            ? "1 Year Subscription"
            : "Pending Setup";

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
                {cityRegion !== "—" && (
                  <span className="fd-location-text">
                    <IconMapPin /> {cityRegion}
                  </span>
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
              <div className="fd-action-card" onClick={() => setActiveTab("Usage")}>
                <div className="fd-action-icon"><IconBarChart /></div>
                <div>
                  <h3>View Usage</h3>
                  <p>Detailed reports on facility-wide operational metrics and consumption.</p>
                </div>
              </div>
              
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
                onClick={() => void handleDeleteClick()}
                disabled={showDeleteConfirmation && (!isDeleteNameMatch || isDeleting)}
              >
                <IconTrash />
                {isDeleting
                  ? "DELETING..."
                  : showDeleteConfirmation
                    ? "CONFIRM DELETE"
                    : "DELETE FACILITY"}
              </button>

              {showDeleteConfirmation && (
                <div className="fd-delete-confirm" role="alert">
                  <p className="fd-delete-confirm-title">Are you sure you want to delete this facility?</p>
                  <p className="fd-delete-confirm-copy">
                    This action is permanent. To continue, type <strong>{facility.name}</strong> below.
                  </p>
                  <input
                    type="text"
                    className="fd-delete-confirm-input"
                    placeholder="Type facility name to confirm"
                    value={deleteNameInput}
                    onChange={(e) => setDeleteNameInput(e.target.value)}
                    disabled={isDeleting}
                  />
                  <div className="fd-delete-confirm-actions">
                    <button
                      type="button"
                      className="fd-btn-danger-cancel"
                      onClick={() => {
                        setShowDeleteConfirmation(false);
                        setDeleteNameInput("");
                      }}
                      disabled={isDeleting}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {deleteError && (
                <div className="fd-delete-error" role="alert">
                  {deleteError}
                </div>
              )}
            </div>
          </>
        )}
        
        {activeTab === "Overview" && (
          <div className="fd-overview-grid">
            {/* Left Column */}
            <div className="fd-overview-col fd-overview-main">
              {/* Overview Card */}
              <div className="fd-info-card">
                <div className="fd-info-header">
                  <h3 className="fd-info-title">OVERVIEW</h3>
                  <IconBuilding />
                </div>
                <div className="fd-info-content">
                  <div className="fd-info-row">
                    <span className="fd-info-label">ADDRESS</span>
                    <span className="fd-info-value">{facility.address || cityRegion}</span>
                  </div>
                  <div className="fd-info-row">
                    <span className="fd-info-label">DATE ADDED</span>
                    <span className="fd-info-value">{dateAdded}</span>
                  </div>
                  <div className="fd-info-row" style={{ borderBottom: 'none' }}>
                    <span className="fd-info-label">SUBSCRIPTION</span>
                    <span className="fd-info-sub-pill">{subscriptionLabel}</span>
                  </div>
                </div>
              </div>

              {/* Primary Contact Card */}
              <div className="fd-info-card">
                <div className="fd-info-header">
                  <h3 className="fd-info-title">PRIMARY CONTACT</h3>
                  <IconContactBadge />
                </div>
                <div className="fd-info-content fd-info-contact-content">
                  <div className="fd-contact-profile">
                    <div className="fd-contact-avatar">{contactInitials}</div>
                    <div className="fd-contact-details">
                      <div className="fd-contact-name">{contactName || contactEmail || "—"}</div>
                      <div className="fd-contact-role-label">PRIMARY CONTACT</div>
                    </div>
                  </div>
                  <div className="fd-contact-methods">
                    <div className="fd-contact-method">
                       <IconPhone />
                       <span>{facility.primaryContactPhone || "—"}</span>
                    </div>
                    <div className="fd-contact-method">
                       <IconEmail />
                       <span>{contactEmail || "—"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="fd-overview-col fd-overview-side">
              {/* Admin Card */}
              <div className="fd-info-card">
                <div className="fd-info-header">
                  <h3 className="fd-info-title">ADMIN</h3>
                  <IconShield />
                </div>
                <div className="fd-info-content">
                  <div className="fd-admin-profile">
                    <div className="fd-admin-avatar"><IconPerson /></div>
                    <div className="fd-admin-details">
                      <div className="fd-admin-email">{facility.adminEmail || "—"}</div>
                      <div className="fd-admin-desc">Full admin-level access control</div>
                    </div>
                  </div>
                </div>
                <div className="fd-info-footer">
                  <span className="fd-info-label">STATUS</span>
                  <span className="fd-status-active">
                    <span className="fd-status-dot"></span> ACTIVE
                  </span>
                </div>
              </div>

              {/* Users Card */}
              <div className="fd-info-card">
                <div className="fd-info-header">
                  <h3 className="fd-info-title">USERS</h3>
                  <IconUsersGroup />
                </div>
                <div className="fd-users-content">
                  <div className="fd-users-count">
                    <span className="fd-users-number">{facility.userCount}</span>
                    <span className="fd-users-label">MEMBERS</span>
                  </div>
                  <p className="fd-users-desc">Currently active on this facility portal</p>
                  <button type="button" className="fd-btn-dark">VIEW ALL USERS</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "Users" && (
          <div className="fd-directory">
            <div className="fd-dir-header">
              <div className="fd-dir-title-box">
                <h3 className="fd-dir-title">ACTIVE DIRECTORY</h3>
                <p className="fd-dir-subtitle">52 registered staff members</p>
              </div>
              <div className="fd-dir-search">
                <IconSearch />
                <input type="text" placeholder="Search members..." />
              </div>
            </div>
            
            <div className="fd-dir-table-wrap">
              <table className="fd-dir-table">
                <thead>
                  <tr>
                    <th>EMPLOYEE ID</th>
                    <th>FIRST NAME</th>
                    <th>LAST NAME</th>
                    <th>EMAIL</th>
                    <th>JOB TITLE</th>
                    <th>DEPARTMENT</th>
                    <th>PATIENT ACCESS</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_STAFF.map(staff => (
                    <tr key={staff.id}>
                      <td>{staff.id}</td>
                      <td>{staff.firstName}</td>
                      <td>{staff.lastName}</td>
                      <td className="fd-dir-email">{staff.email}</td>
                      <td>{staff.jobTitle}</td>
                      <td>{staff.department}</td>
                      <td>
                        {staff.patientAccess ? <IconCheckCircle /> : <IconXCircle />}
                      </td>
                      <td>
                        <span className={`fd-dir-status ${staff.status.toLowerCase()}`}>
                          {staff.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="fd-dir-footer">
              <div className="fd-invite-box">
                <div className="fd-invite-input-wrap">
                  <IconMail />
                  <input type="email" placeholder="Invite admin or staff by email..." />
                </div>
                <div className="fd-invite-controls">
                  <div className="fd-select-wrap">
                    <select className="fd-invite-select">
                      <option>As Staff</option>
                      <option>As Admin</option>
                    </select>
                  </div>
                  <button type="button" className="fd-invite-btn">SEND INVITE</button>
                </div>
              </div>
            </div>
          </div>
        )}
        {activeTab === "Usage" && (
          <FacilityDashboard facility={facility} />
        )}
      </div>
    </div>
  );
}
