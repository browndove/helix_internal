"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { fetchDepartmentsList } from "@/lib/departmentsApi";
import { normalizeDepartmentOption, type DepartmentOption } from "@/lib/departmentMap";
import { createRole, deleteRole, fetchRolesList } from "@/lib/rolesApi";
import { normalizeRoleTableRow, type RoleTableRow } from "@/lib/rolesDirectoryMap";
import { gatherPagedList } from "@/lib/v1ClientHelpers";
import { PortalSelect } from "@/components/ui/PortalSelect";

interface RolesPanelProps {
  onClose: () => void;
  /** Facility whose duty roles are loaded (X-Facility-Id). */
  facilityId: string;
  facilityName: string;
  accessToken?: string;
}

export function RolesPanel({ onClose, facilityId, facilityName, accessToken }: RolesPanelProps) {
  const [roles, setRoles] = useState<RoleTableRow[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<"table" | "form">("table");
  const [formSaving, setFormSaving] = useState(false);

  const [formName, setFormName] = useState("");
  const [formDepartmentId, setFormDepartmentId] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formMandatory, setFormMandatory] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setActionError(null);

    const [rolesRes, deptRes] = await Promise.all([
      gatherPagedList((q) => fetchRolesList(accessToken, facilityId, q)),
      gatherPagedList((q) => fetchDepartmentsList(accessToken, facilityId, q)),
    ]);

    if (deptRes.ok) {
      const opts = deptRes.items
        .map((raw) => normalizeDepartmentOption(raw))
        .filter((d): d is DepartmentOption => d !== null);
      setDepartments(opts);
    } else {
      setDepartments([]);
    }

    if (!rolesRes.ok) {
      setRoles([]);
      setLoadError(rolesRes.message);
      setLoading(false);
      return;
    }

    const mapped = rolesRes.items
      .map((raw) => normalizeRoleTableRow(raw))
      .filter((r): r is RoleTableRow => r !== null);
    setRoles(mapped);
    setLoading(false);
  }, [accessToken, facilityId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRoles = useMemo(
    () =>
      roles.filter(
        (r) =>
          r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.department.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [roles, searchQuery]
  );

  const roleDepartmentOptions = useMemo(() => {
    const rows = [...departments]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((d) => ({ value: d.id, label: d.name }));
    return [{ value: "", label: "— None / unassigned —" }, ...rows];
  }, [departments]);

  const resetForm = () => {
    setFormName("");
    setFormDepartmentId("");
    setFormDescription("");
    setFormMandatory(false);
    setActionError(null);
  };

  const handleCreateRole = async () => {
    if (!formName.trim()) return;
    setFormSaving(true);
    setActionError(null);

    const body: Record<string, unknown> = {
      name: formName.trim(),
      description: formDescription.trim(),
      priority: formMandatory ? "critical" : "standard",
    };
    if (formDepartmentId) {
      body.department_id = formDepartmentId;
    }

    const res = await createRole(accessToken, facilityId, body);
    setFormSaving(false);

    if (!res.ok) {
      setActionError(res.message);
      return;
    }

    const row = normalizeRoleTableRow(res.data);
    if (row) {
      setRoles((prev) => [row, ...prev]);
    } else {
      await loadData();
    }
    resetForm();
    setView("table");
  };

  const handleDeleteRole = async (id: string) => {
    setActionError(null);
    const res = await deleteRole(accessToken, facilityId, id);
    if (!res.ok) {
      setActionError(res.message);
      return;
    }
    setRoles((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div className="roles-panel-overlay">
      <div className="roles-panel">
        <div className="panel-facility-context-banner panel-facility-context-ok" role="status">
          Roles for <strong>{facilityName}</strong> — requests use facility <code className="panel-facility-code">{facilityId}</code>
          {!accessToken?.trim() ? (
            <span className="panel-facility-hint">
              {" "}
              (add a token or <code className="panel-facility-code">NEXT_PUBLIC_DEV_BEARER_TOKEN</code> for mutating
              APIs.)
            </span>
          ) : null}
        </div>

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
              <button type="button" className="roles-panel-add-btn" onClick={() => setView("form")}>
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
                  resetForm();
                }}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
                Cancel
              </button>
            )}
            <button type="button" className="roles-panel-close-btn" onClick={onClose} aria-label="Close roles panel">
              ×
            </button>
          </div>
        </header>

        {loadError ? (
          <div className="panel-data-error" role="alert">
            {loadError}
          </div>
        ) : null}
        {actionError ? (
          <div className="panel-data-error" role="alert">
            {actionError}
          </div>
        ) : null}

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
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="panel-table-loading">
                        Loading roles…
                      </td>
                    </tr>
                  ) : null}
                  {!loading &&
                    filteredRoles.map((role) => (
                      <tr key={role.id}>
                        <td className="roles-td-name">{role.name}</td>
                        <td className="roles-td-dept">{role.department}</td>
                        <td>
                          <span
                            className={`roles-priority-badge ${
                              role.priority === "CRITICAL" ? "roles-priority-critical" : "roles-priority-standard"
                            }`}
                          >
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
                            onClick={() => void handleDeleteRole(role.id)}
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
                  {!loading && filteredRoles.length === 0 && !loadError ? (
                    <tr>
                      <td colSpan={6} className="panel-table-loading">
                        No roles for this facility.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
              <div className="roles-table-footer">
                Showing {filteredRoles.length} of {roles.length} roles
              </div>
            </div>
          ) : (
            <div className="roles-form-card">
              <h2 className="roles-form-title">Create New Role</h2>
              <p className="roles-form-desc">Create a duty role for {facilityName}.</p>

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
                  <label className="roles-form-label" htmlFor="roles-new-department">
                    DEPARTMENT
                  </label>
                  <PortalSelect
                    id="roles-new-department"
                    triggerClassName="roles-form-select"
                    value={formDepartmentId}
                    onChange={setFormDepartmentId}
                    options={roleDepartmentOptions}
                    placeholder="— None / unassigned —"
                    emptyMessage="No departments for this facility yet."
                  />
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
                <button type="button" className="roles-form-templates-btn" onClick={() => setView("table")}>
                  ← Back
                </button>
                <button
                  type="button"
                  className="roles-form-submit-btn"
                  onClick={() => void handleCreateRole()}
                  disabled={!formName.trim() || formSaving}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {formSaving ? "Creating…" : "Create Role"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
