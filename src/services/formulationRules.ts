import type { Ingredient, ProductCategory } from '../types';

/**
 * Expert formulation guidance per product category.
 * Drives both live AI suggestions and the warning system.
 */

export interface IngredientHint {
  id: string;
  reason: string;
}

export interface CategoryRules {
  /** Pairs (or triples) of base ingredients that work great together */
  goodBaseCombos: string[][];
  /** Actives recommended for this category, ranked by usefulness */
  recommendedActives: IngredientHint[];
  /** Ingredients that should NOT be used in this category */
  forbidden: Array<IngredientHint & { severity: 'high' | 'medium' }>;
  /** Best scent options */
  recommendedScents: IngredientHint[];
  /** A friendly tagline shown in the suggestion card when the user picks this category */
  starterHint: string;
}

export const CATEGORY_RULES: Record<ProductCategory, CategoryRules> = {
  // ───────────── LOTIONS ─────────────
  lotion: {
    goodBaseCombos: [
      ['i-aloe-vera', 'i-jojoba-oil'],
      ['i-aloe-vera', 'i-argan-oil'],
    ],
    recommendedActives: [
      { id: 'i-hyaluronic-acid', reason: 'deep, lightweight hydration' },
      { id: 'i-niacinamide', reason: 'strengthens the skin barrier' },
      { id: 'i-vitamin-c', reason: 'brightening for day lotions' },
    ],
    forbidden: [
      {
        id: 'i-retinol',
        severity: 'medium',
        reason: 'Retinol is unstable in day lotions — reserve for night-only formulas.',
      },
    ],
    recommendedScents: [
      { id: 'i-lavender', reason: 'calming, ideal for daily use' },
      { id: 'i-rose', reason: 'a premium, luxurious finish' },
    ],
    starterHint: 'Start with Aloe Vera Gel + Jojoba Oil for a light, fast-absorbing base.',
  },

  // ───────────── SHAMPOOS ─────────────
  shampoo: {
    goodBaseCombos: [
      ['i-aloe-vera', 'i-coconut-oil'],
      ['i-aloe-vera', 'i-jojoba-oil'],
    ],
    recommendedActives: [
      { id: 'i-salicylic-acid', reason: 'clears dandruff and product buildup' },
      { id: 'i-niacinamide', reason: 'soothes scalp irritation' },
      { id: 'i-citric-acid', reason: 'balances pH for cleaner rinse' },
    ],
    forbidden: [
      {
        id: 'i-retinol',
        severity: 'high',
        reason: 'Retinol is not formulated for scalp use — it can cause irritation.',
      },
      {
        id: 'i-shea-butter',
        severity: 'medium',
        reason: 'Heavy butters are hard to rinse from hair and may leave residue.',
      },
      {
        id: 'i-cocoa-butter',
        severity: 'medium',
        reason: 'Cocoa butter is too heavy for shampoos — may clog the scalp.',
      },
    ],
    recommendedScents: [
      { id: 'i-tea-tree', reason: 'antibacterial, fights dandruff' },
      { id: 'i-peppermint', reason: 'cooling, invigorating scalp feel' },
      { id: 'i-eucalyptus', reason: 'fresh, aromatic finish' },
    ],
    starterHint: 'Build on Aloe Vera Gel + a small amount of Coconut Oil for balanced cleansing.',
  },

  // ───────────── BEARD OIL ─────────────
  'beard-oil': {
    goodBaseCombos: [
      ['i-jojoba-oil', 'i-argan-oil'],
      ['i-jojoba-oil', 'i-coconut-oil'],
    ],
    // Beard oils don't really need actives — leave list empty
    recommendedActives: [],
    forbidden: [
      { id: 'i-vitamin-c', severity: 'high', reason: 'Vitamin C is water-soluble and won\'t blend into oil-based beard products.' },
      { id: 'i-retinol', severity: 'high', reason: 'Retinol is not stable or appropriate in oil-only leave-in products.' },
      { id: 'i-salicylic-acid', severity: 'high', reason: 'Acids do not belong in oil-based beard formulations.' },
      { id: 'i-glycolic-acid', severity: 'high', reason: 'Acids do not belong in oil-based beard formulations.' },
      { id: 'i-citric-acid', severity: 'high', reason: 'Acids do not belong in oil-based beard formulations.' },
      { id: 'i-hyaluronic-acid', severity: 'high', reason: 'HA is water-soluble — won\'t mix with oil-based beard products.' },
      { id: 'i-niacinamide', severity: 'medium', reason: 'Niacinamide is water-soluble — typically not effective in oil-only formats.' },
      { id: 'i-aloe-vera', severity: 'medium', reason: 'Aloe is water-based — incompatible with oil-only beard products.' },
    ],
    recommendedScents: [
      { id: 'i-sandalwood', reason: 'warm, premium masculine note' },
      { id: 'i-tea-tree', reason: 'anti-microbial, helps beard dandruff' },
      { id: 'i-lavender', reason: 'softer scent option' },
    ],
    starterHint: 'The classic combo: Jojoba + Argan oils. Add Sandalwood for a premium finish.',
  },

  // ───────────── FACE SERUM ─────────────
  'face-serum': {
    goodBaseCombos: [
      ['i-aloe-vera', 'i-jojoba-oil'],
    ],
    recommendedActives: [
      { id: 'i-hyaluronic-acid', reason: 'foundational hydration for any serum' },
      { id: 'i-niacinamide', reason: 'pairs with almost any other active safely' },
      { id: 'i-vitamin-c', reason: 'brightening morning serum' },
      { id: 'i-retinol', reason: 'anti-aging night serum (use 2 actives max)' },
      { id: 'i-salicylic-acid', reason: 'targeted acne treatment' },
    ],
    forbidden: [
      { id: 'i-shea-butter', severity: 'medium', reason: 'Too heavy for serums — better in butters/lotions.' },
      { id: 'i-cocoa-butter', severity: 'medium', reason: 'Too heavy for serums — use in body butters instead.' },
    ],
    recommendedScents: [
      { id: 'i-lavender', reason: 'use sparingly — face skin is sensitive' },
    ],
    starterHint: 'Pick a focus: hydration (HA + Niacinamide), brightening (Vit C + Niacinamide), or anti-aging (Retinol + HA at night).',
  },

  // ───────────── BODY BUTTER ─────────────
  'body-butter': {
    goodBaseCombos: [
      ['i-shea-butter', 'i-cocoa-butter'],
      ['i-shea-butter', 'i-argan-oil'],
    ],
    recommendedActives: [
      { id: 'i-vitamin-c', reason: 'all-over glow' },
      { id: 'i-niacinamide', reason: 'smooths and softens skin texture' },
    ],
    forbidden: [
      { id: 'i-hyaluronic-acid', severity: 'medium', reason: 'HA needs water to function — doesn\'t suspend in thick butters.' },
      { id: 'i-salicylic-acid', severity: 'medium', reason: 'Too harsh for full-body application in a butter.' },
      { id: 'i-glycolic-acid', severity: 'medium', reason: 'Too harsh for full-body application in a butter.' },
    ],
    recommendedScents: [
      { id: 'i-sandalwood', reason: 'warm, luxurious base note' },
      { id: 'i-rose', reason: 'premium body-care signature' },
    ],
    starterHint: 'Whip Shea + Cocoa Butter together for ultra-rich texture. Add Argan Oil for smoother spread.',
  },
};

