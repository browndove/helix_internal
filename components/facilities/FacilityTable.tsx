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

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Name</th>
            <th>Admin Email</th>
            <th>City</th>
            <th>Region</th>
            <th>Users</th>
            <th>Address</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {facilities.map((facility) => (
            <tr
              key={facility.id}
              className={`clickable-row ${selectedId === facility.id ? 'row-active' : ''}`}
              onClick={() => onSelectFacility(facility.id)}
            >
              <td>{facility.code ?? "Pending"}</td>
              <td>{facility.name}</td>
              <td>{facility.adminEmail}</td>
              <td>{facility.city}</td>
              <td>{facility.region}</td>
              <td>
                <span className="user-count-cell">{facility.userCount}</span>
              </td>
              <td>{facility.address}</td>
              <td>{formatDate(facility.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
