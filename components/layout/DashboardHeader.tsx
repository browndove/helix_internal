interface DashboardHeaderProps {
  username: string;
  facilityCount: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onLogout: () => void;
}

export function DashboardHeader({
  username,
  facilityCount,
  searchValue,
  onSearchChange,
  onLogout
}: DashboardHeaderProps) {
  return (
    <header className="dashboard-header">
      <div className="header-copy">
        <h1>Dashboard</h1>
        <p>{facilityCount} facilities in the internal registry.</p>
      </div>

      <div className="header-actions">
        <label className="toolbar-search">
          <input
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search facilities, code, region"
          />
        </label>
        <span className="signed-in-user">{username}</span>
        <button type="button" className="btn btn-secondary" onClick={onLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}
