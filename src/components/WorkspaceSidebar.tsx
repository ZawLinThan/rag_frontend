import { NavLink, Link } from "react-router-dom";
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
import Brand from "./Brand";

const navigation = [
  { to: "/", label: "Overview", icon: LayoutDashboard },
  { to: "/courses", label: "My courses", icon: Library },
  { to: "/documents", label: "My documents", icon: Files },
  { to: "/chat", label: "Study assistant", icon: Sparkles },
  { to: "/timer", label: "Focus timer", icon: Timer },
  { to: "/flashcards", label: "Flashcards", icon: Layers },
  { to: "/tests", label: "Tests", icon: ListChecks },
];

export default function WorkspaceSidebar({
  loading = false,
}: {
  loading?: boolean;
}) {
  const { user } = useAuthStore();
  return (
    <aside className="sidebar">
      <Brand />
      <div className="workspace-label">PERSONAL WORKSPACE</div>
      <nav>
        {navigation.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
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
        <span className={loading ? "avatar skeleton sk-ui-icon" : "avatar"}>
          {" "}
          {getNameInitials(
            user?.user_metadata.full_name || user?.email || "Student",
          )}
        </span>
        <span>
          <strong className={loading ? "skeleton sk-text" : undefined}>
            {user?.user_metadata.full_name || "Student"}
          </strong>
          <small> {user?.email} </small>
        </span>
      </Link>
    </aside>
  );
}
