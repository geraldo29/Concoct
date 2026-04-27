/**
 * Combine class names, filtering out falsy values.
 * A minimal, dependency-free alternative to clsx.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Generate a placeholder image URL based on a seed string. We use a colored
 * SVG data URI so the app works fully offline without binary assets.
 */
export function placeholderImage(seed: string, color: string = '#a8a29e'): string {
  const initial = seed.charAt(0).toUpperCase();
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' fill='${color}' opacity='0.25'/>
    <text x='50' y='62' text-anchor='middle' font-family='Georgia, serif'
      font-size='48' fill='${color}' opacity='0.8'>${initial}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Format an ecoScore (1-10) into a star display.
 */
export function formatEcoScore(score: number): string {
  const filled = '●'.repeat(Math.round(score / 2));
  const empty = '○'.repeat(5 - Math.round(score / 2));
  return filled + empty;
}

/**
 * Capitalize the first letter and replace hyphens with spaces.
 */
export function humanize(s: string): string {
  return s
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
