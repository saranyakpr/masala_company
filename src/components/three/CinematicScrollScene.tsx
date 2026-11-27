import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { damp, easeOut } from '../../lib/math'
import { scene, subscribeScroll } from '../../lib/scene'
import { FloatingSpices } from './FloatingSpices'
import { heroDirector, stepHeroDirector } from './heroDirector'
import { HeroPowderCloud } from './HeroPowderCloud'
import { IngredientStage } from './IngredientStage'
import { PowderBurst } from './PowderBurst'
import { bottleRuntime } from './runtime'
import { SpiceBottle3D } from './SpiceBottle3D'
import { SpiceDust } from './SpiceDust'
import type { SceneQuality } from './quality'

const BASE_Z = 8

/** Keeps world-space viewport metrics in sync for every satellite. */
function ViewportSync() {
  const size = useThree((s) => s.size)
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
  useEffect(() => {
    const halfH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * BASE_Z
    bottleRuntime.halfH = halfH
    bottleRuntime.halfW = halfH * (size.width / size.height)
    bottleRuntime.worldPerPx = (halfH * 2) / size.height
  }, [size, camera])
  return null
}

/** Cinematic camera: intro dolly, pointer parallax and per-section drift. */
function CameraRig() {
  const camera = useThree((s) => s.camera)
  const look = useRef(new THREE.Vector3())
  useFrame((_, dtRaw) => {
    const dt = Math.min(dtRaw, 1 / 20)
    const sec = scene.sections
    const intro = easeOut(scene.intro)
    const storyDrift = sec.story.enter * (1 - sec.products.enter)
    const hc = scene.mode === 'home' ? heroDirector.camera : { x: 0, y: 0, z: 0 }
    const tx = scene.pointer.x * 0.22 + storyDrift * 0.25 + hc.x * intro
    const ty = 0.12 + scene.pointer.y * 0.14 + (1 - intro) * 1.2 + hc.y * intro
    const tz = BASE_Z + (1 - intro) * 4 - storyDrift * 0.35 + hc.z * intro
    camera.position.x = damp(camera.position.x, tx, 3, dt)
    camera.position.y = damp(camera.position.y, ty, 3, dt)
    camera.position.z = damp(camera.position.z, tz, 3, dt)
    look.current.set(0, 0, 0)
    camera.lookAt(look.current)
    camera.rotation.z += storyDrift * 0.025
  })
  return null
}

function StudioLights() {
  const key = useRef<THREE.SpotLight>(null)
  const rimL = useRef<THREE.PointLight>(null)
  const rimR = useRef<THREE.PointLight>(null)
  useFrame((st) => {
    const i = easeOut(scene.intro)
    const t = st.clock.elapsedTime
    if (key.current) {
      key.current.intensity = 260 * i
      key.current.target.position.copy(bottleRuntime.position)
      key.current.target.updateMatrixWorld()
    }
    if (rimL.current) rimL.current.intensity = (30 + Math.sin(t * 1.3) * 4) * i
    if (rimR.current) rimR.current.intensity = (26 + Math.sin(t * 1.7 + 1) * 4) * i
  })
  return (
    <>
      <ambientLight intensity={0.25} color="#ffe2c2" />
      <spotLight
        ref={key}
        position={[1.5, 7, 6]}
        angle={0.42}
        penumbra={0.9}
        decay={1.6}
        color="#ffe6c8"
        intensity={0}
      />
      <pointLight ref={rimL} position={[-3.2, 1.2, -2.2]} color="#ff6a1a" decay={1.4} distance={14} />
      <pointLight ref={rimR} position={[3.4, 2.2, -2]} color="#ffbe5c" decay={1.4} distance={14} />
      <directionalLight position={[0, -3, 4]} intensity={0.35} color="#ff9a52" />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3.2} color="#fff1dc" position={[-4, 1.5, 3]} rotation-y={Math.PI / 3} scale={[1.2, 6, 1]} />
        <Lightformer form="rect" intensity={2.4} color="#ffd29a" position={[4, 1, 2.5]} rotation-y={-Math.PI / 3} scale={[0.8, 6, 1]} />
        <Lightformer form="rect" intensity={1.6} color="#ffffff" position={[0, 5, 1]} rotation-x={Math.PI / 2} scale={[6, 2, 1]} />
        <Lightformer form="ring" intensity={2.2} color="#ff7a2a" position={[0, 0, -6]} scale={4} />
        <Lightformer form="rect" intensity={0.8} color="#ff8c3a" position={[0, -4, 2]} rotation-x={-Math.PI / 2} scale={[8, 3, 1]} />
      </Environment>
    </>
  )
}

/** Advances the hero choreography before anything else reads it this frame. */
function HeroDirectorDriver() {
  useFrame((st, dt) => stepHeroDirector(Math.min(dt, 1 / 20), st.clock.elapsedTime), -1)
  return null
}

/** Stops rendering entirely while no 3D content is on screen. */
function FrameloopController({ mode }: { mode: SceneMode }) {
  const setFrameloop = useThree((s) => s.setFrameloop)
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    let active = true
    const check = () => {
      const s = scene.sections
      // home: everything except while the opaque, pinned dishes stage fills the screen
      const jarZone = mode === 'home' && !(s.food.enter >= 1 && s.food.exit <= 0)
      const ingredientsZone = mode === 'about' && s.ingredients.enter > 0 && s.ingredients.exit < 1
      const next = jarZone || ingredientsZone
      if (next !== active) {
        active = next
        setFrameloop(next ? 'always' : 'never')
        if (next) invalidate()
      }
    }
    check()
    return subscribeScroll(check)
  }, [setFrameloop, invalidate, mode])
  return null
}

export type SceneMode = 'home' | 'about'

export default function CinematicScrollScene({
  quality,
  mode,
  onReady,
}: {
  quality: SceneQuality
  mode: SceneMode
  onReady?: () => void
}) {
  useEffect(() => {
    scene.mode = mode
    return () => {
      scene.mode = 'none'
    }
  }, [mode])
  const [dpr, setDpr] = useState(Math.min(window.devicePixelRatio || 1, quality.maxDpr))

  return (
    <Canvas
      dpr={dpr}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', stencil: false }}
      camera={{ fov: 35, position: [0, 1.3, BASE_Z + 4], near: 0.1, far: 60 }}
      onCreated={({ gl }) => {
        gl.toneMapping = THREE.ACESFilmicToneMapping
        gl.toneMappingExposure = 1.05
        gl.setClearColor(0x000000, 0)
        requestAnimationFrame(() => onReady?.())
      }}
      style={{ pointerEvents: 'none' }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => setDpr((d) => Math.max(1, d - 0.35))}
        onIncline={() => setDpr((d) => Math.min(quality.maxDpr, d + 0.25))}
        flipflops={3}
      />
      <ViewportSync />
      <FrameloopController mode={mode} />
      <CameraRig />
      <StudioLights />
      <SpiceDust count={quality.dust} />
      {mode === 'home' && (
        <>
          <HeroDirectorDriver />
          <PowderBurst count={quality.powder} />
          <SpiceBottle3D reflection={quality.reflection} />
          <FloatingSpices count={quality.garnish} />
          <HeroPowderCloud counts={quality.hero} />
        </>
      )}
      {mode === 'about' && <IngredientStage />}
    </Canvas>
  )
}
