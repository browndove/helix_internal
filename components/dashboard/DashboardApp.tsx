"use client";

import { useMemo, useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BlurLoader } from "@/components/common/BlurLoader";
import { FacilityFiltersBar } from "@/components/facilities/FacilityFilters";
import { FacilityForm } from "@/components/facilities/FacilityForm";
import { FacilityTable } from "@/components/facilities/FacilityTable";
import { FacilityDashboard } from "@/components/facilities/FacilityDashboard";
import { AuditLogPage } from "@/components/audit/AuditLogPage";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { loginAdmin } from "@/lib/auth";
import {
  SEED_FACILITIES,
  SEED_AUDIT_LOG
} from "@/lib/constants";
import {
  DEFAULT_FACILITY_FILTERS,
  FacilityFilters,
  filterFacilities
} from "@/lib/facilities";
import { fetchAuditLogs } from "@/lib/audit";
import { createFacility, fetchFacilities } from "@/lib/facilitiesApi";
import { Facility, FacilityInput, UserSession, AuditLogEntry } from "@/lib/types";
import { useStoredState } from "@/hooks/useStoredState";

const SESSION_STORAGE_KEY = "internal.facilities.session.v1";
const FACILITIES_STORAGE_KEY = "internal.facilities.list.v3";
const AUDIT_LOG_STORAGE_KEY = "internal.audit.log.v1";

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
  const [filters, setFilters] = useState<FacilityFilters>(DEFAULT_FACILITY_FILTERS);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<string>("facilities");
  const [addFacilityError, setAddFacilityError] = useState<string | null>(null);
  const [addFacilityLoading, setAddFacilityLoading] = useState(false);

  const selectedFacility = useMemo(
    () => facilities.find((f) => f.id === selectedFacilityId) ?? null,
    [facilities, selectedFacilityId]
  );

  const isHydrated = sessionReady && facilitiesReady && auditReady;

  const visibleFacilities = useMemo(
    () => filterFacilities(facilities, filters),
    [facilities, filters]
  );

  useEffect(() => {
    if (session?.token) {
      fetchAuditLogs(session.token).then((logs) => {
        if (logs.length > 0) {
          setAuditLog(logs);
        }
      });
    }
  }, [session, setAuditLog]);

  useEffect(() => {
    if (!isHydrated || activeView !== "facilities") return;
    fetchFacilities().then((list) => {
      if (list.length > 0) {
        setFacilities(list);
      }
    });
  }, [isHydrated, activeView, setFacilities]);

  const cityOptions = useMemo(
    () =>
      Array.from(new Set(facilities.map((facility) => facility.city)))
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right)),
    [facilities]
  );

  const regionOptions = useMemo(
    () =>
      Array.from(new Set(facilities.map((facility) => facility.region)))
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right)),
    [facilities]
  );

  const addAuditEntry = (action: string, target: string, details?: string) => {
    const entry: AuditLogEntry = {
      id: createId(),
      timestamp: new Date().toISOString(),
      action,
      actor: session?.username ?? "system",
      target,
      details
    };
    setAuditLog((prev) => [entry, ...prev]);
  };

  const handleFilterChange = (nextFilterValues: Partial<FacilityFilters>) => {
    setFilters((previousFilters) => ({ ...previousFilters, ...nextFilterValues }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FACILITY_FILTERS);
  };

  const handleLogin = async (email: string, password: string) => {
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const authResult = await loginAdmin(email, password);
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
  };

  const handleAddFacility = async (facilityInput: FacilityInput): Promise<boolean> => {
    setAddFacilityError(null);
    setAddFacilityLoading(true);
    try {
      const result = await createFacility(session?.token, facilityInput);
      if (result.success) {
        setFacilities((prev) => [result.facility, ...prev]);
        addAuditEntry(
          "Facility Created",
          result.facility.name,
          `New facility registered in the ${result.facility.region}.`
        );
        return true;
      }
      setAddFacilityError(result.message);
      return false;
    } finally {
      setAddFacilityLoading(false);
    }
  };

  const handleDeleteFacility = (id: string) => {
    const facility = facilities.find((f) => f.id === id);
    setFacilities((prev) => prev.filter((f) => f.id !== id));
    if (selectedFacilityId === id) setSelectedFacilityId(null);
    if (facility) {
      addAuditEntry("Facility Deleted", facility.name, `Facility removed from the registry.`);
    }
  };

  const handleNavigate = (view: string) => {
    setActiveView(view);
    setSelectedFacilityId(null);
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

  if (!session) {
    return (
      <main className="center-layout">
        <LoginForm
          onLogin={handleLogin}
          errorMessage={loginError}
          isSubmitting={isLoggingIn}
        />
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <AdminSidebar
        username={session.username}
        activeView={activeView}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      />
      <section className="dashboard-main">
        {activeView === "audit" ? (
          <AuditLogPage entries={auditLog} />
        ) : selectedFacility ? (
          <FacilityDashboard facility={selectedFacility} />
        ) : (
          <section className="content-area facilities-page">
            <header className="facilities-top-bar">
              <div className="facilities-top-bar-title">
                <h1 className="facilities-page-title">Facilities</h1>
                <p className="facilities-page-subtitle">
                  Showing {visibleFacilities.length} of {facilities.length} registered facilities
                </p>
              </div>
              <div className="facilities-top-bar-filters">
                <FacilityFiltersBar
                  filters={filters}
                  cities={cityOptions}
                  regions={regionOptions}
                  onFilterChange={handleFilterChange}
                  onReset={handleResetFilters}
                />
              </div>
            </header>

            <section className="surface section-block facilities-list-block">
              <FacilityTable
                facilities={visibleFacilities}
                selectedId={selectedFacilityId}
                onSelectFacility={setSelectedFacilityId}
              />
            </section>

            <section className="fd-add-facility-row">
              <section className="surface section-block add-facility-block">
                <h2>Add Facility</h2>
                <p className="section-note">Facility code is generated by backend.</p>
                <FacilityForm
                  onAddFacility={handleAddFacility}
                  isSubmitting={addFacilityLoading}
                  errorMessage={addFacilityError}
                />
              </section>

              <section className="surface section-block registry-snapshot-block">
                <h2>Registry Snapshot</h2>
                <ul className="summary-list">
                  <li>
                    <span>Total facilities</span>
                    <strong>{facilities.length}</strong>
                  </li>
                  <li>
                    <span>Tracked cities</span>
                    <strong>{cityOptions.length}</strong>
                  </li>
                  <li>
                    <span>Tracked regions</span>
                    <strong>{regionOptions.length}</strong>
                  </li>
                  <li>
                    <span>Pending account setups</span>
                    <strong>{facilities.filter((facility) => !facility.code).length}</strong>
                  </li>
                </ul>
              </section>
            </section>
          </section>
        )}
      </section>
    </main>
  );
}
