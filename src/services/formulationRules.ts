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
  /** The "ideal" formula for this category — used when the user has built a poorly-balanced mix */
  idealRecipe: { id: string; pct: number }[];
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
    idealRecipe: [
      { id: 'i-aloe-vera', pct: 50 },
      { id: 'i-jojoba-oil', pct: 30 },
      { id: 'i-niacinamide', pct: 5 },
      { id: 'i-hyaluronic-acid', pct: 3 },
      { id: 'i-lavender', pct: 1 },
    ],
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
    idealRecipe: [
      { id: 'i-aloe-vera', pct: 60 },
      { id: 'i-coconut-oil', pct: 10 },
      { id: 'i-salicylic-acid', pct: 2 },
      { id: 'i-tea-tree', pct: 1 },
      { id: 'i-peppermint', pct: 1 },
    ],
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
    idealRecipe: [
      { id: 'i-jojoba-oil', pct: 60 },
      { id: 'i-argan-oil', pct: 30 },
      { id: 'i-coconut-oil', pct: 10 },
      { id: 'i-sandalwood', pct: 1 },
    ],
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
    idealRecipe: [
      { id: 'i-aloe-vera', pct: 60 },
      { id: 'i-jojoba-oil', pct: 25 },
      { id: 'i-hyaluronic-acid', pct: 5 },
      { id: 'i-niacinamide', pct: 5 },
    ],
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
    idealRecipe: [
      { id: 'i-shea-butter', pct: 40 },
      { id: 'i-cocoa-butter', pct: 25 },
      { id: 'i-argan-oil', pct: 20 },
      { id: 'i-jojoba-oil', pct: 15 },
      { id: 'i-rose', pct: 1 },
    ],
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

// ═══════════ COMPOSITION ANALYZER ═══════════
// Detects "feel/texture" issues that aren't strictly forbidden but produce
// a poor end product (heavy balm where you wanted a lotion, no purpose focus, etc.)

// Ingredients that solidify or feel waxy at room temperature
const HARD_BUTTERS = new Set(['i-shea-butter', 'i-cocoa-butter']);
// Heavy, occlusive ingredients that compound greasiness
const OCCLUSIVE_BASES = new Set(['i-shea-butter', 'i-cocoa-butter', 'i-coconut-oil']);
// Lightweight, spreadable bases
const LIGHT_BASES = new Set(['i-jojoba-oil', 'i-argan-oil', 'i-aloe-vera']);

export interface CompositionWarning {
  severity: 'critical' | 'caution';
  title: string;
  body: string;
  removeActions?: Array<{ id: string; label: string }>;
}

export function analyzeComposition(
  category: ProductCategory,
  ingredients: Ingredient[],
): CompositionWarning | null {
  const baseIngredients = ingredients.filter((i) => i.type === 'base');
  const hardButters = baseIngredients.filter((i) => HARD_BUTTERS.has(i.id));
  const occlusives = baseIngredients.filter((i) => OCCLUSIVE_BASES.has(i.id));
  const lights = baseIngredients.filter((i) => LIGHT_BASES.has(i.id));

  // ─── 1. Beard oil with butters ─── (hardest case)
  if (category === 'beard-oil' && hardButters.length > 0) {
    return {
      severity: 'critical',
      title: 'Too thick for a beard oil',
      body: `${humanList(hardButters.map((i) => i.name))} will solidify at room temperature and feel waxy in a beard oil. Beard oils should be 70–90% liquid carrier oils like Jojoba and Argan.`,
      removeActions: hardButters.map((i) => ({ id: i.id, label: `Remove ${i.name}` })),
    };
  }

  // ─── 2. "Heavy balm" pattern ─── (Shea + Cocoa together outside body butter)
  if (category !== 'body-butter' && hardButters.length >= 2) {
    return {
      severity: 'critical',
      title: 'Will feel like a heavy balm',
      body: `Shea Butter + Cocoa Butter together is ~40%+ hard butter — your ${humanCategory(category)} will solidify at room temp. Consider moving these to a body butter formulation, or remove one.`,
      removeActions: hardButters.map((i) => ({ id: i.id, label: `Remove ${i.name}` })),
    };
  }

  // ─── 3. Occlusive overload ─── (3+ heavy bases anywhere except body butter)
  if (category !== 'body-butter' && occlusives.length >= 3) {
    return {
      severity: 'critical',
      title: 'Too occlusive',
      body: `${humanList(occlusives.map((i) => i.name))} together creates a very greasy, pore-clogging combo. Only body butters can carry this load — in a ${humanCategory(category)} it will feel suffocating on skin.`,
      removeActions: occlusives.slice(1).map((i) => ({ id: i.id, label: `Remove ${i.name}` })),
    };
  }

  // ─── 4. "No purpose focus" pattern ─── (4+ bases mixed evenly)
  // Indicates ingredient stacking instead of intentional formulation
  if (baseIngredients.length >= 4 && lights.length > 0 && occlusives.length > 0) {
    return {
      severity: 'caution',
      title: 'No clear purpose',
      body: `${baseIngredients.length} bases mixed evenly is ingredient stacking — not formulation. Pick a goal: lightweight (Aloe + Jojoba), deep moisture (Shea + Argan), or targeted (single carrier + active). Right now it tries to do everything.`,
    };
  }

  return null;
}

