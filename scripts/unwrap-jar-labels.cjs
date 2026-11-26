/**
 * Unwraps a jar body from a flat product photo into a 360° cylindrical label texture
 * for the 3D jars (src/three/parts/GlassJar.tsx and src/components/common/Jar3D.tsx).
 *
 * Front ~190° = the photographed label, sine-unwrapped to undo the camera's foreshortening.
 * Back = fine powder grain sampled from the same photo's ground spice.
 *
 * Usage (sharp is not a project dependency):
 *   npm i --no-save sharp && node scripts/unwrap-jar-labels.cjs <folder with the original 1254px photos>
 *
 * To add a jar: measure the inner body box (x0..x1, y0..y1) and a pure-powder rectangle in the
 * original photo, add an entry below, then copy the printed aspect/powder values into src/data/jars.ts.
 */
const path = require('path');
const sharp = require('sharp');
const SRC = process.argv[2];
if (!SRC) throw new Error('Pass the folder containing the original product photos.');
const OUT = path.join(__dirname, '..', 'public', 'images', 'jars');
require('fs').mkdirSync(OUT, { recursive: true });

// file = original uploaded photo (1254×1254): 4 = Chaat, 5 = Chicken, 6 = Biryani Masala. Boxes are in that photo's pixels.
const jars = [
  { slug: 'biryani-masala', file: '6.png', x0: 314, x1: 940, y0: 494, y1: 1038, powder: [480, 440, 780, 494] },
];

const SPAN = (95 * Math.PI) / 180, FADE = (12 * Math.PI) / 180, BETA = (78 * Math.PI) / 180;
let seed = 7; const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);

(async () => {
  const meta = [];
  for (const j of jars) {
    const { data, info } = await sharp(path.join(SRC, j.file)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const SW = info.width, C = 3;
    const px = (x, y) => { const i = (Math.round(y) * SW + Math.round(x)) * C; return [data[i], data[i + 1], data[i + 2]]; };
    const cx = (j.x0 + j.x1) / 2, Rs = (j.x1 - j.x0) / 2, hPx = j.y1 - j.y0;
    const W = 2048, H = Math.round((W * hPx) / (2 * Math.PI * Rs));

    // powder grain: random samples of the real powder pixels, softened
    const [px0, py0, px1, py1] = j.powder;
    const grain = Buffer.alloc(W * H * C); const sum = [0, 0, 0];
    for (let i = 0; i < W * H; i++) {
      const p = px(px0 + rand() * (px1 - px0 - 1), py0 + rand() * (py1 - py0 - 1));
      grain.set(p, i * C); sum[0] += p[0]; sum[1] += p[1]; sum[2] += p[2];
    }
    const soft = await sharp(grain, { raw: { width: W, height: H, channels: 3 } }).blur(0.9).raw().toBuffer();

    const out = Buffer.alloc(W * H * C);
    for (let y = 0; y < H; y++) {
      const sy = j.y0 + (y / (H - 1)) * (hPx - 1);
      for (let x = 0; x < W; x++) {
        let th = (x / W) * 2 * Math.PI; if (th > Math.PI) th -= 2 * Math.PI;
        const a = Math.abs(th), o = (y * W + x) * C;
        let wl = a <= SPAN - FADE ? 1 : a >= SPAN ? 0 : (SPAN - a) / FADE;
        wl = wl * wl * (3 - 2 * wl);
        const g = [soft[o] * 0.84, soft[o + 1] * 0.84, soft[o + 2] * 0.84];
        let col = g;
        if (wl > 0) {
          const s = Math.max(-1, Math.min(1, th / SPAN));
          const l = px(cx + (Rs * 0.93 * Math.sin(s * BETA)) / Math.sin(BETA), sy);
          col = l.map((c, i) => c * wl + g[i] * (1 - wl));
        }
        out[o] = col[0]; out[o + 1] = col[1]; out[o + 2] = col[2];
      }
    }
    const img = sharp(out, { raw: { width: W, height: H, channels: 3 } });
    await img.clone().resize({ width: 1536 }).webp({ quality: 80 }).toFile(`${OUT}/${j.slug}-1536.webp`);
    await img.clone().resize({ width: 1024 }).webp({ quality: 78 }).toFile(`${OUT}/${j.slug}-1024.webp`);
    const hex = '#' + sum.map(v => Math.round((v / (W * H)) * 0.84).toString(16).padStart(2, '0')).join('');
    meta.push({ slug: j.slug, aspect: +(hPx / Rs).toFixed(3), texAspect: +(W / H).toFixed(4), powder: hex });
  }
  console.log(JSON.stringify(meta));
})();