// ─── Universal rules (apply across all categories) ──────────────

export interface UniversalConflict {
  ids: string[];
  severity: 'high' | 'medium';
  title: string;
  body: string;
  suggestion?: string;
}

export const UNIVERSAL_CONFLICTS: UniversalConflict[] = [
  {
    ids: ['i-vitamin-c', 'i-retinol'],
    severity: 'high',
    title: 'High Severity Interaction',
    body: 'Vitamin C and Retinol should not be mixed in the same formulation. They operate at different pH levels and can cause severe irritation.',
    suggestion: 'Apply Vitamin C in AM and Retinol in PM as separate products.',
  },
  {
    ids: ['i-retinol', 'i-glycolic-acid'],
    severity: 'high',
    title: 'Retinol + Acid',
    body: 'Combining Retinol with strong AHAs like Glycolic Acid is harsh on skin and accelerates irritation.',
    suggestion: 'Alternate days, or apply each in separate products.',
  },
  {
    ids: ['i-retinol', 'i-salicylic-acid'],
    severity: 'high',
    title: 'Retinol + BHA',
    body: 'Retinol with Salicylic Acid is too aggressive for most skin types.',
    suggestion: 'Use one or the other, not together.',
  },
  {
    ids: ['i-retinol', 'i-citric-acid'],
    severity: 'medium',
    title: 'Retinol + Acid',
    body: 'Retinol becomes unstable around acidic pH adjusters like Citric Acid.',
  },
  {
    ids: ['i-vitamin-c', 'i-salicylic-acid'],
    severity: 'medium',
    title: 'Acid Stacking',
    body: 'Vitamin C with strong acids can over-exfoliate and disrupt the skin barrier.',
    suggestion: 'Limit to one strong active per formulation.',
  },
];

