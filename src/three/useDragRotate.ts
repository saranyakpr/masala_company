import { useCallback, useMemo, useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

export interface DragRotateState {
  rotY: number;
  rotX: number;
  velocity: number;
  dragging: boolean;
  lastInteraction: number;
}

/**
 * Horizontal drag-to-rotate with inertia. Unlike OrbitControls it leaves vertical
 * touch scrolling alone (`touch-action: pan-y`), so mobile users are never trapped.
 */
export function useDragRotate() {
  const state = useRef<DragRotateState>({ rotY: 0, rotX: 0, velocity: 0, dragging: false, lastInteraction: 0 });
  const last = useRef({ x: 0, y: 0 });

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    state.current.dragging = true;
    state.current.velocity = 0;
    last.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    const s = state.current;
    if (!s.dragging) return;
    const dx = e.clientX - last.current.x;
    const dy = e.clientY - last.current.y;
    last.current = { x: e.clientX, y: e.clientY };
    s.rotY += dx * 0.01;
    s.velocity = dx * 0.01;
    if (e.pointerType === 'mouse') s.rotX = Math.max(-0.35, Math.min(0.35, s.rotX + dy * 0.004));
    s.lastInteraction = performance.now();
  }, []);

  const onPointerUp = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    state.current.dragging = false;
    state.current.lastInteraction = performance.now();
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  }, []);

  const nudge = useCallback((radians: number) => {
    state.current.rotY += radians;
    state.current.lastInteraction = performance.now();
  }, []);

  const reset = useCallback(() => {
    const s = state.current;
    s.rotY = Math.round(s.rotY / (Math.PI * 2)) * Math.PI * 2;
    s.rotX = 0;
    s.velocity = 0;
    s.lastInteraction = performance.now();
  }, []);

  const handlers = useMemo(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel: onPointerUp,
      style: { touchAction: 'pan-y', cursor: 'grab' } as const,
    }),
    [onPointerDown, onPointerMove, onPointerUp],
  );

  return { state, handlers, nudge, reset };
}

/** Per-frame integration of the drag state into a target rotation (with idle auto-rotate). */
export function stepDragRotate(s: DragRotateState, delta: number, autoSpeed = 0.35) {
  if (!s.dragging) {
    s.rotY += s.velocity;
    s.velocity *= Math.pow(0.04, delta);
    if (performance.now() - s.lastInteraction > 2500) s.rotY += delta * autoSpeed;
  }
}
