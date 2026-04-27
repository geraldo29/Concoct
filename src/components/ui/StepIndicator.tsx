import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '../../utils/helpers';

interface StepIndicatorProps {
  currentStage: 1 | 2 | 3 | 4;
  onStageClick?: (stage: 1 | 2 | 3 | 4) => void;
}

const STAGES = [
  { number: 1, label: 'The Base', sublabel: 'Category' },
  { number: 2, label: 'The Soul', sublabel: 'Vessel' },
  { number: 3, label: 'The Elements', sublabel: 'Components' },
  { number: 4, label: 'The Synthesis', sublabel: 'Result' },
] as const;

export function StepIndicator({ currentStage, onStageClick }: StepIndicatorProps) {
  return (
    <nav aria-label="Lab progress" className="w-full py-6">
      <ol className="flex items-start justify-between gap-2 md:gap-4">
        {STAGES.map((stage, idx) => {
          const isComplete = stage.number < currentStage;
          const isActive = stage.number === currentStage;
          const isClickable = onStageClick && stage.number <= currentStage;

          return (
            <li key={stage.number} className="flex flex-1 items-start">
              <div className="flex flex-1 flex-col items-center text-center">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={() => isClickable && onStageClick?.(stage.number as 1 | 2 | 3 | 4)}
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full border-2 font-heading text-lg transition-all',
                    isComplete && 'bg-sage border-sage text-bone',
                    isActive && 'bg-charcoal border-charcoal text-bone scale-110',
                    !isComplete && !isActive && 'bg-bone-light border-stone-light text-stone',
                    isClickable && 'cursor-pointer hover:scale-105',
                  )}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {isComplete ? <Check size={18} /> : stage.number}
                </button>
                <div className="mt-2 hidden md:block">
                  <p
                    className={cn(
                      'font-heading text-base leading-tight',
                      isActive ? 'text-charcoal font-semibold' : 'text-stone',
                    )}
                  >
                    {stage.label}
                  </p>
                  <p className="text-xs text-stone-light uppercase tracking-wider">
                    {stage.sublabel}
                  </p>
                </div>
              </div>

              {idx < STAGES.length - 1 && (
                <div className="relative mx-1 mt-5 h-0.5 flex-1 overflow-hidden bg-stone-light/30 md:mx-2">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-sage"
                    initial={false}
                    animate={{ width: isComplete ? '100%' : '0%' }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                  />
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
