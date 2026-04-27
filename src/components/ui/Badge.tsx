import type { ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface BadgeProps {
  children: ReactNode;
  variant?: 'sage' | 'stone' | 'amber' | 'danger';
  className?: string;
}

const VARIANTS: Record<NonNullable<BadgeProps['variant']>, string> = {
  sage: 'bg-sage/15 text-sage-dark border-sage/30',
  stone: 'bg-stone-light/20 text-stone-dark border-stone-light/40',
  amber: 'bg-amber/15 text-amber border-amber/30',
  danger: 'bg-danger/10 text-danger border-danger/30',
};

export function Badge({ children, variant = 'stone', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
