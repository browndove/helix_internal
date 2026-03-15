import React from "react";
import { Facility } from "@/lib/types";

interface FacilityTableProps {
  facilities: Facility[];
  selectedId?: string | null;
  onSelectFacility: (id: string) => void;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export function FacilityTable({ facilities, selectedId, onSelectFacility }: FacilityTableProps) {
  if (facilities.length === 0) {
    return (
      <div className="empty-state">
        <p>No facilities found for the selected filters.</p>
      </div>
    );
  }

  const total = facilities.length;
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [page, setPage] = React.useState(1);
  React.useEffect(() => {
    setPage((p) => (p > totalPages ? totalPages : p));
  }, [totalPages]);
  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, total);
  const pageFacilities = facilities.slice(start, end);

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>CODE</th>
            <th>FACILITY NAME</th>
            <th>ADMIN EMAIL</th>
            <th>CITY</th>
            <th>USERS</th>
            <th>DATE CREATED</th>
            <th className="th-actions">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {pageFacilities.map((facility) => (
            <tr
              key={facility.id}
              className={`clickable-row ${selectedId === facility.id ? "row-active" : ""}`}
              onClick={() => onSelectFacility(facility.id)}
            >
              <td>
                {facility.code ? (
                  <span className="facility-code-badge">{facility.code}</span>
                ) : (
                  <span className="facility-code-pending">Pending</span>
                )}
              </td>
              <td className="td-facility-name">{facility.name}</td>
              <td>{facility.adminEmail || "—"}</td>
              <td>{facility.city || "—"}</td>
              <td>{facility.userCount}</td>
              <td>{formatDate(facility.createdAt)}</td>
              <td className="td-actions">
                <button
                  type="button"
                  className="table-edit-link"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFacility(facility.id);
                  }}
                >
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="table-pagination">
        <span className="table-pagination-info">
          Showing {total === 0 ? 0 : start + 1} to {end} of {total} entries
        </span>
        <div className="table-pagination-controls">
          <button
            type="button"
            className="table-pagination-btn"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              type="button"
              className={`table-pagination-btn ${n === page ? "active" : ""}`}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            type="button"
            className="table-pagination-btn"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
