"use client";

import { useMemo } from "react";
import { PortalSelect } from "@/components/ui/PortalSelect";
import { FacilityFilters } from "@/lib/facilities";

interface FacilityFiltersBarProps {
  filters: FacilityFilters;
  cities: string[];
  regions: string[];
  onFilterChange: (nextFilterValues: Partial<FacilityFilters>) => void;
  onReset: () => void;
}

export function FacilityFiltersBar({
  filters,
  cities,
  regions,
  onFilterChange,
  onReset
}: FacilityFiltersBarProps) {
  const cityOptions = useMemo(
    () => [
      { value: "All", label: "All" },
      ...cities.map((city) => ({ value: city, label: city })),
    ],
    [cities]
  );
  const regionOptionsSelect = useMemo(
    () => [
      { value: "All", label: "All" },
      ...regions.map((region) => ({ value: region, label: region })),
    ],
    [regions]
  );

  return (
    <div className="filters-wrap">
      <label className="field">
        <span>City</span>
        <PortalSelect
          value={filters.city}
          onChange={(v) => onFilterChange({ city: v as FacilityFilters["city"] })}
          options={cityOptions}
          placeholder="All"
          triggerClassName="portal-select-trigger filters-bar-select"
        />
      </label>

      <label className="field">
        <span>Region</span>
        <PortalSelect
          value={filters.region}
          onChange={(v) =>
            onFilterChange({
              region: v as FacilityFilters["region"],
            })
          }
          options={regionOptionsSelect}
          placeholder="All"
          triggerClassName="portal-select-trigger filters-bar-select"
        />
      </label>

      <button type="button" className="btn btn-secondary" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
