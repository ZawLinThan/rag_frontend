import { test } from "node:test";
import assert from "node:assert/strict";
import {
  startTimer,
  pauseTimer,
  resumeTimer,
  refreshTimer,
  remainingTime,
  formatTimer,
  parseTimerState,
} from "../src/lib/timer.ts";

test("countdown uses the deadline even when updates are delayed", () => {
  const timer = startTimer(60_000, 1_000);
  assert.equal(remainingTime(timer, 21_000), 40_000);
  assert.equal(refreshTimer(timer, 100_000).status, "completed");
  assert.equal(remainingTime(timer, 100_000), 0);
});

test("pause freezes time and resume sets a new deadline", () => {
  const paused = pauseTimer(startTimer(60_000, 1_000), 21_000);
  assert.equal(paused.remainingMs, 40_000);
  assert.equal(remainingTime(paused, 90_000), 40_000);
  const resumed = resumeTimer(paused, 90_000);
  assert.equal(remainingTime(resumed, 100_000), 30_000);
  assert.equal(refreshTimer(resumed, 130_000).status, "completed");
});

test("formatting and persisted state validation handle edge cases", () => {
  assert.equal(formatTimer(1), "00:01");
  assert.equal(formatTimer(60 * 60_000), "1:00:00");
  const state = startTimer(60_000, 1_000);
  assert.deepEqual(parseTimerState(state), state);
  assert.equal(parseTimerState({ ...state, deadlineMs: null }), null);
  assert.equal(parseTimerState({ ...state, durationMs: -1 }), null);
});
