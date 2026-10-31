import { Link, useLocation } from "react-router-dom";
import { Clock3, GripVertical, Pause, Play, X } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
} from "react";
import { useTimer } from "../hooks/useTimer";
import { formatTimer } from "../lib/timer";

export default function FloatingTimer() {
  const { pathname } = useLocation();
  const {
    timer,
    remainingMs,
    pause,
    resume,
    floatingHidden,
    setFloatingHidden,
  } = useTimer();
  const element = useRef<HTMLElement>(null);
  const drag = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    () => {
      try {
        const value = JSON.parse(
          localStorage.getItem("folio:timer-position") ?? "null",
        );
        return value && Number.isFinite(value.x) && Number.isFinite(value.y)
          ? { x: value.x, y: value.y }
          : null;
      } catch {
        return null;
      }
    },
  );
  const visible =
    !floatingHidden && pathname !== "/timer" && timer.status !== "idle";
  const constrain = (x: number, y: number) => {
    const rect = element.current?.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(x, window.innerWidth - (rect?.width ?? 0))),
      y: Math.max(0, Math.min(y, window.innerHeight - (rect?.height ?? 0))),
    };
  };
  useEffect(() => {
    if (!visible) return;
    const resize = () =>
      setPosition((current) =>
        current ? constrain(current.x, current.y) : null,
      );
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [visible]);
  const remember = (value: { x: number; y: number }) => {
    setPosition(value);
    try {
      localStorage.setItem("folio:timer-position", JSON.stringify(value));
    } catch {
      /* Position remains available in this session. */
    }
  };
  const beginDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const rect = element.current?.getBoundingClientRect();
    if (!rect) return;
    drag.current = {
      x: event.clientX,
      y: event.clientY,
      left: rect.left,
      top: rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };
  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const start = drag.current;
    if (start)
      setPosition(
        constrain(
          start.left + event.clientX - start.x,
          start.top + event.clientY - start.y,
        ),
      );
  };
  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const start = drag.current;
    if (!start) return;
    remember(
      constrain(
        start.left + event.clientX - start.x,
        start.top + event.clientY - start.y,
      ),
    );
    drag.current = null;
  };
  const moveWithKeyboard = (event: KeyboardEvent<HTMLButtonElement>) => {
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const direction = delta[event.key];
    const rect = element.current?.getBoundingClientRect();
    if (!direction || !rect) return;
    event.preventDefault();
    const step = event.shiftKey ? 40 : 10;
    remember(
      constrain(
        rect.left + direction[0] * step,
        rect.top + direction[1] * step,
      ),
    );
  };
  if (!visible) return null;
  return (
    <aside
      className={`floating-timer ${timer.status}`}
      aria-label="Focus timer"
      ref={element}
      style={
        position
          ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
          : undefined
      }
    >
      <button
        className="floating-timer-grip"
        type="button"
        aria-label="Move timer; use arrow keys to reposition"
        onPointerDown={beginDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={() => {
          drag.current = null;
        }}
        onKeyDown={moveWithKeyboard}
      >
        <GripVertical size={17} />
      </button>
      <span className="floating-timer-icon">
        <Clock3 size={18} />
      </span>
      <Link to="/timer" className="floating-timer-link">
        <span>
          {timer.status === "completed"
            ? "SESSION COMPLETE"
            : timer.status === "paused"
              ? "PAUSED"
              : "FOCUS TIME"}
        </span>
        <strong>
          {timer.status === "completed"
            ? "Nice work!"
            : formatTimer(remainingMs)}
        </strong>
      </Link>
      {timer.status !== "completed" && (
        <button
          type="button"
          className="floating-timer-action"
          onClick={timer.status === "running" ? pause : resume}
          aria-label={
            timer.status === "running" ? "Pause timer" : "Resume timer"
          }
        >
          {timer.status === "running" ? (
            <Pause size={16} fill="currentColor" />
          ) : (
            <Play size={16} fill="currentColor" />
          )}
        </button>
      )}
      <button
        type="button"
        className="floating-timer-close"
        aria-label="Hide floating timer"
        title="Hide timer; countdown continues"
        onClick={() => setFloatingHidden(true)}
      >
        <X size={16} />
      </button>
      {timer.status === "completed" && (
        <span className="sr-only" role="status">
          Your focus timer is complete.
        </span>
      )}
    </aside>
  );
}
