import { useSyncExternalStore } from 'react';

/**
 * Tiny shared state between the intro loader and the homepage hero:
 * - `introDone`: the loader has lifted, so entrance animations can start.
 * - `heroReady`: the 3D hero has rendered its first frame (the loader waits for it).
 */
let introDone = false;
let heroReady = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function markIntroDone() {
  if (introDone) return;
  introDone = true;
  emit();
}

export function markHeroReady() {
  if (heroReady) return;
  heroReady = true;
  emit();
}

export const isHeroReady = () => heroReady;
export const isIntroDone = () => introDone;

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useIntroDone() {
  return useSyncExternalStore(subscribe, () => introDone, () => true);
}

/** Resolves once the hero is ready (or after `timeout` ms, so the loader never hangs). */
export function waitForHeroReady(timeout: number) {
  return new Promise<void>((resolve) => {
    if (heroReady) return resolve();
    const timer = window.setTimeout(done, timeout);
    const unsub = subscribe(() => heroReady && done());
    function done() {
      window.clearTimeout(timer);
      unsub();
      resolve();
    }
  });
}
