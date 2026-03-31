"use client";

import { useMemo, useState, useEffect, useLayoutEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BlurLoader } from "@/components/common/BlurLoader";
import { FacilityTable } from "@/components/facilities/FacilityTable";
import { FacilityDashboard } from "@/components/facilities/FacilityDashboard";
import { FacilityDetails } from "@/components/facilities/FacilityDetails";
import { AddFacilityDrawer } from "@/components/facilities/AddFacilityDrawer";
import { RolesPanel } from "@/components/facilities/RolesPanel";
import { StaffPanel } from "@/components/facilities/StaffPanel";
import { PortalSelect } from "@/components/ui/PortalSelect";
import { AuditLogPage } from "@/components/audit/AuditLogPage";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { loginAdmin } from "@/lib/auth";
import {
  SEED_FACILITIES,
  SEED_AUDIT_LOG
} from "@/lib/constants";
import { DEFAULT_FACILITY_FILTERS, FacilityFilters, filterFacilities } from "@/lib/facilities";
import { fetchAuditLogs } from "@/lib/audit";
import { fetchFacilities, createFacility, deleteFacility } from "@/lib/facilitiesApi";
import { Facility, UserSession, AuditLogEntry, FacilityInput } from "@/lib/types";
import { useStoredState } from "@/hooks/useStoredState";
import { createLocalSyntheticSession, isLocalDevHostname } from "@/lib/localDevAuth";

const SESSION_STORAGE_KEY = "internal.facilities.session.v1";
const FACILITIES_STORAGE_KEY = "internal.facilities.list.v4";
const AUDIT_LOG_STORAGE_KEY = "internal.audit.log.v1";
const ACTING_FACILITY_STORAGE_KEY = "internal.actingFacility.id.v1";

