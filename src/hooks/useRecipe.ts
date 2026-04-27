import { useCallback, useMemo, useState } from 'react';
import type {
  AIAnalysisResult,
  Ingredient,
  LabState,
  ProductCategory,
  Vessel,
} from '../types';
import { isVesselCompatible } from '../services/compatibilityEngine';

const initialState: LabState = {
  currentStage: 1,
  category: null,
  vessel: null,
  ingredients: [],
  aiResult: null,
  isAnalyzing: false,
};

export function useRecipe() {
  const [state, setState] = useState<LabState>(initialState);

  const setCategory = useCallback((category: ProductCategory) => {
    setState((s) => ({ ...s, category }));
  }, []);

  const setVessel = useCallback((vessel: Vessel | null) => {
    setState((s) => ({ ...s, vessel }));
  }, []);

  const addIngredient = useCallback((ingredient: Ingredient) => {
    setState((s) => {
      if (s.ingredients.some((i) => i.id === ingredient.id)) return s;

      const nextIngredients = [...s.ingredients, ingredient];
      // Fail-safe: clear vessel if it becomes incompatible
      const nextVessel =
        s.vessel && !isVesselCompatible(s.vessel, nextIngredients) ? null : s.vessel;

      return { ...s, ingredients: nextIngredients, vessel: nextVessel };
    });
  }, []);

  const removeIngredient = useCallback((ingredientId: string) => {
    setState((s) => ({
      ...s,
      ingredients: s.ingredients.filter((i) => i.id !== ingredientId),
    }));
  }, []);

  const setAiResult = useCallback((aiResult: AIAnalysisResult | null) => {
    setState((s) => ({ ...s, aiResult }));
  }, []);

  const setAnalyzing = useCallback((isAnalyzing: boolean) => {
    setState((s) => ({ ...s, isAnalyzing }));
  }, []);

  const goToStage = useCallback((stage: 1 | 2 | 3 | 4) => {
    setState((s) => ({ ...s, currentStage: stage }));
  }, []);

  const nextStage = useCallback(() => {
    setState((s) => ({
      ...s,
      currentStage: Math.min(4, s.currentStage + 1) as 1 | 2 | 3 | 4,
    }));
  }, []);

  const prevStage = useCallback(() => {
    setState((s) => ({
      ...s,
      currentStage: Math.max(1, s.currentStage - 1) as 1 | 2 | 3 | 4,
    }));
  }, []);

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  const canAdvance = useMemo(() => {
    switch (state.currentStage) {
      case 1:
        return state.category !== null;
      case 2:
        return state.vessel !== null;
      case 3:
        return state.ingredients.length > 0;
      case 4:
        return false;
      default:
        return false;
    }
  }, [state]);

  return {
    state,
    setCategory,
    setVessel,
    addIngredient,
    removeIngredient,
    setAiResult,
    setAnalyzing,
    goToStage,
    nextStage,
    prevStage,
    reset,
    canAdvance,
  };
}

export type RecipeController = ReturnType<typeof useRecipe>;
