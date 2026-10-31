import { createContext, useContext } from "react";
import type { TimerState } from "../lib/timer";

export type TimerContextValue = {
  floatingHidden: boolean;
  setFloatingHidden: (hidden: boolean) => void;
  timer: TimerState;
  remainingMs: number;
  start: (minutes: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
};
export const TimerContext = createContext<TimerContextValue | null>(null);
export function useTimer() {
  const value = useContext(TimerContext);
  if (!value) throw new Error("TimerProvider is required");
  return value;
}
