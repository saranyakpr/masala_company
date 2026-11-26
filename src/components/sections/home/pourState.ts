/**
 * Shared, mutable state between the 3D banner (which tips the jar) and the homepage spice-flow
 * layer (which carries the falling masala past the banner into the next section).
 * Written every frame by the 3D scene; read every frame by the flow layer — no React state involved.
 */
export const pour = {
  /** Jar mouth, in page coordinates (px). */
  x: 0,
  y: 0,
  /** Pour direction on screen (unit vector, y down). */
  dirX: 0,
  dirY: 1,
  /** 0 = not pouring, 1 = full stream. */
  rate: 0,
  /** Screen pixels per jar radius (sizes the stream to the jar). */
  unitPx: 30,
  /** Banner scroll progress, 0 → 1. */
  progress: 0,
};
