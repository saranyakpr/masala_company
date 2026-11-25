import { useMemo } from 'react';
import { useReducedMotion } from 'framer-motion';
import type { DeviceTier } from '@/types';
import { useMediaQuery } from './useMediaQuery';

interface NavigatorWithMemory extends Navigator {
  deviceMemory?: number;
}

/**
 * Rough device capability tier used to scale 3D complexity
 * (particle counts, shadows, pixel ratio, pointer effects).
 */
export function useDeviceTier(): DeviceTier {
  const isSmall = useMediaQuery('(max-width: 767px)');
  const coarse = useMediaQuery('(pointer: coarse)');
  const reduced = useReducedMotion();

  return useMemo<DeviceTier>(() => {
    if (typeof navigator === 'undefined') return 'mid';
    const nav = navigator as NavigatorWithMemory;
    const cores = nav.hardwareConcurrency ?? 4;
    const memory = nav.deviceMemory ?? 4;
    if (reduced || cores <= 2 || memory <= 2) return 'low';
    if (isSmall || coarse || cores <= 4) return 'mid';
    return 'high';
  }, [isSmall, coarse, reduced]);
}

export const tierConfig = {
  low: { dpr: [1, 1] as [number, number], particles: 260, shadows: false, pointer: false },
  mid: { dpr: [1, 1.5] as [number, number], particles: 700, shadows: false, pointer: false },
  high: { dpr: [1, 2] as [number, number], particles: 1600, shadows: true, pointer: true },
} satisfies Record<DeviceTier, { dpr: [number, number]; particles: number; shadows: boolean; pointer: boolean }>;
