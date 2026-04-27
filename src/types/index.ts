// ─── Concoct Type System ───

// === Enums & Unions ===

export type VesselMaterial = 'glass' | 'bamboo' | 'aluminum' | 'ceramic' | 'recycled-plastic';

export type VesselSize = 'small' | 'medium' | 'large';

export type IngredientType = 'base' | 'active' | 'scent';

export type ProductCategory = 'lotion' | 'shampoo' | 'beard-oil' | 'face-serum' | 'body-butter';

export type EthicalTag =
  | 'organic'
  | 'fair-trade'
  | 'vegan'
  | 'cruelty-free'
  | 'sustainably-harvested'
  | 'locally-sourced'
  | 'zero-waste';

// === Core Entities ===

export interface Vessel {
  id: string;
  name: string;
  material: VesselMaterial;
  size: VesselSize;
  capacityMl: number;
  ecoScore: number; // 1–10
  incompatibleIngredients: string[]; // ingredient IDs
  imageUrl: string;
  description: string;
  priceUsd: number;
}

export interface Ingredient {
  id: string;
  name: string;
  type: IngredientType;
  ethicalTags: EthicalTag[];
  incompatibleVesselMaterials: VesselMaterial[];
  benefitDescription: string;
  imageUrl: string;
  color: string; // hex for visual layer representation
}

export interface ProductRecipe {
  id: string;
  name: string;
  category: ProductCategory;
  vessel: Vessel;
  ingredients: Ingredient[];
  aiAnalysis?: AIAnalysisResult;
  createdAt: Date;
  creatorName: string;
  creatorAvatar?: string;
}

export interface AIAnalysisResult {
  safetyScore: number;      // 0–100
  efficacyRating: number;   // 0–100
  warnings: string[];
  suggestions: string[];
  poeticDescription: string;
}

// === Wizard State ===

export interface LabState {
  currentStage: 1 | 2 | 3 | 4;
  category: ProductCategory | null;
  vessel: Vessel | null;
  ingredients: Ingredient[];
  aiResult: AIAnalysisResult | null;
  isAnalyzing: boolean;
}

// === Category Metadata ===

export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  suggestedVesselMaterials: VesselMaterial[];
}

// === Collective / Social ===

export interface CollectivePost {
  recipe: ProductRecipe;
  likes: number;
  testimonial?: string;
  featured: boolean;
}
