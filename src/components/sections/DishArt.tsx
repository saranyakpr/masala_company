import { memo, useMemo, type ReactElement } from 'react'
import type { Dish } from '../../data/content'
import { seeded } from '../../lib/math'

/**
 * Procedural top-down dish illustrations. Each dish has a "before" (plain,
 * unspiced) layer and an "after" (spiced) layer that is revealed through a
 * growing circular clip — the transformation the masala brings.
 */

const C = 200
type Rnd = () => number

function inCircle(rnd: Rnd, r: number): [number, number] {
  const a = rnd() * Math.PI * 2
  const d = Math.sqrt(rnd()) * r
  return [C + Math.cos(a) * d, C + Math.sin(a) * d]
}

function pick<T>(rnd: Rnd, arr: T[]) {
  return arr[Math.floor(rnd() * arr.length)]
}

function leaf(x: number, y: number, s: number, rot: number, fill: string, key: string) {
  return (
    <path
      key={key}
      d={`M0 0 C ${4 * s} ${-5 * s}, ${10 * s} ${-5 * s}, ${14 * s} 0 C ${10 * s} ${5 * s}, ${4 * s} ${5 * s}, 0 0 Z`}
      transform={`translate(${x} ${y}) rotate(${rot})`}
      fill={fill}
      opacity={0.95}
    />
  )
}

function blob(rnd: Rnd, x: number, y: number, r: number, key: string, fill: string) {
  const pts = 7
  let d = ''
  for (let i = 0; i <= pts; i++) {
    const a = (i / pts) * Math.PI * 2
    const rr = r * (0.75 + rnd() * 0.4)
    const px = x + Math.cos(a) * rr
    const py = y + Math.sin(a) * rr * 0.8
    d += i === 0 ? `M${px.toFixed(1)} ${py.toFixed(1)}` : ` Q${(x + Math.cos(a - 0.45) * rr * 1.15).toFixed(1)} ${(y + Math.sin(a - 0.45) * rr * 0.92).toFixed(1)} ${px.toFixed(1)} ${py.toFixed(1)}`
  }
  return <path key={key} d={d + 'Z'} fill={fill} />
}

function riceGrains(seed: number, palette: string[], count: number, r: number) {
  const rnd = seeded(seed)
  const out: ReactElement[] = []
  for (let i = 0; i < count; i++) {
    const [x, y] = inCircle(rnd, r)
    out.push(
      <ellipse
        key={`g${i}`}
        cx={x.toFixed(1)}
        cy={y.toFixed(1)}
        rx={6.5}
        ry={2.1}
        fill={pick(rnd, palette)}
        transform={`rotate(${(rnd() * 180).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})`}
      />,
    )
  }
  return out
}

function Biryani({ spiced }: { spiced: boolean }) {
  const els = useMemo(() => {
    const out: ReactElement[] = []
    out.push(<circle key="base" cx={C} cy={C} r={152} fill={spiced ? '#e3b46a' : '#efe6d2'} />)
    out.push(
      ...riceGrains(
        11,
        spiced ? ['#fbf3e2', '#f6e7c8', '#f2b04a', '#e8892c', '#fff8ea', '#f3c46a'] : ['#fbf6ec', '#f3ece0', '#ffffff', '#ece3d3'],
        620,
        150,
      ),
    )
    if (spiced) {
      const rnd = seeded(23)
      for (let i = 0; i < 7; i++) {
        const [x, y] = inCircle(rnd, 105)
        out.push(blob(rnd, x, y, 17 + rnd() * 6, `ck${i}`, 'url(#bir-chicken)'))
      }
      for (let i = 0; i < 34; i++) {
        const [x, y] = inCircle(rnd, 140)
        const a = rnd() * Math.PI * 2
        out.push(
          <path
            key={`on${i}`}
            d={`M${x} ${y} q${Math.cos(a) * 8} ${Math.sin(a) * 8} ${Math.cos(a + 1) * 14} ${Math.sin(a + 1) * 14}`}
            stroke="#6b3410"
            strokeWidth={2.6}
            fill="none"
            strokeLinecap="round"
          />,
        )
      }
      for (let i = 0; i < 12; i++) {
        const [x, y] = inCircle(rnd, 130)
        out.push(leaf(x, y, 1.2, rnd() * 360, '#3f7a2e', `m${i}`))
      }
      out.push(<ellipse key="egg" cx={248} cy={168} rx={20} ry={15} fill="#fbf7ee" />, <circle key="yolk" cx={250} cy={169} r={9} fill="#f2b632" />)
    }
    return out
  }, [spiced])
  return <>{els}</>
}

