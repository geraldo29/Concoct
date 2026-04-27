import type { CategoryInfo } from '../types';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'lotion',
    name: 'Lotion',
    description: 'Silky, hydrating body and hand lotions crafted from botanical emollients.',
    icon: 'Droplets',
    suggestedVesselMaterials: ['glass', 'ceramic', 'recycled-plastic'],
  },
  {
    id: 'shampoo',
    name: 'Shampoo',
    description: 'Gentle, sulfate-free hair cleansers enriched with plant extracts.',
    icon: 'Waves',
    suggestedVesselMaterials: ['recycled-plastic', 'aluminum'],
  },
  {
    id: 'beard-oil',
    name: 'Beard Oil',
    description: 'Nourishing blends of carrier and essential oils for facial hair.',
    icon: 'Scissors',
    suggestedVesselMaterials: ['glass', 'aluminum'],
  },
  {
    id: 'face-serum',
    name: 'Face Serum',
    description: 'Concentrated active formulas for targeted skincare concerns.',
    icon: 'Sparkles',
    suggestedVesselMaterials: ['glass', 'ceramic'],
  },
  {
    id: 'body-butter',
    name: 'Body Butter',
    description: 'Rich, dense moisturizers with shea and cocoa butter bases.',
    icon: 'Sun',
    suggestedVesselMaterials: ['glass', 'bamboo', 'ceramic'],
  },
];
