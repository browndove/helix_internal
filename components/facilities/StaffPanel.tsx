"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { fetchDepartmentsList } from "@/lib/departmentsApi";
import { normalizeDepartmentOption, type DepartmentOption } from "@/lib/departmentMap";
import { createStaffViaProxy, deleteStaffMember, fetchStaffList } from "@/lib/staffApi";
import { normalizeStaffDirectoryRow, type StaffDirectoryRow } from "@/lib/staffDirectoryMap";
import {
  formatGhanaPhoneInputValue,
  isCompleteGhanaPhoneInput,
  normalizeToGhanaInternationalPhone,
} from "@/lib/staffPhone";
import { gatherPagedList } from "@/lib/v1ClientHelpers";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { PortalSelect } from "@/components/ui/PortalSelect";

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

function directoryRowToMember(row: StaffDirectoryRow): StaffMember {
  return {
    id: row.id,
    employeeId: row.employeeId,
    firstName: row.firstName,
    lastName: row.lastName,
    email: row.email,
    jobTitle: row.jobTitle,
    department: row.department,
    patientAccess: row.patientAccess ? "Granted" : "None",
    status: row.status === "INACTIVE" ? "DISABLED" : "ACTIVE",
  };
}

type PatientAccessChoice = "yes" | "no";

const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
] as const;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type DeptFilter = "All Depts" | "Unassigned";
type StatusFilter = "All Status" | "Active" | "Disabled";
type SortOption = "Last Name A-Z" | "Last Name Z-A" | "First Name A-Z";

interface StaffPanelProps {
  onClose: () => void;
  facilityId: string;
  facilityName: string;
  accessToken?: string;
}

