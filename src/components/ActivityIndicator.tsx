import { useState } from "react";
import { Music2 } from "lucide-react";
import { useTimer } from "../hooks/useTimer";
import { formatTimer } from "../lib/timer";
import type { Playback } from "../lib/spotify/client";
function SpotifyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="21" height="21" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="currentColor" />
      <path
        d="M6.2 9.2c4-1.2 8.5-.8 11.8 1.2M6.9 12.3c3.4-1 7.3-.6 10.2 1.1M7.5 15.2c2.9-.8 5.8-.5 8.3.9"
        fill="none"
        stroke="var(--surface)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
export default function ActivityIndicator({
  playback,
  musicProvider,
  spotifyLoaded,
  openSpotify,
}: {
  playback: Playback | null;
  musicProvider: "spotify" | "youtube" | "apple";
  spotifyLoaded: boolean;
  openSpotify: () => void;
}) {
  const { timer, remainingMs, setFloatingHidden } = useTimer();
  const [open, setOpen] = useState(false);
  const timerActive = timer.status !== "idle";
  const spotifyActive = Boolean(
    (musicProvider === "spotify" && playback?.item) || spotifyLoaded,
  );
  const musicName = {
    spotify: "Spotify",
    youtube: "YouTube Music",
    apple: "Apple Music",
  }[musicProvider];
  const icon =
    musicProvider === "spotify" ? <SpotifyIcon /> : <Music2 size={21} />;
  if (!timerActive && !spotifyActive) return null;
  const fraction = timer.durationMs
    ? Math.max(0, Math.min(1, remainingMs / timer.durationMs))
    : 0;
  return (
    <div
      className="activity-indicator"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className="activity-trigger"
        aria-label="Active tools"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        {timerActive ? (
          <span
            className="activity-countdown"
            aria-label={`${formatTimer(remainingMs)} remaining`}
          >
            <svg viewBox="0 0 36 36" aria-hidden="true">
              <circle cx="18" cy="18" r="15" className="activity-ring-track" />
              <circle
                cx="18"
                cy="18"
                r="15"
                className="activity-ring-progress"
                strokeDasharray={`${fraction * 94.25} 94.25`}
              />
            </svg>
            <span>{Math.ceil(remainingMs / 60000)}</span>
          </span>
        ) : (
          icon
        )}
        {timerActive && spotifyActive && (
          <span className="activity-spotify-dot">{icon}</span>
        )}
      </button>
      {open && (
        <div className="activity-menu" aria-label="Active tools">
          <span className="activity-menu-label">ACTIVE TOOLS</span>
          {timerActive && (
            <button
              type="button"
              onClick={() => {
                setFloatingHidden(false);
                setOpen(false);
              }}
            >
              <span className="activity-menu-symbol">◷</span>
              <span>
                <strong>Focus timer</strong>
                <small>
                  {timer.status === "completed"
                    ? "Complete"
                    : `${formatTimer(remainingMs)} · ${timer.status}`}
                </small>
              </span>
            </button>
          )}
          {spotifyActive && (
            <button
              type="button"
              onClick={() => {
                openSpotify();
                setOpen(false);
              }}
            >
              <span className="activity-menu-symbol spotify-symbol">
                {icon}
              </span>
              <span>
                <strong>{musicName}</strong>
                <small>{playback?.item?.name || `${musicName} player`}</small>
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
