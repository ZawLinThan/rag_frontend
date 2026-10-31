import { useState } from "react";
import {
  ArrowRight,
  Check,
  Clock3,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageHeading from "../components/PageHeading";
import { useTimer } from "../hooks/useTimer";
import { formatTimer } from "../lib/timer";

const presets = [
  { minutes: 25, label: "Quick focus", description: "Build momentum" },
  { minutes: 50, label: "Deep work", description: "Find your flow" },
  { minutes: 10, label: "Short break", description: "Take a breath" },
];
export default function TimerPage() {
  const { timer, remainingMs, start, pause, resume, reset } = useTimer();
  const [minutes, setMinutes] = useState("25");
  const amount = Number(minutes);
  const valid = Number.isInteger(amount) && amount >= 1 && amount <= 240;
  const idle = timer.status === "idle";
  const displayed = idle ? (valid ? amount * 60_000 : 0) : remainingMs;
  const progress = idle ? 0 : 1 - remainingMs / timer.durationMs;
  return (
    <div className="timer-page">
      <PageHeading
        title="Focus timer"
        description="Make a little space for the work that matters."
      />
      <div className="timer-layout">
        <section className="timer-main" aria-label="Focus timer">
          <div className="timer-main-top">
            <div>
              <span className="timer-eyebrow">YOUR MOMENT TO FOCUS</span>
              <h2>
                {timer.status === "completed"
                  ? "Time well spent."
                  : timer.status === "paused"
                    ? "Take your time."
                    : "Settle into your flow."}
              </h2>
              <p>
                {timer.status === "completed"
                  ? "Your session is complete. Take a moment for yourself."
                  : "One thing at a time. You’ve got this."}
              </p>
            </div>
            <span className={`timer-state ${timer.status}`}>
              <span />
              {timer.status === "idle"
                ? "Ready"
                : timer.status === "running"
                  ? "In progress"
                  : timer.status === "paused"
                    ? "Paused"
                    : "Complete"}
            </span>
          </div>
          <div className="timer-clock-wrap">
            <div className="timer-clock">
              <svg viewBox="0 0 240 240" aria-hidden="true">
                <circle
                  className="timer-ring-track"
                  cx="120"
                  cy="120"
                  r="108"
                />
                <circle
                  className="timer-ring-progress"
                  cx="120"
                  cy="120"
                  r="108"
                  pathLength="100"
                  strokeDasharray="100"
                  strokeDashoffset={
                    100 - Math.max(0, Math.min(1, progress)) * 100
                  }
                />
              </svg>
              <div className="timer-clock-content">
                <span className="timer-clock-label">
                  {timer.status === "completed"
                    ? "SESSION COMPLETE"
                    : idle
                      ? "READY WHEN YOU ARE"
                      : "TIME REMAINING"}
                </span>
                <span
                  className="timer-digits"
                  aria-label={`${Math.ceil(displayed / 1000)} seconds remaining`}
                >
                  {formatTimer(displayed)}
                </span>
                <span className="timer-clock-caption">
                  {timer.status === "completed"
                    ? "A little progress adds up."
                    : "A moment for your mind."}
                </span>
              </div>
            </div>
          </div>
          <div className="timer-actions">
            {idle && (
              <button
                className="button primary timer-primary"
                disabled={!valid}
                onClick={() => start(amount)}
              >
                <Play size={17} fill="currentColor" /> Start focusing
              </button>
            )}
            {timer.status === "running" && (
              <button className="button primary timer-primary" onClick={pause}>
                <Pause size={17} fill="currentColor" /> Pause timer
              </button>
            )}
            {timer.status === "paused" && (
              <button className="button primary timer-primary" onClick={resume}>
                <Play size={17} fill="currentColor" /> Resume timer
              </button>
            )}
            {!idle && (
              <button className="button timer-reset" onClick={reset}>
                <RotateCcw size={16} /> Reset
              </button>
            )}
          </div>
          <div className="timer-footer">
            <span>
              Your timer stays with you as you explore your workspace.
            </span>
          </div>
          {timer.status === "completed" && (
            <p className="timer-complete-announcement" role="status">
              Your focus timer is complete.
            </p>
          )}
        </section>
        <aside className="timer-settings">
          <div className="timer-settings-heading">
            <span className="timer-settings-icon">
              <Clock3 size={18} />
            </span>
            <div>
              <span className="timer-eyebrow">MAKE IT YOURS</span>
              <h3>Set your time</h3>
            </div>
          </div>
          <p>Choose a rhythm that works for you.</p>
          <div
            className="timer-presets"
            role="group"
            aria-label="Timer presets"
          >
            {presets.map((preset) => (
              <button
                type="button"
                key={preset.minutes}
                className={`timer-preset ${idle && amount === preset.minutes ? "selected" : ""}`}
                aria-pressed={idle && amount === preset.minutes}
                disabled={!idle}
                onClick={() => setMinutes(String(preset.minutes))}
              >
                <span className="timer-preset-number">
                  {preset.minutes}
                  <small>MIN</small>
                </span>
                <span className="timer-preset-copy">
                  <strong>{preset.label}</strong>
                  <small>{preset.description}</small>
                </span>
                {idle && amount === preset.minutes && <Check size={16} />}
              </button>
            ))}
          </div>
          <label className="timer-custom">
            Or set your own{" "}
            <span className="timer-custom-input">
              <input
                type="number"
                min="1"
                max="240"
                step="1"
                value={minutes}
                disabled={!idle}
                onChange={(event) => setMinutes(event.target.value)}
                aria-describedby="timer-custom-help"
              />
              <span>minutes</span>
            </span>
          </label>
          <p id="timer-custom-help" className="timer-helper">
            {!valid
              ? "Enter a whole number between 1 and 240."
              : !idle
                ? "Reset the timer to change the duration."
                : "Choose any length from 1 to 240 minutes."}
          </p>
          <div className="timer-tip">
            <span>✦</span>
            <div>
              <strong>A gentle reminder</strong>
              <p>A focused session is a fresh start, not a race.</p>
            </div>
          </div>
          <Link className="timer-back-link" to="/courses">
            Explore your courses <ArrowRight size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
