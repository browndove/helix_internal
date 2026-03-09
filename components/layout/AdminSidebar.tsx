import Link from "next/link";

const navigationItems = [{ label: "Facilities", href: "/dashboard", isActive: true }];

export function AdminSidebar() {
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
              <Link
                href={item.href}
                className={item.isActive ? "nav-item nav-item-active" : "nav-item"}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
