import { createContext } from "react";
import type { Playback } from "../lib/spotify/client";
export const ActivityContext = createContext<{
  playback: Playback | null;
  musicProvider: "spotify" | "youtube" | "apple";
  spotifyLoaded: boolean;
  openSpotify: () => void;
}>({
  musicProvider: "spotify",
  playback: null,
  spotifyLoaded: false,
  openSpotify: () => {},
});
