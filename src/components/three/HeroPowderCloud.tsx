import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import { seeded, smoothstep } from '../../lib/math'
import { scene } from '../../lib/scene'
import { heroDirector, P_SWAP } from './heroDirector'
import { bottleRuntime } from './runtime'

/**
 * Hero transition powder — the masala itself is the scene transition.
 *
 * Four populations, one draw call:
 *   0 grains     fine powder: air drag + terminal-velocity fall
 *   1 dust       lingering haze: heavy drag, carried by the wind
 *   2 fragments  flakes / seeds / chips: heavier, shaped silhouettes
 *   3 puffs      volumetric cloud sprites that sweep the screen and mask the swap
 *
 * Every particle's position is an analytic function of time since the pour
 * began, so the CPU only updates a handful of uniforms per frame.
 */

const vertexShader = /* glsl */ `
  attribute vec4 aSeed;
  attribute float aKind;
  attribute float aEmit;
  uniform float uT, uTime, uScale, uSwapMix, uDensity, uWeight, uGravity, uSwirl, uLift, uRadial, uFocus, uOpacity;
  uniform vec3 uOrigin, uDir, uWind, uJar, uColorA, uColorB, uFragA, uFragB;
  uniform vec2 uHalf, uFrom, uTo;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vKind;
  varying float vBlur;
  varying float vSeed;

  vec3 turb(vec3 p, float t, float s){
    return vec3(sin(p.y * 1.7 + t * 1.3 + s * 20.0), sin(p.x * 1.3 - t * 1.1 + s * 13.0), sin(p.x * 0.9 + p.y * 1.1 + t * 0.7 + s * 7.0));
  }
  vec2 rot(vec2 v, float a){ float c = cos(a), s = sin(a); return vec2(c * v.x - s * v.y, s * v.x + c * v.y); }

  void main(){
    float kind = aKind;
    float alpha;
    float size;
    vec3 pos;
    vec3 col;

    if (kind < 2.5) {
      float isGrain = step(kind, 0.5);
      float isDust = step(0.5, kind) * step(kind, 1.5);
      float isFrag = step(1.5, kind);
      float emitT = aEmit * 2.0;
      float age = uT - emitT;
      float a = max(age, 0.0);
      float k = isGrain * 0.9 + isDust * 2.4 + isFrag * 0.35;
      float gMul = isGrain * 1.0 + isDust * 0.22 + isFrag * 1.7;
      float windR = isGrain * 0.55 + isDust * 1.5 + isFrag * 0.2;
      float speed = mix(1.0 + aSeed.x * 0.8, 1.3 + aSeed.x * 1.4, 1.0 - isFrag);
      vec3 spread = normalize(aSeed.xyz - 0.5 + 0.0001) * (isGrain * 0.35 + isDust * 0.9 + isFrag * 0.5);
      vec3 v0 = uDir * speed + spread;

      // linear air drag: x(t) = v0 (1 - e^-kt)/k ; constant forces reach terminal velocity
      float e = (1.0 - exp(-k * a)) / k;
      float settle = (a - e) / k;
      pos = uOrigin + v0 * e;
      pos.y -= uGravity * uWeight * gMul * settle;
      pos += uWind * windR * settle;
      float late = max(a - 0.7, 0.0);
      pos.y += uLift * (1.0 - isFrag * 0.8) * late * late * 0.3;
      pos.xy = rot(pos.xy, uSwirl * a * mix(0.55, 0.22, isFrag));
      pos += turb(pos, uTime, aSeed.w) * mix(0.12, 0.035, isFrag) * min(a, 2.0);

      float life = isGrain * 3.2 + isDust * 4.6 + isFrag * 2.7;
      alpha = step(0.0, age) * smoothstep(0.0, 0.08, age) * (1.0 - smoothstep(life * 0.5, life, age));
      if (isFrag < 0.5 && aSeed.y > uDensity) alpha = 0.0;

      col = mix(uColorA * 0.5, uColorA * 1.05, aSeed.z);
      col = mix(col, mix(col, vec3(1.0, 0.92, 0.8), 0.2), isDust);
      col = mix(col, mix(uFragA, uFragB, step(0.62, aSeed.z)), isFrag);
      size = isGrain * mix(0.014, 0.026, aSeed.y) + isDust * mix(0.008, 0.016, aSeed.y) + isFrag * mix(0.026, 0.05, aSeed.y);
      alpha *= isGrain * 0.95 + isDust * 0.5 + isFrag;
    } else {
      // volumetric cloud puffs
      float engulf = step(aSeed.y, 0.24);
      float born = mix(1.1 + aEmit * 1.35, 1.45 + aEmit * 0.9, engulf);
      float age = uT - born;
      float a = max(age, 0.0);
      vec2 from = uFrom * uHalf;
      vec2 to = uTo * uHalf;
      vec2 dir = to - from;
      vec2 perp = length(dir) > 0.001 ? normalize(vec2(-dir.y, dir.x)) : vec2(0.0, 1.0);
      vec2 base = mix(from, to, aEmit) + perp * (aSeed.x - 0.5) * 2.0 * uHalf.y * 1.25;
      float ang = aSeed.x * 6.2832 + uSwirl * a * 0.45;
      float rad = (0.15 + aEmit * 1.1) * uHalf.y * (1.0 + a * 0.35);
      base = mix(base, vec2(cos(ang), sin(ang)) * rad * vec2(1.4, 1.0), uRadial);
      base = mix(base, uJar.xy + (aSeed.xz - 0.5) * vec2(2.6, 2.8), engulf);
      pos = vec3(base, mix(mix(-1.4, 2.4, aSeed.z), mix(0.6, 2.4, aSeed.z), engulf));
      pos += uWind * 0.22 * a + vec3(0.0, uLift * 0.25 * a, 0.0);
      pos += turb(pos * 0.5, uTime * 0.5, aSeed.w) * 0.25 * (0.4 + a * 0.4);

      float grow = 0.55 + 0.45 * smoothstep(0.0, 1.4, a) + a * 0.12;
      size = mix(1.0, 2.3, aSeed.w) * grow;
      alpha = step(0.0, age) * smoothstep(0.0, 0.55, age) * (1.0 - smoothstep(1.7, 3.3, age)) * mix(0.34, 0.52, aSeed.y);
      vec3 haze = vec3(0.92, 0.86, 0.76);
      // dark powders (pepper, garam) read as a lighter smoky haze in the air
      float lumA = dot(uColorA, vec3(0.3, 0.59, 0.11));
      float lumB = dot(uColorB, vec3(0.3, 0.59, 0.11));
      vec3 ca = mix(uColorA, haze * 0.55, 0.1 + 0.4 * (1.0 - smoothstep(0.04, 0.2, lumA)));
      vec3 cb = mix(uColorB, haze * 0.55, 0.1 + 0.4 * (1.0 - smoothstep(0.04, 0.2, lumB)));
      col = mix(ca, cb, uSwapMix * smoothstep(0.0, 1.0, aEmit + 0.45 + engulf));
      col *= mix(0.55, 1.0, aSeed.z);
    }

    // the overhead light shaft catches whatever drifts through it
    float beam = exp(-pow(pos.x / (uHalf.x * 0.32), 2.0)) * smoothstep(-uHalf.y, uHalf.y * 0.8, pos.y);
    col *= 1.0 + beam * 0.4;

    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mv;
    // cheap depth of field: out-of-focus grains grow and soften
    float blur = kind > 2.5 ? 0.0 : clamp(abs(-mv.z - uFocus) / 4.0, 0.0, 1.0);
    vAlpha = alpha * uOpacity / (1.0 + blur * 1.8);
    float ps = size * (1.0 + blur * 1.6) * uScale / max(-mv.z, 0.1);
    gl_PointSize = vAlpha < 0.002 ? 0.0 : min(ps, 900.0);
    vColor = col;
    vKind = kind;
    vBlur = blur;
    vSeed = aSeed.w;
  }
`

