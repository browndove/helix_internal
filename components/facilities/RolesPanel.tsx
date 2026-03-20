import { useState } from "react";

interface Role {
  id: string;
  name: string;
  department: string;
  priority: "CRITICAL" | "STANDARD";
  mandatory: boolean;
  escalation: string;
}

const SEED_ROLES: Role[] = [
  { id: "r-1", name: "Anesthesiologist On-Call", department: "Unassigned", priority: "CRITICAL", mandatory: true, escalation: "No policy" },
  { id: "r-2", name: "ED On-Call Physician", department: "Unassigned", priority: "CRITICAL", mandatory: true, escalation: "No policy" },
  { id: "r-3", name: "Housekeeping Supervisor", department: "Unassigned", priority: "STANDARD", mandatory: false, escalation: "N/A" },
  { id: "r-4", name: "ICU Charge Nurse", department: "Unassigned", priority: "CRITICAL", mandatory: true, escalation: "No policy" },
  { id: "r-5", name: "IT Support On-Call", department: "Unassigned", priority: "STANDARD", mandatory: false, escalation: "N/A" },
  { id: "r-6", name: "Night Shift Supervisor", department: "Unassigned", priority: "STANDARD", mandatory: false, escalation: "N/A" },
  { id: "r-7", name: "On-Call Cardiologist", department: "Unassigned", priority: "CRITICAL", mandatory: true, escalation: "No policy" },
  { id: "r-8", name: "Pediatrics Resident", department: "Unassigned", priority: "STANDARD", mandatory: false, escalation: "N/A" },
  { id: "r-9", name: "Pharmacy On-Call", department: "Unassigned", priority: "STANDARD", mandatory: false, escalation: "N/A" },
  { id: "r-10", name: "Radiology Tech Lead", department: "Unassigned", priority: "STANDARD", mandatory: false, escalation: "N/A" },
  { id: "r-11", name: "Security Head", department: "Emergency Department", priority: "CRITICAL", mandatory: true, escalation: "No policy" },
  { id: "r-12", name: "Trauma Surgeon", department: "Unassigned", priority: "CRITICAL", mandatory: true, escalation: "No policy" },
  { id: "r-13", name: "Triage Nurse", department: "Unassigned", priority: "CRITICAL", mandatory: true, escalation: "No policy" },
];

const DEPARTMENT_OPTIONS = [
  "Emergency Department",
  "ICU",
  "Radiology",
  "Pharmacy",
  "Surgery",
  "Pediatrics",
  "Administration",
];

interface RolesPanelProps {
  onClose: () => void;
}

