import type {
  AIAnalysisResult,
  Ingredient,
  ProductCategory,
  Vessel,
} from '../types';
import { apiFetch } from './apiClient';

export interface SavedRecipe {
  id: string;
  name: string;
  category: ProductCategory;
  vessel: Vessel;
  ingredients: Ingredient[];
  aiAnalysis?: AIAnalysisResult;
  createdAt: Date;
}

interface SaveInput {
  name: string;
  category: ProductCategory;
  vessel: Vessel;
  ingredients: Ingredient[];
  aiAnalysis?: AIAnalysisResult;
}

interface ApiRecipe extends Omit<SavedRecipe, 'createdAt'> {
  createdAt: string;
}

function hydrate(r: ApiRecipe): SavedRecipe {
  return { ...r, createdAt: new Date(r.createdAt) };
}

export async function loadUserRecipes(_uid: string): Promise<SavedRecipe[]> {
  const { recipes } = await apiFetch<{ recipes: ApiRecipe[] }>('/recipes');
  return recipes.map(hydrate);
}

export async function saveRecipe(_uid: string, input: SaveInput): Promise<string> {
  const created = await apiFetch<ApiRecipe>('/recipes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return created.id;
}

export async function deleteRecipe(_uid: string, recipeId: string): Promise<void> {
  await apiFetch<void>(`/recipes/${encodeURIComponent(recipeId)}`, {
    method: 'DELETE',
  });
}
