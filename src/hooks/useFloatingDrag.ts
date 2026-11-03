import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
  type KeyboardEvent,
} from "react";

export function useFloatingDrag(active: boolean) {
  const element = useRef<HTMLElement>(null);
  const start = useRef<{
    x: number;
    y: number;
    left: number;
    top: number;
  } | null>(null);
  const [position, setPosition] = useState<{ x: number; y: number } | null>(
    null,
  );
  const constrain = (x: number, y: number) => {
    const rect = element.current?.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(x, window.innerWidth - (rect?.width ?? 0))),
      y: Math.max(0, Math.min(y, window.innerHeight - (rect?.height ?? 0))),
    };
  };
  useEffect(() => {
    if (!active || !element.current) return;
    const resize = () =>
      setPosition((value) => (value ? constrain(value.x, value.y) : null));
    const observer = new ResizeObserver(resize);
    observer.observe(element.current);
    window.addEventListener("resize", resize);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [active]);
  const onPointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;
    const rect = element.current?.getBoundingClientRect();
    if (!rect) return;
    start.current = {
      x: event.clientX,
      y: event.clientY,
      left: rect.left,
      top: rect.top,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  };
  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const value = start.current;
    if (value)
      setPosition(
        constrain(
          value.left + event.clientX - value.x,
          value.top + event.clientY - value.y,
        ),
      );
  };
  const onPointerUp = (event: PointerEvent<HTMLButtonElement>) => {
    onPointerMove(event);
    start.current = null;
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const direction: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const delta = direction[event.key];
    const rect = element.current?.getBoundingClientRect();
    if (!delta || !rect) return;
    event.preventDefault();
    const step = event.shiftKey ? 40 : 10;
    setPosition(
      constrain(rect.left + step * delta[0], rect.top + step * delta[1]),
    );
  };
  return {
    element,
    style:
      active && position
        ? { left: position.x, top: position.y, right: "auto", bottom: "auto" }
        : undefined,
    handle: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: () => {
        start.current = null;
      },
      onKeyDown,
    },
  };
}