function Curry({ spiced }: { spiced: boolean }) {
  const els = useMemo(() => {
    const rnd = seeded(41)
    const out: ReactElement[] = [<circle key="base" cx={C} cy={C} r={152} fill={spiced ? 'url(#curry-gravy)' : 'url(#curry-pale)'} />]
    for (let i = 0; i < 9; i++) {
      const [x, y] = inCircle(rnd, 100)
      out.push(blob(rnd, x, y, 16 + rnd() * 6, `c${i}`, spiced ? 'url(#curry-chunk)' : '#e2c79c'))
    }
    if (spiced) {
      for (let i = 0; i < 36; i++) {
        const [x, y] = inCircle(rnd, 145)
        out.push(<ellipse key={`o${i}`} cx={x} cy={y} rx={3 + rnd() * 7} ry={2 + rnd() * 4} fill="#ffb04a" opacity={0.28} />)
      }
      out.push(
        <path
          key="cream"
          d="M150 220c20-30 70-40 100-14s10 60-30 54-46-40-14-46"
          stroke="#f8ead2"
          strokeWidth={5}
          fill="none"
          strokeLinecap="round"
          opacity={0.85}
        />,
      )
      for (let i = 0; i < 18; i++) {
        const [x, y] = inCircle(rnd, 125)
        const rot = rnd() * 360
        out.push(
          <g key={`cl${i}`} transform={`translate(${x} ${y}) rotate(${rot})`}>
            <circle r={4.5} cx={-3} fill="#4f8a35" />
            <circle r={4.5} cx={3} fill="#5b9a3d" />
            <circle r={4.5} cy={-5} fill="#4a8231" />
          </g>,
        )
      }
    }
    return out
  }, [spiced])
  return <>{els}</>
}

function Sambar({ spiced }: { spiced: boolean }) {
  const els = useMemo(() => {
    const rnd = seeded(77)
    const out: ReactElement[] = [<circle key="base" cx={C} cy={C} r={152} fill={spiced ? 'url(#sambar-liquid)' : 'url(#sambar-pale)'} />]
    for (let i = 0; i < 6; i++) {
      const [x, y] = inCircle(rnd, 100)
      out.push(
        <g key={`d${i}`} transform={`translate(${x} ${y}) rotate(${rnd() * 180})`}>
          <rect x={-22} y={-6} width={44} height={12} rx={6} fill={spiced ? '#6b8a3a' : '#a9b98a'} />
          <path d="M-16 0h32" stroke={spiced ? '#4c6a26' : '#8ea06c'} strokeWidth={1.5} />
        </g>,
      )
    }
    for (let i = 0; i < 9; i++) {
      const [x, y] = inCircle(rnd, 120)
      out.push(blob(rnd, x, y, 7 + rnd() * 4, `t${i}`, spiced ? '#c93a24' : '#e0a58e'))
    }
    for (let i = 0; i < 8; i++) {
      const [x, y] = inCircle(rnd, 120)
      out.push(
        <g key={`s${i}`}>
          <circle cx={x} cy={y} r={8} fill={spiced ? '#b9707a' : '#dcbcbf'} />
          <circle cx={x} cy={y} r={4.5} fill="none" stroke={spiced ? '#e8b4b8' : '#efdcdc'} strokeWidth={1.2} />
        </g>,
      )
    }
    if (spiced) {
      for (let i = 0; i < 26; i++) {
        const [x, y] = inCircle(rnd, 145)
        out.push(<ellipse key={`oil${i}`} cx={x} cy={y} rx={3 + rnd() * 6} ry={2 + rnd() * 3} fill="#f6a640" opacity={0.3} />)
      }
      for (let i = 0; i < 11; i++) {
        const [x, y] = inCircle(rnd, 130)
        out.push(leaf(x, y, 1.6, rnd() * 360, '#2f5a22', `cl${i}`))
      }
      for (let i = 0; i < 80; i++) {
        const [x, y] = inCircle(rnd, 140)
        out.push(<circle key={`ms${i}`} cx={x} cy={y} r={1.9} fill="#2a1a10" />)
      }
    }
    return out
  }, [spiced])
  return <>{els}</>
}

const vessels: Record<Dish['id'], { outer: string; rim: string }> = {
  biryani: { outer: 'url(#vessel-brass)', rim: '#f3d58c' },
  curry: { outer: 'url(#vessel-clay)', rim: '#5b4636' },
  sambar: { outer: 'url(#vessel-copper)', rim: '#f0a874' },
}

