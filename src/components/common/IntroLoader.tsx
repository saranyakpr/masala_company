import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Jar3D } from './Jar3D';
import { useLenis } from './SmoothScroll';
import { markIntroDone, waitForHeroReady } from './introState';
import { jarTexture, loaderJar } from '@/data/jars';
import { filmAssets, filmChapters } from '@/data/film';
import { site } from '@/data/site';
import { useWebGL } from '@/hooks/useWebGL';
import { easePremium } from '@/animations/variants';

const SEEN_KEY = 'masala:intro-seen';

const stages = [
  { at: 0, label: 'Sourcing whole spices' },
  { at: 28, label: 'Slow-drying the harvest' },
  { at: 55, label: 'Grinding cool, batch by batch' },
  { at: 82, label: 'Sealing the jar' },
  { at: 100, label: 'Ready' },
];

const GOLD = 'bg-gradient-to-b from-[#fbe9b4] via-[#e4c17a] to-[#b07e2c] bg-clip-text text-transparent [filter:drop-shadow(0_2px_10px_rgba(0,0,0,0.6))]';

const loadImage = (src: string) =>
  new Promise<void>((resolve) => {
    const img = new Image();
    img.onload = img.onerror = () => resolve();
    img.src = src;
  });

/** The route's own code chunk (same specifiers as App.tsx, so Vite shares the request). */
function routeChunk(pathname: string): Promise<unknown> {
  const seg = pathname.split('/')[1] ?? '';
  switch (seg) {
    case '':
      return import('@/pages/Home');
    case 'about':
      return import('@/pages/About');
    case 'products':
      return pathname.split('/').length > 2 ? import('@/pages/ProductDetail') : import('@/pages/Products');
    case 'ingredients':
      return import('@/pages/Ingredients');
    case 'process':
      return import('@/pages/Process');
    case 'quality':
      return import('@/pages/Quality');
    case 'contact':
      return import('@/pages/Contact');
    default:
      return import('@/pages/NotFound');
  }
}

function safeSession(get: true): boolean;
function safeSession(get: false): void;
function safeSession(get: boolean) {
  try {
    if (get) return sessionStorage.getItem(SEEN_KEY) === '1';
    sessionStorage.setItem(SEEN_KEY, '1');
  } catch {
    return false;
  }
}

/** Fixed spray pattern for the CSS spice burst: 11 spikes (angle, distance in jar radii, size px). */
const BURST = Array.from({ length: 52 }, (_, i) => {
  const a = ((i % 12) / 12) * Math.PI * 2 + Math.sin(i * 12.9) * 0.16;
  return { a, d: 1.5 + ((Math.sin(i * 7.3) + 1) / 2) * 1.7, s: 3 + ((i * 5) % 6), delay: ((i * 3) % 7) * 0.025 };
});

/**
 * First-load screen in the style of the reference video (and the banner): the client's Biryani Masala
 * jar turning in CSS 3D on a wooden log slice under warm light shafts, with the video's spice bursts
 * blooming behind it and their gold titles, a golden light trail circling the jar, and a progress
 * figure driven by real work — fonts, the page's code and, on the homepage, the 3D banner.
 */
