import {
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  initialTimer,
  parseTimerState,
  pauseTimer,
  refreshTimer,
  remainingTime,
  resumeTimer,
  startTimer,
  type TimerState,
} from "../lib/timer";
import { TimerContext } from "../hooks/useTimer";

export function TimerProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  const storageKey = `folio:focus-timer:${userId}`;
  const [timer, setTimer] = useState<TimerState>(() => {
    try {
      return refreshTimer(
        parseTimerState(
          JSON.parse(localStorage.getItem(storageKey) ?? "null"),
        ) ?? initialTimer(),
        Date.now(),
      );
    } catch {
      return initialTimer();
    }
  });
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    try {
      if (timer.status === "idle") localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, JSON.stringify(timer));
    } catch {
      /* The countdown still works without storage. */
    }
  }, [timer, storageKey]);
  useEffect(() => {
    if (timer.status !== "running") return;
    const update = () => {
      const time = Date.now();
      setNow(time);
      setTimer((current) => refreshTimer(current, time));
    };
    update();
    const interval = window.setInterval(update, 250);
    document.addEventListener("visibilitychange", update);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", update);
    };
  }, [timer.status]);
  const start = (minutes: number) => {
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 240) return;
    const time = Date.now();
    setNow(time);
    setTimer(startTimer(minutes * 60_000, time));
  };
  const pause = () => setTimer((current) => pauseTimer(current, Date.now()));
  const resume = () => {
    const time = Date.now();
    setNow(time);
    setTimer((current) => resumeTimer(current, time));
  };
  const reset = () => setTimer(initialTimer());
  return (
    <TimerContext.Provider
      value={{
        timer,
        remainingMs: remainingTime(timer, now),
        start,
        pause,
        resume,
        reset,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
}
