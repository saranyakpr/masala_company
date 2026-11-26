/**
 * Builds the textures for the homepage "spice film" (src/three/SpiceFilm.tsx) from frames of the
 * client's reference video, plus procedural textures in the video's colours.
 *
 *   npm i --no-save sharp
 *   node scripts/build-film-assets.cjs <closeup-frame.png> <final-frame.png>
 *
 * closeup-frame: the 2.83 s frame (lid lifting, label front-on, 720×1280).
 * final-frame:   the 14.77 s end card (used as the no-WebGL poster).
 */
const path = require('path');
const sharp = require('sharp');

const [closeup, finalFrame] = process.argv.slice(2);
if (!closeup || !finalFrame) throw new Error('Pass the close-up frame and the final frame.');
const OUT = path.join(__dirname, '..', 'public', 'images', 'film');
require('fs').mkdirSync(OUT, { recursive: true });

let seed = 11;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

/* value noise for organic edges */
function makeNoise(size = 256) {
  const g = new Float32Array(size * size).map(() => rand());
  const at = (x, y) => g[((y % size) + size) % size * size + (((x % size) + size) % size)];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const s = (t) => t * t * (3 - 2 * t);
    const a = at(xi, yi), b = at(xi + 1, yi), c = at(xi, yi + 1), d = at(xi + 1, yi + 1);
    return a + (b - a) * s(xf) + (c - a) * s(yf) + (a - b - c + d) * s(xf) * s(yf);
  };
}
const noise = makeNoise();
const fbm = (x, y) => noise(x, y) * 0.55 + noise(x * 2.1, y * 2.1) * 0.3 + noise(x * 4.3, y * 4.3) * 0.15;
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));

async function label() {
  const { data, info } = await sharp(closeup).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const W = info.width, C = 3;
  const px = (x, y) => { const i = (y * W + x) * C; return [data[i], data[i + 1], data[i + 2]]; };
  const box = { x0: 165, x1: 570, y0: 685, y1: 1200 };
  const cream = (x, y) => {
    const [r, g, b] = px(x, y); const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
    return mx / 255 > 0.66 && (mx - mn) / mx < 0.3;
  };
  // The label is symmetric, but its right half is shaded to the same tan as one of the spice bands,
  // so detect the well-lit left edge (first run of cream paper scanning inward) and mirror it.
  const bw = box.x1 - box.x0, bh = box.y1 - box.y0;
  const AXIS = 369 - box.x0; // label centre line in the frame
  const RUN = 4;
  const left = new Int32Array(bh).fill(-1), right = new Int32Array(bh).fill(-1);
  for (let y = 0; y < bh; y++) {
    let run = 0;
    for (let x = 0; x < AXIS; x++) { run = cream(box.x0 + x, box.y0 + y) ? run + 1 : 0; if (run === RUN) { left[y] = x - RUN + 1; break; } }
    if (left[y] >= 0 && AXIS - left[y] > 20) right[y] = 2 * AXIS - left[y];
    else left[y] = -1;
  }
  // Below the artwork the edge is broken by leaves: taper the outline from the last clean row to the bottom tip.
  const TIP = 1190 - box.y0;
  let last = -1;
  for (let y = 0; y < Math.min(TIP, bh); y++) if (left[y] >= 0 && y < TIP - 140) last = y;
  if (last > 0) {
    for (let y = last + 1; y <= Math.min(TIP, bh - 1); y++) {
      const t = (y - last) / (TIP - last);
      const l = Math.round(left[last] + (AXIS - 6 - left[last]) * Math.pow(t, 2.2));
      left[y] = l; right[y] = 2 * AXIS - l;
    }
  }
  // median-smooth the outline to remove compression noise
  const med = (arr, y, k = 5) => { const v = []; for (let d = -k; d <= k; d++) { const a = arr[y + d]; if (a !== undefined && a >= 0) v.push(a); } v.sort((a, b) => a - b); return v.length > k ? v[v.length >> 1] : -1; };
  const mask = new Float32Array(bw * bh);
  let minY = bh, maxY = 0, hw = 0, cxSum = 0, rows = 0;
  for (let y = 0; y < bh; y++) {
    const a = med(left, y), b = med(right, y);
    if (a < 0 || b < 0) continue;
    minY = Math.min(minY, y); maxY = Math.max(maxY, y);
    hw = Math.max(hw, (b - a) / 2); cxSum += (a + b) / 2; rows++;
    for (let x = a; x <= b; x++) mask[y * bw + x] = 1;
  }
  // dilate to take in the gold border, then soften the edge
  const D = 6;
  const dil = new Float32Array(bw * bh);
  for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
    let m = 0;
    for (let dy = -D; dy <= D && !m; dy++) for (let dx = -D; dx <= D; dx++) {
      if (dx * dx + dy * dy > D * D) continue;
      const xx = x + dx, yy = y + dy;
      if (xx >= 0 && yy >= 0 && xx < bw && yy < bh && mask[yy * bw + xx]) { m = 1; break; }
    }
    dil[y * bw + x] = m;
  }
  const alpha = await sharp(Buffer.from(dil.map((v) => v * 255)), { raw: { width: bw, height: bh, channels: 1 } }).blur(1.1).extractChannel(0).raw().toBuffer();

  // un-curve: the label is printed on a cylinder (glass radius R px, axis at cx)
  const R = 240, cx = box.x0 + cxSum / rows;
  const halfW = hw + D;
  const thetaMax = Math.asin(Math.min(0.99, halfW / R));
  const y0 = Math.max(0, minY - D), y1 = Math.min(bh - 1, maxY + D);
  const outW = Math.round(2 * thetaMax * R), outH = y1 - y0 + 1;
  const out = Buffer.alloc(outW * outH * 4);
  for (let j = 0; j < outW; j++) {
    const th = ((j + 0.5) / outW * 2 - 1) * thetaMax;
    const sx = cx + R * Math.sin(th);
    const x0 = Math.floor(sx), f = sx - x0;
    for (let i = 0; i < outH; i++) {
      const y = box.y0 + y0 + i;
      const p0 = px(x0, y), p1 = px(x0 + 1, y);
      const a0 = alpha[(y0 + i) * bw + (x0 - box.x0)] ?? 0, a1 = alpha[(y0 + i) * bw + (x0 + 1 - box.x0)] ?? 0;
      const o = (i * outW + j) * 4;
      out[o] = p0[0] * (1 - f) + p1[0] * f; out[o + 1] = p0[1] * (1 - f) + p1[1] * f; out[o + 2] = p0[2] * (1 - f) + p1[2] * f;
      out[o + 3] = a0 * (1 - f) + a1 * f;
    }
  }
  await sharp(out, { raw: { width: outW, height: outH, channels: 4 } }).webp({ quality: 86, alphaQuality: 90 }).toFile(`${OUT}/film-label.webp`);
  return { arc: +(2 * thetaMax).toFixed(4), heightR: +(outH / R).toFixed(4), size: [outW, outH] };
}