/**
 * Compare current ingredients against the category's ideal recipe.
 * Returns a friendly comparison string — useful for the synthesis screen.
 */
export function getIdealRecipe(category: ProductCategory): { id: string; name: string; pct: number }[] {
  return CATEGORY_RULES[category].idealRecipe.map((r) => ({
    ...r,
    name: lookupName(r.id),
  }));
}

/**
 * The smart suggestion engine — picks the next best action given:
 *   - chosen category
 *   - current ingredients
 *
 * Returns a hint suitable for rendering in the AI suggestion card.
 * `severity` lets the UI render warnings in a critical tone vs neutral suggestions.
 */
export interface SmartSuggestion {
  basedOn?: string;
  recommendation: string;
  suggestId?: string;
  /** 'critical' = something is wrong | 'caution' = soft issue | 'info' = forward suggestion */
  severity: 'critical' | 'caution' | 'info';
  /** Title shown above the message when severity is critical/caution */
  title?: string;
  /** One-tap remove action (kept for back-compat — first item in `removeActions`) */
  actionLabel?: string;
  actionRemoveId?: string;
  /** Multiple remove actions when several ingredients need removing */
  removeActions?: Array<{ id: string; label: string }>;
}

export function getSmartSuggestion(
  category: ProductCategory | null,
  ingredients: Ingredient[],
): SmartSuggestion {
  const has = (id: string) => ingredients.some((i) => i.id === id);

  // No category yet
  if (!category) {
    return {
      severity: 'info',
      recommendation:
        'Pick a product category to unlock formulation guidance tailored to your goal.',
    };
  }

  const rules = CATEGORY_RULES[category];

  // ─── 1. CRITICAL: surface ALL universal conflicts (Vit C + Retinol, etc.) ───
  const conflicts = getActiveConflicts(ingredients);
  if (conflicts.length > 0) {
    // Collect every ingredient involved across all conflict pairs
    const involvedIds = Array.from(new Set(conflicts.flatMap((c) => c.ids)));
    const involvedNames = involvedIds
      .map((id) => ingredients.find((i) => i.id === id)?.name)
      .filter((n): n is string => Boolean(n));

    // Multi-conflict: list them all; single-conflict: keep the rich title
    const isMulti = conflicts.length > 1;
    const title = isMulti
      ? `${conflicts.length} ingredient interactions`
      : conflicts[0].title;
    const body = isMulti
      ? `${humanList(involvedNames)} cannot safely coexist in one formulation. Remove one of each conflicting pair.`
      : conflicts[0].body + (conflicts[0].suggestion ? ` ${conflicts[0].suggestion}` : '');

    // Build remove actions — dedupe to second item of each conflict pair
    const removeIds = Array.from(new Set(conflicts.map((c) => c.ids[1])));
    const removeActions = removeIds
      .map((id) => {
        const ing = ingredients.find((i) => i.id === id);
        return ing ? { id, label: `Remove ${ing.name}` } : null;
      })
      .filter((a): a is { id: string; label: string } => Boolean(a));

    return {
      severity: 'critical',
      title,
      recommendation: body,
      removeActions,
      actionLabel: removeActions[0]?.label,
      actionRemoveId: removeActions[0]?.id,
    };
  }

  // ─── 2. CAUTION/CRITICAL: aggregate ALL category-forbidden ingredients ───
  const categoryWarnings = getCategoryWarnings(category, ingredients);
  if (categoryWarnings.length > 0) {
    // Highest severity wins (high → critical, medium → caution)
    const anyHigh = categoryWarnings.some((w) => w.warning.severity === 'high');
    const severity: 'critical' | 'caution' = anyHigh ? 'critical' : 'caution';

    const removeActions = categoryWarnings.map((w) => ({
      id: w.ingredient.id,
      label: `Remove ${w.ingredient.name}`,
    }));

    if (categoryWarnings.length === 1) {
      const w = categoryWarnings[0];
      return {
        severity,
        title: `${w.ingredient.name} doesn't suit ${humanCategory(category)}`,
        recommendation: w.warning.reason,
        removeActions,
        actionLabel: removeActions[0].label,
        actionRemoveId: removeActions[0].id,
      };
    }

    // Multiple offenders — list them all
    const names = categoryWarnings.map((w) => w.ingredient.name);
    const reasons = categoryWarnings
      .map((w) => `• ${w.ingredient.name}: ${w.warning.reason}`)
      .join(' ');

    return {
      severity,
      title: `${categoryWarnings.length} ingredients don't suit ${humanCategory(category)}`,
      recommendation: `${humanList(names)} aren't recommended here. ${reasons}`,
      removeActions,
      actionLabel: removeActions[0].label,
      actionRemoveId: removeActions[0].id,
    };
  }

  // ─── 3. CRITICAL/CAUTION: composition analysis (texture, greasiness, focus) ───
  const compositionIssue = analyzeComposition(category, ingredients);
  if (compositionIssue) {
    return {
      severity: compositionIssue.severity,
      title: compositionIssue.title,
      recommendation: compositionIssue.body,
      removeActions: compositionIssue.removeActions,
      actionLabel: compositionIssue.removeActions?.[0]?.label,
      actionRemoveId: compositionIssue.removeActions?.[0]?.id,
    };
  }

  // ─── 4. INFO: starter hint when no ingredients yet ───
  if (ingredients.length === 0) {
    const firstBaseId = rules.goodBaseCombos[0]?.[0];
    return {
      severity: 'info',
      recommendation: rules.starterHint,
      suggestId: firstBaseId,
    };
  }

  // ─── 4. INFO: complete an unfinished good base combo ───
  for (const combo of rules.goodBaseCombos) {
    const present = combo.filter(has);
    const missing = combo.filter((id) => !has(id));
    if (present.length > 0 && missing.length > 0) {
      const partner = missing[0];
      const partnerName = lookupName(partner);
      const presentName = ingredients.find((i) => i.id === present[0])?.name ?? 'your base';
      return {
        severity: 'info',
        basedOn: presentName,
        recommendation: `add ${partnerName} to complete a balanced ${humanCategory(category)} base.`,
        suggestId: partner,
      };
    }
  }

  // ─── 5. INFO: suggest the top recommended active ───
  const hasAnyActive = ingredients.some((i) => i.type === 'active');
  if (!hasAnyActive && rules.recommendedActives.length > 0) {
    const next = rules.recommendedActives.find((a) => !has(a.id));
    if (next) {
      const lastBase = ingredients.find((i) => i.type === 'base');
      return {
        severity: 'info',
        basedOn: lastBase?.name,
        recommendation: `add ${lookupName(next.id)} for ${next.reason}.`,
        suggestId: next.id,
      };
    }
  }

  // ─── 6. INFO: finish with a scent ───
  const hasScent = ingredients.some((i) => i.type === 'scent');
  if (!hasScent && rules.recommendedScents.length > 0) {
    const scent = rules.recommendedScents.find((s) => !has(s.id));
    if (scent) {
      return {
        severity: 'info',
        basedOn: ingredients[ingredients.length - 1].name,
        recommendation: `finish with ${lookupName(scent.id)} — ${scent.reason}.`,
        suggestId: scent.id,
      };
    }
  }

  // ─── 7. INFO: pair a second active in serums ───
  if (category === 'face-serum' && hasAnyActive) {
    const next = rules.recommendedActives.find(
      (a) => !has(a.id) && a.id !== 'i-retinol',
    );
    if (next && ingredients.filter((i) => i.type === 'active').length < 2) {
      return {
        severity: 'info',
        basedOn: ingredients.find((i) => i.type === 'active')?.name,
        recommendation: `pair with ${lookupName(next.id)} for ${next.reason}.`,
        suggestId: next.id,
      };
    }
  }

  // ─── 8. Done ───
  return {
    severity: 'info',
    basedOn: ingredients[ingredients.length - 1].name,
    recommendation: `your ${humanCategory(category)} is well-balanced. Ready to synthesize.`,
  };
}

function humanCategory(c: ProductCategory): string {
  return c.replace('-', ' ');
}

/**
 * Joins names into a natural English list:
 *   ['A']             → 'A'
 *   ['A', 'B']        → 'A and B'
 *   ['A', 'B', 'C']   → 'A, B, and C'
 */
function humanList(names: string[]): string {
  if (names.length === 0) return '';
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  const head = names.slice(0, -1).join(', ');
  return `${head}, and ${names[names.length - 1]}`;
}

// ─── Ingredient name lookup (avoids importing component data here) ───
import { INGREDIENTS } from '../data/ingredients';

function lookupName(id: string): string {
  return INGREDIENTS.find((i) => i.id === id)?.name ?? 'this ingredient';
}
