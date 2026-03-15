"use client";

import { useMemo, useState, useEffect } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BlurLoader } from "@/components/common/BlurLoader";
import { FacilityTable } from "@/components/facilities/FacilityTable";
import { FacilityDashboard } from "@/components/facilities/FacilityDashboard";
import { FacilityDetails } from "@/components/facilities/FacilityDetails";
import { AuditLogPage } from "@/components/audit/AuditLogPage";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { loginAdmin } from "@/lib/auth";
import {
  SEED_FACILITIES,
  SEED_AUDIT_LOG
} from "@/lib/constants";
import { DEFAULT_FACILITY_FILTERS, FacilityFilters, filterFacilities } from "@/lib/facilities";
import { fetchAuditLogs } from "@/lib/audit";
import { fetchFacilities } from "@/lib/facilitiesApi";
import { Facility, UserSession, AuditLogEntry } from "@/lib/types";
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
  const [facilityViewMode, setFacilityViewMode] = useState<"list" | "usage">("list");
  const [activeView, setActiveView] = useState<string>("facilities");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedFacility = useMemo(
    () => facilities.find((f) => f.id === selectedFacilityId) ?? null,
    [facilities, selectedFacilityId]
  );

  const isHydrated = sessionReady && facilitiesReady && auditReady;

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
        ) : activeView === "facilities" && facilityViewMode === "usage" && selectedFacility ? (
          <FacilityDashboard facility={selectedFacility} onBackToFacilities={backToFacilitiesList} />
        ) : (
          <section className="content-area facilities-page">
            <header className="top-bar">
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
              <select
                className="top-bar-select"
                value={filters.city}
                onChange={(e) => handleFilterChange({ city: e.target.value as FacilityFilters["city"] })}
                aria-label="Filter by city"
              >
                <option value="All">All Cities</option>
                {cityOptions.map((city) => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <select
                className="top-bar-select"
                value={filters.region}
                onChange={(e) => handleFilterChange({ region: e.target.value as FacilityFilters["region"] })}
                aria-label="Filter by region"
              >
                <option value="All">All Regions</option>
                {regionOptions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <button type="button" className="top-bar-reset" onClick={handleResetFilters}>
                Reset
              </button>
              <button type="button" className="top-bar-add btn btn-primary">
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
                onSelectFacility={setSelectedFacilityId}
              />
            </section>
          </section>
        )}
        {activeView === "facilities" && facilityViewMode === "list" && selectedFacility && (
          <div className="facility-detail-drawer">
            <FacilityDetails
              facility={selectedFacility}
              onClose={closeDetailPanel}
              onViewUsage={openFacilityUsage}
              onGenerateCode={() => {}}
              onDelete={handleDeleteFacility}
            />
          </div>
        )}
      </section>
    </main>
  );
}
