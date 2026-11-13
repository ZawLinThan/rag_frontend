import { names, type Provider } from "../lib/music/providers";

export function ProviderIcon({ provider }: { provider: Provider }) {
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
export function MusicProviderSelector({
  provider,
  onChange,
}: {
  provider: Provider;
  onChange?: (provider: Provider) => void;
}) {
  return (
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
            if (option !== provider) onChange?.(option);
          }}
        >
          <ProviderIcon provider={option} />
          {names[option]}
        </button>
      ))}
    </div>
  );
}