/** Returns all triggered universal conflicts based on current ingredients. */
export function getActiveConflicts(ingredients: Ingredient[]): UniversalConflict[] {
  const ids = new Set(ingredients.map((i) => i.id));
  return UNIVERSAL_CONFLICTS.filter((c) => c.ids.every((id) => ids.has(id)));
}

/** Returns ingredients that the chosen category warns against. */
export function getCategoryWarnings(
  category: ProductCategory,
  ingredients: Ingredient[],
): Array<{ ingredient: Ingredient; warning: CategoryRules['forbidden'][number] }> {
  const rules = CATEGORY_RULES[category];
  const warnings: Array<{
    ingredient: Ingredient;
    warning: CategoryRules['forbidden'][number];
  }> = [];

  for (const ing of ingredients) {
    const match = rules.forbidden.find((f) => f.id === ing.id);
    if (match) warnings.push({ ingredient: ing, warning: match });
  }
  return warnings;
}

/** Heuristic: returns true if adding `ing` would trigger any conflict for this category. */
export function isIngredientForbidden(
  category: ProductCategory | null,
  ing: Ingredient,
): { forbidden: boolean; reason?: string } {
  if (!category) return { forbidden: false };
  const rules = CATEGORY_RULES[category];
  const match = rules.forbidden.find((f) => f.id === ing.id);
  if (match) return { forbidden: true, reason: match.reason };
  return { forbidden: false };
}

/**
 * The smart suggestion engine — picks the next best ingredient given:
 *   - chosen category
 *   - current ingredients
 *
 * Returns a hint suitable for rendering in the AI suggestion card.
 */
export function getSmartSuggestion(
  category: ProductCategory | null,
  ingredients: Ingredient[],
): {
  basedOn?: string;
  recommendation: string;
  suggestId?: string;
} {
  const has = (id: string) => ingredients.some((i) => i.id === id);

  // No category yet
  if (!category) {
    return {
      recommendation:
        'Pick a product category to unlock formulation guidance tailored to your goal.',
    };
  }

  const rules = CATEGORY_RULES[category];

  // No ingredients — give the starter hint with the first base from a good combo
  if (ingredients.length === 0) {
    const firstBaseId = rules.goodBaseCombos[0]?.[0];
    return {
      recommendation: rules.starterHint,
      suggestId: firstBaseId,
    };
  }

  // 1. Look for an unfinished good base combo and complete it
  for (const combo of rules.goodBaseCombos) {
    const present = combo.filter(has);
    const missing = combo.filter((id) => !has(id));
    if (present.length > 0 && missing.length > 0) {
      const partner = missing[0];
      const presentName = ingredients.find((i) => i.id === present[0])?.name ?? 'your base';
      return {
        basedOn: presentName,
        recommendation: `complete the pairing with the partner from this combo for a balanced ${humanCategory(category)}.`,
        suggestId: partner,
      };
    }
  }

  // 2. If no actives yet and the category recommends some, suggest the top active
  const hasAnyActive = ingredients.some((i) => i.type === 'active');
  if (!hasAnyActive && rules.recommendedActives.length > 0) {
    const next = rules.recommendedActives.find((a) => !has(a.id));
    if (next) {
      const lastBase = ingredients.find((i) => i.type === 'base');
      return {
        basedOn: lastBase?.name,
        recommendation: `add it for ${next.reason}.`,
        suggestId: next.id,
      };
    }
  }

  // 3. If there are actives but no scent, suggest a scent
  const hasScent = ingredients.some((i) => i.type === 'scent');
  if (!hasScent && rules.recommendedScents.length > 0) {
    const scent = rules.recommendedScents.find((s) => !has(s.id));
    if (scent) {
      return {
        basedOn: ingredients[ingredients.length - 1].name,
        recommendation: `finish with this scent — ${scent.reason}.`,
        suggestId: scent.id,
      };
    }
  }

  // 4. Suggest a second active if it's a serum (which benefits from up to 2-3 actives)
  if (category === 'face-serum' && hasAnyActive) {
    const next = rules.recommendedActives.find(
      (a) => !has(a.id) && a.id !== 'i-retinol', // never auto-suggest retinol on top of others
    );
    if (next && ingredients.filter((i) => i.type === 'active').length < 2) {
      return {
        basedOn: ingredients.find((i) => i.type === 'active')?.name,
        recommendation: `pair with this for ${next.reason}.`,
        suggestId: next.id,
      };
    }
  }

  // 5. We're done — formulation looks balanced
  return {
    basedOn: ingredients[ingredients.length - 1].name,
    recommendation: `your ${humanCategory(category)} is well-balanced. Ready to synthesize.`,
  };
}

function humanCategory(c: ProductCategory): string {
  return c.replace('-', ' ');
}