function createId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.round(Math.random() * 1_000_000)}`;
}

export function DashboardApp() {
  const [session, setSession, sessionReady] = useStoredState<UserSession | null>(
    SESSION_STORAGE_KEY,
    null
  );
  const [facilities, setFacilities, facilitiesReady] = useStoredState<Facility[]>(
    FACILITIES_STORAGE_KEY,
    SEED_FACILITIES
  );
  const [auditLog, setAuditLog, auditReady] = useStoredState<AuditLogEntry[]>(
    AUDIT_LOG_STORAGE_KEY,
    SEED_AUDIT_LOG
  );
  const [actingFacilityId, setActingFacilityId, actingFacilityReady] = useStoredState<string | null>(
    ACTING_FACILITY_STORAGE_KEY,
    null
  );
  const [filters, setFilters] = useState<FacilityFilters>(DEFAULT_FACILITY_FILTERS);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [facilityViewMode, setFacilityViewMode] = useState<"list" | "usage">("list");
  const [activeView, setActiveView] = useState<string>("facilities");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddFacilityForm, setShowAddFacilityForm] = useState(false);
  const [addFacilityError, setAddFacilityError] = useState<string | null>(null);
  const [isAddingFacility, setIsAddingFacility] = useState(false);
  const [deleteFacilityError, setDeleteFacilityError] = useState<string | null>(null);
  const [showRolesPanel, setShowRolesPanel] = useState(false);
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  /** After logout on localhost, show the real login screen until user signs in or skips again. */
  const [forceLoginOnLocal, setForceLoginOnLocal] = useState(false);
  const [localBypassEnabled, setLocalBypassEnabled] = useState(false);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    setLocalBypassEnabled(isLocalDevHostname(window.location.hostname));
  }, []);

  const requireLoginEverywhere = process.env.NEXT_PUBLIC_REQUIRE_LOGIN === "true";

  const activeSession = useMemo((): UserSession | null => {
    if (session) return session;
    if (requireLoginEverywhere || forceLoginOnLocal || !localBypassEnabled) return null;
    return createLocalSyntheticSession();
  }, [session, requireLoginEverywhere, forceLoginOnLocal, localBypassEnabled]);

  const selectedFacility = useMemo(
    () => facilities.find((f) => f.id === selectedFacilityId) ?? null,
    [facilities, selectedFacilityId]
  );

  const isHydrated = sessionReady && facilitiesReady && auditReady && actingFacilityReady;

  const actingFacility = useMemo(
    () => (actingFacilityId ? facilities.find((f) => f.id === actingFacilityId) ?? null : null),
    [actingFacilityId, facilities]
  );

  useEffect(() => {
    if (!actingFacilityId) return;
    if (!facilities.some((f) => f.id === actingFacilityId)) {
      setActingFacilityId(null);
    }
  }, [actingFacilityId, facilities, setActingFacilityId]);

  useEffect(() => {
    if (!selectedFacilityId) {
      setShowRolesPanel(false);
      setShowStaffPanel(false);
    }
  }, [selectedFacilityId]);

  const filteredByFilters = useMemo(
    () => filterFacilities(facilities, filters),
    [facilities, filters]
  );

  const visibleFacilities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return filteredByFilters;
    return filteredByFilters.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        (f.code?.toLowerCase().includes(q)) ||
        f.city.toLowerCase().includes(q) ||
        f.region.toLowerCase().includes(q) ||
        f.adminEmail.toLowerCase().includes(q)
    );
  }, [filteredByFilters, searchQuery]);

  const cityOptions = useMemo(
    () =>
      Array.from(new Set(facilities.map((f) => f.city).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [facilities]
  );
  const regionOptions = useMemo(
    () =>
      Array.from(new Set(facilities.map((f) => f.region).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b)
      ),
    [facilities]
  );

  const actingFacilitySelectOptions = useMemo(
    () => [
      { value: "", label: "No facility selected" },
      ...[...facilities]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((f) => ({ value: f.id, label: f.name })),
    ],
    [facilities]
  );

  const cityFilterSelectOptions = useMemo(
    () => [
      { value: "All", label: "All Cities" },
      ...cityOptions.map((c) => ({ value: c, label: c })),
    ],
    [cityOptions]
  );

  const regionFilterSelectOptions = useMemo(
    () => [
      { value: "All", label: "All Regions" },
      ...regionOptions.map((r) => ({ value: r, label: r })),
    ],
    [regionOptions]
  );

  const handleFilterChange = (next: Partial<FacilityFilters>) => {
    setFilters((prev) => ({ ...prev, ...next }));
  };
  const handleResetFilters = () => {
    setFilters(DEFAULT_FACILITY_FILTERS);
    setSearchQuery("");
  };

  const facilityStats = useMemo(() => {
    const cities = new Set(facilities.map((f) => f.city).filter(Boolean));
    const regions = new Set(facilities.map((f) => f.region).filter(Boolean));
    const pending = facilities.filter((f) => !f.code).length;
    return {
      total: facilities.length,
      cities: cities.size,
      regions: regions.size,
      pending,
    };
  }, [facilities]);

  useEffect(() => {
    if (activeSession?.token) {
      fetchAuditLogs(activeSession.token).then((logs) => {
        if (logs.length > 0) {
          setAuditLog(logs);
        }
      });
    }
  }, [activeSession?.token, setAuditLog]);

  useEffect(() => {
    if (!isHydrated) return;
    fetchFacilities().then((list) => {
      if (list.length > 0) {
        setFacilities(list);
      }
    });
  }, [isHydrated, setFacilities]);

  const addAuditEntry = (action: string, target: string, details?: string) => {
    const entry: AuditLogEntry = {
      id: createId(),
      timestamp: new Date().toISOString(),
      action,
      actor: activeSession?.username ?? "system",
      target,
      details
    };
    setAuditLog((prev) => [entry, ...prev]);
  };

  const handleLogin = async (email: string, password: string) => {
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const authResult = await loginAdmin(email, password);
      setForceLoginOnLocal(false);
      setSession({
        username: authResult.username,
        token: authResult.token,
        loggedInAt: new Date().toISOString()
      });
    } catch (error) {
      setLoginError(
        error instanceof Error ? error.message : "Unable to login. Please try again."
      );
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setSession(null);
    setFilters(DEFAULT_FACILITY_FILTERS);
    if (localBypassEnabled) {
      setForceLoginOnLocal(true);
    }
  };

  const handleDeleteFacility = async (id: string): Promise<boolean> => {
    setDeleteFacilityError(null);
    const facility = facilities.find((f) => f.id === id);
    const result = await deleteFacility(activeSession?.token, id);
    if (!result.success) {
      setDeleteFacilityError(result.message);
      return false;
    }
    setFacilities((prev) => prev.filter((f) => f.id !== id));
    if (selectedFacilityId === id) setSelectedFacilityId(null);
    if (actingFacilityId === id) setActingFacilityId(null);
    if (facility) {
      addAuditEntry("Facility Deleted", facility.name, `Facility removed from the registry.`);
    }
    return true;
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
    setSelectedFacilityId(null);
    setFacilityViewMode("list");
  };

  const openFacilityUsage = () => {
    setFacilityViewMode("usage");
  };

  const closeDetailPanel = () => {
    setSelectedFacilityId(null);
  };

  const backToFacilitiesList = () => {
    setFacilityViewMode("list");
    setSelectedFacilityId(null);
  };

  const handleAddFacility = async (input: FacilityInput): Promise<boolean> => {
    setAddFacilityError(null);
    setIsAddingFacility(true);
    try {
      const result = await createFacility(activeSession?.token, input);
      if (result.success) {
        const facility: Facility = {
          ...result.facility,
          adminEmail: input.adminEmail || result.facility.adminEmail,
          name: input.name || result.facility.name,
          city: input.city || result.facility.city,
          region: input.region || result.facility.region,
          address: input.address || result.facility.address,
        };
        setFacilities((prev) => [facility, ...prev]);
        addAuditEntry("Facility Created", facility.name, "New facility added to the registry.");
        return true;
      }
      setAddFacilityError(result.message);
      return false;
    } catch (err) {
      setAddFacilityError(err instanceof Error ? err.message : "Failed to add facility.");
      return false;
    } finally {
      setIsAddingFacility(false);
    }
  };

  if (!isHydrated) {
    return (
      <main className="center-layout">
        <section className="surface loading-surface">
          <BlurLoader label="Loading dashboard..." />
        </section>
      </main>
    );
  }

  if (!activeSession) {
    return (
      <main className="center-layout">
        <LoginForm
          onLogin={handleLogin}
          errorMessage={loginError}
          isSubmitting={isLoggingIn}
          showLocalSkip={localBypassEnabled && forceLoginOnLocal}
          onSkipLocalLogin={() => setForceLoginOnLocal(false)}
        />
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <AdminSidebar
        username={activeSession.username}
        activeView={activeView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <section className="dashboard-main">
        {activeView === "audit" ? (
          <AuditLogPage entries={auditLog} />
        ) : activeView === "facilities" && facilityViewMode === "usage" && selectedFacility ? (
          <FacilityDashboard facility={selectedFacility} onBackToFacilities={backToFacilitiesList} />
        ) : activeView === "facilities" && selectedFacility ? (
          <FacilityDetails
            facility={selectedFacility}
            onClose={() => {
              closeDetailPanel();
              setDeleteFacilityError(null);
            }}
            onViewUsage={openFacilityUsage}
            onGenerateCode={() => {}}
            onDelete={handleDeleteFacility}
            onAddRole={() => setShowRolesPanel(true)}
            onAddStaff={() => setShowStaffPanel(true)}
            deleteError={deleteFacilityError}
            actingFacilityId={actingFacilityId}
            actingFacilityName={actingFacility?.name ?? null}
            accessToken={activeSession?.token}
          />
        ) : (
          <section className="content-area facilities-page">
            <header className="top-bar">
              <label className="top-bar-facility" htmlFor="acting-facility-select">
                <span className="top-bar-facility-label">Acting as</span>
                <PortalSelect
                  id="acting-facility-select"
                  triggerClassName="top-bar-select top-bar-facility-select"
                  value={actingFacilityId ?? ""}
                  onChange={(v) => setActingFacilityId(v.trim() || null)}
                  options={actingFacilitySelectOptions}
                  placeholder="No facility selected"
                  aria-label="Facility context for internal admin API calls"
                />
              </label>
              <label className="top-bar-search">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search facilities..."
                  aria-label="Search facilities"
                />
              </label>
              <PortalSelect
                id="facility-filter-city"
                triggerClassName="top-bar-select"
                value={filters.city}
                onChange={(v) => handleFilterChange({ city: v as FacilityFilters["city"] })}
                options={cityFilterSelectOptions}
                placeholder="All Cities"
                aria-label="Filter by city"
              />
              <PortalSelect
                id="facility-filter-region"
                triggerClassName="top-bar-select"
                value={filters.region}
                onChange={(v) => handleFilterChange({ region: v as FacilityFilters["region"] })}
                options={regionFilterSelectOptions}
                placeholder="All Regions"
                aria-label="Filter by region"
              />
              <button type="button" className="top-bar-reset" onClick={handleResetFilters}>
                Reset
              </button>
              <button
                type="button"
                className="top-bar-add btn btn-primary"
                onClick={() => setShowAddFacilityForm(true)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Facility
              </button>
            </header>

            <div className="facility-stat-cards">
              <div className="facility-stat-card">
                <span className="facility-stat-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                </span>
                <span className="facility-stat-label">Total facilities</span>
                <span className="facility-stat-value">{facilityStats.total}</span>
                <span className="facility-stat-trend">+1 from last month</span>
              </div>
              <div className="facility-stat-card">
                <span className="facility-stat-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                </span>
                <span className="facility-stat-label">Tracked cities</span>
                <span className="facility-stat-value">{facilityStats.cities}</span>
                <span className="facility-stat-trend">Active locations</span>
              </div>
              <div className="facility-stat-card">
                <span className="facility-stat-icon" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>
                </span>
                <span className="facility-stat-label">Tracked regions</span>
                <span className="facility-stat-value">{facilityStats.regions}</span>
                <span className="facility-stat-trend">Territorial coverage</span>
              </div>
              <div className="facility-stat-card">
                <span className="facility-stat-icon facility-stat-icon-muted" aria-hidden="true">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                </span>
                <span className="facility-stat-label">Pending setups</span>
                <span className="facility-stat-value">{facilityStats.pending}</span>
                <span className="facility-stat-muted">{facilityStats.pending === 0 ? "Up to date" : "Requires attention"}</span>
              </div>
            </div>

            <section className="surface section-block facilities-list-block">
              <FacilityTable
                facilities={visibleFacilities}
                selectedId={selectedFacilityId}
                onSelectFacility={(id) => {
                  setSelectedFacilityId(id);
                  setActingFacilityId(id);
                }}
              />
            </section>
          </section>
        )}
        {showRolesPanel && selectedFacility ? (
          <RolesPanel
            onClose={() => setShowRolesPanel(false)}
            facilityId={selectedFacility.id}
            facilityName={selectedFacility.name}
            accessToken={activeSession?.token}
          />
        ) : null}
        {showStaffPanel && selectedFacility ? (
          <StaffPanel
            onClose={() => setShowStaffPanel(false)}
            facilityId={selectedFacility.id}
            facilityName={selectedFacility.name}
            accessToken={activeSession?.token}
          />
        ) : null}
        {showAddFacilityForm && (
          <AddFacilityDrawer
            onClose={() => {
              setShowAddFacilityForm(false);
              setAddFacilityError(null);
            }}
            onAdd={handleAddFacility}
            isSubmitting={isAddingFacility}
            errorMessage={addFacilityError}
          />
        )}
      </section>
    </main>
  );
}
