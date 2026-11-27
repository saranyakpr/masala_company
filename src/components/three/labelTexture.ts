import * as THREE from 'three'
import type { Product } from '../../data/products'
import { seeded } from '../../lib/math'

/**
 * Procedurally paints the 12 SPICES jar label (modelled on the real pack:
 * black wrap, gold swooshes, Cinzel wordmark, two-tone product name, bowl of
 * powder, veg mark, net weight).
 *
 * The label is a full 360° wrap: u = 0.5 faces the camera (front panel),
 * u = 0 / 1 is the back panel.
 *
 * mode 'color' → albedo, mode 'metal' → white where the print is gold foil.
 */
export const LABEL_W = 2048
export const LABEL_H = 768

type Mode = 'color' | 'metal'

interface Paint {
  gold: (ctx: CanvasRenderingContext2D, y0: number, y1: number) => string | CanvasGradient
  cream: string
  green: string
  ink: string
  muted: string
}

function paints(mode: Mode): Paint {
  if (mode === 'metal') {
    return { gold: () => '#ffffff', cream: '#000000', green: '#000000', ink: '#000000', muted: '#000000' }
  }
  return {
    gold: (ctx, y0, y1) => {
      const g = ctx.createLinearGradient(0, y0, 0, y1)
      g.addColorStop(0, '#f6dc94')
      g.addColorStop(0.45, '#d4a24c')
      g.addColorStop(0.55, '#b9832f')
      g.addColorStop(1, '#f0cf7e')
      return g
    },
    cream: '#f4ead8',
    green: '#3f8a3a',
    ink: '#0c0a09',
    muted: 'rgba(244,234,216,0.62)',
  }
}

