"use client";

interface AdminSidebarProps {
  activeView: string;
  onNavigate: (view: string) => void;
}

const navigationItems = [
  { label: "Facilities", view: "facilities" },
  { label: "Audit Log", view: "audit" }
];

export function AdminSidebar({ activeView, onNavigate }: AdminSidebarProps) {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-brand">
        <div className="brand-mark" aria-hidden="true">
          BS
        </div>
        <div className="brand-copy">
          <p>blvcksapphire</p>
          <span>operations admin</span>
        </div>
      </div>

      <nav>
        <ul className="sidebar-nav">
          {navigationItems.map((item) => (
            <li key={item.label}>
              <button
                type="button"
                className={activeView === item.view ? "nav-item nav-item-active" : "nav-item"}
                onClick={() => onNavigate(item.view)}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

