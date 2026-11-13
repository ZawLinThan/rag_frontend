import type { ExternalMusicProvider } from "./embeds";
export type Provider = "spotify" | ExternalMusicProvider;
export const names = {
  spotify: "Spotify",
  youtube: "YouTube Music",
  apple: "Apple Music",
};
