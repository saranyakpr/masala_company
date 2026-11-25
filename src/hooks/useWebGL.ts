import { useState } from 'react';

let cached: boolean | null = null;

function detect(): boolean {
  if (cached !== null) return cached;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    cached = !!gl;
    // Release the probe context immediately.
    const lose = gl?.getExtension('WEBGL_lose_context');
    lose?.loseContext();
  } catch {
    cached = false;
  }
  return cached;
}

/** Returns false when WebGL is unavailable so a static fallback can be shown. */
export function useWebGL(): boolean {
  const [supported] = useState(() => (typeof window === 'undefined' ? false : detect()));
  return supported;
}
