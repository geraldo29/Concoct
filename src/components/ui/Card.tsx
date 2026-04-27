import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../utils/helpers';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  selected?: boolean;
  disabled?: boolean;
  interactive?: boolean;
}

export function Card({
  children,
  selected,
  disabled,
  interactive,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        'rounded-2xl border bg-bone-light p-5 transition-all duration-200',
        interactive && !disabled && 'cursor-pointer hover:shadow-lg hover:-translate-y-0.5',
        selected
          ? 'border-sage border-2 eco-glow bg-cream'
          : 'border-stone-light/30',
        disabled && 'opacity-40 cursor-not-allowed grayscale',
        className,
      )}
    >
      {children}
    </div>
  );
}
