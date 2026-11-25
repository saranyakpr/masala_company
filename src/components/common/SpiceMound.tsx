import { useId } from 'react';
import { cn } from '@/utils/cn';
import { lighten } from '@/utils/color';

interface SpiceMoundProps {
  color: string;
  colorDeep: string;
  label: string;
  className?: string;
}

/**
 * Editorial SVG rendering of a heap of ground spice with grain texture.
 * Used as an illustrative visual until client product photography is supplied.
 */
export function SpiceMound({ color, colorDeep, label, className }: SpiceMoundProps) {
  const uid = useId().replace(/:/g, '');
  return (
    <svg viewBox="0 0 400 260" className={cn('w-full', className)} role="img" aria-label={`Ground ${label} — illustrative render`}>
      <defs>
        <radialGradient id={`m-${uid}`} cx="0.42" cy="0.18" r="0.95">
          <stop offset="0" stopColor={lighten(color, 0.3)} />
          <stop offset="0.25" stopColor={color} stopOpacity="1" />
          <stop offset="1" stopColor={colorDeep} />
        </radialGradient>
        <filter id={`g-${uid}`}>
          <feTurbulence type="fractalNoise" baseFrequency="2.2" numOctaves="2" seed="3" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d" />
          <feColorMatrix in="n" type="saturate" values="0" result="mono" />
          <feComposite in="mono" in2="d" operator="in" result="speck" />
          <feBlend in="d" in2="speck" mode="multiply" />
        </filter>
        <filter id={`s-${uid}`} x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
      </defs>
      <ellipse cx="200" cy="226" rx="170" ry="18" fill="#1c120d" opacity="0.35" filter={`url(#s-${uid})`} />
      <path
        filter={`url(#g-${uid})`}
        fill={`url(#m-${uid})`}
        d="M24 224 C60 210 92 170 128 120 C152 86 176 52 200 48 C226 46 248 84 272 122 C304 172 336 210 376 224 C330 236 70 236 24 224 Z"
      />
      {/* scattered loose grains */}
      {GRAINS.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 0 ? colorDeep : color} opacity="0.85" />
      ))}
    </svg>
  );
}

const GRAINS: [number, number, number][] = [
  [18, 232, 2.2], [44, 238, 1.6], [70, 236, 1.2], [340, 236, 1.8], [362, 230, 1.3], [384, 238, 1.6],
  [300, 240, 1.1], [110, 240, 1.4], [10, 240, 1.1], [392, 228, 1], [260, 242, 1.2], [150, 241, 1],
];
