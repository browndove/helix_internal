"use client";

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
  return (
    <div className="filters-wrap">
      <label className="field">
        <span>City</span>
        <select
          value={filters.city}
          onChange={(event) =>
            onFilterChange({ city: event.target.value as FacilityFilters["city"] })
          }
        >
          <option value="All">All</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Region</span>
        <select
          value={filters.region}
          onChange={(event) =>
            onFilterChange({
              region: event.target.value as FacilityFilters["region"]
            })
          }
        >
          <option value="All">All</option>
          {regions.map((region) => (
            <option key={region} value={region}>
              {region}
            </option>
          ))}
        </select>
      </label>

      <button type="button" className="btn btn-secondary" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}