const fragmentShader = /* glsl */ `
  uniform sampler2D uPuff;
  varying vec3 vColor;
  varying float vAlpha;
  varying float vKind;
  varying float vBlur;
  varying float vSeed;
  void main(){
    if (vAlpha < 0.002) discard;
    vec2 pc = gl_PointCoord - 0.5;
    vec3 col = vColor;
    float a;
    if (vKind > 2.5) {
      float r = vSeed * 6.2832;
      vec2 uv = mat2(cos(r), -sin(r), sin(r), cos(r)) * pc + 0.5;
      vec4 tx = texture2D(uPuff, uv);
      a = tx.a;
      col *= (0.72 + 0.45 * (0.5 - pc.y)) * (0.85 + 0.3 * tx.r);
    } else {
      float r2 = dot(pc, pc) * 4.0;
      if (vKind > 1.5) {
        // irregular flake / seed silhouette
        float ang = atan(pc.y, pc.x);
        float edge = 0.5 * (0.84 + 0.12 * sin(ang * 2.0 + vSeed * 20.0) + 0.05 * sin(ang * 5.0 + vSeed * 9.0));
        float l = length(pc);
        if (l > edge) discard;
        r2 = (l * l) / (edge * edge);
      } else if (r2 > 1.0) discard;
      vec3 n = vec3(pc * 2.0, sqrt(max(0.0, 1.0 - r2)));
      float diff = max(dot(n, normalize(vec3(-0.45, 0.7, 0.55))), 0.0);
      col *= 0.42 + 0.85 * diff;
      float soft = (vKind > 0.5 && vKind < 1.5) ? 0.6 : 0.12;
      a = mix(1.0, smoothstep(1.0, 0.0, r2), clamp(vBlur * 0.9 + soft, 0.0, 1.0));
    }
    gl_FragColor = vec4(col, a * vAlpha);
  }
`

