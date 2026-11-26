import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'framer-motion';
import { pour } from './pourState';

/*
 * Homepage-only flow layer: carries the masala pouring from the banner's 3D jar down past the
 * bottom of the banner and lets it land on the top edge of the next section, where it builds a
 * small mound of spice with dust puffs. Particles live in page coordinates, so the stream and the
 * mound scroll naturally with the page. One fixed 2D canvas, pointer-events off, paused when idle.
 */

const MAX = 1600;
const GRAVITY = 1700; // px/s²
const BIN = 4; // mound resolution (px)
const MAX_PILE = 44; // px
const PALETTE = ['#d8a02a', '#a6301d', '#c4622a', '#e0aa2e', '#6e5a35', '#b99a5e', '#9c2b1b', '#3c3127', '#d9a830'];

/** Pre-rendered soft, top-lit grain for each colour (cheap to stamp thousands of times). */
function makeSprites() {
  return PALETTE.map((c) => {
    const s = 24;
    const cv = document.createElement('canvas');
    cv.width = cv.height = s;
    const ctx = cv.getContext('2d')!;
    const g = ctx.createRadialGradient(s * 0.4, s * 0.38, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0, '#fff3d6');
    g.addColorStop(0.18, c);
    g.addColorStop(0.7, c);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, s / 2, 0, Math.PI * 2);
    ctx.fill();
    return cv;
  });
}

