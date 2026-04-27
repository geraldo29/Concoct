import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ArrowRight, Leaf } from 'lucide-react';

import type { ProductCategory, Vessel, VesselMaterial } from '../../types';
import { CATEGORIES } from '../../data/categories';
import { VESSELS } from '../../data/vessels';
import { INGREDIENTS } from '../../data/ingredients';

import { useRecipe } from '../../hooks/useRecipe';
import {
  isVesselCompatible,
  getIncompatibilityReasons,
} from '../../services/compatibilityEngine';
import {
  getActiveConflicts,
  getCategoryWarnings,
  getSmartSuggestion,
  isIngredientForbidden,
} from '../../services/formulationRules';
import { analyzeFormulation } from '../../services/geminiService';
import { estimateCo2Impact } from '../../utils/formulation';
import { cn, humanize } from '../../utils/helpers';

import { Button } from '../ui/Button';
import { IngredientRow } from '../ui/IngredientRow';
import { WarningCallout } from '../ui/WarningCallout';
import { VesselPreview } from '../ui/VesselPreview';
import { VesselIcon } from '../ui/VesselIcon';

import { EthicalPledge } from './EthicalPledge';
import { CompositionPanel } from './CompositionPanel';
import { AISuggestionCard } from './AISuggestionCard';
import { StageSynthesis } from './StageSynthesis';

const ALL_VESSEL_MATERIALS: VesselMaterial[] = [
  'glass',
  'aluminum',
  'bamboo',
  'ceramic',
  'recycled-plastic',
];

