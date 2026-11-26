import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import type { Ingredient } from '@/types';
import { ingredientImage } from '@/data/ingredientImages';
import { easePremium } from '@/animations/variants';
import { cn } from '@/utils/cn';

/*
 * Shared ingredient presentation for the homepage "Our ingredients" section and the
 * Ingredients page, so every ingredient has the same photo, frame and motion everywhere.
 */

/** Arch frame echoing the mihrab arches in the product photography. */
export const ARCH: CSSProperties = { borderRadius: '50% 50% 1.5rem 1.5rem / 36% 36% 1.5rem 1.5rem' };
/** The same arch on a landscape frame (taller curve so it still reads as an arch). */
export const ARCH_WIDE: CSSProperties = { borderRadius: '50% 50% 1.5rem 1.5rem / 50% 50% 1.5rem 1.5rem' };
export const pad = (n: number) => String(n).padStart(2, '0');

const spring = { stiffness: 140, damping: 16, mass: 0.6 };

/** Pointer-driven tilt + glare (mouse only; off for reduced motion). */
function useTilt(maxY = 10, maxX = 8) {
  const reduced = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-maxY, maxY]), spring);
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [maxX, -maxX]), spring);
  const glareX = useTransform(mx, [-0.5, 0.5], ['15%', '85%']);
  const glareY = useTransform(my, [-0.5, 0.5], ['10%', '80%']);
  const glare = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,236,200,0.26), transparent 55%)`;
  const handlers = {
    onPointerMove: (e: PointerEvent<HTMLElement>) => {
      if (reduced || e.pointerType !== 'mouse') return;
      const r = e.currentTarget.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    },
    onPointerLeave: () => {
      mx.set(0);
      my.set(0);
    },
  };
  return { rotateX, rotateY, glare, handlers };
}

/** Round photo thumbnail used in ingredient selectors. */
export function IngredientThumb({ ingredient, active, size = 'md', className }: { ingredient: Ingredient; active?: boolean; size?: 'md' | 'responsive'; className?: string }) {
  return (
    <span
      className={cn(
        size === 'responsive' ? 'h-7 w-7 lg:h-11 lg:w-11' : 'h-11 w-11',
        'relative shrink-0 overflow-hidden rounded-full ring-1 transition-all duration-500 ease-[var(--ease-premium)]',
        active ? 'scale-110 ring-gold shadow-[0_8px_20px_-6px_rgba(0,0,0,0.8)]' : 'ring-ivory/15 opacity-60 saturate-50 group-hover:opacity-100 group-hover:saturate-100',
        className,
      )}
    >
      <img src={ingredientImage(ingredient.id).thumb} alt="" width={44} height={44} loading="lazy" decoding="async" className="h-full w-full object-cover" />
    </span>
  );
}

interface StageProps {
  ingredient: Ingredient;
  index: number;
  total: number;
  /** Floating name/number caption in front of the frame. */
  caption?: boolean;
  className?: string;
  /** Extra overlay content inside the stage (e.g. a view toggle). */
  children?: ReactNode;
}

/** Large arch-framed photo on layered 3D planes: tilts toward the pointer, floats, catches a moving glare, crossfades between ingredients. */
export function IngredientStage({ ingredient, index, total, caption = true, className, children }: StageProps) {
  const { rotateX, rotateY, glare, handlers } = useTilt();
  const img = ingredientImage(ingredient.id);

  return (
    <div className={cn('group relative mx-auto w-full max-w-[30rem] px-6', className)} style={{ perspective: 1100 }} {...handlers}>
      <div className="ing-float relative" style={{ transformStyle: 'preserve-3d' }}>
        <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative">
          {/* colour glow far behind */}
          <div
            aria-hidden="true"
            className="absolute -inset-12 rounded-full opacity-70 blur-3xl transition-[background] duration-700"
            style={{ background: `radial-gradient(circle at 50% 45%, ${ingredient.color}66, transparent 65%)`, transform: 'translateZ(-90px)' }}
          />
          {/* orbiting gold ring — the same motif as the loader */}
          <div aria-hidden="true" className="absolute left-1/2 top-[38%] aspect-square w-[122%]" style={{ transform: 'translate(-50%, -50%) translateZ(-60px)' }}>
            <div className="jar3d-ring h-full w-full rounded-full border border-dashed border-gold/35" />
          </div>
          {/* offset outline arch */}
          <div aria-hidden="true" className="absolute inset-0 border border-gold/40" style={{ ...ARCH, transform: 'translate3d(18px, 18px, -30px)' }} />

          {/* main photo */}
          <div className="relative aspect-[5/6] overflow-hidden bg-ink shadow-[0_60px_90px_-35px_rgba(0,0,0,0.85)] ring-1 ring-gold/50" style={ARCH}>
            <div className="absolute inset-0 transition-transform duration-[1200ms] ease-[var(--ease-premium)] group-hover:scale-[1.06]">
              <AnimatePresence initial={false}>
                <motion.img
                  key={ingredient.id}
                  src={img.src}
                  srcSet={img.srcSet}
                  sizes="(min-width: 1024px) 30rem, 90vw"
                  alt={`${ingredient.name} — ${ingredient.notes}`}
                  width={720}
                  height={720}
                  decoding="async"
                  initial={{ opacity: 0, scale: 1.14 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: easePremium }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </AnimatePresence>
            </div>
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-ink/10" />
            <motion.div aria-hidden="true" className="absolute inset-0 mix-blend-soft-light" style={{ background: glare }} />
            <div aria-hidden="true" className="absolute inset-3 border border-gold-light/25" style={ARCH} />
          </div>

          {caption && (
            <div
              className="absolute -bottom-8 -left-4 min-w-[15rem] border border-gold/30 bg-burgundy/85 px-6 py-4 shadow-[0_25px_45px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md"
              style={{ transform: 'translateZ(70px)' }}
            >
              <AnimatePresence mode="wait">
                <motion.div key={ingredient.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
                  <span className="eyebrow text-[0.58rem] text-ivory/45">
                    {pad(index + 1)} / {pad(total)}
                  </span>
                  <p className="mt-1 font-display text-3xl leading-tight">{ingredient.name}</p>
                  <p className="text-xs italic text-ivory/50">{ingredient.botanical}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          )}

          {/* floating tasting notes */}
          <div
            className="absolute -right-8 top-[24%] whitespace-nowrap rounded-full border border-gold/30 bg-ink/70 px-5 py-2.5 text-center shadow-[0_18px_35px_-15px_rgba(0,0,0,0.9)] backdrop-blur-md"
            style={{ transform: 'translateZ(100px)' }}
          >
            <AnimatePresence mode="wait">
              <motion.p key={ingredient.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="eyebrow text-[0.56rem] leading-snug text-gold-light">
                {ingredient.notes}
              </motion.p>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      <div aria-hidden="true" className="ing-shadow mx-auto mt-6 h-6 w-3/4 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.6),transparent)]" />
      {children}
    </div>
  );
}

/** Arch-framed photo card with hover tilt, glare, zoom and a lifted shadow — for grids and editorial rows. */
export function IngredientArchCard({
  ingredient,
  index,
  sizes = '(min-width: 1024px) 28rem, 90vw',
  tone = 'dark',
  shape = 'portrait',
  className,
}: {
  ingredient: Ingredient;
  index: number;
  sizes?: string;
  tone?: 'dark' | 'light';
  shape?: 'portrait' | 'landscape';
  className?: string;
}) {
  const { rotateX, rotateY, glare, handlers } = useTilt(9, 7);
  const arch = shape === 'landscape' ? ARCH_WIDE : ARCH;
  const img = ingredientImage(ingredient.id);
  return (
    <div className={cn('group relative', className)} style={{ perspective: 1000 }} {...handlers}>
      <div className="transition-transform duration-700 ease-[var(--ease-premium)] group-hover:-translate-y-2" style={{ transformStyle: 'preserve-3d' }}>
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className="relative">
        <div
          aria-hidden="true"
          className="absolute -inset-8 rounded-full opacity-40 blur-3xl transition-opacity duration-700 group-hover:opacity-80"
          style={{ background: `radial-gradient(circle at 50% 55%, ${ingredient.color}, transparent 65%)`, transform: 'translateZ(-60px)' }}
        />
        <div
          aria-hidden="true"
          className={cn('absolute inset-0 border transition-transform duration-700 ease-[var(--ease-premium)]', tone === 'light' ? 'border-gold/60' : 'border-gold/40')}
          style={{ ...arch, transform: 'translate3d(14px, 14px, -24px)' }}
        />
        <div
          className={cn(
            'relative overflow-hidden bg-ink ring-1 ring-gold/50 shadow-[0_40px_70px_-35px_rgba(0,0,0,0.75)] transition-shadow duration-700 group-hover:shadow-[0_60px_90px_-35px_rgba(0,0,0,0.85)]',
            shape === 'landscape' ? 'aspect-[6/5]' : 'aspect-[5/6]',
          )}
          style={arch}
        >
          <img
            src={img.src}
            srcSet={img.srcSet}
            sizes={sizes}
            alt={`${ingredient.name} — ${ingredient.notes}`}
            width={720}
            height={720}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1200ms] ease-[var(--ease-premium)] group-hover:scale-[1.07]"
          />
          <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent" />
          <motion.div aria-hidden="true" className="absolute inset-0 mix-blend-soft-light" style={{ background: glare }} />
          <div aria-hidden="true" className="absolute inset-3 border border-gold-light/25" style={arch} />
        </div>
        <span
          aria-hidden="true"
          className="absolute -bottom-5 left-6 flex h-12 w-12 items-center justify-center rounded-full border border-gold/40 bg-burgundy font-display text-sm italic text-gold-light shadow-[0_15px_30px_-12px_rgba(0,0,0,0.8)]"
          style={{ transform: 'translateZ(50px)' }}
        >
          {pad(index + 1)}
        </span>
      </motion.div>
      </div>
    </div>
  );
}
