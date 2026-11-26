import { useId, useMemo, type CSSProperties } from 'react';
import { jarTexture, type JarModel } from '@/data/jars';
import { cn } from '@/utils/cn';

interface Jar3DProps {
  jar: JarModel;
  /** Body diameter in px. */
  size: number;
  /** Seconds per full turn. */
  spinSeconds?: number;
  /** Orbiting gold rings + drifting spice motes. */
  effects?: boolean;
  /** Gentle hover (off when the jar stands on something). */
  float?: boolean;
  /** Draw the jar's own floor shadow. */
  shadow?: boolean;
  className?: string;
}

const FACES = 36;
const TILT = (10 * Math.PI) / 180; // camera looks slightly down onto the jar

/**
 * Lightweight 3D jar in pure CSS — no WebGL needed, so it renders instantly.
 *
 * The body is a true 3D cylinder (36 faces, `preserve-3d`) wrapped with the label
 * unwrapped from the product photo, spinning in place. Glass, gold band, lid and base
 * are view-dependent, so they are drawn as a screen-space SVG layer aligned to the
 * cylinder's projected outline: the label turns *behind* fixed reflections, like real glass.
 */
export function Jar3D({ jar, size, spinSeconds = 12, effects = true, float = true, shadow = true, className }: Jar3DProps) {
  const uid = useId().replace(/:/g, '');
  const g = useMemo(() => geometry(size, jar.aspect), [size, jar.aspect]);
  const { r, H, P, faceW, perimeter, W, Htot, cy } = g;
  const tex = `url(${jarTexture(jar.slug, 1024)})`;

  const body = g.ellipse(H / 2, r);
  const top = g.ellipse(-H / 2, r);
  const glassTop = g.ellipse(-H / 2, r * 1.06);
  const glassBot = g.ellipse(H / 2, r * 1.06);
  const baseBot = g.ellipse(H / 2 + r * 0.16, r * 1.04);
  const neck = g.ellipse(-H / 2 - r * 0.2, r * 0.86);
  const bandTop = g.ellipse(-H / 2 - r * 0.33, r * 0.88);
  const rimBot = g.ellipse(-H / 2 - r * 0.35, r * 0.98);
  const rimTop = g.ellipse(-H / 2 - r * 0.45, r * 0.98);
  const domeTop = g.ellipse(-H / 2 - r * 0.78, r * 0.2);
  const knobC = g.point(-H / 2 - r * 0.98);

  const id = (n: string) => `${uid}-${n}`;
  const frontArc = (e: Ellipse) => `A ${e.rx} ${e.ry} 0 0 0 ${e.rx} ${e.cy}`;
  const cylinder = (t: Ellipse, b: Ellipse) =>
    `M ${-t.rx} ${t.cy} L ${-b.rx} ${b.cy} A ${b.rx} ${b.ry} 0 0 0 ${b.rx} ${b.cy} L ${t.rx} ${t.cy} A ${t.rx} ${t.ry} 0 0 0 ${-t.rx} ${t.cy} Z`;

  return (
    <div className={cn('jar3d relative select-none', className)} style={{ width: W, height: Htot }} aria-hidden="true">
      {/* warm glow + floor shadow */}
      <div
        className="absolute left-1/2 rounded-full blur-2xl"
        style={{ width: r * 4.2, height: r * 4.2, top: cy - r * 2.1, marginLeft: -r * 2.1, background: `radial-gradient(circle, ${jar.powder}88, transparent 65%)` }}
      />
      {shadow && <div
        className={cn('absolute left-1/2 rounded-[50%]', float && 'jar3d-shadow')}
        style={{ width: r * 2.9, height: r * 0.42, marginLeft: -r * 1.45, top: cy + baseBot.cy + r * 0.32, background: 'radial-gradient(closest-side, rgba(0,0,0,0.6), transparent)' }}
      />}

      <div className={cn('absolute inset-0', float && 'jar3d-float')}>
        {effects && <Ring r={r} cy={cy} half="back" />}

        {/* ---- the rotating 3D body ---- */}
        <div className="absolute inset-0" style={{ perspective: P, perspectiveOrigin: `50% ${cy}px` }}>
          <div className="absolute left-1/2" style={{ top: cy, transformStyle: 'preserve-3d', transform: `rotateX(${-TILT}rad)` }}>
            <div className="jar3d-spin" style={{ transformStyle: 'preserve-3d', animationDuration: `${spinSeconds}s` } as CSSProperties}>
              {Array.from({ length: FACES }, (_, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    width: faceW + 0.9,
                    height: H,
                    left: -faceW / 2,
                    top: -H / 2,
                    backgroundImage: tex,
                    backgroundSize: `${perimeter}px ${H}px`,
                    backgroundPosition: `${-(i - 0.5) * faceW}px 0`,
                    backgroundRepeat: 'repeat-x',
                    backfaceVisibility: 'hidden',
                    transform: `rotateY(${(i * 360) / FACES}deg) translateZ(${r - 0.2}px)`,
                  }}
                />
              ))}
              {/* ground spice surface */}
              <div
                className="absolute rounded-full"
                style={{
                  width: 2 * r,
                  height: 2 * r,
                  left: -r,
                  top: -r,
                  background: `radial-gradient(circle at 45% 40%, ${jar.powder}, color-mix(in srgb, ${jar.powder} 55%, black))`,
                  transform: `rotateX(90deg) translateZ(${H / 2}px)`,
                }}
              />
            </div>
          </div>
        </div>

        {/* ---- glass, lid & reflections (screen space) ---- */}
        <svg className="absolute inset-0 overflow-visible" width={W} height={Htot} viewBox={`${-W / 2} ${-cy} ${W} ${Htot}`}>
          <defs>
            <linearGradient id={id('shade')} x1="0" x2="1">
              <stop offset="0" stopColor="#000" stopOpacity="0.62" />
              <stop offset="0.2" stopColor="#000" stopOpacity="0.08" />
              <stop offset="0.55" stopColor="#000" stopOpacity="0" />
              <stop offset="0.82" stopColor="#000" stopOpacity="0.22" />
              <stop offset="1" stopColor="#000" stopOpacity="0.72" />
            </linearGradient>
            <linearGradient id={id('spec')} x1="0" x2="1">
              <stop offset="0.1" stopColor="#fff6e6" stopOpacity="0" />
              <stop offset="0.17" stopColor="#fff6e6" stopOpacity="0.55" />
              <stop offset="0.21" stopColor="#fff6e6" stopOpacity="0.08" />
              <stop offset="0.26" stopColor="#fff6e6" stopOpacity="0.22" />
              <stop offset="0.3" stopColor="#fff6e6" stopOpacity="0" />
              <stop offset="0.84" stopColor="#fff6e6" stopOpacity="0" />
              <stop offset="0.88" stopColor="#fff6e6" stopOpacity="0.32" />
              <stop offset="0.91" stopColor="#fff6e6" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={id('gold')} x1="0" x2="1">
              <stop offset="0" stopColor="#5e4316" />
              <stop offset="0.16" stopColor="#c99a3e" />
              <stop offset="0.26" stopColor="#fbe7b5" />
              <stop offset="0.38" stopColor="#c99a3e" />
              <stop offset="0.7" stopColor="#8a6a2a" />
              <stop offset="0.86" stopColor="#e4c17a" />
              <stop offset="1" stopColor="#4a3412" />
            </linearGradient>
            <linearGradient id={id('glass')} x1="0" x2="1">
              <stop offset="0" stopColor="#fff" stopOpacity="0.34" />
              <stop offset="0.12" stopColor="#fff" stopOpacity="0.06" />
              <stop offset="0.3" stopColor="#fff" stopOpacity="0.2" />
              <stop offset="0.45" stopColor="#fff" stopOpacity="0.04" />
              <stop offset="0.88" stopColor="#fff" stopOpacity="0.08" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.3" />
            </linearGradient>
            <radialGradient id={id('knob')} cx="0.38" cy="0.32" r="0.75">
              <stop offset="0" stopColor="#fff" stopOpacity="0.95" />
              <stop offset="0.18" stopColor="#fff" stopOpacity="0.3" />
              <stop offset="0.7" stopColor="#f3d9a0" stopOpacity="0.12" />
              <stop offset="1" stopColor="#fff" stopOpacity="0.45" />
            </radialGradient>
          </defs>

          {/* glass base */}
          <path d={cylinder(glassBot, baseBot)} fill={`url(#${id('glass')})`} />
          <path d={`M ${-baseBot.rx} ${baseBot.cy} ${frontArc(baseBot)}`} fill="none" stroke="#fff" strokeOpacity="0.4" strokeWidth={0.8} />

          {/* body shading + glass wall + speculars */}
          <path d={cylinder(top, body)} fill={`url(#${id('shade')})`} />
          <path d={cylinder(glassTop, glassBot)} fill={`url(#${id('spec')})`} />
          <path d={`M ${-glassTop.rx} ${glassTop.cy} L ${-glassBot.rx} ${glassBot.cy}`} stroke="#fff" strokeOpacity="0.45" strokeWidth={1.1} />
          <path d={`M ${glassTop.rx} ${glassTop.cy} L ${glassBot.rx} ${glassBot.cy}`} stroke="#fff" strokeOpacity="0.25" strokeWidth={1} />
          <path d={`M ${-glassBot.rx} ${glassBot.cy} ${frontArc(glassBot)}`} fill="none" stroke="#fff" strokeOpacity="0.28" strokeWidth={1} />

          {/* shoulder into the neck */}
          <path
            d={`M ${-glassTop.rx} ${glassTop.cy} C ${-glassTop.rx} ${glassTop.cy - r * 0.14}, ${-neck.rx} ${neck.cy + r * 0.04}, ${-neck.rx} ${neck.cy}
                L ${neck.rx} ${neck.cy} C ${neck.rx} ${neck.cy + r * 0.04}, ${glassTop.rx} ${glassTop.cy - r * 0.14}, ${glassTop.rx} ${glassTop.cy}
                A ${glassTop.rx} ${glassTop.ry} 0 0 1 ${-glassTop.rx} ${glassTop.cy} Z`}
            fill={`url(#${id('glass')})`}
            stroke="#fff"
            strokeOpacity="0.3"
            strokeWidth={0.8}
          />

          {/* gold neck band */}
          <path d={cylinder(bandTop, neck)} fill={`url(#${id('gold')})`} />
          <path d={`M ${-neck.rx} ${neck.cy} ${frontArc(neck)}`} fill="none" stroke="#3b2808" strokeOpacity="0.5" strokeWidth={0.8} />

          {/* glass lid: rim, dome, knob */}
          <path d={cylinder(rimTop, rimBot)} fill={`url(#${id('glass')})`} stroke="#fff" strokeOpacity="0.4" strokeWidth={0.8} />
          <ellipse cx={0} cy={rimTop.cy} rx={rimTop.rx} ry={rimTop.ry} fill="#fff" fillOpacity="0.07" stroke="#fff" strokeOpacity="0.35" strokeWidth={0.8} />
          <path
            d={`M ${-rimTop.rx * 0.92} ${rimTop.cy} C ${-rimTop.rx * 0.9} ${domeTop.cy + r * 0.05}, ${-domeTop.rx * 2.2} ${domeTop.cy}, ${-domeTop.rx} ${domeTop.cy}
                L ${domeTop.rx} ${domeTop.cy} C ${domeTop.rx * 2.2} ${domeTop.cy}, ${rimTop.rx * 0.9} ${domeTop.cy + r * 0.05}, ${rimTop.rx * 0.92} ${rimTop.cy} Z`}
            fill={`url(#${id('glass')})`}
            stroke="#fff"
            strokeOpacity="0.32"
            strokeWidth={0.8}
          />
          <path
            d={`M ${-rimTop.rx * 0.62} ${rimTop.cy - r * 0.05} Q ${-rimTop.rx * 0.5} ${domeTop.cy + r * 0.08} ${-domeTop.rx * 1.2} ${domeTop.cy + r * 0.04}`}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.6"
            strokeWidth={1.4}
            strokeLinecap="round"
          />
          <rect x={-r * 0.09} y={knobC.y + r * 0.12} width={r * 0.18} height={domeTop.cy - knobC.y - r * 0.1} fill="#fff" fillOpacity="0.18" />
          <ellipse cx={0} cy={knobC.y} rx={r * 0.26} ry={r * 0.21} fill={`url(#${id('knob')})`} stroke="#fff" strokeOpacity="0.45" strokeWidth={0.8} />
        </svg>

        {effects && <Ring r={r} cy={cy} half="front" />}
      </div>

      {effects && <Motes r={r} cy={cy} color={jar.powder} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Ring({ r, cy, half }: { r: number; cy: number; half: 'back' | 'front' }) {
  const d = r * 3.3;
  return (
    <div
      className="absolute inset-0"
      style={{ perspective: r * 12, perspectiveOrigin: `50% ${cy}px`, clipPath: half === 'back' ? `inset(0 0 ${`calc(100% - ${cy}px)`} 0)` : `inset(${cy}px 0 0 0)` }}
    >
      <div className="absolute left-1/2" style={{ top: cy, transform: 'rotateX(76deg)', transformStyle: 'preserve-3d' }}>
        <div className="jar3d-ring absolute rounded-full border border-dashed border-gold/55" style={{ width: d, height: d, left: -d / 2, top: -d / 2 }} />
        <div className="jar3d-ring-rev absolute rounded-full border border-gold-light/25" style={{ width: d * 1.18, height: d * 1.18, left: -d * 0.59, top: -d * 0.59 }} />
      </div>
    </div>
  );
}

const MOTES = Array.from({ length: 16 }, (_, i) => {
  const a = Math.sin(i * 91.7) * 0.5 + 0.5;
  const b = Math.sin(i * 37.3) * 0.5 + 0.5;
  return { x: (a - 0.5) * 3.4, y: b * 1.6, s: 2 + ((i * 7) % 4), d: 4 + ((i * 13) % 5), delay: -((i * 1.7) % 6), gold: i % 3 !== 0 };
});

function Motes({ r, cy, color }: { r: number; cy: number; color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {MOTES.map((m, i) => (
        <span
          key={i}
          className="jar3d-mote absolute rounded-full"
          style={{
            left: `calc(50% + ${m.x * r}px)`,
            top: cy + m.y * r,
            width: m.s,
            height: m.s,
            background: m.gold ? '#e4c17a' : color,
            boxShadow: `0 0 ${m.s * 3}px ${m.gold ? '#e4c17a' : color}`,
            animationDuration: `${m.d}s`,
            animationDelay: `${m.delay}s`,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */

interface Ellipse {
  cy: number;
  rx: number;
  ry: number;
}

/** Perspective projection matching the CSS 3D body, so the SVG layer lines up with it. */
function geometry(D: number, aspect: number) {
  const r = D / 2;
  const H = aspect * r;
  const P = D * 7;
  const cos = Math.cos(TILT);
  const sin = Math.sin(TILT);
  const project = (x: number, y: number, z: number) => {
    const yr = y * cos + z * sin;
    const zr = -y * sin + z * cos;
    const s = P / (P - zr);
    return { x: x * s, y: yr * s };
  };
  const ellipse = (y: number, radius: number): Ellipse => {
    const front = project(0, y, radius);
    const back = project(0, y, -radius);
    return { cy: (front.y + back.y) / 2, ry: (front.y - back.y) / 2, rx: project(radius, y, 0).x };
  };
  const point = (y: number) => project(0, y, 0);

  const faceW = 2 * r * Math.tan(Math.PI / FACES);
  const perimeter = faceW * FACES;
  const above = -point(-H / 2 - r * 1.25).y; // knob top
  const below = point(H / 2).y + r * 0.95; // base + shadow
  return { r, H, P, faceW, perimeter, W: Math.round(D * 2.1), Htot: Math.round(above + below), cy: above, ellipse, point };
}
