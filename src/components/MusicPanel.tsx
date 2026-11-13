import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ExternalLink, Link2, Music2 } from "lucide-react";
import SpotifyPanel from "./SpotifyPanel";
import { musicEmbed, type ExternalMusicProvider } from "../lib/music/embeds";
import type { Playback } from "../lib/spotify/client";

type Provider = "spotify" | ExternalMusicProvider;
const names = {
  spotify: "Spotify",
  youtube: "YouTube Music",
  apple: "Apple Music",
};
function ProviderIcon({ provider }: { provider: Provider }) {
  if (provider === "youtube")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#ff0033" />
        <path d="m10 7.5 7 4.5-7 4.5z" fill="white" />
      </svg>
    );
  if (provider === "apple")
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="1" y="1" width="22" height="22" rx="6" fill="#fa2d48" />
        <path
          d="M15.5 5v9.1a2.8 2.8 0 1 1-1.5-2.5V7.2l-5 1v7.3a2.8 2.8 0 1 1-1.5-2.5V7z"
          fill="white"
        />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="11" fill="#1db954" />
      <path
        d="M6 9c4-1.2 8.5-.8 12 1.3M7 12.2c3.5-1 7-.6 10 1.2M7.5 15.2c2.8-.8 5.8-.5 8.3.9"
        fill="none"
        stroke="#fff"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
export default function MusicPanel({
  onPlayback,
  onContentChange,
  floatingOpen,
  closeFloating,
  onProviderChange,
}: {
  onPlayback: (playback: Playback | null) => void;
  onContentChange: (loaded: boolean) => void;
  floatingOpen: boolean;
  closeFloating: () => void;
  onProviderChange: (provider: Provider) => void;
}) {
  const [provider, setProvider] = useState<Provider>("spotify");
  const [link, setLink] = useState("");
  const [embed, setEmbed] = useState<string | null>(null);
  const [error, setError] = useState("");
  const floating = useLocation().pathname !== "/timer";
  const selector = (
    <div
      className="music-provider-selector"
      role="group"
      aria-label="Music service"
    >
      {(Object.keys(names) as Provider[]).map((option) => (
        <button
          type="button"
          key={option}
          className={option === provider ? "selected" : ""}
          aria-pressed={option === provider}
          onClick={() => {
            if (option === provider) return;
            setProvider(option);
            onProviderChange(option);
            setLink("");
            setEmbed(null);
            setError("");
            onPlayback(null);
            onContentChange(false);
          }}
        >
          <ProviderIcon provider={option} />
          {names[option]}
        </button>
      ))}
    </div>
  );
  if (provider === "spotify")
    return (
      <SpotifyPanel
        onPlayback={onPlayback}
        onContentChange={onContentChange}
        floatingOpen={floatingOpen}
        closeFloating={closeFloating}
        selector={selector}
      />
    );
  const name = names[provider];
  const home =
    provider === "youtube"
      ? "https://music.youtube.com"
      : "https://music.apple.com";
  return (
    <section
      className={`spotify-panel ${floating && floatingOpen && embed ? "spotify-floating spotify-embed-only" : ""}`}
      aria-label={`${name} player`}
      style={
        floating && !(floatingOpen && embed) ? { display: "none" } : undefined
      }
    >
      {floating && floatingOpen && embed && (
        <div className="spotify-floating-controls has-embed">
          <button
            type="button"
            className="floating-timer-close"
            onClick={closeFloating}
            aria-label={`Close ${name} player`}
          >
            ×
          </button>
        </div>
      )}
      {selector}
      <div className="spotify-heading">
        <div>
          <span className="timer-eyebrow">A SOUNDTRACK FOR YOUR SESSION</span>
          <h2>
            <ProviderIcon provider={provider} /> {name}
          </h2>
        </div>
        <a
          className="text-link"
          href={home}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open {name} <ExternalLink size={14} />
        </a>
      </div>
      <p className="spotify-intro">
        Set the mood. Keep your focus timer in view while you listen.
      </p>
      <form
        className="spotify-link-form"
        onSubmit={(event) => {
          event.preventDefault();
          const next = musicEmbed(provider, link);
          if (!next) {
            setError(
              `Paste a valid ${name} ${provider === "youtube" ? "video or playlist" : "song, album, or playlist"} link.`,
            );
            return;
          }
          setEmbed(next);
          onContentChange(true);
          setError("");
        }}
      >
        <label htmlFor="music-link">
          Your{" "}
          {provider === "youtube"
            ? "video or playlist"
            : "song, album, or playlist"}
        </label>
        <div>
          <span className="spotify-link-icon">
            <Link2 size={17} />
          </span>
          <input
            id="music-link"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder={
              provider === "youtube"
                ? "https://music.youtube.com/watch?…"
                : "https://music.apple.com/…"
            }
            aria-describedby={error ? "music-link-error" : undefined}
          />
          <button className="button" disabled={!link.trim()}>
            Load player
          </button>
        </div>
        {error && (
          <p className="error" id="music-link-error" role="alert">
            {error}
          </p>
        )}
      </form>
      {embed ? (
        <div className="spotify-embed">
          <iframe
            key={embed}
            src={embed}
            title={`${name} player`}
            height="352"
            width="100%"
            allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
          />
          <button
            className="text-link"
            onClick={() => {
              setEmbed(null);
              onContentChange(false);
            }}
          >
            Close player
          </button>
        </div>
      ) : (
        <div className="spotify-empty">
          <Music2 size={32} />
          <h3>A little music. A little momentum.</h3>
          <p>Copy a link from {name} and load it here to start listening.</p>
          <a
            href={home}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            Find something on {name} <ExternalLink size={14} />
          </a>
        </div>
      )}
      <p className="spotify-footnote">
        Music provided by {name}. Playback availability depends on the service
        and your browser. Timer controls only affect your focus session.
      </p>
    </section>
  );
}
