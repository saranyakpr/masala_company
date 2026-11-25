import { Component, Suspense, useEffect, useRef, useState, type HTMLAttributes, type ReactNode } from 'react';
import { Canvas, type CanvasProps } from '@react-three/fiber';
import * as THREE from 'three';
import { SceneLoader } from '@/components/common/Loaders';
import { useWebGL } from '@/hooks/useWebGL';
import { tierConfig, useDeviceTier } from '@/hooks/useDeviceTier';
import { cn } from '@/utils/cn';

class CanvasErrorBoundary extends Component<{ fallback: ReactNode; children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: unknown) {
    if (import.meta.env.DEV) console.warn('[3D] Scene failed, showing fallback.', error);
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

interface SceneCanvasProps {
  children: ReactNode;
  /** Shown when WebGL is unavailable or the scene throws. */
  fallback: ReactNode;
  className?: string;
  camera?: CanvasProps['camera'];
  loaderTone?: 'light' | 'dark';
  loaderLabel?: string;
  /** Extra props for the wrapper (e.g. drag handlers). */
  wrapperProps?: HTMLAttributes<HTMLDivElement>;
}

/**
 * Shared R3F canvas wrapper:
 * - mounts only once scrolled near the viewport (keeps first paint light)
 * - pauses rendering when off-screen
 * - scales pixel ratio by device tier
 * - falls back gracefully when WebGL is unavailable or a scene errors.
 */
export function SceneCanvas({
  children,
  fallback,
  className,
  camera = { position: [0, 0, 6], fov: 35 },
  loaderTone = 'light',
  loaderLabel,
  wrapperProps,
}: SceneCanvasProps) {
  const supported = useWebGL();
  const tier = useDeviceTier();
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) setMounted(true);
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className ?? 'relative'} {...wrapperProps}>
      {!supported ? (
        fallback
      ) : (
        <CanvasErrorBoundary fallback={fallback}>
          {!ready && <SceneLoader tone={loaderTone} label={loaderLabel} />}
          {mounted && (
            <Suspense fallback={null}>
              <Canvas
                className={cn('transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}
                frameloop={visible ? 'always' : 'never'}
                dpr={tierConfig[tier].dpr}
                camera={camera}
                gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
                onCreated={({ gl }) => {
                  gl.toneMapping = THREE.ACESFilmicToneMapping;
                  gl.toneMappingExposure = 1.05;
                  gl.outputColorSpace = THREE.SRGBColorSpace;
                  requestAnimationFrame(() => setReady(true));
                }}
              >
                {children}
              </Canvas>
            </Suspense>
          )}
        </CanvasErrorBoundary>
      )}
    </div>
  );
}
