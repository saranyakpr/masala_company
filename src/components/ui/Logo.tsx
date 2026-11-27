import { useId } from 'react'

/** 12 SPICES emblem: a ring of twelve seeds around a gold "12". */
export function Emblem({ className = '', animated = false }: { className?: string; animated?: boolean }) {
  // unique gradient id: a shared id breaks when the first copy is display:none
  const gid = `emblem-gold-${useId().replace(/:/g, '')}`
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6dc94" />
          <stop offset="0.5" stopColor="#d4a24c" />
          <stop offset="1" stopColor="#a8772a" />
        </linearGradient>
      </defs>
      <circle cx="32" cy="32" r="20" fill="none" stroke={`url(#${gid})`} strokeWidth="1.4" />
      <g className={animated ? 'origin-center animate-[slow-spin_24s_linear_infinite]' : ''} style={{ transformBox: 'fill-box' }}>
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2 - Math.PI / 2
          const x = 32 + Math.cos(a) * 26.5
          const y = 32 + Math.sin(a) * 26.5
          return (
            <ellipse
              key={i}
              cx={x}
              cy={y}
              rx="1.8"
              ry="3.2"
              fill={i === 0 ? '#d9531e' : `url(#${gid})`}
              transform={`rotate(${(a * 180) / Math.PI + 90} ${x} ${y})`}
            />
          )
        })}
      </g>
      <text x="32" y="33" textAnchor="middle" dominantBaseline="middle" fontFamily="Cinzel, Georgia, serif" fontWeight="700" fontSize="19" fill={`url(#${gid})`}>
        12
      </text>
    </svg>
  )
}

export function Logo({ className = '', compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Emblem className={compact ? 'h-9 w-9 shrink-0' : 'h-11 w-11 shrink-0'} />
      <span className="flex flex-col leading-none">
        <span className={`font-brand font-semibold tracking-[0.22em] gold-text ${compact ? 'text-[1.05rem]' : 'text-xl'}`}>SPICES</span>
        <span className="mt-1 text-[0.45rem] font-bold tracking-[0.28em] text-cream/55">MASALA &amp; WHOLE SPICES</span>
      </span>
    </span>
  )
}
