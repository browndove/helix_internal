import { useState, useMemo } from "react";

interface StaffMember {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  department: string;
  patientAccess: "Granted" | "None";
  status: "ACTIVE" | "DISABLED";
}

const SEED_STAFF: StaffMember[] = [
  { id: "s-1", employeeId: "AMC-0115", firstName: "Bright", lastName: "Addae", email: "briteaddae@gmail.com", jobTitle: "Doctor", department: "Unassigned", patientAccess: "None", status: "ACTIVE" },
  { id: "s-2", employeeId: "bright.addae", firstName: "Bright", lastName: "Addae", email: "dennisboachie9+24@gmail.com", jobTitle: "Doctor", department: "Unassigned", patientAccess: "Granted", status: "ACTIVE" },
  { id: "s-3", employeeId: "AMC-0104", firstName: "Esi", lastName: "Addo", email: "esi.addo.5urlw82@trial-facility.com", jobTitle: "Nurse", department: "Unassigned", patientAccess: "Granted", status: "ACTIVE" },
  { id: "s-4", employeeId: "AMC-0003", firstName: "Esi", lastName: "Addo", email: "nurse.esi.addo@hospital.com", jobTitle: "Nurse", department: "Unassigned", patientAccess: "Granted", status: "ACTIVE" },
  { id: "s-5", employeeId: "AMC-0105", firstName: "Kofi", lastName: "Ampong", email: "kofi.ampong.5urlw83@trial-facility.com", jobTitle: "Nurse", department: "Unassigned", patientAccess: "Granted", status: "ACTIVE" },
  { id: "s-6", employeeId: "AMC-0004", firstName: "Kofi", lastName: "Ampong", email: "nurse.kofi.ampong@hospital.com", jobTitle: "Nurse", department: "Unassigned", patientAccess: "Granted", status: "ACTIVE" },
  { id: "s-7", employeeId: "AMC-0110", firstName: "Efua", lastName: "Asante", email: "efua.asante.5urlw88@trial-facility.com", jobTitle: "Pharmacist", department: "Unassigned", patientAccess: "Granted", status: "ACTIVE" },
  { id: "s-8", employeeId: "AMC-0009", firstName: "Efua", lastName: "Asante", email: "staff.efua.asante@hospital.com", jobTitle: "Pharmacist", department: "Unassigned", patientAccess: "Granted", status: "ACTIVE" },
  { id: "s-9", employeeId: "AMC-0106", firstName: "Ama", lastName: "Badu", email: "ama.badu.5urlw84@trial-facility.com", jobTitle: "Administrator", department: "Unassigned", patientAccess: "None", status: "ACTIVE" },
  { id: "s-10", employeeId: "AMC-0005", firstName: "Ama", lastName: "Badu", email: "admin.ama.badu@hospital.com", jobTitle: "Administrator", department: "Unassigned", patientAccess: "None", status: "ACTIVE" },
  { id: "s-11", employeeId: "dennis.boachie6", firstName: "Dennis", lastName: "Boachie", email: "dennisboachie9+helix@gmail.com", jobTitle: "Doctor", department: "Unassigned", patientAccess: "None", status: "ACTIVE" },
  { id: "s-12", employeeId: "dennis.boachie5", firstName: "Dennis", lastName: "Boachie", email: "dennisboachie9+11@gmail.com", jobTitle: "Doctor", department: "Unassigned", patientAccess: "None", status: "ACTIVE" },
  { id: "s-13", employeeId: "dennis.boachie4", firstName: "Dennis", lastName: "Boachie", email: "dennisboachie9+10@gmail.com", jobTitle: "Doctor", department: "Unassigned", patientAccess: "None", status: "ACTIVE" },
  { id: "s-14", employeeId: "dennis.boachie3", firstName: "Dennis", lastName: "Boachie", email: "dennisboachie9+8@gmail.com", jobTitle: "Doctor", department: "Unassigned", patientAccess: "None", status: "ACTIVE" },
];

const DEPARTMENT_OPTIONS = [
  "Cardiology",
  "Emergency",
  "ICU",
  "Radiology",
  "Pharmacy",
  "Surgery",
  "Pediatrics",
  "Administration",
];

const PATIENT_ACCESS_OPTIONS: Array<"Granted" | "None"> = ["Granted", "None"];

type DeptFilter = "All Depts" | "Unassigned";
type StatusFilter = "All Status" | "Active" | "Disabled";
type SortOption = "Last Name A-Z" | "Last Name Z-A" | "First Name A-Z";

