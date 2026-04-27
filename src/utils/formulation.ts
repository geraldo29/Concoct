import type { Ingredient, Vessel } from '../types';

/**
 * Estimate CO2 savings vs an industry-standard plastic bottle of equivalent size.
 * Higher ecoScore + more ethical-tagged ingredients = more savings.
 * Returns a NEGATIVE number (e.g. -2.4) representing kg CO2e saved.
 */
export function estimateCo2Impact(
  vessel: Vessel | null,
  ingredients: Ingredient[],
): number {
  if (!vessel) return 0;
  const baselineFootprint = vessel.capacityMl * 0.012; // ~12g CO2e per ml industry standard
  const vesselFactor = (10 - vessel.ecoScore) / 10;
  const ingredientBonus = ingredients.reduce(
    (sum, i) => sum + i.ethicalTags.length * 0.05,
    0,
  );
  const savings = baselineFootprint * (1 - vesselFactor) + ingredientBonus;
  return -Number(savings.toFixed(1));
}

/**
 * Estimate per-ingredient cost based on type. Mock pricing for visual fidelity.
 */
export function estimateIngredientPrice(ing: Ingredient): number {
  const basePrice: Record<typeof ing.type, number> = {
    base: 18,
    active: 24,
    scent: 14,
  };
  const tagDiscount = ing.ethicalTags.includes('locally-sourced') ? -2 : 0;
  return basePrice[ing.type] + tagDiscount;
}

/**
 * Distribute 100% across ingredients with weighting:
 * - Bases get the majority share
 * - Actives are concentrated (lower %)
 * - Scents are minimal
 */
export function calculateComposition(
  ingredients: Ingredient[],
): Array<{ ingredient: Ingredient; percent: number }> {
  if (ingredients.length === 0) return [];

  const weights: Record<typeof ingredients[number]['type'], number> = {
    base: 60,
    active: 8,
    scent: 2,
  };

  const totals = ingredients.map((i) => ({ ingredient: i, weight: weights[i.type] }));
  const sumWeights = totals.reduce((s, t) => s + t.weight, 0);

  return totals.map((t) => ({
    ingredient: t.ingredient,
    percent: Math.round((t.weight / sumWeights) * 100),
  }));
}
