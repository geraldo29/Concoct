import type { VesselMaterial, VesselSize } from '../../types';

interface VesselIconProps {
  material: VesselMaterial;
  size?: VesselSize;
  className?: string;
}

/**
 * Compact SVG icon representing a vessel — shape varies by size,
 * fill/texture varies by material. Used in selector cards.
 */
export function VesselIcon({ material, size = 'medium', className }: VesselIconProps) {
  const palette = MATERIAL_PALETTES[material];

  return (
    <svg
      viewBox="0 0 48 56"
      className={className}
      role="img"
      aria-label={`${material} vessel`}
    >
      <defs>
        <linearGradient id={`grad-${material}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={palette.light} />
          <stop offset="100%" stopColor={palette.dark} />
        </linearGradient>
      </defs>

      {renderShape(size, material, palette)}
    </svg>
  );
}

// ─── Per-material color & treatment ───
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
    dark: '#a08760',
    stroke: '#6b5a3d',
    cap: '#1c1917',
  },
  bamboo: {
    light: '#c9a876',
    dark: '#8a6f3f',
    stroke: '#5a4828',
    cap: '#3d3020',
    accent: '#a08555',
  },
  aluminum: {
    light: '#d6d3d1',
    dark: '#8b8783',
    stroke: '#57534e',
    cap: '#292524',
  },
  ceramic: {
    light: '#f0e6d8',
    dark: '#bfa988',
    stroke: '#7a6850',
    cap: '#4a3f30',
  },
  'recycled-plastic': {
    light: '#a3b8a0',
    dark: '#6b8268',
    stroke: '#3f5240',
    cap: '#2d3a2d',
  },
};

// ─── Shape variants ───
function renderShape(size: VesselSize, material: VesselMaterial, p: Palette) {
  // Width varies subtly per size for visual hint
  const widths = { small: 16, medium: 22, large: 28 };
  const w = widths[size];
  const x = (48 - w) / 2;

  // Cap dimensions
  const capW = w + 2;
  const capX = (48 - capW) / 2;

  return (
    <g>
      {/* Bottle body */}
      <path
        d={`M ${x} 18
            L ${x} 22
            Q ${x - 3} 26 ${x - 3} 32
            L ${x - 3} 48
            Q ${x - 3} 52 ${x + 1} 52
            L ${x + w - 1} 52
            Q ${x + w + 3} 52 ${x + w + 3} 48
            L ${x + w + 3} 32
            Q ${x + w + 3} 26 ${x + w} 22
            L ${x + w} 18 Z`}
        fill={`url(#grad-${material})`}
        stroke={p.stroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Bamboo: horizontal ring marks */}
      {material === 'bamboo' && p.accent && (
        <>
          <line x1={x - 3} y1="35" x2={x + w + 3} y2="35" stroke={p.accent} strokeWidth="0.6" opacity="0.7" />
          <line x1={x - 3} y1="42" x2={x + w + 3} y2="42" stroke={p.accent} strokeWidth="0.6" opacity="0.7" />
          <line x1={x - 3} y1="48" x2={x + w + 3} y2="48" stroke={p.accent} strokeWidth="0.6" opacity="0.7" />
        </>
      )}

      {/* Glass: highlight streak */}
      {material === 'glass' && (
        <path
          d={`M ${x - 1} 28 Q ${x - 2} 38 ${x} 48`}
          stroke="#fffbf5"
          strokeWidth="1.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.55"
        />
      )}

      {/* Aluminum: vertical brushed lines */}
      {material === 'aluminum' && (
        <>
          <line x1={x + 2} y1="26" x2={x + 2} y2="50" stroke="#fff" strokeWidth="0.4" opacity="0.4" />
          <line x1={x + w / 2} y1="26" x2={x + w / 2} y2="50" stroke="#fff" strokeWidth="0.4" opacity="0.3" />
          <line x1={x + w - 2} y1="26" x2={x + w - 2} y2="50" stroke="#000" strokeWidth="0.4" opacity="0.2" />
        </>
      )}

      {/* Ceramic: subtle speckle */}
      {material === 'ceramic' && (
        <>
          <circle cx={x + 4} cy="36" r="0.6" fill={p.stroke} opacity="0.4" />
          <circle cx={x + w - 5} cy="40" r="0.5" fill={p.stroke} opacity="0.4" />
          <circle cx={x + w / 2} cy="46" r="0.5" fill={p.stroke} opacity="0.4" />
        </>
      )}

      {/* Recycled plastic: soft squeeze indent */}
      {material === 'recycled-plastic' && (
        <ellipse
          cx="24"
          cy="38"
          rx={w / 2 - 1}
          ry="2"
          fill="none"
          stroke={p.stroke}
          strokeWidth="0.5"
          opacity="0.5"
        />
      )}

      {/* Cap */}
      <rect x={capX} y="10" width={capW} height="9" rx="1.5" fill={p.cap} />
      <rect x={capX} y="11.5" width={capW} height="1" fill="#fff" opacity="0.15" />
    </g>
  );
}
