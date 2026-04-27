import { motion } from 'framer-motion';
import type { Ingredient, Vessel } from '../../types';
import { Beaker } from 'lucide-react';

interface VesselPreviewProps {
  vessel: Vessel | null;
  ingredients: Ingredient[];
}

/**
 * A SVG-based vessel illustration that visually "fills" with the
 * selected ingredients, layering colors from the bottom up.
 */
export function VesselPreview({ vessel, ingredients }: VesselPreviewProps) {
  if (!vessel) {
    return (
      <div className="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-stone-light/40 bg-bone-light/40 text-stone-light">
        <Beaker size={42} strokeWidth={1.2} />
        <p className="font-heading text-lg italic">No vessel selected</p>
      </div>
    );
  }

  const totalLayers = Math.max(ingredients.length, 1);
  const fillFraction = Math.min(ingredients.length / 6, 1); // up to 6 ingredients = full
  const fillHeight = 140 * fillFraction;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        viewBox="0 0 200 240"
        className="h-72 w-auto"
        role="img"
        aria-label={`Preview of ${vessel.name} containing ${ingredients.length} ingredients`}
      >
        {/* Vessel outline (a soft flask shape) */}
        <defs>
          <clipPath id="vessel-clip">
            <path d="M 60 40 L 60 80 Q 30 100 30 150 L 30 200 Q 30 220 50 220 L 150 220 Q 170 220 170 200 L 170 150 Q 170 100 140 80 L 140 40 Z" />
          </clipPath>
          <linearGradient id="glass-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e7e5e4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#a8a29e" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Liquid fill (clipped to vessel shape) */}
        <g clipPath="url(#vessel-clip)">
          <rect
            x="0"
            y={220 - fillHeight}
            width="200"
            height={fillHeight}
            fill="#fffbf5"
          />
          {ingredients.map((ing, i) => {
            const layerH = fillHeight / totalLayers;
            const y = 220 - fillHeight + i * layerH;
            return (
              <motion.rect
                key={ing.id}
                initial={{ opacity: 0, y: y + 20 }}
                animate={{ opacity: 0.85, y }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                x="0"
                width="200"
                height={layerH}
                fill={ing.color}
              />
            );
          })}
        </g>

        {/* Vessel stroke */}
        <path
          d="M 60 40 L 60 80 Q 30 100 30 150 L 30 200 Q 30 220 50 220 L 150 220 Q 170 220 170 200 L 170 150 Q 170 100 140 80 L 140 40 Z"
          fill="url(#glass-gradient)"
          stroke="#57534e"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Cap */}
        <rect
          x="65"
          y="20"
          width="70"
          height="22"
          rx="3"
          fill="#1c1917"
        />

        {/* Highlight */}
        <path
          d="M 50 90 Q 45 130 55 180"
          fill="none"
          stroke="#fffbf5"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>

      <div className="text-center">
        <p className="font-heading text-xl text-charcoal">{vessel.name}</p>
        <p className="text-sm text-stone">
          {vessel.capacityMl}ml · {vessel.material}
        </p>
      </div>
    </div>
  );
}
