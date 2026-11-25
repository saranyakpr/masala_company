import { useId } from 'react';
import type { Product } from '@/types';
import { site } from '@/data/site';
import { packLine } from '@/data/categories';
import { cn } from '@/utils/cn';
import { darken, lighten } from '@/utils/color';

interface PackVisualProps {
  product: Pick<Product, 'name' | 'localName' | 'palette' | 'category'>;
  weight?: string;
  className?: string;
}

/**
 * Procedural stand-up pouch rendering (SVG).
 * This is a design placeholder for the client's real packaging photography/artwork.
 */
export function PackVisual({ product, weight = '100 g', className }: PackVisualProps) {
  const uid = useId().replace(/:/g, '');
  const { base, accent, spice, text } = product.palette;
  const nameLines = splitName(product.name);

  return (
    <svg
      viewBox="0 0 300 420"
      className={cn('h-full w-full', className)}
      role="img"
      aria-label={`${product.name} pack — illustrative packaging render`}
    >
      <defs>
        <linearGradient id={`shade-${uid}`} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.45" />
          <stop offset="0.18" stopColor="#000" stopOpacity="0.05" />
          <stop offset="0.32" stopColor="#fff" stopOpacity="0.16" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.02" />
          <stop offset="0.85" stopColor="#000" stopOpacity="0.18" />
          <stop offset="1" stopColor="#000" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id={`vert-${uid}`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.1" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.35" />
        </linearGradient>
        <radialGradient id={`window-${uid}`} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor={lighten(spice, 0.25)} />
          <stop offset="0.6" stopColor={spice} />
          <stop offset="1" stopColor={darken(spice, 0.35)} />
        </radialGradient>
        <filter id={`grain-${uid}`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="7" result="noise" />
          <feColorMatrix in="noise" type="saturate" values="0" result="mono" />
          <feComponentTransfer in="mono" result="soft">
            <feFuncA type="linear" slope="0.5" />
          </feComponentTransfer>
          <feComposite in="soft" in2="SourceGraphic" operator="in" result="g" />
          <feBlend in="SourceGraphic" in2="g" mode="multiply" />
        </filter>
        <filter id={`shadow-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
        <clipPath id={`pouch-${uid}`}>
          <path d={POUCH_PATH} />
        </clipPath>
      </defs>

      {/* ground shadow */}
      <ellipse cx="150" cy="404" rx="112" ry="10" fill="#1c120d" opacity="0.35" filter={`url(#shadow-${uid})`} />

      <g clipPath={`url(#pouch-${uid})`}>
        <rect width="300" height="420" fill={base} />
        {/* top seal band */}
        <rect x="0" y="22" width="300" height="34" fill={darken(base, 0.18)} />
        <line x1="40" x2="260" y1="48" y2="48" stroke={accent} strokeOpacity="0.5" strokeWidth="1" strokeDasharray="2 3" />
        <circle cx="150" cy="36" r="5" fill={darken(base, 0.45)} />

        {/* label frame */}
        <rect x="46" y="82" width="208" height="262" fill="none" stroke={accent} strokeWidth="1.2" />
        <rect x="52" y="88" width="196" height="250" fill="none" stroke={accent} strokeOpacity="0.4" strokeWidth="0.6" />

        <text x="150" y="112" textAnchor="middle" fill={accent} fontFamily="Manrope Variable, sans-serif" fontSize="9" fontWeight="700" letterSpacing="4.5">
          {site.wordmark}
        </text>
        <text x="150" y="124" textAnchor="middle" fill={text} opacity="0.55" fontFamily="Manrope Variable, sans-serif" fontSize="5.5" fontWeight="600" letterSpacing="2.6">
          {packLine[product.category]}
        </text>

        {/* spice window */}
        <circle cx="150" cy="178" r="40" fill="none" stroke={accent} strokeWidth="0.8" />
        <circle cx="150" cy="178" r="34" fill={`url(#window-${uid})`} filter={`url(#grain-${uid})`} />
        <ellipse cx="138" cy="166" rx="12" ry="7" fill="#fff" opacity="0.12" />
        {ornament(accent)}

        {nameLines.map((line, i) => (
          <text
            key={line}
            x="150"
            y={250 + i * 24}
            textAnchor="middle"
            fill={text}
            fontFamily="Fraunces Variable, Georgia, serif"
            fontSize={nameLines.length > 1 ? 21 : 24}
            fontWeight="400"
          >
            {line}
          </text>
        ))}
        <text
          x="150"
          y={250 + nameLines.length * 24 - 2}
          textAnchor="middle"
          fill={accent}
          fontFamily="Fraunces Variable, Georgia, serif"
          fontStyle="italic"
          fontSize="11"
        >
          {product.localName}
        </text>

        <line x1="110" x2="190" y1="318" y2="318" stroke={accent} strokeOpacity="0.6" strokeWidth="0.6" />
        <text x="150" y="332" textAnchor="middle" fill={text} opacity="0.85" fontFamily="Manrope Variable, sans-serif" fontSize="7.5" fontWeight="700" letterSpacing="2.2">
          NET WT {weight.toUpperCase()}
        </text>

        {/* bottom gusset */}
        <path d="M0 372 Q150 352 300 372 L300 420 L0 420 Z" fill="#000" opacity="0.18" />

        {/* pillow shading */}
        <rect width="300" height="420" fill={`url(#shade-${uid})`} />
        <rect width="300" height="420" fill={`url(#vert-${uid})`} />
        <rect x="78" y="56" width="16" height="320" fill="#fff" opacity="0.06" />
      </g>
      <path d={POUCH_PATH} fill="none" stroke="#000" strokeOpacity="0.25" strokeWidth="1" />
    </svg>
  );
}

const POUCH_PATH =
  'M30 22 L270 22 L270 60 C276 150 280 260 284 370 C286 386 278 398 262 400 L38 400 C22 398 14 386 16 370 C20 260 24 150 30 60 Z';

function ornament(color: string) {
  const petals = Array.from({ length: 12 }).map((_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const x = 150 + Math.cos(a) * 46;
    const y = 178 + Math.sin(a) * 46;
    return <circle key={i} cx={x} cy={y} r="1.3" fill={color} opacity="0.8" />;
  });
  return <g>{petals}</g>;
}

function splitName(name: string): string[] {
  const words = name.split(' ');
  if (name.length <= 14 || words.length === 1) return [name];
  const mid = Math.ceil(words.length / 2);
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')];
}
