import { useLocation } from "react-router-dom";
import { useEffect, useState, useSyncExternalStore } from "react";
import { ExternalLink, Headphones, Link2, Music2, Unplug } from "lucide-react";
import { spotify } from "../lib/spotify";
import {
  SpotifyError,
  spotifyContent,
  type Playback,
} from "../lib/spotify/client";

export default function SpotifyPanel({
  onPlayback,
  onContentChange,
  floatingOpen,
  closeFloating,
  selector,
}: {
  onContentChange: (loaded: boolean) => void;
  onPlayback: (playback: Playback | null) => void;
  floatingOpen: boolean;
  closeFloating: () => void;
  selector: React.ReactNode;
}) {
  const floating = useLocation().pathname !== "/timer";
  const connected = useSyncExternalStore(spotify.subscribe, spotify.connected);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [message, setMessage] = useState("");
  const [retry, setRetry] = useState(0);
  const [connecting, setConnecting] = useState(false);
  const [link, setLink] = useState("");
  const [content, setContent] =
    useState<ReturnType<typeof spotifyContent>>(null);
  const [linkError, setLinkError] = useState("");
  useEffect(() => {
    onContentChange(Boolean(content));
  }, [content, onContentChange]);
  useEffect(() => {
    if (!connected) return;
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout>;
    let stopped = false;
    const check = async () => {
      let delay = 10000;
      if (!document.hidden) {
        try {
          const next = await spotify.currentlyPlaying(controller.signal);
          if (!stopped) {
            setPlayback(next);
            onPlayback(next);
            setMessage("");
          }
        } catch (error) {
          if (stopped) return;
          setPlayback(null);
          onPlayback(null);
          setMessage(
            error instanceof Error
              ? error.message
              : "Could not reach Spotify. Check your connection.",
          );
          if (error instanceof SpotifyError) {
            if (error.status === 403 || error.status === 401) return;
            delay = Math.max(delay, error.retryAt - Date.now());
          }
        }
      }
      if (!stopped) timeout = setTimeout(() => void check(), delay);
    };
    void check();
    return () => {
      stopped = true;
      controller.abort();
      clearTimeout(timeout);
    };
  }, [connected, retry, onPlayback]);
  const item = connected ? playback?.item : null;
  const current = item ? spotifyContent(item.uri) : null;
  const embed = content
    ? `https://open.spotify.com/embed/${content.type}/${content.id}`
    : null;
  return (
    <>
      <section
        className={`spotify-panel ${floating && floatingOpen && (item || embed) ? "spotify-floating spotify-embed-only" : ""}`}
        aria-label={floating ? "Spotify player" : undefined}
        aria-labelledby={floating ? undefined : "spotify-heading"}
        style={
          floating && !(floatingOpen && (item || embed))
            ? { display: "none" }
            : undefined
        }
      >
        {floating && floatingOpen && (item || embed) && (
          <div
            className={`spotify-floating-controls ${embed ? "has-embed" : ""}`}
          >
            {item && (
              <div className="spotify-current-copy">
                <span className="timer-eyebrow">
                  {playback?.is_playing ? "NOW PLAYING" : "SPOTIFY PLAYBACK"}
                </span>
                <strong>{item.name}</strong>
                <span>
                  {item.artists?.map((artist) => artist.name).join(", ") ||
                    "Spotify audio"}
                </span>
                {!embed && current && (
                  <button
                    type="button"
                    className="text-link"
                    onClick={() => setContent(current)}
                  >
                    Load in player
                  </button>
                )}
              </div>
            )}
            <button
              type="button"
              className="floating-timer-close"
              onClick={closeFloating}
              aria-label="Close Spotify player"
            >
              ×
            </button>
          </div>
        )}
        {selector}
        <div className="spotify-heading">
          <div>
            <span className="timer-eyebrow">A SOUNDTRACK FOR YOUR SESSION</span>
            <h2 id="spotify-heading">
              <Music2 size={22} /> Spotify
            </h2>
          </div>
          <a
            className="text-link"
            href="https://open.spotify.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open Spotify <ExternalLink size={14} />
          </a>
        </div>
        <p className="spotify-intro">
          Set the mood. Keep your focus timer in view while you listen.
        </p>
        <div className="spotify-connection">
          <span className="spotify-connection-icon">
            <Headphones size={21} />
          </span>
          <div>
            <strong>
              {connected ? "Spotify connected" : "Bring your music along"}
            </strong>
            <p>
              {connected
                ? "Your current track appears here. Playback stays in your hands."
                : "Connect to see what’s playing, or paste a Spotify link below."}
            </p>
          </div>
          {connected ? (
            <button
              className="button"
              onClick={() => {
                spotify.disconnect();
                setPlayback(null);
                onPlayback(null);
                setMessage("");
              }}
            >
              <Unplug size={15} /> Disconnect
            </button>
          ) : (
            <button
              className="button spotify-connect"
              disabled={connecting}
              onClick={async () => {
                setConnecting(true);
                setMessage("");
                try {
                  await spotify.authorize();
                } catch (error) {
                  setMessage(
                    error instanceof Error
                      ? error.message
                      : "Could not connect to Spotify.",
                  );
                  setConnecting(false);
                }
              }}
            >
              {connecting ? "Connecting…" : "Connect Spotify"}
            </button>
          )}
        </div>
        {message && (
          <div className="notice" role="status">
            <p>{message}</p>
            {connected && (
              <button
                className="button"
                onClick={() => {
                  setMessage("");
                  setRetry((value) => value + 1);
                }}
              >
                Retry Spotify access
              </button>
            )}
          </div>
        )}
        {connected && !message && (
          <div className="spotify-now-playing">
            <span className="timer-eyebrow">
              {playback?.is_playing
                ? "NOW PLAYING ON SPOTIFY"
                : "YOUR SPOTIFY PLAYBACK"}
            </span>
            {item ? (
              <>
                <strong>{item.name}</strong>
                <span>
                  {item.artists?.map((artist) => artist.name).join(", ") ||
                    "Spotify audio"}
                </span>
                {current && (
                  <button
                    className="text-link"
                    onClick={() => {
                      setContent(current);
                      setLink(
                        `https://open.spotify.com/${current.type}/${current.id}`,
                      );
                    }}
                  >
                    Load in player <ExternalLink size={14} />
                  </button>
                )}
              </>
            ) : (
              <p>
                Start a track in Spotify to see it here. Updates every 10
                seconds while this page is visible.
              </p>
            )}
          </div>
        )}
        <form
          className="spotify-link-form"
          onSubmit={(event) => {
            event.preventDefault();
            const parsed = spotifyContent(link);
            if (!parsed) {
              setLinkError(
                "Paste a valid open.spotify.com link to a playlist, album, or track.",
              );
              return;
            }
            setContent(parsed);
            setLinkError("");
          }}
        >
          <label htmlFor="spotify-link">Your playlist, album, or track</label>
          <div>
            <span className="spotify-link-icon">
              <Link2 size={17} />
            </span>
            <input
              id="spotify-link"
              value={link}
              onChange={(event) => setLink(event.target.value)}
              placeholder="https://open.spotify.com/playlist/…"
              aria-describedby={linkError ? "spotify-link-error" : undefined}
            />
            <button className="button" disabled={!link.trim()}>
              Load player
            </button>
          </div>
          {linkError && (
            <p className="error" id="spotify-link-error" role="alert">
              {linkError}
            </p>
          )}
        </form>
        {embed ? (
          <div className="spotify-embed">
            <iframe
              key={embed}
              src={embed}
              title="Spotify music player"
              height="352"
              width="100%"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              allowFullScreen
            />
            <button className="text-link" onClick={() => setContent(null)}>
              Close player
            </button>
          </div>
        ) : (
          <div className="spotify-empty">
            <Music2 size={32} />
            <h3>A little music. A little momentum.</h3>
            <p>
              Copy a link from Spotify’s Share menu and load it here to start
              listening.
            </p>
            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link"
            >
              Find something on Spotify <ExternalLink size={14} />
            </a>
          </div>
        )}
        <p className="spotify-footnote">
          Music provided by Spotify. Playback availability depends on your
          Spotify account and browser. Timer controls only affect your focus
          session.
        </p>
      </section>
    </>
  );
}
