import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Leaf } from 'lucide-react';
import type { Ingredient, Vessel, VesselMaterial, VesselSize } from '../../types';
import { VESSELS } from '../../data/vessels';
import {
  getIncompatibilityReasons,
  isVesselCompatible,
} from '../../services/compatibilityEngine';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { humanize } from '../../utils/helpers';

interface StageSoulProps {
  selected: Vessel | null;
  ingredients: Ingredient[];
  onSelect: (vessel: Vessel) => void;
}

const MATERIALS: Array<VesselMaterial | 'all'> = [
  'all',
  'glass',
  'bamboo',
  'aluminum',
  'ceramic',
  'recycled-plastic',
];
const SIZES: Array<VesselSize | 'all'> = ['all', 'small', 'medium', 'large'];

export function StageSoul({ selected, ingredients, onSelect }: StageSoulProps) {
  const [materialFilter, setMaterialFilter] = useState<VesselMaterial | 'all'>('all');
  const [sizeFilter, setSizeFilter] = useState<VesselSize | 'all'>('all');

  const filtered = useMemo(() => {
    return VESSELS.filter((v) => {
      if (materialFilter !== 'all' && v.material !== materialFilter) return false;
      if (sizeFilter !== 'all' && v.size !== sizeFilter) return false;
      return true;
    });
  }, [materialFilter, sizeFilter]);

  return (
    <div>
      <header className="mb-8 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-sage">Stage 02</p>
        <h2 className="mt-2 text-4xl md:text-5xl font-heading text-charcoal">
          The <em className="text-gradient not-italic">Soul</em>
        </h2>
        <p className="mt-3 max-w-xl mx-auto text-stone">
          Every formulation deserves a worthy vessel. Choose with sustainability
          and chemistry in mind.
        </p>
      </header>

      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <FilterGroup
          label="Material"
          values={MATERIALS}
          current={materialFilter}
          onChange={(v) => setMaterialFilter(v as VesselMaterial | 'all')}
        />
        <FilterGroup
          label="Size"
          values={SIZES}
          current={sizeFilter}
          onChange={(v) => setSizeFilter(v as VesselSize | 'all')}
        />
      </div>

      {ingredients.length > 0 && (
        <p className="mb-4 text-center text-sm text-stone italic">
          Filtering with {ingredients.length} ingredient{ingredients.length !== 1 && 's'} loaded —
          incompatible vessels are dimmed.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((vessel, idx) => {
          const compatible = isVesselCompatible(vessel, ingredients);
          const reasons = compatible ? [] : getIncompatibilityReasons(vessel, ingredients);
          const isSelected = selected?.id === vessel.id;

          return (
            <motion.div
              key={vessel.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03, duration: 0.25 }}
            >
              <Card
                interactive={compatible}
                selected={isSelected}
                disabled={!compatible}
                onClick={() => compatible && onSelect(vessel)}
                className="h-full flex flex-col"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-heading text-xl text-charcoal">
                      {vessel.name}
                    </h3>
                    <p className="text-xs uppercase tracking-wider text-stone-light mt-0.5">
                      {humanize(vessel.material)} · {vessel.capacityMl}ml
                    </p>
                  </div>
                  <Badge variant="sage">
                    <Leaf size={10} /> {vessel.ecoScore}/10
                  </Badge>
                </div>

                <p className="mt-3 text-sm text-stone leading-relaxed flex-1">
                  {vessel.description}
                </p>

                <div className="mt-4 flex items-end justify-between gap-2">
                  <span className="font-heading text-lg text-charcoal">
                    ${vessel.priceUsd.toFixed(2)}
                  </span>
                  {!compatible && (
                    <Badge variant="danger" className="text-[10px]">
                      <AlertCircle size={10} /> Incompatible
                    </Badge>
                  )}
                </div>

                {reasons.length > 0 && (
                  <p className="mt-2 text-xs text-danger italic leading-snug">
                    {reasons[0]}
                  </p>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-stone italic py-12">
          No vessels match your filters. Try broadening your selection.
        </p>
      )}
    </div>
  );
}

// ─── Subcomponent ───
interface FilterGroupProps<T extends string> {
  label: string;
  values: readonly T[];
  current: T;
  onChange: (value: T) => void;
}

function FilterGroup<T extends string>({
  label,
  values,
  current,
  onChange,
}: FilterGroupProps<T>) {
  return (
    <div className="flex items-center gap-1 rounded-full border border-stone-light/40 bg-bone-light p-1">
      <span className="px-2 text-xs uppercase tracking-wider text-stone-light">
        {label}
      </span>
      {values.map((v) => (
        <button
          key={v}
          type="button"
          onClick={() => onChange(v)}
          className={`min-h-[32px] rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            current === v
              ? 'bg-charcoal text-bone'
              : 'text-stone hover:bg-stone-light/20'
          }`}
        >
          {humanize(v)}
        </button>
      ))}
    </div>
  );
}
