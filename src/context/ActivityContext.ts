import { createContext } from "react";
import type { Playback } from "../lib/spotify/client";
export const ActivityContext = createContext<{
  playback: Playback | null;
  spotifyLoaded: boolean;
  openSpotify: () => void;
}>({ playback: null, spotifyLoaded: false, openSpotify: () => {} });