function drawBackground(ctx: CanvasRenderingContext2D, mode: Mode) {
  if (mode === 'metal') {
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, LABEL_W, LABEL_H)
    return
  }
  ctx.fillStyle = '#0d0b0a'
  ctx.fillRect(0, 0, LABEL_W, LABEL_H)
  // soft vignette lift on the front panel
  const g = ctx.createRadialGradient(LABEL_W / 2, LABEL_H * 0.45, 40, LABEL_W / 2, LABEL_H * 0.45, 620)
  g.addColorStop(0, 'rgba(70,52,36,0.55)')
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, LABEL_W, LABEL_H)

  // faint paisley-like flourishes
  const rnd = seeded(7)
  ctx.strokeStyle = 'rgba(255,240,220,0.045)'
  ctx.lineWidth = 2
  for (let i = 0; i < 46; i++) {
    const x = rnd() * LABEL_W
    const y = rnd() * LABEL_H
    const r = 30 + rnd() * 70
    ctx.beginPath()
    for (let a = 0; a < Math.PI * 3.2; a += 0.08) {
      const rr = r * (1 - a / (Math.PI * 3.6))
      const px = x + Math.cos(a) * rr
      const py = y + Math.sin(a) * rr * 0.8
      if (a === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  }
  // paper grain
  const img = ctx.getImageData(0, 0, LABEL_W, LABEL_H)
  const d = img.data
  for (let i = 0; i < d.length; i += 4) {
    const n = (rnd() - 0.5) * 10
    d[i] += n
    d[i + 1] += n
    d[i + 2] += n
  }
  ctx.putImageData(img, 0, 0)
}

function swooshes(ctx: CanvasRenderingContext2D, p: Paint) {
  // top band
  ctx.fillStyle = p.gold(ctx, 0, 60)
  ctx.beginPath()
  ctx.moveTo(0, 22)
  ctx.bezierCurveTo(LABEL_W * 0.3, 8, LABEL_W * 0.6, 58, LABEL_W, 26)
  ctx.lineTo(LABEL_W, 40)
  ctx.bezierCurveTo(LABEL_W * 0.6, 72, LABEL_W * 0.3, 22, 0, 36)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(0, 0, LABEL_W, 8)

  // bottom sweep (rises to the right, like the pack)
  ctx.fillStyle = p.gold(ctx, LABEL_H - 110, LABEL_H)
  ctx.beginPath()
  ctx.moveTo(0, LABEL_H - 40)
  ctx.bezierCurveTo(LABEL_W * 0.35, LABEL_H - 30, LABEL_W * 0.55, LABEL_H - 30, LABEL_W * 0.64, LABEL_H - 108)
  ctx.lineTo(LABEL_W * 0.645, LABEL_H - 96)
  ctx.bezierCurveTo(LABEL_W * 0.56, LABEL_H - 14, LABEL_W * 0.35, LABEL_H - 16, 0, LABEL_H - 24)
  ctx.closePath()
  ctx.fill()
  ctx.fillRect(0, LABEL_H - 8, LABEL_W, 8)
}

/** 12 SPICES emblem: a ring of twelve seeds around a gold "12". */
function twelveMark(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, p: Paint) {
  ctx.save()
  ctx.strokeStyle = p.gold(ctx, cy - r, cy + r)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(cx, cy, r, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = p.gold(ctx, cy - r, cy + r)
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2
    ctx.save()
    ctx.translate(cx + Math.cos(a) * (r + 14), cy + Math.sin(a) * (r + 14))
    ctx.rotate(a + Math.PI / 2)
    ctx.beginPath()
    ctx.ellipse(0, 0, 4.5, 8, 0, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  ctx.font = `700 ${Math.round(r * 1.12)}px Cinzel, Georgia, serif`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText('12', cx, cy + r * 0.06)
  ctx.restore()
}

function spaced(ctx: CanvasRenderingContext2D, px: number) {
  const c = ctx as CanvasRenderingContext2D & { letterSpacing?: string }
  if ('letterSpacing' in c) c.letterSpacing = `${px}px`
}

function bowl(ctx: CanvasRenderingContext2D, cx: number, cy: number, product: Product, mode: Mode, p: Paint) {
  if (mode === 'metal') {
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 4
    ctx.beginPath()
    ctx.ellipse(cx, cy - 4, 170, 30, 0, 0, Math.PI * 2)
    ctx.stroke()
    return
  }
  // scattered powder on the "table"
  const rnd = seeded(product.id.length * 31 + 3)
  for (let i = 0; i < 900; i++) {
    const a = rnd() * Math.PI * 2
    const r = Math.sqrt(rnd()) * 230
    ctx.fillStyle = rnd() > 0.5 ? product.powder : product.powderDeep
    ctx.globalAlpha = 0.25 + rnd() * 0.5
    ctx.fillRect(cx + Math.cos(a) * r, cy + 36 + Math.sin(a) * r * 0.16, 2, 2)
  }
  ctx.globalAlpha = 1

  // wooden bowl body
  const wood = ctx.createLinearGradient(cx - 150, 0, cx + 150, 0)
  wood.addColorStop(0, '#3b2213')
  wood.addColorStop(0.4, '#7a4a28')
  wood.addColorStop(0.7, '#5a341b')
  wood.addColorStop(1, '#2e190d')
  ctx.fillStyle = wood
  ctx.beginPath()
  ctx.moveTo(cx - 150, cy)
  ctx.bezierCurveTo(cx - 140, cy + 70, cx + 140, cy + 70, cx + 150, cy)
  ctx.closePath()
  ctx.fill()

  // powder mound
  const mound = ctx.createRadialGradient(cx - 30, cy - 70, 10, cx, cy - 20, 170)
  mound.addColorStop(0, lighten(product.powder, 0.25))
  mound.addColorStop(0.55, product.powder)
  mound.addColorStop(1, product.powderDeep)
  ctx.fillStyle = mound
  ctx.beginPath()
  ctx.moveTo(cx - 150, cy)
  ctx.bezierCurveTo(cx - 110, cy - 40, cx - 50, cy - 108, cx, cy - 110)
  ctx.bezierCurveTo(cx + 50, cy - 108, cx + 110, cy - 40, cx + 150, cy)
  ctx.closePath()
  ctx.fill()
  for (let i = 0; i < 1400; i++) {
    const x = cx + (rnd() - 0.5) * 290
    const y = cy - rnd() * 105
    ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,230,190,0.25)' : 'rgba(40,10,0,0.25)'
    ctx.fillRect(x, y, 1.6, 1.6)
  }
  // bowl rim
  ctx.strokeStyle = '#8a5a33'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.ellipse(cx, cy, 150, 14, 0, 0, Math.PI)
  ctx.stroke()
  ctx.strokeStyle = p.gold(ctx, cy, cy + 10)
}

function lighten(hex: string, amt: number) {
  const c = new THREE.Color(hex)
  c.lerp(new THREE.Color('#fff3d6'), amt)
  return `#${c.getHexString()}`
}

function vegMark(ctx: CanvasRenderingContext2D, x: number, y: number, mode: Mode) {
  if (mode === 'metal') return
  ctx.fillStyle = '#fff'
  ctx.fillRect(x - 24, y - 24, 48, 48)
  ctx.strokeStyle = '#1f8a3a'
  ctx.lineWidth = 4
  ctx.strokeRect(x - 19, y - 19, 38, 38)
  ctx.fillStyle = '#1f8a3a'
  ctx.beginPath()
  ctx.arc(x, y, 10, 0, Math.PI * 2)
  ctx.fill()
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ')
  let line = ''
  let yy = y
  for (const w of words) {
    const test = line ? `${line} ${w}` : w
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, yy)
      line = w
      yy += lh
    } else line = test
  }
  if (line) ctx.fillText(line, x, yy)
}

