import { createSpotifyClient } from "./client";

export const spotify = createSpotifyClient({
  clientId: import.meta.env.VITE_SPOTIFY_CLIENT_ID ?? "",
  redirectUri:
    import.meta.env.VITE_SPOTIFY_REDIRECT_URI ??
    `${window.location.origin}/spotify/callback`,
});

// A single promise prevents React StrictMode from redeeming the same code twice.
let callback: Promise<void> | null = null;
export function completeSpotifyAuthorization() {
  if (!callback) {
    const search = window.location.search;
    window.history.replaceState(null, "", window.location.pathname);
    callback = spotify.callback(search);
  }
  return callback;
}
