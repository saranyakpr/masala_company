import * as THREE from 'three';
import type { Product } from '@/types';
import { site } from '@/data/site';
import { packLine } from '@/data/categories';
import { darken, lighten } from '@/utils/color';

const W = 1024;
const H = 1434; // matches pouch front aspect (1.5 × 2.1)

const DISPLAY = '"Fraunces Variable", Georgia, serif';
const SANS = '"Manrope Variable", system-ui, sans-serif';

export async function ensureFonts() {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await Promise.all([
      document.fonts.load(`400 80px ${DISPLAY}`),
      document.fonts.load(`italic 400 40px ${DISPLAY}`),
      document.fonts.load(`700 30px ${SANS}`),
    ]);
  } catch {
    /* fall back to system fonts */
  }
}

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  words.forEach((w) => {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  });
  if (line) lines.push(line);
  return lines;
}

function spaced(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, spacing: number) {
  // letter-spaced centred text
  const chars = text.split('');
  const total = chars.reduce((acc, c) => acc + ctx.measureText(c).width + spacing, -spacing);
  let cx = x - total / 2;
  ctx.textAlign = 'left';
  chars.forEach((c) => {
    ctx.fillText(c, cx, y);
    cx += ctx.measureText(c).width + spacing;
  });
  ctx.textAlign = 'center';
}

function base(ctx: CanvasRenderingContext2D, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, W, H);
  // fine paper/foil grain
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    img.data[i] += n;
    img.data[i + 1] += n;
    img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);
  // top seal band
  ctx.fillStyle = darken(color, 0.2);
  ctx.fillRect(0, 0, W, 150);
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.fillRect(0, 150, W, 4);
}

/** Front label of the procedural pouch. */
export function createFrontLabel(product: Product, weight: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const { base: bg, accent, spice, text } = product.palette;
  base(ctx, bg);

  // zip line
  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.5;
  ctx.setLineDash([6, 10]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(110, 205);
  ctx.lineTo(W - 110, 205);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.globalAlpha = 1;

  // frames
  ctx.strokeStyle = accent;
  ctx.lineWidth = 4;
  ctx.strokeRect(130, 280, W - 260, 960);
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 2;
  ctx.strokeRect(150, 300, W - 300, 920);
  ctx.globalAlpha = 1;

  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = `700 34px ${SANS}`;
  spaced(ctx, site.wordmark, W / 2, 385, 16);
  ctx.globalAlpha = 0.6;
  ctx.fillStyle = text;
  ctx.font = `700 20px ${SANS}`;
  spaced(ctx, packLine[product.category], W / 2, 428, 8);
  ctx.globalAlpha = 1;

  // spice window
  const cx = W / 2, cy = 610, r = 130;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r + 22, 0, Math.PI * 2);
  ctx.stroke();
  const g = ctx.createRadialGradient(cx - 40, cy - 50, 10, cx, cy, r);
  g.addColorStop(0, lighten(spice, 0.3));
  g.addColorStop(0.6, spice);
  g.addColorStop(1, darken(spice, 0.4));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  // grains
  for (let i = 0; i < 900; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.sqrt(Math.random()) * r;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.16)';
    ctx.fillRect(cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2.2, 2.2);
  }
  ctx.fillStyle = accent;
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(a) * (r + 44), cy + Math.sin(a) * (r + 44), 4.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // name
  ctx.fillStyle = text;
  ctx.font = `400 92px ${DISPLAY}`;
  const lines = wrap(ctx, product.name, W - 340);
  let y = 900;
  lines.forEach((l) => {
    ctx.fillText(l, W / 2, y);
    y += 96;
  });
  ctx.fillStyle = accent;
  ctx.font = `italic 400 46px ${DISPLAY}`;
  ctx.fillText(product.localName, W / 2, y - 18);

  ctx.strokeStyle = accent;
  ctx.globalAlpha = 0.6;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(W / 2 - 150, 1130);
  ctx.lineTo(W / 2 + 150, 1130);
  ctx.stroke();
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = text;
  ctx.font = `700 30px ${SANS}`;
  spaced(ctx, `NET WT ${weight.toUpperCase()}`, W / 2, 1185, 7);
  ctx.globalAlpha = 1;

  // bottom gusset shade
  const sg = ctx.createLinearGradient(0, H - 150, 0, H);
  sg.addColorStop(0, 'rgba(0,0,0,0)');
  sg.addColorStop(1, 'rgba(0,0,0,0.35)');
  ctx.fillStyle = sg;
  ctx.fillRect(0, H - 150, W, 150);

  return finalize(canvas);
}

/** Back panel: ingredients and a clear "illustrative render" notice. */
export function createBackLabel(product: Product): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const { base: bg, accent, text } = product.palette;
  base(ctx, bg);

  ctx.textAlign = 'center';
  ctx.fillStyle = accent;
  ctx.font = `700 30px ${SANS}`;
  spaced(ctx, 'INGREDIENTS', W / 2, 340, 10);
  ctx.fillStyle = text;
  ctx.globalAlpha = 0.85;
  ctx.font = `400 44px ${DISPLAY}`;
  let y = 430;
  wrap(ctx, product.ingredients.join(' · '), W - 300).forEach((l) => {
    ctx.fillText(l, W / 2, y);
    y += 60;
  });
  ctx.globalAlpha = 1;

  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.strokeRect(170, y + 50, W - 340, 230);
  ctx.fillStyle = text;
  ctx.globalAlpha = 0.6;
  ctx.font = `700 22px ${SANS}`;
  spaced(ctx, 'STORAGE', W / 2, y + 110, 8);
  ctx.font = `400 30px ${SANS}`;
  ctx.fillText('Store in a cool, dry place.', W / 2, y + 165);
  ctx.fillText('Reseal after every use.', W / 2, y + 210);
  ctx.globalAlpha = 1;

  ctx.fillStyle = accent;
  ctx.globalAlpha = 0.75;
  ctx.font = `italic 400 30px ${DISPLAY}`;
  ctx.fillText('Illustrative render — final artwork pending', W / 2, H - 230);
  ctx.globalAlpha = 1;
  return finalize(canvas);
}

function finalize(canvas: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  tex.needsUpdate = true;
  return tex;
}
