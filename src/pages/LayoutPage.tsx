import { useCallback, useState } from "react";
import { ActivityContext } from "../context/ActivityContext";
import type { Playback } from "../lib/spotify/client";
import MusicPanel from "../components/MusicPanel";
import { Outlet, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import WorkspaceSidebar from "../components/WorkspaceSidebar";
import FloatingTimer from "../components/FloatingTimer";
import { TimerProvider } from "../context/TimerContext";
import "../timer.css";

const LayoutPage = () => {
  const { user } = useAuthStore();
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [spotifyLoaded, setSpotifyLoaded] = useState(false);
  const [musicProvider, setMusicProvider] = useState<
    "spotify" | "youtube" | "apple"
  >("spotify");
  const [spotifyOpen, setSpotifyOpen] = useState(false);
  const openSpotify = useCallback(() => setSpotifyOpen(true), []);
  const closeSpotify = useCallback(() => setSpotifyOpen(false), []);
  const timerPage = useLocation().pathname === "/timer";

  return (
    <TimerProvider key={user?.id} userId={user?.id ?? "anonymous"}>
      <ActivityContext.Provider
        value={{ playback, spotifyLoaded, openSpotify, musicProvider }}
      >
        <div className="app-layout">
          <WorkspaceSidebar />
          <div className="main-shell">
            <main className={timerPage ? "timer-workspace" : undefined}>
              <Outlet />
              <MusicPanel
                onProviderChange={setMusicProvider}
                onPlayback={setPlayback}
                onContentChange={setSpotifyLoaded}
                floatingOpen={spotifyOpen}
                closeFloating={closeSpotify}
              />
            </main>
          </div>
          <FloatingTimer />
        </div>
      </ActivityContext.Provider>
    </TimerProvider>
  );
};

export default LayoutPage;