export function SpiceFlow() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) return;
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const hero = document.querySelector<HTMLElement>('section[aria-label="Introduction"]');
    if (!hero) return;
    const sprites = makeSprites();
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const cap = coarse ? 700 : MAX;

    // particles (struct of arrays): x, y, vx, vy, size, colour, kind (0 grain, 1 dust), life
    const px = new Float32Array(MAX), py = new Float32Array(MAX), vx = new Float32Array(MAX), vy = new Float32Array(MAX);
    const sz = new Float32Array(MAX), col = new Uint8Array(MAX), kind = new Uint8Array(MAX), life = new Float32Array(MAX);
    let n = 0;
    let pile = new Float32Array(0);
    let speck = new Uint8Array(0);
    let dpr = 1, W = 0, H = 0, floor = 0;
    let carry = 0;
    let raf = 0;
    let last = performance.now();
    let idleFrames = 0;

    const measure = () => {
      dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      floor = hero.getBoundingClientRect().bottom + window.scrollY; // top edge of the next section
      const bins = Math.ceil(W / BIN) + 1;
      if (pile.length !== bins) {
        const next = new Float32Array(bins);
        next.set(pile.subarray(0, Math.min(bins, pile.length)));
        pile = next;
        speck = new Uint8Array(bins * 3).map(() => Math.floor(Math.random() * PALETTE.length));
      }
    };
    measure();

    const spawn = (x: number, y: number, vxi: number, vyi: number, size: number, c: number, k: number, l: number) => {
      if (n >= cap) return;
      px[n] = x; py[n] = y; vx[n] = vxi; vy[n] = vyi; sz[n] = size; col[n] = c; kind[n] = k; life[n] = l;
      n++;
    };
    const kill = (i: number) => {
      n--;
      px[i] = px[n]; py[i] = py[n]; vx[i] = vx[n]; vy[i] = vy[n]; sz[i] = sz[n]; col[i] = col[n]; kind[i] = kind[n]; life[i] = life[n];
    };

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const scroll = window.scrollY;
      const near = scroll < floor + H * 0.6; // banner / next section on screen
      const rate = near ? pour.rate : 0;

      // the mound slowly disappears when the visitor scrolls back up and the jar rights itself
      let pileTotal = 0;
      if (pour.progress < 0.05) for (let b = 0; b < pile.length; b++) pile[b] *= 0.9;
      for (let b = 0; b < pile.length; b++) pileTotal += pile[b];

      if (!near || (n === 0 && rate < 0.01 && pileTotal < 1)) {
        if (idleFrames++ === 0) ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      idleFrames = 0;

      /* emit from the jar mouth */
      const u = Math.max(8, pour.unitPx);
      carry += rate * (coarse ? 190 : 420) * dt;
      while (carry >= 1) {
        carry -= 1;
        const spread = (Math.random() - 0.5) * u * 0.9;
        const speed = u * (1.4 + Math.random() * 1.8);
        spawn(
          pour.x + -pour.dirY * spread * 0.6,
          pour.y + pour.dirX * spread * 0.6,
          pour.dirX * speed + (Math.random() - 0.5) * u * 1.1,
          pour.dirY * speed + (Math.random() - 0.5) * u * 0.8,
          1.4 + Math.random() * (Math.random() < 0.12 ? 4.5 : 2.4),
          (Math.random() * PALETTE.length) | 0,
          0,
          0,
        );
      }

      /* simulate */
      for (let i = n - 1; i >= 0; i--) {
        if (kind[i] === 1) {
          // dust puff: drifts up and out, fades
          life[i] -= dt;
          px[i] += vx[i] * dt;
          py[i] += vy[i] * dt;
          vx[i] *= 0.96;
          vy[i] = vy[i] * 0.95 - 6 * dt;
          if (life[i] <= 0) kill(i);
          continue;
        }
        if (kind[i] === 2) {
          // splash grain: short hop, then gone
          life[i] -= dt;
          vy[i] += GRAVITY * dt;
          px[i] += vx[i] * dt;
          py[i] += vy[i] * dt;
          if (life[i] <= 0) kill(i);
          continue;
        }
        vy[i] += GRAVITY * dt;
        vx[i] *= 0.995;
        px[i] += vx[i] * dt;
        py[i] += vy[i] * dt;
        const b = Math.round(px[i] / BIN);
        if (b < 0 || b >= pile.length) {
          if (py[i] > floor + 200) kill(i);
          continue;
        }
        const surface = floor - pile[b];
        if (py[i] >= surface) {
          // land: grow the mound, sometimes splash or puff
          pile[b] = Math.min(MAX_PILE, pile[b] + sz[i] * 0.5);
          if (Math.random() < 0.06) spawn(px[i], surface, (Math.random() - 0.5) * 220, -120 - Math.random() * 220, sz[i], col[i], 2, 0.35);
          if (Math.random() < 0.025) spawn(px[i], surface - 4, (Math.random() - 0.5) * 70, -20 - Math.random() * 30, 26 + Math.random() * 30, col[i], 1, 1.1 + Math.random() * 0.6);
          kill(i);
        }
      }
      // angle of repose: powder slides down steep slopes
      for (let pass = 0; pass < 2; pass++)
        for (let b = 1; b < pile.length - 1; b++) {
          const l = pile[b] - pile[b - 1], r = pile[b] - pile[b + 1];
          if (l > 2.2) { const m = (l - 2.2) * 0.25; pile[b] -= m; pile[b - 1] += m; }
          if (r > 2.2) { const m = (r - 2.2) * 0.25; pile[b] -= m; pile[b + 1] += m; }
        }

      /* draw (page → viewport) */
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      const oy = -scroll;

      // the mound on the top edge of the next section
      const fy = floor + oy;
      if (fy > -MAX_PILE && fy < H + MAX_PILE && pileTotal > 1) {
        ctx.beginPath();
        ctx.moveTo(0, fy);
        for (let b = 0; b < pile.length; b++) ctx.lineTo(b * BIN, fy - pile[b]);
        ctx.lineTo(W, fy);
        ctx.closePath();
        const g = ctx.createLinearGradient(0, fy - MAX_PILE, 0, fy);
        g.addColorStop(0, '#e0a43a');
        g.addColorStop(0.45, '#b8642a');
        g.addColorStop(1, '#7a3416');
        ctx.fillStyle = g;
        ctx.fill();
        // grain texture + rim light
        for (let b = 0; b < pile.length; b++) {
          const h = pile[b];
          if (h < 1.5) continue;
          for (let k = 0; k < 3; k++) {
            const yy = fy - h * ((k + 0.5) / 3.2);
            ctx.globalAlpha = 0.55;
            ctx.drawImage(sprites[speck[b * 3 + k]], b * BIN - 1.5 + ((k * 7) % 3), yy - 1.5, 3, 3);
          }
        }
        ctx.globalAlpha = 0.5;
        ctx.strokeStyle = '#ffd98f';
        ctx.lineWidth = 1;
        ctx.beginPath();
        let open = false;
        for (let b = 0; b < pile.length; b++) {
          if (pile[b] < 1.5) { open = false; continue; }
          if (!open) { ctx.moveTo(b * BIN, fy - pile[b]); open = true; } else ctx.lineTo(b * BIN, fy - pile[b]);
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      // falling grains, splashes and dust
      for (let i = 0; i < n; i++) {
        const y = py[i] + oy;
        if (y < -20 || y > H + 20) continue;
        const s = sz[i];
        if (kind[i] === 1) {
          ctx.globalAlpha = Math.min(1, life[i]) * 0.16;
          ctx.drawImage(sprites[col[i]], px[i] - s / 2, y - s / 2, s, s);
          continue;
        }
        // motion streak for fast grains
        const speed = Math.abs(vy[i]);
        if (speed > 500) {
          ctx.globalAlpha = 0.35;
          ctx.drawImage(sprites[col[i]], px[i] - vx[i] * 0.012 - s / 2, y - vy[i] * 0.012 - s / 2, s, s);
        }
        ctx.globalAlpha = 1;
        ctx.drawImage(sprites[col[i]], px[i] - s / 2, y - s / 2, s, s);
      }
      ctx.globalAlpha = 1;
    };

    raf = requestAnimationFrame(tick);
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    // the banner's height can settle after fonts/layout; re-measure the landing edge a few times
    const timers = [400, 1500, 4000].map((ms) => window.setTimeout(measure, ms));
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', onResize);
      timers.forEach(clearTimeout);
    };
  }, [reduced]);

  if (reduced) return null;
  return <canvas ref={ref} aria-hidden="true" className="pointer-events-none fixed inset-0 z-[35] h-full w-full" />;
}
