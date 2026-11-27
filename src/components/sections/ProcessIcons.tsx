import type { ProcessIcon } from '../../data/content'

/**
 * Line-art illustrations for the farm-to-flavour journey. Every path uses
 * pathLength=1 so it can be "drawn" with stroke-dashoffset.
 */
const common = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  pathLength: 1,
  className: 'draw',
}

export function ProcessIllustration({ icon }: { icon: ProcessIcon }) {
  return (
    <svg viewBox="0 0 240 200" className="h-full w-full" aria-hidden>
      {icon === 'select' && (
        <g>
          <path {...common} d="M120 190V70" />
          <path {...common} d="M120 120c-20-6-38-22-44-44 22 2 38 18 44 44z" />
          <path {...common} d="M120 100c20-6 38-22 44-44-22 2-38 18-44 44z" />
          <path {...common} d="M120 70c-6-16-2-34 10-46 6 16 2 34-10 46z" />
          <path {...common} d="M84 100c-4 18 2 40 12 52 4-14 0-36-12-52z" className="draw accent" />
          <path {...common} d="M156 84c6 18 2 44-10 58-4-16 0-40 10-58z" className="draw accent" />
          <path {...common} d="M60 190h120" />
        </g>
      )}
      {icon === 'source' && (
        <g>
          <path {...common} d="M10 160c40-30 70-30 110-8s70 22 110-6" />
          <path {...common} d="M10 182c50-22 90-20 130-2s60 14 90 0" />
          <path {...common} d="M92 150c-14-34-10-74 8-92h40c18 18 22 58 8 92z" />
          <path {...common} d="M100 58c6-10 34-10 40 0" />
          <path {...common} d="M104 52c-6-12 4-22 16-14 12-8 22 2 16 14" />
          <path {...common} d="M104 104h32M108 118h24" className="draw accent" />
          <path {...common} d="M190 40a14 14 0 1 1-28 0c0-12 14-26 14-26s14 14 14 26z" className="draw accent" />
        </g>
      )}
      {icon === 'clean' && (
        <g>
          <path {...common} d="M40 84a80 22 0 1 0 160 0a80 22 0 1 0-160 0" />
          <path {...common} d="M40 84c6 34 40 54 80 54s74-20 80-54" />
          <path {...common} d="M64 96l20 30M92 104l10 32M120 106v34M148 104l-10 32M176 96l-20 30" />
          <path {...common} d="M90 80c8-6 18-6 26 0M126 76c8-6 18-6 26 0" className="draw accent" />
          <path {...common} d="M110 156v6M120 168v6M130 158v6M104 178v4M136 180v4" className="draw accent" />
        </g>
      )}
      {icon === 'grind' && (
        <g>
          <path {...common} d="M50 110h140c0 40-30 70-70 70s-70-30-70-70z" />
          <path {...common} d="M44 110h152" />
          <path {...common} d="M150 30l-40 86" />
          <path {...common} d="M162 36c-6-10-22-12-28 2l-26 74c-2 8 10 12 14 6z" />
          <path {...common} d="M70 104c16-12 34-14 50-8 18-8 36-6 50 8" className="draw accent" />
          <path {...common} d="M80 194h80" />
        </g>
      )}
      {icon === 'check' && (
        <g>
          <path {...common} d="M40 170c10-40 40-62 80-62s70 22 80 62z" />
          <path {...common} d="M150 40a36 36 0 1 0 0.1 0" />
          <path {...common} d="M175 102l36 36" />
          <path {...common} d="M134 76l12 12 24-26" className="draw accent" />
          <path {...common} d="M70 150c10-8 22-12 34-10M120 142c14-2 30 2 44 12" className="draw accent" />
        </g>
      )}
      {icon === 'pack' && (
        <g>
          <path {...common} d="M84 30h72v26H84z" />
          <path {...common} d="M80 60c-8 6-12 14-12 24v86c0 10 8 18 18 18h68c10 0 18-8 18-18V84c0-10-4-18-12-24z" />
          <path {...common} d="M68 96h104M68 152h104" />
          <path {...common} d="M104 112c4-6 12-6 16 0 4-6 12-6 16 0-4 10-12 16-16 20-4-4-12-10-16-20z" className="draw accent" />
          <path {...common} d="M96 140h48" className="draw accent" />
        </g>
      )}
    </svg>
  )
}