export function StaffPanel({ onClose, facilityId, facilityName, accessToken }: StaffPanelProps) {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"directory" | "import">("directory");
  const [showForm, setShowForm] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [deptFilter, setDeptFilter] = useState<DeptFilter>("All Depts");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All Status");
  const [sortOption, setSortOption] = useState<SortOption>("Last Name A-Z");

  const [formFirstName, setFormFirstName] = useState("");
  const [formLastName, setFormLastName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formDob, setFormDob] = useState("");
  const [formGender, setFormGender] = useState<string>("");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formHighestQualification, setFormHighestQualification] = useState("");
  const [formIsDoctor, setFormIsDoctor] = useState<"" | "dr" | "other">("");
  const [formDepartmentId, setFormDepartmentId] = useState("");
  const [formPatientAccess, setFormPatientAccess] = useState<PatientAccessChoice>("yes");

  const departmentSelectOptions = useMemo(() => {
    return [...departments]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((d) => ({ value: d.id, label: d.name }));
  }, [departments]);

  const genderSelectOptions = useMemo(
    () => GENDER_OPTIONS.map((g) => ({ value: g.value, label: g.label })),
    []
  );

  const patientAccessSelectOptions = useMemo(
    () => [
      { value: "yes", label: "Yes" },
      { value: "no", label: "No" },
    ],
    []
  );

  const doctorSelectOptions = useMemo(
    () => [
      { value: "dr", label: "Dr." },
      { value: "other", label: "Other" },
    ],
    []
  );

  const sortSelectOptions = useMemo(
    () => [
      { value: "Last Name A-Z", label: "Last Name A-Z" },
      { value: "Last Name Z-A", label: "Last Name Z-A" },
      { value: "First Name A-Z", label: "First Name A-Z" },
    ],
    []
  );

  const canSubmitNewStaff = useMemo(() => {
    if (!formFirstName.trim() || !formLastName.trim() || !formEmail.trim()) return false;
    if (!EMAIL_RE.test(formEmail.trim())) return false;
    if (!isCompleteGhanaPhoneInput(formatGhanaPhoneInputValue(formPhone))) return false;
    if (!formDob.trim()) return false;
    if (!formGender) return false;
    if (!formJobTitle.trim()) return false;
    if (!formHighestQualification.trim()) return false;
    if (!formIsDoctor) return false;
    return true;
  }, [
    formFirstName,
    formLastName,
    formEmail,
    formPhone,
    formDob,
    formGender,
    formJobTitle,
    formHighestQualification,
    formIsDoctor,
  ]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    setActionError(null);

    const [staffRes, deptRes] = await Promise.all([
      gatherPagedList((q) => fetchStaffList(accessToken, facilityId, q)),
      gatherPagedList((q) => fetchDepartmentsList(accessToken, facilityId, q)),
    ]);

    if (deptRes.ok) {
      setDepartments(
        deptRes.items
          .map((raw) => normalizeDepartmentOption(raw))
          .filter((d): d is DepartmentOption => d !== null)
      );
    } else {
      setDepartments([]);
    }

    if (!staffRes.ok) {
      setStaff([]);
      setLoadError(staffRes.message);
      setLoading(false);
      return;
    }

    const mapped = staffRes.items
      .map((raw) => normalizeStaffDirectoryRow(raw))
      .filter((r): r is StaffDirectoryRow => r !== null)
      .map(directoryRowToMember);
    setStaff(mapped);
    setLoading(false);
  }, [accessToken, facilityId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredStaff = useMemo(() => {
    let list = [...staff];

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

    if (deptFilter === "Unassigned") {
      list = list.filter((s) => s.department === "Unassigned" || s.department === "—");
    }

    if (statusFilter === "Active") {
      list = list.filter((s) => s.status === "ACTIVE");
    } else if (statusFilter === "Disabled") {
      list = list.filter((s) => s.status === "DISABLED");
    }

    list.sort((a, b) => {
      if (sortOption === "Last Name A-Z") return a.lastName.localeCompare(b.lastName);
      if (sortOption === "Last Name Z-A") return b.lastName.localeCompare(a.lastName);
      return a.firstName.localeCompare(b.firstName);
    });

    return list;
  }, [staff, searchQuery, deptFilter, statusFilter, sortOption]);

  const resetForm = () => {
    setFormFirstName("");
    setFormLastName("");
    setFormEmail("");
    setFormPhone("");
    setFormDob("");
    setFormGender("");
    setFormJobTitle("");
    setFormHighestQualification("");
    setFormIsDoctor("");
    setFormDepartmentId("");
    setFormPatientAccess("yes");
    setActionError(null);
  };

  const handleAddStaff = async () => {
    if (!canSubmitNewStaff || formSaving) return;
    setFormSaving(true);
    setActionError(null);

    const phoneFormatted = formatGhanaPhoneInputValue(formPhone);
    const phone = normalizeToGhanaInternationalPhone(phoneFormatted);
    if (!phone) {
      setFormSaving(false);
      setActionError("Enter exactly 9 digits after +233.");
      return;
    }

    const body: Record<string, unknown> = {
      role: "staff",
      first_name: formFirstName.trim(),
      last_name: formLastName.trim(),
      email: formEmail.trim().toLowerCase(),
      phone,
      date_of_birth: formDob,
      dob: formDob,
      gender: formGender,
      job_title: formJobTitle.trim(),
      title: formJobTitle.trim(),
      highest_qualification: formHighestQualification.trim(),
      is_doctor: formIsDoctor === "dr",
      patient_access: formPatientAccess === "yes",
      can_access_patients: formPatientAccess === "yes",
    };
    const deptId = formDepartmentId.trim();
    if (deptId) {
      body.department_id = deptId;
    }

    const res = await createStaffViaProxy(accessToken, facilityId, body);
    setFormSaving(false);

    if (!res.ok) {
      setActionError(res.message);
      return;
    }

    const row = normalizeStaffDirectoryRow(res.data);
    if (row) {
      setStaff((prev) => [directoryRowToMember(row), ...prev]);
    } else {
      await loadData();
    }
    resetForm();
    setShowForm(false);
  };

  const handleDeleteStaff = async (id: string) => {
    setActionError(null);
    const res = await deleteStaffMember(accessToken, facilityId, id);
    if (!res.ok) {
      setActionError(res.message);
      return;
    }
    setStaff((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <div className="staff-panel-overlay">
      <div className="staff-panel">
        <div className="panel-facility-context-banner panel-facility-context-ok" role="status">
          Staff for <strong>{facilityName}</strong> — requests use facility{" "}
          <code className="panel-facility-code">{facilityId}</code>
          {!accessToken?.trim() ? (
            <span className="panel-facility-hint">
              {" "}
              (add a token or <code className="panel-facility-code">NEXT_PUBLIC_DEV_BEARER_TOKEN</code> for mutating
              APIs.)
            </span>
          ) : null}
        </div>

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
              <button type="button" className="staff-panel-add-btn" onClick={() => setShowForm(true)}>
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
                onClick={() => {
                  setShowForm(false);
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
            <button type="button" className="staff-panel-close-btn" onClick={onClose} aria-label="Close staff panel">
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

        <div className="staff-panel-body">
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
              {showForm && (
                <div className="staff-form-card">
                  <h3 className="staff-form-heading">New Staff Member</h3>
                  <div className="staff-form-grid">
                    <div className="staff-form-field">
                      <label className="staff-form-label" htmlFor="staff-new-first-name">
                        First name <span className="staff-form-required">*</span>
                      </label>
                      <input
                        id="staff-new-first-name"
                        type="text"
                        className="staff-form-input"
                        placeholder="Enter first name"
                        value={formFirstName}
                        onChange={(e) => setFormFirstName(e.target.value)}
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label" htmlFor="staff-new-last-name">
                        Last name <span className="staff-form-required">*</span>
                      </label>
                      <input
                        id="staff-new-last-name"
                        type="text"
                        className="staff-form-input"
                        placeholder="Enter last name"
                        value={formLastName}
                        onChange={(e) => setFormLastName(e.target.value)}
                        autoComplete="family-name"
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label" htmlFor="staff-new-email">
                        Email <span className="staff-form-required">*</span>
                      </label>
                      <input
                        id="staff-new-email"
                        type="email"
                        className="staff-form-input"
                        placeholder="name@example.com"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label" htmlFor="staff-new-phone">
                        Phone <span className="staff-form-required">*</span>
                      </label>
                      <input
                        id="staff-new-phone"
                        type="tel"
                        className="staff-form-input"
                        inputMode="numeric"
                        autoComplete="tel-national"
                        placeholder="+233_________"
                        value={formatGhanaPhoneInputValue(formPhone)}
                        onChange={(e) => setFormPhone(formatGhanaPhoneInputValue(e.target.value))}
                      />
                      <p className="staff-form-hint">
                        +233 is fixed. Digits only — exactly 9 numbers after the country code.
                      </p>
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label" htmlFor="staff-new-dob">
                        Date of birth <span className="staff-form-required">*</span>
                      </label>
                      <DatePickerField
                        id="staff-new-dob"
                        value={formDob}
                        onChange={setFormDob}
                        placeholder="Select date of birth"
                        triggerClassName="staff-form-input date-picker-trigger-btn"
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label" htmlFor="staff-new-gender">
                        Gender <span className="staff-form-required">*</span>
                      </label>
                      <PortalSelect
                        id="staff-new-gender"
                        triggerClassName="staff-form-select"
                        value={formGender}
                        onChange={setFormGender}
                        options={genderSelectOptions}
                        placeholder="Select gender"
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label" htmlFor="staff-new-title">
                        Title (job title) <span className="staff-form-required">*</span>
                      </label>
                      <input
                        id="staff-new-title"
                        type="text"
                        className="staff-form-input"
                        placeholder="e.g. Registered nurse"
                        value={formJobTitle}
                        onChange={(e) => setFormJobTitle(e.target.value)}
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label" htmlFor="staff-new-qualification">
                        Highest qualification <span className="staff-form-required">*</span>
                      </label>
                      <input
                        id="staff-new-qualification"
                        type="text"
                        className="staff-form-input"
                        placeholder="e.g. BSc Nursing"
                        value={formHighestQualification}
                        onChange={(e) => setFormHighestQualification(e.target.value)}
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label" htmlFor="staff-new-department">
                        Department <span className="staff-form-optional">(optional)</span>
                      </label>
                      <PortalSelect
                        id="staff-new-department"
                        triggerClassName="staff-form-select"
                        value={formDepartmentId}
                        onChange={setFormDepartmentId}
                        options={departmentSelectOptions}
                        placeholder="None / select later"
                        emptyMessage="No departments for this facility yet. Create departments for this facility first, then refresh."
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label" htmlFor="staff-new-is-doctor">
                        Is doctor <span className="staff-form-required">*</span>
                      </label>
                      <PortalSelect
                        id="staff-new-is-doctor"
                        triggerClassName="staff-form-select"
                        value={formIsDoctor}
                        onChange={(v) => setFormIsDoctor(v as "" | "dr" | "other")}
                        options={doctorSelectOptions}
                        placeholder="Select Dr. or other"
                      />
                    </div>
                    <div className="staff-form-field">
                      <label className="staff-form-label" htmlFor="staff-new-patient-access">
                        Patient access
                      </label>
                      <PortalSelect
                        id="staff-new-patient-access"
                        triggerClassName="staff-form-select"
                        value={formPatientAccess}
                        onChange={(v) => setFormPatientAccess(v as PatientAccessChoice)}
                        options={patientAccessSelectOptions}
                        placeholder="Select yes or no"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    className="staff-form-submit-btn"
                    onClick={() => void handleAddStaff()}
                    disabled={!canSubmitNewStaff || formSaving}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    {formSaving ? "Adding…" : "Add Staff"}
                  </button>
                </div>
              )}

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
                  <PortalSelect
                    id="staff-directory-sort"
                    value={sortOption}
                    onChange={(v) => setSortOption(v as SortOption)}
                    options={sortSelectOptions}
                    placeholder="Sort"
                    triggerClassName="portal-select-trigger staff-sort-select-btn"
                    aria-label="Sort staff list"
                  />
                </div>
              </div>

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
                    {loading ? (
                      <tr>
                        <td colSpan={9} className="panel-table-loading">
                          Loading staff…
                        </td>
                      </tr>
                    ) : null}
                    {!loading &&
                      !loadError &&
                      filteredStaff.map((member) => (
                        <tr key={member.id}>
                          <td className="staff-td-eid">{member.employeeId}</td>
                          <td>{member.firstName}</td>
                          <td className="staff-td-bold">{member.lastName}</td>
                          <td className="staff-td-email">{member.email}</td>
                          <td>{member.jobTitle}</td>
                          <td className="staff-td-dept">{member.department}</td>
                          <td>
                            <span
                              className={`staff-access-badge ${
                                member.patientAccess === "Granted" ? "staff-access-granted" : "staff-access-none"
                              }`}
                            >
                              <span className="staff-access-dot" />
                              {member.patientAccess}
                            </span>
                          </td>
                          <td>
                            <span
                              className={`staff-status-badge ${
                                member.status === "ACTIVE" ? "staff-status-active" : "staff-status-disabled"
                              }`}
                            >
                              {member.status}
                            </span>
                          </td>
                          <td className="staff-td-actions">
                            <button
                              type="button"
                              className="staff-action-delete"
                              aria-label="Delete staff"
                              onClick={() => void handleDeleteStaff(member.id)}
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
                    {!loading && !loadError && filteredStaff.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="panel-table-loading">
                          No staff for this facility.
                        </td>
                      </tr>
                    ) : null}
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
