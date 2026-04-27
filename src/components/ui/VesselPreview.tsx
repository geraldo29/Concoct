import { motion } from 'framer-motion';
import { Beaker } from 'lucide-react';
import type { Ingredient, Vessel, VesselMaterial, VesselSize } from '../../types';

interface VesselPreviewProps {
  vessel: Vessel | null;
  ingredients: Ingredient[];
  productName?: string;
  productSubtitle?: string;
  size?: 'sm' | 'lg';
}

/**
 * Hero-style vessel illustration. The bottle SHAPE varies by vessel size
 * (small → tall vial, medium → flask, large → wide jar) and the surface
 * TREATMENT varies by material (glass highlight, bamboo rings, brushed
 * aluminum, ceramic speckle, recycled-plastic squeeze).
 */
export function VesselPreview({
  vessel,
  ingredients,
  productName,
  productSubtitle,
  size = 'lg',
}: VesselPreviewProps) {
  if (!vessel) {
    return (
      <div
        className={`flex w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-stone-light/40 bg-bone-light/40 text-stone-light ${
          size === 'lg' ? 'h-[360px]' : 'h-72'
        }`}
      >
        <Beaker size={size === 'lg' ? 56 : 42} strokeWidth={1.2} />
        <p className="font-heading text-lg italic">Select a vessel to begin</p>
      </div>
    );
  }

  const dimensions = size === 'lg' ? 'h-[360px] w-auto' : 'h-72 w-auto';

  return (
    <div className="relative flex w-full flex-col items-center">
      <svg
        viewBox="0 0 240 280"
        className={dimensions}
        role="img"
        aria-label={`Preview of ${vessel.name} containing ${ingredients.length} ingredients`}
      >
        <BottleShape
          vessel={vessel}
          ingredients={ingredients}
          productName={productName}
          productSubtitle={productSubtitle}
        />
      </svg>

      <div className="mt-3 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-stone">
          {vessel.capacityMl}ml · {vessel.name}
        </p>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════
//  BottleShape – chooses geometry from vessel.size and
//  surface treatment from vessel.material
// ════════════════════════════════════════════════════

interface ShapeProps {
  vessel: Vessel;
  ingredients: Ingredient[];
  productName?: string;
  productSubtitle?: string;
}

interface ShapeGeometry {
  pathD: string;
  topY: number;
  bottomY: number;
  capX: number;
  capY: number;
  capW: number;
  capH: number;
  centerX: number;
  labelX: number;
  labelY: number;
  labelW: number;
  labelH: number;
}

function BottleShape({ vessel, ingredients, productName, productSubtitle }: ShapeProps) {
  const geo = computeGeometry(vessel.size);
  const palette = MATERIAL_PALETTES[vessel.material];

  const fillFraction = Math.min(ingredients.length / 6, 1);
  const fillTop = geo.bottomY - (geo.bottomY - geo.topY) * fillFraction;
  const totalLayers = Math.max(ingredients.length, 1);
  const layerH = (geo.bottomY - fillTop) / totalLayers;

  // Label color: derived from current ingredients, fallback to material accent
  const labelColor =
    ingredients.length > 0
      ? ingredients[Math.floor(ingredients.length / 2)].color
      : palette.accent ?? palette.dark;

  const clipId = `vessel-clip-${vessel.id}`;
  const glassGradId = `glass-grad-${vessel.id}`;
  const liquidGradId = `liquid-grad-${vessel.id}`;

  return (
    <>
      <defs>
        <clipPath id={clipId}>
          <path d={geo.pathD} />
        </clipPath>
        <linearGradient id={glassGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.light} stopOpacity="0.6" />
          <stop offset="100%" stopColor={palette.dark} stopOpacity="0.35" />
        </linearGradient>
        <linearGradient id={liquidGradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffbf5" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#fffbf5" stopOpacity="0.95" />
        </linearGradient>
      </defs>

      {/* Liquid fill clipped to bottle silhouette */}
      <g clipPath={`url(#${clipId})`}>
        <motion.rect
          initial={{ y: geo.bottomY }}
          animate={{ y: fillTop }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          x="0"
          width="240"
          height={geo.bottomY - geo.topY}
          fill={`url(#${liquidGradId})`}
        />
        {ingredients.map((ing, i) => {
          const y = fillTop + i * layerH;
          return (
            <motion.rect
              key={ing.id}
              initial={{ opacity: 0, y: y + 30 }}
              animate={{ opacity: 0.85, y }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: i * 0.05 }}
              x="0"
              width="240"
              height={layerH}
              fill={ing.color}
            />
          );
        })}

        {/* Label band (only when there's a product name) */}
        {productName && (
          <motion.rect
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.92 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            x={geo.labelX}
            y={geo.labelY}
            width={geo.labelW}
            height={geo.labelH}
            rx="3"
            fill={labelColor}
          />
        )}

        {/* Material-specific surface treatments (also clipped) */}
        <MaterialTreatment material={vessel.material} geo={geo} palette={palette} />
      </g>

      {/* Bottle outline */}
      <path
        d={geo.pathD}
        fill={`url(#${glassGradId})`}
        stroke={palette.stroke}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Cap */}
      <rect
        x={geo.capX}
        y={geo.capY}
        width={geo.capW}
        height={geo.capH}
        rx="3"
        fill={palette.cap}
      />
      <rect
        x={geo.capX}
        y={geo.capY + geo.capH * 0.18}
        width={geo.capW}
        height="2"
        fill="#ffffff"
        opacity="0.15"
      />

      {/* Label text overlay */}
      {productName && (
        <text
          x={geo.centerX}
          y={geo.labelY + geo.labelH * 0.55}
          textAnchor="middle"
          style={{ fontFamily: 'Cormorant Garamond, Georgia, serif' }}
          fontSize="16"
          fontStyle="italic"
          fill="#1c1917"
        >
          {productName}
        </text>
      )}
      {productName && productSubtitle && (
        <text
          x={geo.centerX}
          y={geo.labelY + geo.labelH * 0.85}
          textAnchor="middle"
          fontSize="6.5"
          letterSpacing="1.5"
          fill="#1c1917"
          opacity="0.7"
        >
          {productSubtitle.toUpperCase()}
        </text>
      )}
    </>
  );
}

// ─── Geometry per vessel size ────────────────────────
function computeGeometry(size: VesselSize): ShapeGeometry {
  switch (size) {
    case 'small': {
      // Tall, slim vial / dropper bottle
      const topY = 80;
      const bottomY = 260;
      const neckW = 30;
      const bodyW = 90;
      const cx = 120;
      const left = cx - bodyW / 2;
      const right = cx + bodyW / 2;
      const neckLeft = cx - neckW / 2;
      const neckRight = cx + neckW / 2;

      return {
        pathD: `M ${neckLeft} 60
                L ${neckLeft} ${topY}
                Q ${left + 4} ${topY + 8} ${left} ${topY + 35}
                L ${left} ${bottomY - 8}
                Q ${left} ${bottomY} ${left + 8} ${bottomY}
                L ${right - 8} ${bottomY}
                Q ${right} ${bottomY} ${right} ${bottomY - 8}
                L ${right} ${topY + 35}
                Q ${right - 4} ${topY + 8} ${neckRight} ${topY}
                L ${neckRight} 60 Z`,
        topY,
        bottomY,
        capX: neckLeft - 2,
        capY: 36,
        capW: neckW + 4,
        capH: 26,
        centerX: cx,
        labelX: left + 8,
        labelY: 175,
        labelW: bodyW - 16,
        labelH: 50,
      };
    }
    case 'large': {
      // Wide, low jar
      const topY = 70;
      const bottomY = 260;
      const neckW = 80;
      const bodyW = 170;
      const cx = 120;
      const left = cx - bodyW / 2;
      const right = cx + bodyW / 2;
      const neckLeft = cx - neckW / 2;
      const neckRight = cx + neckW / 2;

      return {
        pathD: `M ${neckLeft} 50
                L ${neckLeft} ${topY}
                Q ${left + 4} ${topY + 4} ${left} ${topY + 18}
                L ${left} ${bottomY - 14}
                Q ${left} ${bottomY} ${left + 14} ${bottomY}
                L ${right - 14} ${bottomY}
                Q ${right} ${bottomY} ${right} ${bottomY - 14}
                L ${right} ${topY + 18}
                Q ${right - 4} ${topY + 4} ${neckRight} ${topY}
                L ${neckRight} 50 Z`,
        topY,
        bottomY,
        capX: neckLeft - 2,
        capY: 28,
        capW: neckW + 4,
        capH: 24,
        centerX: cx,
        labelX: left + 20,
        labelY: 150,
        labelW: bodyW - 40,
        labelH: 60,
      };
    }
    case 'medium':
    default: {
      // Classic flask
      const topY = 80;
      const bottomY = 260;
      const neckW = 50;
      const bodyW = 130;
      const cx = 120;
      const left = cx - bodyW / 2;
      const right = cx + bodyW / 2;
      const neckLeft = cx - neckW / 2;
      const neckRight = cx + neckW / 2;

      return {
        pathD: `M ${neckLeft} 50
                L ${neckLeft} ${topY}
                Q ${left + 6} ${topY + 8} ${left} ${topY + 30}
                L ${left} ${bottomY - 12}
                Q ${left} ${bottomY} ${left + 12} ${bottomY}
                L ${right - 12} ${bottomY}
                Q ${right} ${bottomY} ${right} ${bottomY - 12}
                L ${right} ${topY + 30}
                Q ${right - 6} ${topY + 8} ${neckRight} ${topY}
                L ${neckRight} 50 Z`,
        topY,
        bottomY,
        capX: neckLeft - 2,
        capY: 26,
        capW: neckW + 4,
        capH: 26,
        centerX: cx,
        labelX: left + 12,
        labelY: 165,
        labelW: bodyW - 24,
        labelH: 56,
      };
    }
  }
}

// ─── Material treatments ─────────────────────────────
interface Palette {
  light: string;
  dark: string;
  stroke: string;
  cap: string;
  accent?: string;
}

const MATERIAL_PALETTES: Record<VesselMaterial, Palette> = {
  glass: {
    light: '#d4c5a9',
    dark: '#9c8460',
    stroke: '#6b5a3d',
    cap: '#1c1917',
    accent: '#b8956b',
  },
  bamboo: {
    light: '#c9a876',
    dark: '#7a5f33',
    stroke: '#4d3b1f',
    cap: '#3d3020',
    accent: '#a08555',
  },
  aluminum: {
    light: '#d6d3d1',
    dark: '#7a7672',
    stroke: '#4a4744',
    cap: '#1c1917',
    accent: '#9a9690',
  },
  ceramic: {
    light: '#f0e6d8',
    dark: '#bfa988',
    stroke: '#7a6850',
    cap: '#4a3f30',
    accent: '#c9b596',
  },
  'recycled-plastic': {
    light: '#a3b8a0',
    dark: '#5e7559',
    stroke: '#3f5240',
    cap: '#2d3a2d',
    accent: '#7a9173',
  },
};

interface TreatmentProps {
  material: VesselMaterial;
  geo: ShapeGeometry;
  palette: Palette;
}

function MaterialTreatment({ material, geo, palette }: TreatmentProps) {
  const { centerX, topY, bottomY } = geo;
  const bodyHeight = bottomY - topY;
  const left = centerX - 65;
  const right = centerX + 65;

  switch (material) {
    case 'glass':
      // Soft white highlight streak on the left
      return (
        <path
          d={`M ${left + 6} ${topY + bodyHeight * 0.2}
              Q ${left} ${topY + bodyHeight * 0.5}
                ${left + 8} ${bottomY - 20}`}
          fill="none"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.4"
        />
      );

    case 'bamboo':
      // Horizontal ring marks dividing the body
      return (
        <g opacity="0.5">
          {[0.3, 0.5, 0.7, 0.85].map((p, i) => (
            <line
              key={i}
              x1={left}
              y1={topY + bodyHeight * p}
              x2={right}
              y2={topY + bodyHeight * p}
              stroke={palette.accent}
              strokeWidth="0.8"
            />
          ))}
        </g>
      );

    case 'aluminum':
      // Vertical brushed lines
      return (
        <g>
          {[0.2, 0.4, 0.6, 0.8].map((p, i) => (
            <line
              key={i}
              x1={left + (right - left) * p}
              y1={topY + 20}
              x2={left + (right - left) * p}
              y2={bottomY - 8}
              stroke={i % 2 === 0 ? '#ffffff' : '#000000'}
              strokeWidth="0.5"
              opacity={i % 2 === 0 ? 0.35 : 0.18}
            />
          ))}
        </g>
      );

    case 'ceramic':
      // Random speckle dots
      return (
        <g opacity="0.5">
          {SPECKLE_POINTS.map((s, i) => (
            <circle
              key={i}
              cx={centerX + (s[0] - 0.5) * 100}
              cy={topY + 30 + s[1] * (bodyHeight - 50)}
              r={s[2]}
              fill={palette.stroke}
            />
          ))}
        </g>
      );

    case 'recycled-plastic':
      // Soft squeeze indents — two horizontal ellipses
      return (
        <g opacity="0.4" stroke={palette.stroke} strokeWidth="0.8" fill="none">
          <ellipse
            cx={centerX}
            cy={topY + bodyHeight * 0.4}
            rx={(right - left) / 2 - 6}
            ry="3"
          />
          <ellipse
            cx={centerX}
            cy={topY + bodyHeight * 0.7}
            rx={(right - left) / 2 - 6}
            ry="3"
          />
        </g>
      );

    default:
      return null;
  }
}

// Pre-randomized speckle positions (so React doesn't re-render them differently)
const SPECKLE_POINTS: Array<[number, number, number]> = [
  [0.15, 0.1, 0.6], [0.7, 0.18, 0.5], [0.4, 0.25, 0.45], [0.85, 0.32, 0.5],
  [0.2, 0.4, 0.55], [0.6, 0.48, 0.4], [0.1, 0.55, 0.5], [0.78, 0.62, 0.55],
  [0.35, 0.7, 0.45], [0.55, 0.78, 0.5], [0.18, 0.85, 0.55], [0.72, 0.92, 0.45],
];