export function CreationLab({ onSignInClick }: { onSignInClick: () => void }) {
  const r = useRecipe();
  const { state } = r;
  const [showSynthesis, setShowSynthesis] = useState(false);

  // ─── Derived data ─────────────────────────────────────────
  const compatibleVessels = useMemo(() => {
    const allowedMaterials = state.category
      ? CATEGORIES.find((c) => c.id === state.category)?.suggestedVesselMaterials ??
        ALL_VESSEL_MATERIALS
      : ALL_VESSEL_MATERIALS;
    return VESSELS.filter((v) => allowedMaterials.includes(v.material));
  }, [state.category]);

  const co2Impact = useMemo(
    () => estimateCo2Impact(state.vessel, state.ingredients),
    [state.vessel, state.ingredients],
  );

  const interactionWarnings = useMemo(() => {
    if (!state.vessel) return [];
    return getIncompatibilityReasons(state.vessel, state.ingredients);
  }, [state.vessel, state.ingredients]);

  // High-severity ingredient interactions (Vit C + Retinol, etc.)
  const ingredientConflicts = useMemo(
    () => getActiveConflicts(state.ingredients),
    [state.ingredients],
  );

  // Per-category forbidden ingredients (e.g., Retinol in shampoo)
  const categoryWarnings = useMemo(
    () => (state.category ? getCategoryWarnings(state.category, state.ingredients) : []),
    [state.category, state.ingredients],
  );

  // AI-style suggestion driven by category-aware rules engine
  const liveSuggestion = useMemo(
    () => getSmartSuggestion(state.category, state.ingredients),
    [state.category, state.ingredients],
  );

  function handleAcceptSuggestion() {
    if (!liveSuggestion.suggestId) return;
    const ing = INGREDIENTS.find((i) => i.id === liveSuggestion.suggestId);
    if (!ing) return;
    if (state.vessel && !isVesselCompatible(state.vessel, [...state.ingredients, ing])) return;
    r.addIngredient(ing);
  }

  // ─── Action handlers ──────────────────────────────────────
  async function handleReview() {
    if (!state.category || !state.vessel || state.ingredients.length === 0) return;
    setShowSynthesis(true);

    if (!state.aiResult) {
      r.setAnalyzing(true);
      try {
        const result = await analyzeFormulation(
          state.category,
          state.vessel,
          state.ingredients,
        );
        r.setAiResult(result);
      } finally {
        r.setAnalyzing(false);
      }
    }
  }

  // ─── Synthesis takeover view ──────────────────────────────
  if (showSynthesis) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8">
        <button
          type="button"
          onClick={() => setShowSynthesis(false)}
          className="mb-6 text-sm text-stone hover:text-charcoal flex items-center gap-1.5"
        >
          ← Return to Lab
        </button>
        <StageSynthesis
          category={state.category}
          vessel={state.vessel}
          ingredients={state.ingredients}
          result={state.aiResult}
          isAnalyzing={state.isAnalyzing}
          onAnalyze={r.setAiResult}
          onSetAnalyzing={r.setAnalyzing}
          onSignInClick={onSignInClick}
          onReset={() => {
            r.reset();
            setShowSynthesis(false);
          }}
        />
      </div>
    );
  }

  // ─── Main 3-column workbench ──────────────────────────────
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr_300px] lg:gap-8">
        {/* ═══════════ LEFT SIDEBAR ═══════════ */}
        <aside className="space-y-6">
          <CategoryList
            selected={state.category}
            onSelect={r.setCategory}
          />
          <VesselSelector
            vessels={compatibleVessels}
            selected={state.vessel}
            ingredients={state.ingredients}
            onSelect={r.setVessel}
          />
          <EthicalPledge />
        </aside>

        {/* ═══════════ CENTER WORKSPACE ═══════════ */}
        <main className="min-w-0">
          <header className="mb-6">
            <p className="text-xs uppercase tracking-[0.3em] text-sage font-medium mb-2">
              {!state.category
                ? 'Step 1 of 3'
                : !state.vessel
                ? 'Step 2 of 3'
                : state.ingredients.length === 0
                ? 'Step 3 of 3'
                : 'Ready to review'}
            </p>
            <h1 className="font-heading text-4xl md:text-5xl text-charcoal leading-tight">
              {!state.category && (
                <>Choose a <em className="text-gradient not-italic">category</em></>
              )}
              {state.category && !state.vessel && (
                <>Pick your <em className="text-gradient not-italic">vessel</em></>
              )}
              {state.category && state.vessel && (
                <>Create Your <em className="text-gradient not-italic">Essence</em></>
              )}
            </h1>
            <p className="mt-2 text-stone leading-relaxed max-w-xl">
              {!state.category && '← Begin by selecting a product category from the left sidebar.'}
              {state.category && !state.vessel && '← Now choose a sustainable vessel from the left sidebar.'}
              {state.category && state.vessel &&
                'Select active ingredients to tailor your formulation to your skin\'s unique climate and biology.'}
            </p>
          </header>

          {/* Ingredient list — grouped by type */}
          {(['base', 'active', 'scent'] as const).map((groupType) => {
            const items = INGREDIENTS.filter((i) => i.type === groupType);
            const groupLabel =
              groupType === 'base' ? 'Bases' : groupType === 'active' ? 'Actives' : 'Scents';
            const groupHint =
              groupType === 'base'
                ? 'The carrier — what holds your formulation'
                : groupType === 'active'
                ? 'Targeted ingredients with a specific function'
                : 'Finishing aromatic notes';

            return (
              <section key={groupType} className="mb-6">
                <header className="mb-3 flex items-baseline justify-between">
                  <h3 className="font-heading text-xl text-charcoal">{groupLabel}</h3>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-stone-light">
                    {groupHint}
                  </span>
                </header>
                <div className="space-y-2.5">
                  <AnimatePresence initial={false}>
                    {items.map((ing, idx) => {
                      const isSelected = state.ingredients.some((i) => i.id === ing.id);
                      const wouldBreakVessel =
                        state.vessel !== null &&
                        !isSelected &&
                        !isVesselCompatible(state.vessel, [...state.ingredients, ing]);
                      const forbidden = !isSelected ? isIngredientForbidden(state.category, ing) : { forbidden: false };
                      const wouldBreak = wouldBreakVessel || forbidden.forbidden;

                      return (
                        <motion.div
                          key={ing.id}
                          layout
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.02, duration: 0.2 }}
                          title={forbidden.forbidden ? forbidden.reason : undefined}
                        >
                          <IngredientRow
                            ingredient={ing}
                            index={idx}
                            selected={isSelected}
                            disabled={wouldBreak}
                            onToggle={() =>
                              isSelected ? r.removeIngredient(ing.id) : r.addIngredient(ing)
                            }
                          />
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </section>
            );
          })}

          {/* All ingredient conflicts (Vit C + Retinol, etc.) */}
          {ingredientConflicts.length > 0 && (
            <div className="mt-5 space-y-3">
              {ingredientConflicts.map((c, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <WarningCallout
                    severity={c.severity}
                    title={c.title}
                    body={c.body}
                    suggestion={c.suggestion}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Category-specific warnings (Retinol in shampoo, HA in body butter, etc.) */}
          {categoryWarnings.length > 0 && (
            <div className="mt-5 space-y-3">
              {categoryWarnings.map(({ ingredient, warning }) => (
                <motion.div
                  key={ingredient.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <WarningCallout
                    severity={warning.severity}
                    title={`${ingredient.name} not recommended`}
                    body={warning.reason}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Vessel compatibility (chemical reaction with material) */}
          {interactionWarnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5"
            >
              <WarningCallout
                severity="medium"
                title="Vessel Compatibility Notice"
                body={interactionWarnings[0]}
              />
            </motion.div>
          )}

          {/* Footer action bar */}
          <footer className="mt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-stone-light/30 pt-5">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-stone">Est. Impact:</span>
              <span className="flex items-center gap-1 font-medium text-sage-dark tabular-nums">
                <Leaf size={12} /> {co2Impact.toFixed(1)}kg CO₂e
              </span>
            </div>

            <div className="flex flex-col items-end gap-1.5">
              <Button
                size="lg"
                onClick={handleReview}
                disabled={
                  !state.category || !state.vessel || state.ingredients.length === 0
                }
              >
                Review Formulation <ArrowRight size={16} />
              </Button>
              {(!state.category || !state.vessel || state.ingredients.length === 0) && (
                <p className="text-xs italic text-stone-light">
                  {!state.category && 'Select a category to continue'}
                  {state.category && !state.vessel && 'Select a vessel to continue'}
                  {state.category && state.vessel && state.ingredients.length === 0 &&
                    'Add at least one ingredient'}
                </p>
              )}
            </div>
          </footer>
        </main>

        {/* ═══════════ RIGHT SIDEBAR ═══════════ */}
        <aside className="space-y-6 lg:sticky lg:top-28 self-start">
          {/* Hero vessel preview */}
          <div>
            <VesselPreview
              vessel={state.vessel}
              ingredients={state.ingredients}
              productName={state.category ? humanize(state.category) : undefined}
              productSubtitle={state.vessel ? `${state.ingredients.length} elements` : undefined}
              size="sm"
            />
          </div>

          <CompositionPanel ingredients={state.ingredients} />

          <AISuggestionCard
            basedOn={liveSuggestion.basedOn}
            recommendation={liveSuggestion.recommendation}
            onAccept={liveSuggestion.suggestId ? handleAcceptSuggestion : undefined}
          />
        </aside>
      </div>
    </div>
  );
}

// ═══════════════ Subcomponents ═══════════════

interface CategoryListProps {
  selected: ProductCategory | null;
  onSelect: (c: ProductCategory) => void;
}

function CategoryList({ selected, onSelect }: CategoryListProps) {
  return (
    <section>
      <SectionHeader
        step="01"
        label="Category"
        complete={!!selected}
        active={!selected}
      />
      <ul className="space-y-1">
        {CATEGORIES.map((c) => {
          const Icon = (Icons[c.icon as keyof typeof Icons] as LucideIcon) ?? Icons.Leaf;
          const isSelected = selected === c.id;
          return (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => onSelect(c.id)}
                className={cn(
                  'flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-all min-h-[44px]',
                  isSelected
                    ? 'border-charcoal/60 bg-charcoal/5 text-charcoal font-medium'
                    : 'border-transparent text-stone hover:bg-stone-light/15 hover:text-charcoal',
                )}
              >
                <Icon size={14} strokeWidth={1.5} className={isSelected ? 'text-sage' : ''} />
                <span className="text-sm">{c.name}s</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

interface VesselSelectorProps {
  vessels: Vessel[];
  selected: Vessel | null;
  ingredients: import('../../types').Ingredient[];
  onSelect: (v: Vessel) => void;
}

function VesselSelector({
  vessels,
  selected,
  ingredients,
  onSelect,
}: VesselSelectorProps) {
  // Show 4 representative vessels — one per distinct material
  const display = useMemo(() => {
    const seen = new Set<VesselMaterial>();
    return vessels
      .filter((v) => {
        if (seen.has(v.material)) return false;
        seen.add(v.material);
        return true;
      })
      .slice(0, 4);
  }, [vessels]);

  return (
    <section>
      <SectionHeader
        step="02"
        label="Vessel"
        complete={!!selected}
        active={!selected}
        disabled={display.length === 0}
      />
      <div className="grid grid-cols-2 gap-2">
        {display.map((v) => {
          const compatible = isVesselCompatible(v, ingredients);
          const isSelected = selected?.id === v.id;
          return (
            <button
              key={v.id}
              type="button"
              onClick={() => compatible && onSelect(v)}
              disabled={!compatible}
              className={cn(
                'flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center transition-all min-h-[100px]',
                isSelected
                  ? 'border-charcoal/60 bg-charcoal/5 text-charcoal ring-1 ring-charcoal/20'
                  : 'border-stone-light/40 text-stone hover:border-stone-light/70 hover:text-charcoal hover:-translate-y-0.5',
                !compatible && 'opacity-30 cursor-not-allowed hover:transform-none',
              )}
            >
              <VesselIcon material={v.material} size={v.size} className="h-10 w-auto" />
              <p className="font-heading text-xs text-charcoal leading-tight">
                {v.name}
              </p>
              <p className="text-[9px] uppercase tracking-[0.15em] text-stone-light">
                {humanize(v.material)}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ─── Shared section header for left-sidebar steps ───
interface SectionHeaderProps {
  step: string;
  label: string;
  complete: boolean;
  active: boolean;
  disabled?: boolean;
}

function SectionHeader({ step, label, complete, active, disabled }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <span
        className={cn(
          'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-medium tabular-nums',
          complete && 'bg-sage text-bone',
          active && !complete && 'bg-charcoal text-bone ring-2 ring-charcoal/15 ring-offset-2 ring-offset-bone',
          !active && !complete && 'bg-stone-light/30 text-stone',
          disabled && 'bg-stone-light/15 text-stone-light',
        )}
      >
        {complete ? '✓' : step}
      </span>
      <h4
        className={cn(
          'text-xs uppercase tracking-[0.25em] font-medium',
          active ? 'text-charcoal' : complete ? 'text-sage-dark' : 'text-stone-light',
        )}
      >
        {label}
      </h4>
    </div>
  );
}