interface StaffPanelProps {
  onClose: () => void;
}

export function StaffPanel({ onClose }: StaffPanelProps) {
  const [staff, setStaff] = useState<StaffMember[]>(SEED_STAFF);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "import">("directory");
  const [showForm, setShowForm] = useState(false);
  const [deptFilter, setDeptFilter] = useState<DeptFilter>("All Depts");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All Status");
  const [sortOption, setSortOption] = useState<SortOption>("Last Name A-Z");

  // Form state
  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formDepartment, setFormDepartment] = useState("Cardiology");
  const [formPatientAccess, setFormPatientAccess] = useState<"Granted" | "None">("Granted");

  const filteredStaff = useMemo(() => {
    let list = [...staff];

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (s) =>
          s.firstName.toLowerCase().includes(q) ||
          s.lastName.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.employeeId.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
      );
    }

    // Dept filter
    if (deptFilter === "Unassigned") {
      list = list.filter((s) => s.department === "Unassigned");
    }

    // Status filter
    if (statusFilter === "Active") {
      list = list.filter((s) => s.status === "ACTIVE");
    } else if (statusFilter === "Disabled") {
      list = list.filter((s) => s.status === "DISABLED");
    }

    // Sort
    list.sort((a, b) => {
      if (sortOption === "Last Name A-Z") return a.lastName.localeCompare(b.lastName);
      if (sortOption === "Last Name Z-A") return b.lastName.localeCompare(a.lastName);
      return a.firstName.localeCompare(b.firstName);
    });

    return list;
  }, [staff, searchQuery, deptFilter, statusFilter, sortOption]);

  const handleAddStaff = () => {
    if (!formFirstName.trim() || !formLastName.trim() || !formEmail.trim()) return;
    const newId = `AMC-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const newMember: StaffMember = {
      id: `s-${Date.now()}`,
      employeeId: newId,
      firstName: formFirstName.trim(),
      lastName: formLastName.trim(),
      email: formEmail.trim(),
      jobTitle: formJobTitle.trim() || "Doctor",
      department: formDepartment || "Unassigned",
      patientAccess: formPatientAccess,
      status: "ACTIVE",
    };
    setStaff((prev) => [newMember, ...prev]);
    resetForm();
    setShowForm(false);
  };

  const handleDeleteStaff = (id: string) => {
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  const resetForm = () => {
    setFormFirstName("");
    setFormLastName("");
    setFormEmail("");
    setFormPhone("");
    setFormJobTitle("");
    setFormDepartment("Cardiology");
    setFormPatientAccess("Granted");
  };

  return (
    <div className="staff-panel-overlay">
      <div className="staff-panel">
        {/* Header */}
        <header className="staff-panel-header">
          <div className="staff-panel-header-left">
            <h1 className="staff-panel-title">Staff Management</h1>
            <span className="staff-panel-subtitle">Directory &amp; Import</span>
          </div>
          <div className="staff-panel-header-right">
            <div className="staff-panel-search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                placeholder="Search by name, dept, or em..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {!showForm ? (
              <button
                type="button"
                className="staff-panel-add-btn"
                onClick={() => setShowForm(true)}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Staff
              </button>
            ) : (
              <button
                type="button"
                className="staff-panel-cancel-btn"
                onClick={() => { setShowForm(false); resetForm(); }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel
              </button>
            )}
            <button
              type="button"
              className="staff-panel-close-btn"
              onClick={onClose}
              aria-label="Close staff panel"
            >
              ×
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="staff-panel-body">
          {/* Tabs */}
          <div className="staff-tabs">
            <button
              type="button"
              className={`staff-tab ${activeTab === "directory" ? "staff-tab-active" : ""}`}
              onClick={() => setActiveTab("directory")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Staff Directory
            </button>
            <button
              type="button"
              className={`staff-tab ${activeTab === "import" ? "staff-tab-active" : ""}`}
              onClick={() => setActiveTab("import")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              Bulk Import
            </button>
          </div>

          {activeTab === "directory" ? (
            <>
              {/* Add Staff Form (inline, above filters) */}
              {showForm && (
                <div className="staff-form-card">
                  <h3 className="staff-form-heading">New Staff Member</h3>
                  <div className="staff-form-grid">
                    <div className="staff-form-field">
                      <label className="staff-form-label">FIRST NAME *</label>
                      <input
                        type="text"
                        className="staff-form-input"
                        placeholder="First name"
                        value={formFirstName}
                        onChange={(e) => setFormFirstName(e.target.value)}
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label">LAST NAME *</label>
                      <input
                        type="text"
                        className="staff-form-input"
                        placeholder="Last name"
                        value={formLastName}
                        onChange={(e) => setFormLastName(e.target.value)}
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label">EMAIL *</label>
                      <input
                        type="email"
                        className="staff-form-input"
                        placeholder="Email address"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label">PHONE</label>
                      <input
                        type="tel"
                        className="staff-form-input"
                        placeholder="+233240234567"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label">JOB TITLE</label>
                      <input
                        type="text"
                        className="staff-form-input"
                        placeholder="e.g. Nurse"
                        value={formJobTitle}
                        onChange={(e) => setFormJobTitle(e.target.value)}
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label">DEPARTMENT</label>
                      <select
                        className="staff-form-select"
                        value={formDepartment}
                        onChange={(e) => setFormDepartment(e.target.value)}
                      >
                        {DEPARTMENT_OPTIONS.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label">PATIENT ACCESS</label>
                      <select
                        className="staff-form-select"
                        value={formPatientAccess}
                        onChange={(e) => setFormPatientAccess(e.target.value as "Granted" | "None")}
                      >
                        {PATIENT_ACCESS_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="staff-form-submit-btn"
                    onClick={handleAddStaff}
                    disabled={!formFirstName.trim() || !formLastName.trim() || !formEmail.trim()}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Staff
                  </button>
                </div>
              )}

              {/* Filters row */}
              <div className="staff-filters-row">
                <div className="staff-filter-pills">
                  <button
                    type="button"
                    className={`staff-filter-pill ${deptFilter === "All Depts" ? "staff-filter-pill-active" : ""}`}
                    onClick={() => setDeptFilter("All Depts")}
                  >
                    All Depts
                  </button>
                  <button
                    type="button"
                    className={`staff-filter-pill ${deptFilter === "Unassigned" ? "staff-filter-pill-active" : ""}`}
                    onClick={() => setDeptFilter("Unassigned")}
                  >
                    Unassigned
                  </button>
                  <span className="staff-filter-divider" />
                  <button
                    type="button"
                    className={`staff-filter-pill ${statusFilter === "All Status" ? "staff-filter-pill-active" : ""}`}
                    onClick={() => setStatusFilter("All Status")}
                  >
                    All Status
                  </button>
                  <button
                    type="button"
                    className={`staff-filter-pill ${statusFilter === "Active" ? "staff-filter-pill-active" : ""}`}
                    onClick={() => setStatusFilter("Active")}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    className={`staff-filter-pill ${statusFilter === "Disabled" ? "staff-filter-pill-active" : ""}`}
                    onClick={() => setStatusFilter("Disabled")}
                  >
                    Disabled
                  </button>
                </div>
                <div className="staff-sort-wrap">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="4" y1="6" x2="20" y2="6" />
                    <line x1="4" y1="12" x2="14" y2="12" />
                    <line x1="4" y1="18" x2="8" y2="18" />
                  </svg>
                  <select
                    className="staff-sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as SortOption)}
                  >
                    <option value="Last Name A-Z">Last Name A-Z</option>
                    <option value="Last Name Z-A">Last Name Z-A</option>
                    <option value="First Name A-Z">First Name A-Z</option>
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="staff-table-wrap">
                <table className="staff-table">
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
                      <th className="staff-th-right">&nbsp;</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStaff.map((member) => (
                      <tr key={member.id}>
                        <td className="staff-td-eid">{member.employeeId}</td>
                        <td>{member.firstName}</td>
                        <td className="staff-td-bold">{member.lastName}</td>
                        <td className="staff-td-email">{member.email}</td>
                        <td>{member.jobTitle}</td>
                        <td className="staff-td-dept">{member.department}</td>
                        <td>
                          <span className={`staff-access-badge ${member.patientAccess === "Granted" ? "staff-access-granted" : "staff-access-none"}`}>
                            <span className="staff-access-dot" />
                            {member.patientAccess}
                          </span>
                        </td>
                        <td>
                          <span className={`staff-status-badge ${member.status === "ACTIVE" ? "staff-status-active" : "staff-status-disabled"}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="staff-td-actions">
                          <button
                            type="button"
                            className="staff-action-delete"
                            aria-label="Delete staff"
                            onClick={() => handleDeleteStaff(member.id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M3 6h18" />
                              <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                              <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="staff-import-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="15" y2="15" />
              </svg>
              <p>Bulk import coming soon. Upload a CSV to add multiple staff members at once.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
