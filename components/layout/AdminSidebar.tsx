"use client";

import { useState, useRef, useEffect } from "react";

interface AdminSidebarProps {
  username: string;
  activeView: string;
  onNavigate: (view: string) => void;
  onLogout: () => void;
}

const navigationItems = [
  { label: "Facilities", view: "facilities" },
  { label: "Audit Log", view: "audit" }
];

function getInitial(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  const first = trimmed[0];
  const isEmail = trimmed.includes("@");
  if (isEmail) return first.toUpperCase();
  const parts = trimmed.split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase().slice(0, 2);
  }
  return first.toUpperCase();
}

export function AdminSidebar({
  username,
  activeView,
  onNavigate,
  onLogout
}: AdminSidebarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setProfileOpen(false);
      }
    }
    if (profileOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [profileOpen]);

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

      <nav className="sidebar-nav-wrap">
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

      <div className="sidebar-session" ref={profileRef}>
        <button
          type="button"
          className="sidebar-profile-btn"
          onClick={() => setProfileOpen((open) => !open)}
          aria-expanded={profileOpen}
          aria-haspopup="true"
          aria-label="Profile menu"
        >
          <span className="sidebar-profile-initial" aria-hidden="true">
            {getInitial(username)}
          </span>
        </button>
        {profileOpen && (
          <div className="sidebar-profile-dropdown" role="menu">
            <div className="sidebar-profile-dropdown-email">{username}</div>
            <button
              type="button"
              className="sidebar-profile-dropdown-logout"
              onClick={() => {
                setProfileOpen(false);
                onLogout();
              }}
              role="menuitem"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
