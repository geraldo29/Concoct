import { Plus, X } from 'lucide-react';
import type { Ingredient } from '../../types';
import { humanize, cn } from '../../utils/helpers';
import { estimateIngredientPrice } from '../../utils/formulation';

interface IngredientRowProps {
  ingredient: Ingredient;
  index: number;
  selected: boolean;
  disabled?: boolean;
  onToggle: () => void;
}

/**
 * A numbered, list-style ingredient row inspired by the AURA reference UI.
 * Shows index, color swatch, name, type/tag, and price/action.
 */
export function IngredientRow({
  ingredient,
  index,
  selected,
  disabled,
  onToggle,
}: IngredientRowProps) {
  const price = estimateIngredientPrice(ingredient);
  const typeLabel = `${humanize(ingredient.type)} • ${humanize(
    ingredient.ethicalTags[0] ?? 'crafted',
  )}`;

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        'group flex w-full items-center gap-4 rounded-2xl border bg-bone-light px-4 py-3.5 text-left transition-all duration-200',
        'min-h-[64px]',
        selected
          ? 'border-sage/60 bg-cream eco-glow'
          : 'border-stone-light/30 hover:border-stone-light/60 hover:-translate-y-0.5 hover:shadow-sm',
        disabled && 'opacity-40 cursor-not-allowed hover:transform-none hover:border-stone-light/30 hover:shadow-none',
      )}
    >
      {/* Numbered circle */}
      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-stone-light/30 transition-colors"
        style={{ backgroundColor: `${ingredient.color}40` }}
      >
        <span className="font-heading text-base text-stone tabular-nums">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>

      {/* Name + type */}
      <div className="min-w-0 flex-1">
        <p className="font-heading text-lg text-charcoal leading-tight truncate">
          {ingredient.name}
        </p>
        <p className="text-xs text-stone uppercase tracking-wider mt-0.5 truncate">
          {typeLabel}
        </p>
      </div>

      {/* Action / price */}
      <div className="flex items-center gap-2 shrink-0">
        {selected ? (
          <>
            <span className="font-heading text-lg text-charcoal tabular-nums">
              ${price.toFixed(2)}
            </span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-sage/15 text-sage-dark group-hover:bg-danger/15 group-hover:text-danger transition-colors">
              <X size={14} />
            </span>
          </>
        ) : (
          <span className="flex items-center gap-1.5 text-sm uppercase tracking-wider text-stone group-hover:text-charcoal transition-colors">
            <Plus size={14} /> Add
          </span>
        )}
      </div>
    </button>
  );
}