/** Soft, billowy smoke sprite: overlapping soft blobs, like a cauliflower cloud. */
function createPuffTexture(size = 128) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const ctx = c.getContext('2d')!
  const rnd = seeded(314)
  for (let i = 0; i < 34; i++) {
    const ang = rnd() * Math.PI * 2
    const dist = Math.pow(rnd(), 0.8) * size * 0.2
    const x = size / 2 + Math.cos(ang) * dist
    const y = size / 2 + Math.sin(ang) * dist
    const r = size * (0.1 + rnd() * 0.17)
    const shade = Math.round(150 + rnd() * 105)
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    const rgb = `${shade},${shade},${shade}`
    g.addColorStop(0, `rgba(${rgb},0.42)`)
    g.addColorStop(0.6, `rgba(${rgb},0.16)`)
    g.addColorStop(1, `rgba(${rgb},0)`)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.NoColorSpace
  return tex
}

export interface HeroPowderCounts {
  grains: number
  dust: number
  fragments: number
  puffs: number
}

export function HeroPowderCloud({ counts }: { counts: HeroPowderCounts }) {
  const points = useRef<THREE.Points>(null)
  const size = useThree((s) => s.size)
  const dpr = useThree((s) => s.viewport.dpr)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  const lastPattern = useRef<string>('')

  const puffTex = useMemo(() => createPuffTexture(), [])
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uT: { value: -1 },
          uTime: { value: 0 },
          uScale: { value: 1000 },
          uSwapMix: { value: 0 },
          uDensity: { value: 1 },
          uWeight: { value: 1 },
          uGravity: { value: 1.5 },
          uSwirl: { value: 0 },
          uLift: { value: 0 },
          uRadial: { value: 0 },
          uFocus: { value: 8 },
          uOpacity: { value: 1 },
          uOrigin: { value: new THREE.Vector3() },
          uDir: { value: new THREE.Vector3(-1, -0.3, 0) },
          uWind: { value: new THREE.Vector3() },
          uJar: { value: new THREE.Vector3() },
          uColorA: { value: new THREE.Color() },
          uColorB: { value: new THREE.Color() },
          uFragA: { value: new THREE.Color() },
          uFragB: { value: new THREE.Color() },
          uHalf: { value: new THREE.Vector2(4, 2.5) },
          uFrom: { value: new THREE.Vector2() },
          uTo: { value: new THREE.Vector2() },
          uPuff: { value: puffTex },
        },
      }),
    [puffTex],
  )

  const geometry = useMemo(() => {
    const rnd = seeded(808)
    const total = counts.grains + counts.dust + counts.fragments + counts.puffs
    const seeds = new Float32Array(total * 4)
    const kinds = new Float32Array(total)
    const emits = new Float32Array(total)
    let i = 0
    const push = (kind: number, n: number) => {
      for (let k = 0; k < n; k++, i++) {
        seeds[i * 4] = rnd()
        seeds[i * 4 + 1] = rnd()
        seeds[i * 4 + 2] = rnd()
        seeds[i * 4 + 3] = rnd()
        kinds[i] = kind
        // grains bunch toward the start of the pour (the first shake is the heaviest)
        emits[i] = kind === 3 ? rnd() : Math.pow(rnd(), 1.25)
      }
    }
    // puffs first so the fine grains draw over the cloud
    push(3, counts.puffs)
    push(1, counts.dust)
    push(0, counts.grains)
    push(2, counts.fragments)
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(total * 3), 3))
    g.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4))
    g.setAttribute('aKind', new THREE.BufferAttribute(kinds, 1))
    g.setAttribute('aEmit', new THREE.BufferAttribute(emits, 1))
    return g
  }, [counts])

  useEffect(
    () => () => {
      geometry.dispose()
      material.dispose()
      puffTex.dispose()
    },
    [geometry, material, puffTex],
  )

  useFrame((st) => {
    const d = heroDirector
    const pts = points.current
    if (!pts) return
    const heroFade = 1 - smoothstep(0, 0.45, scene.sections.hero.exit)
    const active = d.pourT >= 0 && d.pourT < 6.4 && heroFade > 0.01
    pts.visible = active
    if (!active) return
    const u = material.uniforms

    // per-transition parameters (set once when a new pour begins)
    const key = `${d.transitions}`
    if (lastPattern.current !== key) {
      lastPattern.current = key
      const p = d.pattern
      u.uWind.value.set(...p.wind)
      u.uSwirl.value = p.swirl
      u.uLift.value = p.lift
      u.uGravity.value = p.gravity
      u.uRadial.value = p.radial
      u.uFrom.value.set(...p.from)
      u.uTo.value.set(...p.to)
      u.uColorA.value.copy(d.colorA)
      u.uColorB.value.copy(d.colorB)
      u.uFragA.value.set(d.fx.fragA)
      u.uFragB.value.set(d.fx.fragB)
      u.uDensity.value = d.fx.density
      u.uWeight.value = d.fx.weight
    }
    // follow the sifter while pouring, then freeze the emitter
    if (d.pourT < 2.1) {
      u.uOrigin.value.copy(bottleRuntime.mouth)
      u.uDir.value.copy(bottleRuntime.axis).normalize()
      u.uJar.value.copy(bottleRuntime.position)
    }
    u.uT.value = d.pourT
    u.uTime.value = st.clock.elapsedTime
    u.uSwapMix.value = smoothstep(P_SWAP - 0.6, P_SWAP + 1.2, d.pourT)
    u.uHalf.value.set(bottleRuntime.halfW, bottleRuntime.halfH)
    u.uScale.value = (size.height * dpr) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)))
    u.uFocus.value = camera.position.distanceTo(bottleRuntime.position)
    u.uOpacity.value = heroFade
  })

  return <points ref={points} geometry={geometry} material={material} frustumCulled={false} renderOrder={4} />
}
