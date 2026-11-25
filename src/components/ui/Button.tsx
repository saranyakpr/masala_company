import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'gold' | 'outline-dark' | 'outline-light' | 'ink';
type Size = 'md' | 'lg';

interface BaseProps {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  /** Show the animated arrow icon. */
  arrow?: boolean;
}

type LinkButtonProps = BaseProps & { to: string; href?: never; onClick?: () => void };
type AnchorButtonProps = BaseProps & { href: string; to?: never; external?: boolean };
type NativeButtonProps = BaseProps & { to?: never; href?: never } & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;

export type ButtonProps = LinkButtonProps | AnchorButtonProps | NativeButtonProps;

const variants: Record<Variant, { base: string; fill: string }> = {
  primary: { base: 'bg-spice text-ivory', fill: 'bg-burgundy' },
  gold: { base: 'bg-gold text-ink', fill: 'bg-gold-light' },
  ink: { base: 'bg-ink text-ivory', fill: 'bg-spice' },
  'outline-dark': { base: 'border border-ink/25 text-ink', fill: 'bg-ink' },
  'outline-light': { base: 'border border-ivory/30 text-ivory', fill: 'bg-ivory' },
};

const fillText: Record<Variant, string> = {
  primary: 'group-hover:text-ivory',
  gold: 'group-hover:text-ink',
  ink: 'group-hover:text-ivory',
  'outline-dark': 'group-hover:text-ivory',
  'outline-light': 'group-hover:text-ink',
};

const sizes: Record<Size, string> = {
  md: 'h-12 px-6 text-[0.8rem]',
  lg: 'h-14 px-8 text-[0.85rem]',
};

function Inner({ children, variant, arrow }: { children: ReactNode; variant: Variant; arrow: boolean }) {
  return (
    <>
      <span
        aria-hidden="true"
        className={cn(
          'absolute inset-0 translate-y-[101%] transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-y-0',
          variants[variant].fill,
        )}
      />
      <span className={cn('relative z-10 flex items-center gap-3 transition-colors duration-500', fillText[variant])}>
        {children}
        {arrow && (
          <span className="relative block h-4 w-4 overflow-hidden">
            <ArrowUpRight
              aria-hidden="true"
              className="absolute inset-0 h-4 w-4 transition-transform duration-500 ease-[var(--ease-premium)] group-hover:-translate-y-full group-hover:translate-x-full"
            />
            <ArrowUpRight
              aria-hidden="true"
              className="absolute inset-0 h-4 w-4 -translate-x-full translate-y-full transition-transform duration-500 ease-[var(--ease-premium)] group-hover:translate-x-0 group-hover:translate-y-0"
            />
          </span>
        )}
      </span>
    </>
  );
}

export function Button(props: ButtonProps) {
  const { children, variant = 'primary', size = 'md', className, arrow = true } = props;
  const classes = cn(
    'group relative inline-flex select-none items-center justify-center overflow-hidden rounded-full font-semibold uppercase tracking-[0.16em] transition-[transform,box-shadow] duration-300 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
    variants[variant].base,
    sizes[size],
    className,
  );
  const inner = (
    <Inner variant={variant} arrow={arrow}>
      {children}
    </Inner>
  );

  if ('to' in props && props.to !== undefined) {
    return (
      <Link to={props.to} className={classes} onClick={props.onClick}>
        {inner}
      </Link>
    );
  }
  if ('href' in props && props.href !== undefined) {
    const external = 'external' in props && props.external;
    return (
      <a href={props.href} className={classes} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
        {inner}
      </a>
    );
  }
  const { variant: _v, size: _s, className: _c, arrow: _a, children: _ch, ...rest } = props as NativeButtonProps;
  return (
    <button type="button" className={classes} {...rest}>
      {inner}
    </button>
  );
}
