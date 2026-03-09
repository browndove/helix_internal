"use client";

import { useMemo, useState } from "react";
import { LoginForm } from "@/components/auth/LoginForm";
import { BlurLoader } from "@/components/common/BlurLoader";
import { FacilityFiltersBar } from "@/components/facilities/FacilityFilters";
import { FacilityForm } from "@/components/facilities/FacilityForm";
import { FacilityTable } from "@/components/facilities/FacilityTable";
import { FacilityDetails } from "@/components/facilities/FacilityDetails";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import {
  ADMIN_LOGIN_PASSWORD,
  ADMIN_LOGIN_USERNAME,
  SEED_FACILITIES
} from "@/lib/constants";
import {
  DEFAULT_FACILITY_FILTERS,
  FacilityFilters,
  filterFacilities
} from "@/lib/facilities";
import { Facility, FacilityInput, UserSession } from "@/lib/types";
import { useStoredState } from "@/hooks/useStoredState";

const SESSION_STORAGE_KEY = "internal.facilities.session.v1";
const FACILITIES_STORAGE_KEY = "internal.facilities.list.v2";

function createFacilityId(): string {
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
  const [filters, setFilters] = useState<FacilityFilters>(DEFAULT_FACILITY_FILTERS);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  const selectedFacility = useMemo(
    () => facilities.find((f) => f.id === selectedFacilityId) ?? null,
    [facilities, selectedFacilityId]
  );

  const isHydrated = sessionReady && facilitiesReady;

  const visibleFacilities = useMemo(
    () => filterFacilities(facilities, filters),
    [facilities, filters]
  );

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

  const handleFilterChange = (nextFilterValues: Partial<FacilityFilters>) => {
    setFilters((previousFilters) => ({ ...previousFilters, ...nextFilterValues }));
  };

  const handleResetFilters = () => {
    setFilters(DEFAULT_FACILITY_FILTERS);
  };

  const handleLogin = (username: string, password: string) => {
    const normalizedUsername = username.trim();

    if (
      normalizedUsername !== ADMIN_LOGIN_USERNAME ||
      password !== ADMIN_LOGIN_PASSWORD
    ) {
      setLoginError("Invalid credentials.");
      return;
    }

    setLoginError(null);
    setSession({
      username: normalizedUsername,
      loggedInAt: new Date().toISOString()
    });
  };

  const handleLogout = () => {
    setSession(null);
    setFilters(DEFAULT_FACILITY_FILTERS);
  };

  const handleAddFacility = (facilityInput: FacilityInput) => {
    const newFacility: Facility = {
      id: createFacilityId(),
      createdAt: new Date().toISOString(),
      ...facilityInput
    };

    setFacilities((previousFacilities) => [newFacility, ...previousFacilities]);
  };

  const handleDeleteFacility = (id: string) => {
    setFacilities((prev) => prev.filter(f => f.id !== id));
    if (selectedFacilityId === id) setSelectedFacilityId(null);
  };

  const handleGenerateCode = (id: string) => {
    setFacilities((prev) => prev.map(f => {
      if (f.id === id) {
        return { ...f, code: `FAC-${Math.floor(1000 + Math.random() * 9000).toString()}` };
      }
      return f;
    }));
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
        <LoginForm onLogin={handleLogin} errorMessage={loginError} />
      </main>
    );
  }

  return (
    <main className="dashboard-shell">
      <AdminSidebar />
      <section className="dashboard-main">
        <DashboardHeader
          username={session.username}
          facilityCount={facilities.length}
          searchValue={filters.search}
          onSearchChange={(value) => handleFilterChange({ search: value })}
          onLogout={handleLogout}
        />

        <section className="content-grid">
          <section className="content-main">
            <section className="surface section-block">
              <div className="section-title-row">
                <h2>Facilities</h2>
                <p className="meta-text">
                  Showing {visibleFacilities.length} of {facilities.length}
                </p>
              </div>

              <FacilityFiltersBar
                filters={filters}
                cities={cityOptions}
                regions={regionOptions}
                onFilterChange={handleFilterChange}
                onReset={handleResetFilters}
              />
              <FacilityTable
                facilities={visibleFacilities}
                selectedId={selectedFacilityId}
                onSelectFacility={setSelectedFacilityId}
              />
            </section>
          </section>

          <aside className="content-side">
            {selectedFacility ? (
              <FacilityDetails
                facility={selectedFacility}
                onClose={() => setSelectedFacilityId(null)}
                onGenerateCode={handleGenerateCode}
                onDelete={handleDeleteFacility}
              />
            ) : (
              <>
                <section className="surface section-block">
                  <h2>Add Facility</h2>
                  <p className="section-note">Facility code is generated by backend.</p>
                  <FacilityForm onAddFacility={handleAddFacility} />
                </section>

                <section className="surface section-block">
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
              </>
            )}
          </aside>
        </section>
      </section>
    </main>
  );
}
