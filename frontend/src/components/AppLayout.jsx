import { motion } from "motion/react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";
import { DataProvider, useData } from "../DataContext";
import { Icon } from "../Icons";
import Logo from "../Logo";
import { useTheme } from "../ThemeContext";

function Shell() {
  const { user, logout } = useAuth();
  const { loading, error } = useData();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const routeName =
    location.pathname === "/" ? "home" : location.pathname.slice(1);

  const isDark = theme === "dark";
  const themeIcon = isDark ? "sun" : "moon";
  const themeLabel = isDark ? "Light mode" : "Dark mode";

  return (
    <div className="app">
      <aside className="sidebar">
        <Logo />

        <nav className="nav" aria-label="Main">
          <NavLink to="/" end className="nav-link">
            <Icon name="home" />
            <span>Home</span>
          </NavLink>
          <NavLink to="/history" className="nav-link">
            <Icon name="history" />
            <span>History</span>
          </NavLink>
          <NavLink to="/log" className="nav-link nav-log">
            <Icon name="plus" />
            <span>Log workout</span>
          </NavLink>
          <NavLink to="/progress" className="nav-link">
            <Icon name="chart" />
            <span>Progress</span>
          </NavLink>
          <NavLink to="/coach" className="nav-link">
            <Icon name="sparkles" />
            <span>Coach</span>
          </NavLink>
        </nav>

        <div className="sidebar-user">
          <span className="muted" title={user.email}>
            {user.email}
          </span>
          <button className="ghost" onClick={toggle}>
            <Icon name={themeIcon} size={18} />
            {themeLabel}
          </button>
          <button className="ghost" onClick={logout}>
            <Icon name="logout" size={18} />
            Log out
          </button>
        </div>
      </aside>

      <div className="main">
        <header className="mobile-top">
          <Logo />
          <div className="mobile-actions">
            <button
              className="ghost square"
              onClick={toggle}
              aria-label={themeLabel}
            >
              <Icon name={themeIcon} />
            </button>
            <button
              className="ghost square"
              onClick={logout}
              aria-label="Log out"
            >
              <Icon name="logout" />
            </button>
          </div>
        </header>

        <main className="page">
          {error && <div className="banner banner-error">{error}</div>}
          {loading ? (
            <p className="muted">Loading...</p>
          ) : (
            <motion.div
              className={`route route-${routeName}`}
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <Outlet />
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout() {
  return (
    <DataProvider>
      <Shell />
    </DataProvider>
  );
}