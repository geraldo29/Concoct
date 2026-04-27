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

  // High-severity check: vitamin C + retinol together
  const conflictingActives = useMemo(() => {
    const ids = state.ingredients.map((i) => i.id);
    if (ids.includes('i-vitamin-c') && ids.includes('i-retinol')) {
      return {
        title: 'High Severity Interaction',
        body: 'Vitamin C and Retinol should not be mixed in the same serum. They operate at different pH levels and can cause severe irritation.',
        suggestion: 'Apply Vitamin C in AM, Retinol in PM.',
      };
    }
    return null;
  }, [state.ingredients]);

  // AI-style suggestion (deterministic, runs locally)
  const liveSuggestion = useMemo(() => {
    if (state.ingredients.length === 0) {
      return {
        recommendation:
          'Begin by selecting a base oil. Pure Squalane and Jojoba make excellent foundations.',
      };
    }
    const lastIng = state.ingredients[state.ingredients.length - 1];
    if (lastIng.id === 'i-retinol') {
      return {
        basedOn: 'Retinol',
        recommendation: 'we recommend adding Niacinamide to soothe skin and reinforce the barrier.',
      };
    }
    if (lastIng.type === 'active') {
      return {
        basedOn: lastIng.name,
        recommendation: 'pair with Hyaluronic Acid to maximize hydration and reduce irritation.',
      };
    }
    if (state.ingredients.every((i) => i.type === 'base')) {
      return {
        recommendation:
          'Your base is balanced — consider adding an active like Niacinamide or Vitamin C for targeted benefit.',
      };
    }
    return {
      basedOn: lastIng.name,
      recommendation: 'a touch of Lavender or Rose Otto would round out the aromatic profile.',
    };
  }, [state.ingredients]);

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
            <h1 className="font-heading text-4xl md:text-5xl text-charcoal leading-tight">
              Create Your <em className="text-gradient not-italic">Essence</em>
            </h1>
            <p className="mt-2 text-stone leading-relaxed max-w-xl">
              Select active ingredients to tailor your formulation to your skin's
              unique climate and biology.
            </p>
          </header>

          {/* Ingredient list */}
          <div className="space-y-2.5">
            <AnimatePresence initial={false}>
              {INGREDIENTS.slice(0, 8).map((ing, idx) => {
                const isSelected = state.ingredients.some((i) => i.id === ing.id);
                const wouldBreak =
                  state.vessel !== null &&
                  !isSelected &&
                  !isVesselCompatible(state.vessel, [...state.ingredients, ing]);

                return (
                  <motion.div
                    key={ing.id}
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03, duration: 0.25 }}
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

          {/* Inline severity warning */}
          {conflictingActives && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5"
            >
              <WarningCallout severity="high" {...conflictingActives} />
            </motion.div>
          )}

          {interactionWarnings.length > 0 && !conflictingActives && (
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

            <Button
              size="lg"
              onClick={handleReview}
              disabled={
                !state.category || !state.vessel || state.ingredients.length === 0
              }
            >
              Review Formulation <ArrowRight size={16} />
            </Button>
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
      <h4 className="text-xs uppercase tracking-[0.25em] text-stone-light font-medium mb-3">
        01. Category
      </h4>
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
      <h4 className="text-xs uppercase tracking-[0.25em] text-stone-light font-medium mb-3">
        02. Vessel
      </h4>
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
