import { GoogleGenAI, Type } from '@google/genai';
import type { AIAnalysisResult, Ingredient, ProductCategory, Vessel } from '../types';

// ─── Client Setup ───
// API key is read from environment variables (Vite exposes VITE_-prefixed vars).
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;

const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

// ─── Schema for structured output ───
const analysisSchema = {
  type: Type.OBJECT,
  properties: {
    safetyScore: { type: Type.NUMBER, description: 'Safety score from 0 to 100.' },
    efficacyRating: { type: Type.NUMBER, description: 'Efficacy rating from 0 to 100.' },
    warnings: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Concise safety warnings about the formulation.',
    },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Suggestions for complementary ingredients to add next.',
    },
    poeticDescription: {
      type: Type.STRING,
      description: 'A short, evocative, poetic description (2-3 sentences) of the final concoction.',
    },
  },
  required: ['safetyScore', 'efficacyRating', 'warnings', 'suggestions', 'poeticDescription'],
};

/**
 * Analyzes a formulation using Gemini AI.
 * Falls back to a deterministic mock if no API key is configured.
 */
export async function analyzeFormulation(
  category: ProductCategory,
  vessel: Vessel,
  ingredients: Ingredient[],
): Promise<AIAnalysisResult> {
  if (!ai) {
    return mockAnalysis(category, vessel, ingredients);
  }

  const prompt = buildAnalysisPrompt(category, vessel, ingredients);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
      },
    });

    const text = response.text ?? '';
    const parsed = JSON.parse(text) as AIAnalysisResult;
    return normalizeResult(parsed);
  } catch (err) {
    console.error('Gemini analysis failed, falling back to mock:', err);
    return mockAnalysis(category, vessel, ingredients);
  }
}

// ─── Helpers ───

function buildAnalysisPrompt(
  category: ProductCategory,
  vessel: Vessel,
  ingredients: Ingredient[],
): string {
  const ingredientList = ingredients
    .map((i) => `- ${i.name} (${i.type}): ${i.benefitDescription}`)
    .join('\n');

  return `You are a master botanical formulator and cosmetic chemist evaluating a custom skincare creation.

PRODUCT TYPE: ${category}
VESSEL: ${vessel.name} (${vessel.material}, ${vessel.capacityMl}ml, ecoScore ${vessel.ecoScore}/10)

INGREDIENTS:
${ingredientList}

Analyze this formulation. Provide:
1. A safety score (0-100) considering ingredient interactions and concentrations.
2. An efficacy rating (0-100) for the stated product category.
3. Any warnings about safety, irritation potential, or stability concerns.
4. 1-3 suggestions for complementary ingredients that would enhance the formulation.
5. A poetic, evocative description (2-3 sentences) using sensory and botanical imagery.

Return strictly as JSON matching the provided schema.`;
}

function normalizeResult(r: AIAnalysisResult): AIAnalysisResult {
  return {
    safetyScore: clamp(Math.round(r.safetyScore ?? 0), 0, 100),
    efficacyRating: clamp(Math.round(r.efficacyRating ?? 0), 0, 100),
    warnings: Array.isArray(r.warnings) ? r.warnings : [],
    suggestions: Array.isArray(r.suggestions) ? r.suggestions : [],
    poeticDescription: r.poeticDescription ?? '',
  };
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

// ─── Deterministic mock used when no API key is set ───
function mockAnalysis(
  category: ProductCategory,
  _vessel: Vessel,
  ingredients: Ingredient[],
): AIAnalysisResult {
  const baseScore = 75 + ingredients.length * 3;
  const hasActives = ingredients.some((i) => i.type === 'active');
  const hasScent = ingredients.some((i) => i.type === 'scent');

  const warnings: string[] = [];
  if (ingredients.length === 0) warnings.push('No ingredients selected.');
  if (hasActives && ingredients.filter((i) => i.type === 'active').length > 2) {
    warnings.push('Multiple active ingredients may increase irritation risk — patch test recommended.');
  }

  const suggestions: string[] = [];
  if (!hasScent) suggestions.push('Consider adding Lavender or Rose Otto for an aromatic finish.');
  if (!ingredients.some((i) => i.id === 'i-jojoba-oil')) {
    suggestions.push('Add Jojoba Oil for a stable, skin-mimicking carrier.');
  }

  const ingredientNames = ingredients.map((i) => i.name).join(', ') || 'an empty canvas';

  return {
    safetyScore: clamp(baseScore, 0, 95),
    efficacyRating: clamp(baseScore - 5, 0, 90),
    warnings,
    suggestions,
    poeticDescription: `A ${category.replace('-', ' ')} of quiet intention — ${ingredientNames} woven together like a botanical symphony, each note resolving into the next.`,
  };
}
