import { motion } from 'framer-motion';
import type { Ingredient } from '../../types';
import { calculateComposition } from '../../utils/formulation';

interface CompositionPanelProps {
  ingredients: Ingredient[];
}

export function CompositionPanel({ ingredients }: CompositionPanelProps) {
  const composition = calculateComposition(ingredients);

  return (
    <section>
      <h4 className="text-xs uppercase tracking-[0.2em] text-stone font-medium">
        Active Formulation
      </h4>

      {composition.length === 0 ? (
        <p className="mt-3 text-sm italic text-stone-light">
          Layer ingredients to see composition.
        </p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {composition.map(({ ingredient, percent }, idx) => (
            <motion.li
              key={ingredient.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: ingredient.color }}
                aria-hidden
              />
              <span className="flex-1 text-sm text-charcoal truncate">
                {ingredient.name}
              </span>
              <span className="font-heading text-base text-charcoal tabular-nums">
                {percent}%
              </span>
            </motion.li>
          ))}
        </ul>
      )}
    </section>
  );
}
