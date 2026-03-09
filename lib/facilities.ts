import { Facility } from "@/lib/types";

export interface FacilityFilters {
  search: string;
  city: "All" | string;
  region: "All" | string;
}

export const DEFAULT_FACILITY_FILTERS: FacilityFilters = {
  search: "",
  city: "All",
  region: "All"
};

export function filterFacilities(
  facilities: Facility[],
  filters: FacilityFilters
): Facility[] {
  const searchQuery = filters.search.trim().toLowerCase();

  return facilities.filter((facility) => {
    const matchesSearch =
      searchQuery.length === 0 ||
      facility.name.toLowerCase().includes(searchQuery) ||
      facility.adminEmail.toLowerCase().includes(searchQuery) ||
      (facility.code ?? "").toLowerCase().includes(searchQuery) ||
      facility.address.toLowerCase().includes(searchQuery) ||
      facility.city.toLowerCase().includes(searchQuery) ||
      facility.region.toLowerCase().includes(searchQuery);

    const matchesCity =
      filters.city === "All" || facility.city.toLowerCase() === filters.city.toLowerCase();
    const matchesRegion =
      filters.region === "All" ||
      facility.region.toLowerCase() === filters.region.toLowerCase();

    return matchesSearch && matchesCity && matchesRegion;
  });
}
