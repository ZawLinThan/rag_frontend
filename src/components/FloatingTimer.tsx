import { Link, useLocation } from "react-router-dom";
import { Clock3, Pause, Play } from "lucide-react";
import { useTimer } from "../hooks/useTimer";
import { formatTimer } from "../lib/timer";

export default function FloatingTimer() {
  const { pathname } = useLocation();
  const { timer, remainingMs, pause, resume } = useTimer();
  if (pathname === "/timer" || timer.status === "idle") return null;
  return (
    <aside
      className={`floating-timer ${timer.status}`}
      aria-label="Focus timer"
    >
      <span className="floating-timer-icon">
        <Clock3 size={18} />
      </span>
      <Link to="/timer" className="floating-timer-link">
        <span>
          {timer.status === "completed"
            ? "SESSION COMPLETE"
            : timer.status === "paused"
              ? "PAUSED"
              : "FOCUS TIME"}
        </span>
        <strong>
          {timer.status === "completed"
            ? "Nice work!"
            : formatTimer(remainingMs)}
        </strong>
      </Link>
      {timer.status !== "completed" && (
        <button
          type="button"
          className="floating-timer-action"
          onClick={timer.status === "running" ? pause : resume}
          aria-label={
            timer.status === "running" ? "Pause timer" : "Resume timer"
          }
        >
          {timer.status === "running" ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </button>
      )}
      {timer.status === "completed" && (
        <span className="sr-only" role="status">
          Your focus timer is complete.
        </span>
      )}
    </aside>
  );
}