export function IntroLoader() {
  const { pathname } = useLocation();
  const lenis = useLenis();
  const reduced = useReducedMotion();
  const webgl = useWebGL();
  const [visible, setVisible] = useState(true);
  const [shown, setShown] = useState(0);
  const [spice, setSpice] = useState(0);
  const target = useRef(0);
  const start = useRef(performance.now());
  const [size] = useState(() => Math.round(Math.max(92, Math.min(150, Math.min(window.innerWidth, window.innerHeight) * 0.2))));

  // Real loading work.
  useEffect(() => {
    const tasks: Promise<unknown>[] = [document.fonts?.ready ?? Promise.resolve(), loadImage(jarTexture(loaderJar.slug)), routeChunk(pathname)];
    if (pathname === '/' && webgl) {
      tasks.push(import('@/three/HeroScene'));
      Object.values(filmAssets).forEach((src) => tasks.push(loadImage(src)));
      tasks.push(waitForHeroReady(8000));
    }
    let completed = 0;
    tasks.forEach((t) =>
      t
        .catch(() => undefined)
        .then(() => {
          completed += 1;
          target.current = completed / tasks.length;
        }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Smoothly animated percentage; finishes once work is done and the minimum showtime has passed.
  useEffect(() => {
    const minTime = reduced ? 500 : safeSession(true) ? 1200 : 2400;
    const maxTime = 12000;
    let raf = 0;
    let value = 0;
    let last = performance.now();
    const tick = () => {
      const now = performance.now();
      const dt = Math.min(0.5, (now - last) / 1000); // seconds; time-based so slow frames still progress
      last = now;
      const elapsed = now - start.current;
      const timeCap = Math.min(1, elapsed / minTime); // never outrun the minimum showtime
      const forced = elapsed > maxTime;
      const goal = forced ? 100 : Math.min(target.current, timeCap) * 100;
      // ease toward the goal; while work is pending, creep a little ahead so the number never freezes
      const aim = target.current < 1 && !forced ? Math.max(goal, Math.min(value + 2.5 * dt, goal + 6, 97)) : goal;
      value += (aim - value) * (1 - Math.exp(-dt * 6));
      if (goal >= 100 && value > 99.4) value = 100;
      setShown(value);
      if (value >= 100) {
        window.setTimeout(() => {
          markIntroDone();
          setVisible(false);
        }, reduced ? 100 : 380);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduced]);

  // Cycle the video's spice bursts behind the jar.
  useEffect(() => {
    if (reduced || !visible) return;
    const id = window.setInterval(() => setSpice((i) => (i + 1) % filmChapters.length), 1500);
    return () => window.clearInterval(id);
  }, [reduced, visible]);

  // Lock scrolling while visible.
  useEffect(() => {
    if (!visible) return;
    lenis?.stop();
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = 'hidden';
    return () => {
      root.style.overflow = prev;
      lenis?.start();
    };
  }, [visible, lenis]);

  const pct = Math.round(shown);
  const stage = [...stages].reverse().find((s) => pct >= s.at)!;
  const chapter = filmChapters[spice];
  const r = size / 2;

  return (
    <AnimatePresence onExitComplete={() => safeSession(false)}>
      {visible && (
        <motion.div
          key="intro"
          className="grain-light fixed inset-0 z-[95] flex items-center justify-center overflow-hidden bg-[#1e0b07] text-ivory"
          role="status"
          aria-live="polite"
          aria-label={`Loading ${site.name}: ${pct}%`}
          initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
          exit={{ clipPath: 'inset(0% 0% 100% 0%)', transition: { duration: 0.9, ease: easePremium, delay: 0.1 } }}
        >
          {/* warm studio backdrop + light shafts, as in the reference video and the banner */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'radial-gradient(55% 50% at 50% 40%, rgba(122,70,30,0.9), rgba(60,28,12,0.6) 45%, transparent 78%), radial-gradient(60% 60% at 10% 95%, rgba(163,23,28,0.3), transparent 70%)',
            }}
          />
          <div aria-hidden="true" className="film-rays pointer-events-none absolute -inset-[15%] opacity-80" />

          <motion.div
            className="relative flex flex-col items-center"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.9, ease: easePremium } }}
            exit={{ opacity: 0, y: -40, scale: 1.06, transition: { duration: 0.7, ease: easePremium } }}
          >
            <div className="relative" aria-hidden="true">
              {/* spice burst behind the jar */}
              {!reduced && (
                <div key={spice} className="absolute left-1/2 top-[45%] h-0 w-0">
                  <span
                    className="loader-burst-glow absolute rounded-full"
                    style={{ width: r * 5.4, height: r * 5.4, left: -r * 2.7, top: -r * 2.7, background: `radial-gradient(circle, ${chapter.colors[0]}b0, ${chapter.colors[1]}40 38%, transparent 68%)` }}
                  />
                  {BURST.map((d, i) => (
                    <span
                      key={i}
                      className="loader-burst-dot absolute rounded-full"
                      style={
                        {
                          width: d.s,
                          height: d.s,
                          left: -d.s / 2,
                          top: -d.s / 2,
                          background: i % 3 ? chapter.colors[0] : chapter.colors[1],
                          boxShadow: `0 0 ${d.s * 2}px ${chapter.colors[0]}`,
                          '--dx': `${Math.cos(d.a) * d.d * r}px`,
                          '--dy': `${Math.sin(d.a) * d.d * r}px`,
                          animationDelay: `${d.delay}s`,
                        } as CSSProperties
                      }
                    />
                  ))}
                </div>
              )}

              <Trail r={r} half="back" />

              {/* wooden log slice the jar stands on */}
              <div className="absolute left-1/2 z-0" style={{ width: r * 4, marginLeft: -r * 2, bottom: 0 }}>
                <div className="relative" style={{ height: r * 1.25 }}>
                  <div
                    className="absolute inset-x-0 bottom-0 rounded-b-[50%_45%] shadow-[0_22px_34px_-12px_rgba(0,0,0,0.85)]"
                    style={{ top: r * 0.42, background: `url(${filmAssets.woodSide}) left/auto 100% repeat-x`, filter: 'brightness(0.62)' }}
                  />
                  <div
                    className="absolute inset-x-0 top-0 rounded-[50%]"
                    style={{ height: r * 0.84, background: `url(${filmAssets.woodTop}) center/cover`, boxShadow: 'inset 0 -4px 10px rgba(0,0,0,0.35)' }}
                  />
                </div>
              </div>

              <div className="relative z-10" style={{ marginBottom: r * 0.12 }}>
                <Jar3D jar={loaderJar} size={size} spinSeconds={9} float={false} shadow={false} effects={false} />
              </div>
              <Trail r={r} half="front" />
            </div>

            <div className="mt-6 flex flex-col items-center text-center">
              <span className="relative h-7 w-[min(20rem,80vw)]" aria-hidden="true">
                <AnimatePresence initial={false}>
                  <motion.span
                    key={spice}
                    initial={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -6, filter: 'blur(3px)' }}
                    transition={{ duration: 0.4, ease: easePremium }}
                    className={`absolute inset-x-0 top-0 font-display text-xl italic ${GOLD}`}
                  >
                    {chapter.title}
                  </motion.span>
                </AnimatePresence>
              </span>
              <svg viewBox="0 0 220 24" className="mt-1 w-28 text-gold-light/80" aria-hidden="true">
                <path d="M4 12h70c10 0 14-8 22-8s10 8 14 8 6-8 14-8 12 8 22 8h70" fill="none" stroke="currentColor" strokeWidth="1.2" />
                <path d="M110 4l5 8-5 8-5-8z" fill="currentColor" />
              </svg>
              <p className={`mt-3 font-display text-[clamp(2.8rem,6.5vw,4.2rem)] leading-none tabular-nums ${GOLD}`} aria-hidden="true">
                {pct}
                <span className="ml-1 align-top text-[0.42em]">%</span>
              </p>
              <div className="relative mt-5 h-px w-[min(16rem,60vw)] overflow-hidden bg-ivory/15" aria-hidden="true">
                <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-gold to-gold-light" style={{ width: `${shown}%` }} />
                <div className="loader-sheen absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-ivory/70 to-transparent" />
              </div>
              <span className="eyebrow mt-4 h-4 text-[0.58rem] text-ivory/55">{stage.label}</span>
              <span className="eyebrow mt-3 text-[0.55rem] text-gold-light/60">{site.name}</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/** Golden light trail orbiting the jar — split so it passes behind the jar, then in front. */
function Trail({ r, half }: { r: number; half: 'back' | 'front' }) {
  const w = r * 4.4;
  const h = r * 1.15;
  return (
    <svg
      className={`pointer-events-none absolute left-1/2 overflow-visible ${half === 'front' ? 'z-20' : 'z-[5]'}`}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={{ marginLeft: -w / 2, top: '40%', clipPath: half === 'back' ? 'inset(-60% -10% 50% -10%)' : 'inset(50% -10% -60% -10%)', transform: 'rotate(-8deg)' }}
    >
      <defs>
        <linearGradient id={`loader-trail-${half}`} x1="0" x2="1">
          <stop offset="0" stopColor="#ffd27a" />
          <stop offset="1" stopColor="#fff6dc" />
        </linearGradient>
      </defs>
      <ellipse
        className="loader-trail"
        cx={w / 2}
        cy={h / 2}
        rx={w / 2 - 2}
        ry={h / 2 - 2}
        fill="none"
        stroke={`url(#loader-trail-${half})`}
        strokeWidth={2}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="30 70"
        style={{ filter: 'drop-shadow(0 0 4px #ffcf6b) drop-shadow(0 0 10px rgba(255,190,90,0.6))' }}
      />
    </svg>
  );
}
