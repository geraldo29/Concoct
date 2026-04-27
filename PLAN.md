# Concoct: Technical Specification & Implementation Plan

**Version:** 1.0.0
**Status:** Active Development
**Theme:** Botanical Precision & Ethical Integrity

---

## 1. Project Overview

**Concoct** is a premium, visual-first web application designed for the creation of artisanal beauty and skincare products. It bridges the gap between traditional botanical knowledge and modern formulation science through an interactive "Lab" experience.

### 1.1 Core Mission
- **Artisanal Empowerment:** Allow users to formulate custom lotions, shampoos, and oils.
- **Ethical Integrity:** Prioritize sustainable materials (glass, bamboo, aluminum) and ethically sourced ingredients.
- **Scientific Safety:** Use AI to validate botanical interactions and vessel compatibility.

---

## 2. Core Features

### 2.1 The Creation Lab (Multi-Step Wizard)
The central feature of the app, guiding users through a 4-step formulation process:

| Stage | Name            | Description                                                                 |
|-------|-----------------|-----------------------------------------------------------------------------|
| 1     | The Base        | Selection of the product type (e.g., Lotion, Shampoo, Beard Oil)           |
| 2     | The Soul        | Selection of sustainable packaging with filters for material and size       |
| 3     | The Elements    | Layering ingredients categorized into Bases, Actives, and Scents           |
| 4     | The Synthesis   | Final AI-driven analysis and recipe generation                             |

### 2.2 Dynamic Compatibility Engine
- **Incompatibility Logic:** Prevents the selection of vessels that react poorly with specific ingredients (e.g., high-acid actives in untreated bamboo).
- **Live Filtering:** The vessel library dynamically shrinks or expands based on the "botanical load" of the ingredients currently in the mix.

### 2.3 AI Integration (powered by Gemini)
- **Formulation Analysis:** Analyzes the combination of ingredients to provide safety warnings and efficacy ratings.
- **Next Evolution Suggestions:** Recommends complementary ingredients based on the user's current goal.
- **Visual Description:** Generates poetic, evocative descriptions for the final concoction.

### 2.4 Concoct Collective (Social Feed)
- A community-driven gallery of shared formulations.
- Allows users to explore "masterworks," view testimonials, and learn from other "Concocters."

---

## 3. Technical Architecture

### 3.1 Frontend Stack
| Technology       | Purpose                                          |
|------------------|--------------------------------------------------|
| React 18+        | UI Framework                                     |
| Vite             | Build tool & dev server                          |
| TypeScript       | Type-safe development                            |
| Tailwind CSS     | Utility-first styling                            |
| Framer Motion    | Animations & page transitions                    |
| Lucide React     | Icon library                                     |
| React Hooks      | State management (useState, useMemo, useEffect)  |

### 3.2 Data Schema (TypeScript)

```typescript
// Core types
type VesselMaterial = 'glass' | 'bamboo' | 'aluminum' | 'ceramic' | 'recycled-plastic';
type VesselSize = 'small' | 'medium' | 'large';
type IngredientType = 'base' | 'active' | 'scent';
type ProductCategory = 'lotion' | 'shampoo' | 'beard-oil' | 'face-serum' | 'body-butter';

interface Vessel {
  id: string;
  name: string;
  material: VesselMaterial;
  size: VesselSize;
  capacityMl: number;
  ecoScore: number;               // 1-10
  incompatibleIngredients: string[]; // ingredient IDs
  imageUrl: string;
  description: string;
}

interface Ingredient {
  id: string;
  name: string;
  type: IngredientType;
  ethicalTags: string[];
  incompatibleVesselMaterials: VesselMaterial[];
  benefitDescription: string;
  imageUrl: string;
}

interface ProductRecipe {
  id: string;
  name: string;
  category: ProductCategory;
  vessel: Vessel;
  ingredients: Ingredient[];
  aiAnalysis?: AIAnalysisResult;
  createdAt: Date;
}

interface AIAnalysisResult {
  safetyScore: number;
  efficacyRating: number;
  warnings: string[];
  suggestions: string[];
  poeticDescription: string;
}
```

### 3.3 AI Service
- **Provider:** Google Gemini API
- **SDK:** `@google/genai`
- **Location:** `src/services/geminiService.ts`

---

## 4. Design Philosophy

### 4.1 Visual Direction: "Botanical Tech"
- **Typography:** Serif headings (`Cormorant Garamond`) + Sans-serif body (`Inter`)
- **Palette:**
  - Stone: `#78716c`
  - Bone: `#f5f0eb`
  - Charcoal: `#1c1917`
  - Sage: `#6b7c5e`
  - Accent Amber: `#b45309`
- **Interaction:** Micro-animations for "filling" vessels and "stacking" ingredient layers.

### 4.2 Accessibility & Responsivity
- **Mobile First:** Min 44px touch targets, simplified vertical flow.
- **Desktop Precision:** Enhanced sidebar previews, multi-column "Lab" layouts.

---

## 5. Project Structure

```
src/
├── components/
│   ├── ui/              # Shared UI primitives (Button, Card, Badge, etc.)
│   ├── lab/             # Creation Lab wizard stages
│   │   ├── StageBase.tsx
│   │   ├── StageSoul.tsx
│   │   ├── StageElements.tsx
│   │   └── StageSynthesis.tsx
│   ├── collective/      # Social feed components
│   └── layout/          # Header, Footer, Navigation
├── data/
│   ├── vessels.ts       # Vessel mock data
│   ├── ingredients.ts   # Ingredient mock data
│   └── categories.ts    # Product category definitions
├── hooks/
│   └── useRecipe.ts     # Recipe state management hook
├── services/
│   ├── geminiService.ts # AI integration
│   └── compatibilityEngine.ts  # Vessel/ingredient compatibility logic
├── types/
│   └── index.ts         # All TypeScript interfaces & types
├── utils/
│   └── helpers.ts       # Utility functions
├── App.tsx
├── main.tsx
└── index.css
```

---

## 6. Implementation Phases

### Phase 1: Foundation ✅
- [x] Project scaffolding (Vite + React + TypeScript)
- [ ] Tailwind CSS setup with design tokens
- [ ] TypeScript data schema
- [ ] Mock data for vessels & ingredients

### Phase 2: Core UI
- [ ] Shared UI components (Button, Card, Badge, StepIndicator)
- [ ] App shell with Header/Footer
- [ ] Creation Lab wizard framework

### Phase 3: Lab Stages
- [ ] Stage 1 – Category selection
- [ ] Stage 2 – Vessel selection with filters
- [ ] Stage 3 – Ingredient layering
- [ ] Stage 4 – Synthesis & AI analysis

### Phase 4: Intelligence
- [ ] Compatibility engine
- [ ] Gemini AI service integration
- [ ] Safety & efficacy analysis UI

### Phase 5: Community
- [ ] Concoct Collective feed
- [ ] Recipe sharing cards
- [ ] Testimonials

### Phase 6: Polish
- [ ] Framer Motion animations (page transitions, vessel fill, ingredient stack)
- [ ] Responsive refinements
- [ ] Final build verification

---

## 7. Security & Stability
- **Environment Variables:** All API keys (Gemini) managed via `process.env` / `import.meta.env`.
- **Input Validation:** Strict type checking and ID poisoning guards.
- **Fail-safe Logic:** Incompatible vessel selection cleared automatically with user notification.