function frontPanel(ctx: CanvasRenderingContext2D, product: Product, mode: Mode, p: Paint) {
  const cx = LABEL_W / 2
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'

  twelveMark(ctx, cx, 100, 46, p)

  ctx.fillStyle = p.gold(ctx, 180, 245)
  ctx.font = '600 76px Cinzel, Georgia, serif'
  spaced(ctx, 10)
  ctx.fillText('SPICES', cx + 5, 228)
  ctx.font = '700 18px Manrope, Arial, sans-serif'
  spaced(ctx, 6)
  ctx.fillStyle = p.cream
  ctx.fillText('MASALA & WHOLE SPICES', cx + 3, 258)
  spaced(ctx, 0)

  // underline arc
  ctx.strokeStyle = p.gold(ctx, 260, 290)
  ctx.lineWidth = 4
  ctx.beginPath()
  ctx.moveTo(cx - 190, 276)
  ctx.quadraticCurveTo(cx, 304, cx + 190, 276)
  ctx.stroke()

  // product name
  const nameSize = product.line1.length > 8 ? 80 : 92
  ctx.font = `700 ${nameSize}px "Cormorant Garamond", Georgia, serif`
  ctx.fillStyle = p.cream
  ctx.fillText(product.line1, cx, 372)
  ctx.fillStyle = p.gold(ctx, 390, 460)
  ctx.fillText(product.line2, cx, 456)

  ctx.font = '600 25px Manrope, Arial, sans-serif'
  ctx.fillStyle = p.cream
  ctx.fillText('Authentic Flavours. Extraordinary Taste.', cx, 506)

  ctx.strokeStyle = p.gold(ctx, 520, 530)
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(cx - 60, 528)
  ctx.lineTo(cx + 60, 528)
  ctx.stroke()

  bowl(ctx, cx, 660, product, mode, p)
  vegMark(ctx, cx + 300, 300, mode)

  ctx.textAlign = 'right'
  ctx.fillStyle = p.gold(ctx, 590, 660)
  ctx.font = '700 26px Manrope, Arial, sans-serif'
  ctx.fillText('Net Wt.', cx + 330, 612)
  ctx.font = '700 40px Manrope, Arial, sans-serif'
  ctx.fillText(product.sizes[0].label, cx + 330, 656)
}

function backPanel(ctx: CanvasRenderingContext2D, cx: number, product: Product, p: Paint) {
  ctx.textAlign = 'center'
  ctx.fillStyle = p.gold(ctx, 110, 170)
  ctx.font = '600 46px Cinzel, Georgia, serif'
  ctx.fillText('12 SPICES', cx, 150)
  ctx.fillStyle = p.cream
  ctx.font = '700 54px "Cormorant Garamond", Georgia, serif'
  ctx.fillText(product.name.toUpperCase(), cx, 240)
  ctx.fillStyle = p.muted
  ctx.font = '500 26px Manrope, Arial, sans-serif'
  wrapText(ctx, product.description, cx, 300, 560, 38)
  ctx.fillStyle = p.gold(ctx, 470, 560)
  ctx.font = '700 22px Manrope, Arial, sans-serif'
  ctx.fillText('STORE IN A COOL, DRY PLACE', cx, 500)
  ctx.fillText('ALWAYS USE A DRY SPOON', cx, 540)
}

function sidePanels(ctx: CanvasRenderingContext2D, p: Paint) {
  for (const x of [LABEL_W * 0.25, LABEL_W * 0.75]) {
    ctx.strokeStyle = p.gold(ctx, 100, 600)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, 120)
    ctx.lineTo(x, 560)
    ctx.stroke()
    ctx.save()
    ctx.translate(x, 340)
    ctx.rotate(-Math.PI / 2)
    ctx.fillStyle = p.gold(ctx, -20, 20)
    ctx.font = '600 26px Cinzel, Georgia, serif'
    ctx.textAlign = 'center'
    ctx.fillText('AUTHENTIC FLAVOURS', 0, -18)
    ctx.restore()
  }
}

export function paintLabel(canvas: HTMLCanvasElement, product: Product, mode: Mode) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const p = paints(mode)
  drawBackground(ctx, mode)
  swooshes(ctx, p)
  sidePanels(ctx, p)
  frontPanel(ctx, product, mode, p)
  // back panel straddles the seam: draw it twice, clipped
  for (const cx of [0, LABEL_W]) {
    ctx.save()
    ctx.beginPath()
    ctx.rect(cx === 0 ? 0 : LABEL_W - 420, 0, 420, LABEL_H)
    ctx.clip()
    backPanel(ctx, cx, product, p)
    ctx.restore()
  }
}

export function createLabelTextures(product: Product) {
  const make = (mode: Mode) => {
    const canvas = document.createElement('canvas')
    canvas.width = LABEL_W
    canvas.height = LABEL_H
    paintLabel(canvas, product, mode)
    const tex = new THREE.CanvasTexture(canvas)
    tex.colorSpace = mode === 'color' ? THREE.SRGBColorSpace : THREE.NoColorSpace
    tex.anisotropy = 8
    tex.wrapS = THREE.RepeatWrapping
    return { canvas, tex }
  }
  const color = make('color')
  const metal = make('metal')
  return {
    map: color.tex,
    metalnessMap: metal.tex,
    repaint(next: Product) {
      paintLabel(color.canvas, next, 'color')
      paintLabel(metal.canvas, next, 'metal')
      color.tex.needsUpdate = true
      metal.tex.needsUpdate = true
    },
    dispose() {
      color.tex.dispose()
      metal.tex.dispose()
    },
  }
}

/** Grainy powder texture used as both colour variation and bump. */
export function createGrainTexture(size = 512) {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const img = ctx.createImageData(size, size)
  const rnd = seeded(42)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 175 + rnd() * 80 - (rnd() > 0.93 ? 70 : 0)
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(4, 4)
  return tex
}