export function RolesPanel({ onClose }: RolesPanelProps) {
  const [roles, setRoles] = useState<Role[]>(SEED_ROLES);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"table" | "form">("table");

  // Form state
  const [formName, setFormName] = useState("");
  const [formDepartment, setFormDepartment] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMandatory, setFormMandatory] = useState(false);

  const filteredRoles = roles.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRole = () => {
    if (!formName.trim()) return;
    const newRole: Role = {
      id: `r-${Date.now()}`,
      name: formName.trim(),
      department: formDepartment || "Unassigned",
      priority: formMandatory ? "CRITICAL" : "STANDARD",
      mandatory: formMandatory,
      escalation: formMandatory ? "No policy" : "N/A",
    };
    setRoles((prev) => [...prev, newRole]);
    setFormName("");
    setFormDepartment("");
    setFormDescription("");
    setFormMandatory(false);
    setView("table");
  };

  const handleDeleteRole = (id: string) => {
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="roles-panel-overlay">
      <div className="roles-panel">
        {/* Header */}
        <header className="roles-panel-header">
          <div className="roles-panel-header-left">
            <h1 className="roles-panel-title">Roles</h1>
            <span className="roles-panel-subtitle">Role Management</span>
          </div>
          <div className="roles-panel-header-right">
            <div className="roles-panel-search-wrap">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="search"
                placeholder="Search roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {view === "table" ? (
              <button
                type="button"
                className="roles-panel-add-btn"
                onClick={() => setView("form")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Role
              </button>
            ) : (
              <button
                type="button"
                className="roles-panel-cancel-btn"
                onClick={() => {
                  setView("table");
                  setFormName("");
                  setFormDepartment("");
                  setFormDescription("");
                  setFormMandatory(false);
                }}
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
              className="roles-panel-close-btn"
              onClick={onClose}
              aria-label="Close roles panel"
            >
              ×
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="roles-panel-body">
          {view === "table" ? (
            <div className="roles-table-wrap">
              <table className="roles-table">
                <thead>
                  <tr>
                    <th>ROLE NAME</th>
                    <th>DEPARTMENT</th>
                    <th>PRIORITY</th>
                    <th className="roles-th-center">MANDATORY</th>
                    <th>ESCALATION</th>
                    <th className="roles-th-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRoles.map((role) => (
                    <tr key={role.id}>
                      <td className="roles-td-name">{role.name}</td>
                      <td className="roles-td-dept">{role.department}</td>
                      <td>
                        <span className={`roles-priority-badge ${role.priority === "CRITICAL" ? "roles-priority-critical" : "roles-priority-standard"}`}>
                          {role.priority}
                        </span>
                      </td>
                      <td className="roles-td-center">
                        {role.mandatory ? (
                          <span className="roles-checkbox-checked">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </span>
                        ) : (
                          <span className="roles-checkbox-unchecked" />
                        )}
                      </td>
                      <td className="roles-td-escalation">
                        {role.escalation === "No policy" || role.escalation === "N/A" ? (
                          <span className="roles-escalation-muted">{role.escalation}</span>
                        ) : (
                          <span className="roles-escalation-badge">{role.escalation}</span>
                        )}
                      </td>
                      <td className="roles-td-actions">
                        <button type="button" className="roles-action-edit" aria-label="Edit role">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="roles-action-delete"
                          aria-label="Delete role"
                          onClick={() => handleDeleteRole(role.id)}
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
              <div className="roles-table-footer">
                Showing {filteredRoles.length} of {roles.length} roles
              </div>
            </div>
          ) : (
            <div className="roles-form-card">
              <h2 className="roles-form-title">Create New Role</h2>
              <p className="roles-form-desc">Create a single custom role with its own settings.</p>

              <div className="roles-form-row">
                <div className="roles-form-field">
                  <label className="roles-form-label">ROLE NAME</label>
                  <input
                    type="text"
                    className="roles-form-input"
                    placeholder="e.g. Charge Nurse"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div className="roles-form-field">
                  <label className="roles-form-label">DEPARTMENT</label>
                  <select
                    className="roles-form-select"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {DEPARTMENT_OPTIONS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="roles-form-field roles-form-field-full">
                <label className="roles-form-label">DESCRIPTION</label>
                <textarea
                  className="roles-form-textarea"
                  placeholder="Describe this role..."
                  rows={3}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              <div className="roles-form-mandatory-row">
                <label className="roles-form-checkbox-wrap">
                  <input
                    type="checkbox"
                    checked={formMandatory}
                    onChange={(e) => setFormMandatory(e.target.checked)}
                    className="roles-form-checkbox"
                  />
                  <div className="roles-form-checkbox-text">
                    <span className="roles-form-checkbox-label">This role must always be filled</span>
                    <span className="roles-form-checkbox-hint">Marking as mandatory sets priority to Critical.</span>
                  </div>
                </label>
                <span className={`roles-priority-badge ${formMandatory ? "roles-priority-critical" : "roles-priority-standard"}`}>
                  {formMandatory ? "CRITICAL" : "STANDARD"}
                </span>
              </div>

              <div className="roles-form-footer">
                <button
                  type="button"
                  className="roles-form-templates-btn"
                  onClick={() => setView("table")}
                >
                  ← Templates
                </button>
                <button
                  type="button"
                  className="roles-form-submit-btn"
                  onClick={handleCreateRole}
                  disabled={!formName.trim()}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Create Role
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
