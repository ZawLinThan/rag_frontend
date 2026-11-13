import { MusicProviderSelector, ProviderIcon } from "./MusicProviderSelector";
import { names, type Provider } from "../lib/music/providers";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ExternalLink, Link2, Music2 } from "lucide-react";
import SpotifyPanel from "./SpotifyPanel";
import { musicEmbed } from "../lib/music/embeds";
import type { Playback } from "../lib/spotify/client";

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
    <MusicProviderSelector
      provider={provider}
      onChange={(option) => {
        setProvider(option);
        onProviderChange(option);
        setLink("");
        setEmbed(null);
        setError("");
        onPlayback(null);
        onContentChange(false);
      }}
    />
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
