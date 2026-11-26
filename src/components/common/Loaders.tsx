import { motion } from 'framer-motion';
import { Jar3D } from './Jar3D';
import { loaderJar } from '@/data/jars';
import { cn } from '@/utils/cn';

/** Full-viewport loader shown while a route chunk loads. */
export function PageLoader() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-burgundy-deep text-ivory" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <Jar3D jar={loaderJar} size={84} spinSeconds={8} effects={false} />
        <span className="eyebrow -mt-2 text-gold-light/80">Opening the spice room</span>
      </div>
    </div>
  );
}

/** Lightweight in-place loader for 3D canvases. */
export function SceneLoader({ tone = 'light', label = 'Preparing 3D scene', className }: { tone?: 'light' | 'dark'; label?: string; className?: string }) {
  return (
    <div className={cn('absolute inset-0 flex items-center justify-center', className)} role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4">
        <span className="relative block h-12 w-12">
          <span className={cn('absolute inset-0 rounded-full border', tone === 'light' ? 'border-ivory/15' : 'border-ink/10')} />
          <motion.span
            className="absolute inset-0 rounded-full border border-transparent border-t-gold"
            animate={{ rotate: 360 }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          />
        </span>
        <span className={cn('eyebrow text-[0.6rem]', tone === 'light' ? 'text-ivory/55' : 'text-ink-soft/55')}>{label}</span>
      </div>
    </div>
  );
}