/* Layered spice fill: wavy diagonal bands of powder in the video's colours, seamless around the jar. */
async function stripes() {
  const W = 1024, H = 600;
  const palette = ['#b99a5e', '#a6301d', '#d8a02a', '#6e5a35', '#c4622a', '#d9a830', '#3c3127', '#9c2b1b', '#e0aa2e', '#7a6438', '#c45a26', '#3f342a'].map(hex);
  const bands = [];
  let y = -40;
  while (y < H + 80) { const t = 34 + rand() * 30; bands.push(y + t); y += t; }
  const out = Buffer.alloc(W * H * 3);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const th = (i / W) * Math.PI * 2;
    const warp = Math.sin(th + 0.6) * 46 + Math.sin(th * 2 + 1.7) * 14 + (fbm(i / 40, j / 40) - 0.5) * 26 + (noise(i / 6, j / 6) - 0.5) * 7;
    const yy = j + warp;
    let b = 0; while (b < bands.length - 1 && yy > bands[b]) b++;
    const c = palette[b % palette.length];
    const g = 0.78 + rand() * 0.38 + (noise(i / 2.5, j / 2.5) - 0.5) * 0.25;
    const speck = rand() < 0.035 ? (rand() < 0.5 ? 0.45 : 1.35) : 1;
    const o = (j * W + i) * 3;
    for (let k = 0; k < 3; k++) out[o + k] = Math.max(0, Math.min(255, c[k] * g * speck));
  }
  await sharp(out, { raw: { width: W, height: H, channels: 3 } }).blur(0.55).webp({ quality: 82 }).toFile(`${OUT}/film-stripes.webp`);
}

/* Log slice: bark around the side, growth rings on top. */
async function wood() {
  const W = 1024, H = 160;
  const side = Buffer.alloc(W * H * 3);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const v = fbm(i / 9, j / 60) * 0.7 + fbm(i / 3, j / 18) * 0.3;
    const groove = Math.pow(Math.abs(Math.sin(i / 7 + fbm(i / 30, j / 40) * 6)), 6);
    const l = 0.45 + v * 0.75 - groove * 0.35;
    const o = (j * W + i) * 3;
    side[o] = 92 * l; side[o + 1] = 56 * l; side[o + 2] = 30 * l;
  }
  await sharp(side, { raw: { width: W, height: H, channels: 3 } }).webp({ quality: 80 }).toFile(`${OUT}/film-wood-side.webp`);

  const S = 512, top = Buffer.alloc(S * S * 3);
  for (let j = 0; j < S; j++) for (let i = 0; i < S; i++) {
    const dx = (i - S / 2) / (S / 2), dy = (j - S / 2) / (S / 2);
    const r = Math.hypot(dx, dy) + (fbm(i / 50, j / 50) - 0.5) * 0.08;
    const ring = 0.5 + 0.5 * Math.sin(r * 70 + fbm(i / 25, j / 25) * 3);
    const crack = Math.pow(Math.max(0, 1 - Math.abs(Math.atan2(dy, dx) * 3 % 1 - 0.5) * 40), 3) * (r > 0.3 ? 0.4 : 0);
    let l = 0.72 + ring * 0.22 + (noise(i / 2, j / 2) - 0.5) * 0.12 - crack - Math.max(0, r - 0.9) * 3.5;
    l = Math.max(0.12, Math.min(1.2, l * (1.05 - r * 0.25)));
    const o = (j * S + i) * 3;
    top[o] = 150 * l; top[o + 1] = 96 * l; top[o + 2] = 54 * l;
  }
  await sharp(top, { raw: { width: S, height: S, channels: 3 } }).webp({ quality: 80 }).toFile(`${OUT}/film-wood-top.webp`);
}

(async () => {
  const meta = await label();
  await stripes();
  await wood();
  await sharp(finalFrame).resize(720).webp({ quality: 78 }).toFile(`${OUT}/film-poster.webp`);
  console.log(JSON.stringify(meta));
  console.log(require('fs').readdirSync(OUT).map((f) => `${f} ${Math.round(require('fs').statSync(path.join(OUT, f)).size / 1024)}KB`).join('\n'));
})();
