import { AnimatePresence, motion } from 'framer-motion';
import { Plus, X } from 'lucide-react';
import type { Ingredient, IngredientType, Vessel } from '../../types';
import { INGREDIENTS } from '../../data/ingredients';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { VesselPreview } from '../ui/VesselPreview';
import { humanize } from '../../utils/helpers';
import { isVesselCompatible } from '../../services/compatibilityEngine';

interface StageElementsProps {
  vessel: Vessel | null;
  selected: Ingredient[];
  onAdd: (ing: Ingredient) => void;
  onRemove: (id: string) => void;
}

const TYPES: IngredientType[] = ['base', 'active', 'scent'];

const TYPE_DESCRIPTIONS: Record<IngredientType, string> = {
  base: 'The carrier — what holds and delivers your formulation.',
  active: 'The performer — targeted ingredients with a specific function.',
  scent: 'The aroma — finishing notes that complete the sensory experience.',
};

export function StageElements({
  vessel,
  selected,
  onAdd,
  onRemove,
}: StageElementsProps) {
  return (
    <div>
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sage">Stage 03</p>
        <h2 className="mt-2 text-4xl md:text-5xl font-heading text-charcoal">
          The <em className="text-gradient not-italic">Elements</em>
        </h2>
        <p className="mt-3 max-w-xl mx-auto text-stone">
          Layer ingredients across three families. Watch your concoction take
          shape in the vessel beside you.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* ─── Ingredient library ─── */}
        <div className="space-y-8">
          {TYPES.map((type) => (
            <IngredientFamily
              key={type}
              type={type}
              vessel={vessel}
              selected={selected}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          ))}
        </div>

        {/* ─── Sticky preview sidebar ─── */}
        <aside className="lg:sticky lg:top-24 self-start">
          <Card className="bg-cream">
            <VesselPreview vessel={vessel} ingredients={selected} />

            <div className="mt-6">
              <h4 className="text-xs uppercase tracking-wider text-stone-light">
                Composition
              </h4>
              {selected.length === 0 ? (
                <p className="mt-2 text-sm italic text-stone">
                  No elements layered yet.
                </p>
              ) : (
                <ul className="mt-3 space-y-2">
                  <AnimatePresence>
                    {selected.map((ing) => (
                      <motion.li
                        key={ing.id}
                        layout
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center justify-between gap-2 rounded-lg bg-bone-light p-2"
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className="h-3 w-3 rounded-full border border-stone-light/40"
                            style={{ backgroundColor: ing.color }}
                            aria-hidden
                          />
                          <span className="text-sm text-charcoal">{ing.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onRemove(ing.id)}
                          className="rounded-full p-1 text-stone-light hover:bg-danger/10 hover:text-danger"
                          aria-label={`Remove ${ing.name}`}
                        >
                          <X size={14} />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}

// ─── Subcomponents ───

interface IngredientFamilyProps {
  type: IngredientType;
  vessel: Vessel | null;
  selected: Ingredient[];
  onAdd: (ing: Ingredient) => void;
  onRemove: (id: string) => void;
}

function IngredientFamily({
  type,
  vessel,
  selected,
  onAdd,
  onRemove,
}: IngredientFamilyProps) {
  const items = INGREDIENTS.filter((i) => i.type === type);

  return (
    <section>
      <header className="mb-3 flex items-baseline justify-between">
        <h3 className="font-heading text-2xl text-charcoal">
          {humanize(type)}s
        </h3>
        <span className="text-xs uppercase tracking-wider text-stone-light">
          {TYPE_DESCRIPTIONS[type]}
        </span>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {items.map((ing) => {
          const isSelected = selected.some((s) => s.id === ing.id);
          // Disable if adding would break vessel compatibility
          const wouldBreak =
            vessel !== null &&
            !isSelected &&
            !isVesselCompatible(vessel, [...selected, ing]);

          return (
            <Card
              key={ing.id}
              interactive={!wouldBreak}
              selected={isSelected}
              disabled={wouldBreak}
              onClick={() => {
                if (wouldBreak) return;
                isSelected ? onRemove(ing.id) : onAdd(ing);
              }}
              className="!p-4"
            >
              <div className="flex items-start gap-3">
                <span
                  className="mt-1 h-8 w-8 shrink-0 rounded-full border border-stone-light/40"
                  style={{ backgroundColor: ing.color }}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-heading text-lg text-charcoal leading-tight">
                      {ing.name}
                    </h4>
                    {isSelected ? (
                      <X size={16} className="text-stone shrink-0" />
                    ) : (
                      <Plus size={16} className="text-stone shrink-0" />
                    )}
                  </div>
                  <p className="mt-1 text-xs text-stone leading-relaxed">
                    {ing.benefitDescription}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ing.ethicalTags.slice(0, 2).map((t) => (
                      <Badge key={t} variant="sage" className="text-[10px]">
                        {humanize(t)}
                      </Badge>
                    ))}
                  </div>
                  {wouldBreak && (
                    <p className="mt-2 text-[11px] italic text-danger">
                      Incompatible with {vessel?.material} vessel
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}
