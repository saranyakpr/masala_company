import type * as THREE from 'three'
import { CAP_TOP, LABEL_Y, type createBottleGeometry, type JarMaterials } from './jarParts'

export type BottleGeometry = ReturnType<typeof createBottleGeometry>
export type BottleMats = Pick<JarMaterials, 'glass' | 'powder' | 'label' | 'cap' | 'sifter' | 'gold'>

export function BottleMeshes({
  geo,
  mats,
  spinRef,
  lidRef,
}: {
  geo: BottleGeometry
  mats: BottleMats
  spinRef?: React.Ref<THREE.Group>
  lidRef?: React.Ref<THREE.Group>
}) {
  return (
    <group ref={spinRef}>
      <mesh geometry={geo.powder} material={mats.powder} />
      <mesh geometry={geo.label} material={mats.label} position-y={LABEL_Y} />
      <mesh geometry={geo.body} material={mats.glass} renderOrder={2} />
      <mesh geometry={geo.cap} material={mats.cap} />
      <mesh geometry={geo.capBottom} material={mats.cap} />
      <mesh geometry={geo.goldRing} material={mats.gold} />
      <mesh geometry={geo.sifter} material={mats.sifter} />
      <group ref={lidRef} position={[0, CAP_TOP, -0.6]}>
        <mesh geometry={geo.lid} material={mats.cap} />
        <mesh geometry={geo.thumb} material={mats.cap} />
      </group>
    </group>
  )
}
