import { NavLink, Outlet, Link } from "react-router-dom";
import {
  LayoutDashboard,
  Library,
  Files,
  Sparkles,
  Layers,
  ListChecks,
  Settings,
  Timer,
} from "lucide-react";

import { useAuthStore } from "../stores/authStore";
import { getNameInitials } from "../lib/utils";
import Brand from "../components/Brand";
import FloatingTimer from "../components/FloatingTimer";
import { TimerProvider } from "../context/TimerContext";
import "../timer.css";

const navigation = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/courses", label: "My courses", icon: Library },
  { to: "/documents", label: "My documents", icon: Files },
  { to: "/chat", label: "Study assistant", icon: Sparkles },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/tests", label: "Tests", icon: ListChecks },
  { to: "/timer", label: "Focus timer", icon: Timer },
];

const LayoutPage = () => {
  const { user } = useAuthStore();

  return (
    <TimerProvider key={user?.id} userId={user?.id ?? "anonymous"}>
      <div className="app-layout">
        <aside className="sidebar">
          <Brand />
          <div className="workspace-label">PERSONAL WORKSPACE</div>
          <nav>
            {navigation.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                className={({ isActive }) =>
                  `nav-item ${isActive ? "active" : ""}`
                }
              >
                <Icon size={19} />
                {label}
                {to === "/chat" && <span className="new-tag">AI</span>}
              </NavLink>
            ))}
          </nav>

          <NavLink className="nav-item" to="/settings">
            <Settings size={19} />
            Settings
          </NavLink>
          <Link className="profile" to="/settings">
            <span className="avatar">
              {" "}
              {getNameInitials(
                user?.user_metadata.full_name || user?.email || "Student",
              )}
            </span>
            <span>
              <strong> {user?.user_metadata.full_name || "Student"}</strong>
              <small> {user?.email} </small>
            </span>
          </Link>
        </aside>
        <div className="main-shell">
          <main>
            <Outlet />
          </main>
        </div>
        <FloatingTimer />
      </div>
    </TimerProvider>
  );
};

export default LayoutPage;