function Food({ id, spiced }: { id: Dish['id']; spiced: boolean }) {
  if (id === 'biryani') return <Biryani spiced={spiced} />
  if (id === 'curry') return <Curry spiced={spiced} />
  return <Sambar spiced={spiced} />
}

/**
 * clipRef — the <circle> whose radius reveals the spiced layer.
 * sprinkleRef — group whose children are the falling spice grains.
 */
export const DishArt = memo(function DishArt({
  dish,
  clipRef,
  sprinkleRef,
  sprinkleColor,
}: {
  dish: Dish
  clipRef: (el: SVGCircleElement | null) => void
  sprinkleRef: (el: SVGGElement | null) => void
  sprinkleColor: string
}) {
  const v = vessels[dish.id]
  const sprinkles = useMemo(() => {
    const rnd = seeded(dish.id.length * 13)
    return Array.from({ length: 46 }, (_, i) => {
      const [x, y] = inCircle(rnd, 135)
      return { x, y, r: 1.6 + rnd() * 2.4, d: rnd() * 0.35, key: i }
    })
  }, [dish.id])

  return (
    <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible" role="img" aria-label={`${dish.name}, top-down illustration`}>
      <defs>
        <radialGradient id="vessel-brass" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#f6dc94" />
          <stop offset="0.5" stopColor="#c9963e" />
          <stop offset="1" stopColor="#7a5418" />
        </radialGradient>
        <radialGradient id="vessel-clay" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#4a3a30" />
          <stop offset="0.6" stopColor="#231914" />
          <stop offset="1" stopColor="#0f0a08" />
        </radialGradient>
        <radialGradient id="vessel-copper" cx="40%" cy="35%" r="70%">
          <stop offset="0" stopColor="#f2b382" />
          <stop offset="0.5" stopColor="#b8642f" />
          <stop offset="1" stopColor="#5e2a10" />
        </radialGradient>
        <radialGradient id="bir-chicken" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#e08a48" />
          <stop offset="0.6" stopColor="#a8471b" />
          <stop offset="1" stopColor="#5e220a" />
        </radialGradient>
        <radialGradient id="curry-gravy" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#d6521f" />
          <stop offset="0.65" stopColor="#a5300f" />
          <stop offset="1" stopColor="#6a1a07" />
        </radialGradient>
        <radialGradient id="curry-pale" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#f2e4c4" />
          <stop offset="1" stopColor="#d4bf92" />
        </radialGradient>
        <radialGradient id="curry-chunk" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#c4622c" />
          <stop offset="1" stopColor="#5a1d08" />
        </radialGradient>
        <radialGradient id="sambar-liquid" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#d98436" />
          <stop offset="0.6" stopColor="#b25a22" />
          <stop offset="1" stopColor="#6e2f0e" />
        </radialGradient>
        <radialGradient id="sambar-pale" cx="45%" cy="40%" r="65%">
          <stop offset="0" stopColor="#f3e0a0" />
          <stop offset="1" stopColor="#d6bb64" />
        </radialGradient>
        <radialGradient id="food-shade" cx="50%" cy="50%" r="50%">
          <stop offset="0.7" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.45" />
        </radialGradient>
        <clipPath id={`food-${dish.id}`}>
          <circle cx={C} cy={C} r={152} />
        </clipPath>
        <clipPath id={`reveal-${dish.id}`}>
          <circle ref={clipRef} cx={C} cy={C} r={0} />
        </clipPath>
      </defs>

      {/* shadow + vessel */}
      <ellipse cx={C + 10} cy={C + 18} rx={196} ry={192} fill="#000" opacity={0.45} filter="blur(6px)" />
      <circle cx={C} cy={C} r={192} fill={v.outer} />
      <circle cx={C} cy={C} r={186} fill="none" stroke={v.rim} strokeOpacity={0.5} strokeWidth={1.5} />
      <circle cx={C} cy={C} r={160} fill="#000" opacity={0.35} />

      <g clipPath={`url(#food-${dish.id})`}>
        <Food id={dish.id} spiced={false} />
        <g clipPath={`url(#reveal-${dish.id})`}>
          <Food id={dish.id} spiced />
        </g>
        <circle cx={C} cy={C} r={152} fill="url(#food-shade)" />
      </g>

      {/* falling spice */}
      <g ref={sprinkleRef}>
        {sprinkles.map((s) => (
          <circle key={s.key} cx={s.x} cy={s.y} r={s.r} fill={sprinkleColor} data-d={s.d} opacity={0} />
        ))}
      </g>
    </svg>
  )
})
