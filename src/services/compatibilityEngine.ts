import type { Vessel, Ingredient } from '../types';

/**
 * Determines whether a vessel is compatible with a given set of ingredients.
 * A vessel is INCOMPATIBLE if:
 *   1. Any ingredient lists the vessel's material as incompatible, OR
 *   2. The vessel lists any ingredient ID in its incompatibleIngredients array.
 */
export function isVesselCompatible(vessel: Vessel, ingredients: Ingredient[]): boolean {
  for (const ingredient of ingredients) {
    if (ingredient.incompatibleVesselMaterials.includes(vessel.material)) {
      return false;
    }
    if (vessel.incompatibleIngredients.includes(ingredient.id)) {
      return false;
    }
  }
  return true;
}

/**
 * Returns a human-readable list of reasons why a vessel is incompatible
 * with the current ingredient mix.
 */
export function getIncompatibilityReasons(
  vessel: Vessel,
  ingredients: Ingredient[],
): string[] {
  const reasons: string[] = [];
  for (const ingredient of ingredients) {
    if (ingredient.incompatibleVesselMaterials.includes(vessel.material)) {
      reasons.push(
        `${ingredient.name} reacts poorly with ${vessel.material} surfaces.`,
      );
    }
    if (vessel.incompatibleIngredients.includes(ingredient.id)) {
      reasons.push(
        `${vessel.name} cannot safely contain ${ingredient.name}.`,
      );
    }
  }
  return reasons;
}

/**
 * Filters a list of vessels to only those compatible with the ingredient mix.
 */
export function filterCompatibleVessels(
  vessels: Vessel[],
  ingredients: Ingredient[],
): Vessel[] {
  return vessels.filter((v) => isVesselCompatible(v, ingredients));
}

/**
 * Calculates the "botanical load" — a metric of how chemically demanding the
 * formulation is. Higher loads mean fewer compatible vessels.
 */
export function calculateBotanicalLoad(ingredients: Ingredient[]): number {
  let load = 0;
  for (const ing of ingredients) {
    load += ing.incompatibleVesselMaterials.length * 1.5;
    if (ing.type === 'active') load += 2;
  }
  return Math.round(load);
}
