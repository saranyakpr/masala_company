import { Environment, Lightformer } from '@react-three/drei';

/**
 * Warm cinematic lighting. Reflections come from procedural Lightformers rendered
 * into an environment map — no external HDR files are downloaded.
 */
export function StudioLights({ intensity = 1, rim = '#c4281f' }: { intensity?: number; rim?: string }) {
  return (
    <>
      <ambientLight intensity={0.18 * intensity} color="#ffe6c4" />
      <directionalLight position={[3.5, 5, 4]} intensity={2.6 * intensity} color="#ffd9a3" />
      <directionalLight position={[-5, 1.5, -3]} intensity={1.6 * intensity} color={rim} />
      <pointLight position={[0, 2.5, 2.5]} intensity={3 * intensity} distance={8} color="#ffcf8a" />
      <Environment resolution={128} frames={1}>
        <color attach="background" args={['#1a0a07']} />
        <Lightformer form="rect" intensity={3.2} color="#ffd9a3" position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={2} color="#ffb766" position={[5, 1, 0]} rotation-y={-Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#b3221f" position={[-5, 1, -1]} rotation-y={Math.PI / 2} scale={[4, 6, 1]} />
        <Lightformer form="ring" intensity={1.6} color="#ffe9c7" position={[0, 1, 6]} scale={3} />
      </Environment>
    </>
  );
}
