import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
  Zap, LayoutDashboard, Search, FileText, Clock,
  Settings, LogOut, ChevronRight, Sun, Moon,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";

const NAV = [
  { href: "/app/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/app/scan",      icon: Search,          label: "New Scan" },
  { href: "/app/analyze",   icon: FileText,         label: "Analyze Job" },
  { href: "/app/history",   icon: Clock,            label: "History" },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, profile, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const initials = (profile?.display_name || user?.email || "U")
    .split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ justifyContent: "space-between" }}>
          <Link href="/app/dashboard" style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="sidebar-logo-icon">
              <Zap size={15} color="#fff" />
            </div>
            <span className="sidebar-wordmark">
              STRIKE<span className="sidebar-accent">BASE</span>
            </span>
          </Link>
          <button
            onClick={toggle}
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            style={{ background: "none", border: "1px solid var(--border)", borderRadius: "var(--radius)", padding: "5px", cursor: "pointer", color: "var(--text-3)", display: "flex", alignItems: "center", transition: "var(--tr-fast)", flexShrink: 0 }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--text-1)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-3)")}
          >
            {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-section-label">Workspace</p>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = router.pathname === href;
            return (
              <Link key={href} href={href} className={`nav-link${active ? " active" : ""}`}>
                <Icon size={15} className="nav-link-icon" />
                {label}
                {active && <ChevronRight size={12} style={{ marginLeft: "auto", opacity: 0.5 }} />}
              </Link>
            );
          })}

          <p className="nav-section-label" style={{ marginTop: 12 }}>Account</p>
          <Link href="/app/settings" className={`nav-link${router.pathname === "/app/settings" ? " active" : ""}`}>
            <Settings size={15} className="nav-link-icon" />
            Settings
          </Link>
        </nav>

        <div className="sidebar-bottom">
          <div className="user-chip" onClick={handleLogout} title="Sign out">
            <div className="user-avatar">{initials}</div>
            <div className="user-info">
              <p className="user-name">{profile?.display_name || user?.email?.split("@")[0] || "User"}</p>
              <p className="user-email">{user?.email || ""}</p>
            </div>
            <LogOut size={13} color="var(--text-3)" style={{ flexShrink: 0, marginLeft: "auto" }} />
          </div>
        </div>
      </aside>

      <main className="app-content">
        {children}
      </main>
    </div>
  );
}
