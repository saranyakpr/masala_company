import { useId } from 'react'
import type { Product } from '../../data/products'

/**
 * Vector 12 SPICES jar — used wherever WebGL is unavailable, so every
 * product still has an on-brand image.
 */
export function JarIllustration({ product, className = '' }: { product: Product; className?: string }) {
  const id = `jar-${product.id}-${useId().replace(/:/g, "")}`
  return (
    <svg viewBox="0 0 240 340" className={className} role="img" aria-label={`${product.name} jar`}>
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" x2="1">
          <stop offset="0" stopColor={product.powderDeep} />
          <stop offset="0.45" stopColor={product.powder} />
          <stop offset="1" stopColor={product.powderDeep} />
        </linearGradient>
        <linearGradient id={`${id}-cap`} x1="0" x2="1">
          <stop offset="0" stopColor="#050505" />
          <stop offset="0.35" stopColor="#3a3a3a" />
          <stop offset="1" stopColor="#050505" />
        </linearGradient>
        <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dc94" />
          <stop offset="0.5" stopColor="#d4a24c" />
          <stop offset="1" stopColor="#a8772a" />
        </linearGradient>
      </defs>
      <ellipse cx="120" cy="326" rx="86" ry="10" fill="#000" opacity="0.5" />
      <rect x="48" y="58" width="144" height="262" rx="22" fill={`url(#${id}-fill)`} />
      <rect x="44" y="20" width="152" height="46" rx="8" fill={`url(#${id}-cap)`} />
      <rect x="44" y="62" width="152" height="3" fill={`url(#${id}-gold)`} />
      <rect x="48" y="118" width="144" height="150" fill="#0d0b0a" />
      <rect x="48" y="122" width="144" height="2" fill={`url(#${id}-gold)`} />
      <rect x="48" y="262" width="144" height="2" fill={`url(#${id}-gold)`} />
      <circle cx="120" cy="150" r="13" fill="none" stroke={`url(#${id}-gold)`} strokeWidth="1.2" />
      <text x="120" y="154" textAnchor="middle" fontFamily="Cinzel, Georgia, serif" fontWeight="700" fontSize="12" fill={`url(#${id}-gold)`}>
        12
      </text>
      <text x="120" y="184" textAnchor="middle" fontFamily="Cinzel, Georgia, serif" fontSize="15" letterSpacing="3" fill={`url(#${id}-gold)`}>
        SPICES
      </text>
      <text x="120" y="216" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="700" fontSize={product.line1.length > 8 ? 17 : 21} fill="#f4ead8">
        {product.line1}
      </text>
      <text x="120" y="240" textAnchor="middle" fontFamily="'Cormorant Garamond', Georgia, serif" fontWeight="700" fontSize="19" fill={`url(#${id}-gold)`}>
        {product.line2}
      </text>
      <rect x="62" y="74" width="10" height="236" rx="5" fill="#fff" opacity="0.18" />
    </svg>
  )
}
