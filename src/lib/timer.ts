export type TimerStatus = "idle" | "running" | "paused" | "completed";
export type TimerState = {
  status: TimerStatus;
  durationMs: number;
  remainingMs: number;
  deadlineMs: number | null;
};
export const initialTimer = (): TimerState => ({
  status: "idle",
  durationMs: 25 * 60_000,
  remainingMs: 25 * 60_000,
  deadlineMs: null,
});
export const remainingTime = (state: TimerState, now: number): number =>
  state.status === "running" && state.deadlineMs !== null
    ? Math.max(0, state.deadlineMs - now)
    : Math.max(0, state.remainingMs);
export function refreshTimer(state: TimerState, now: number): TimerState {
  return state.status === "running" && remainingTime(state, now) <= 0
    ? { ...state, status: "completed", remainingMs: 0, deadlineMs: null }
    : state;
}
export function startTimer(durationMs: number, now: number): TimerState {
  return {
    status: "running",
    durationMs,
    remainingMs: durationMs,
    deadlineMs: now + durationMs,
  };
}
export function pauseTimer(state: TimerState, now: number): TimerState {
  const remainingMs = remainingTime(state, now);
  if (state.status !== "running") return state;
  return remainingMs === 0
    ? { ...state, status: "completed", remainingMs: 0, deadlineMs: null }
    : { ...state, status: "paused", remainingMs, deadlineMs: null };
}
export function resumeTimer(state: TimerState, now: number): TimerState {
  return state.status === "paused" && state.remainingMs > 0
    ? { ...state, status: "running", deadlineMs: now + state.remainingMs }
    : state;
}
export function formatTimer(ms: number): string {
  const seconds = Math.ceil(Math.max(0, ms) / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const rest = seconds % 60;
  return hours
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`
    : `${String(minutes).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
}
export function parseTimerState(value: unknown): TimerState | null {
  if (!value || typeof value !== "object") return null;
  const s = value as TimerState;
  if (
    !["idle", "running", "paused", "completed"].includes(s.status) ||
    !Number.isFinite(s.durationMs) ||
    s.durationMs <= 0 ||
    s.durationMs > 240 * 60_000 ||
    !Number.isFinite(s.remainingMs) ||
    s.remainingMs < 0 ||
    s.remainingMs > s.durationMs ||
    (s.status === "running"
      ? !Number.isFinite(s.deadlineMs)
      : s.deadlineMs !== null)
  )
    return null;
  return s;
}
