# Concoct — Architecture & File Reference

> A complete map of what's in the repo, what each file does, and how the pieces fit together.

**Stack at a glance:** React 19 + Vite + TypeScript + Tailwind v4 → AWS (Cognito + DynamoDB + Lambda + API Gateway) provisioned with CDK → hosted on AWS Amplify.

---

## Table of contents

1. [System architecture](#system-architecture)
2. [Repository layout](#repository-layout)
3. [Frontend (React app)](#frontend-react-app)
4. [Backend infrastructure (CDK)](#backend-infrastructure-cdk)
5. [Configuration & environment](#configuration--environment)
6. [Data flow examples](#data-flow-examples)
7. [Glossary](#glossary)

---

## System architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                        BROWSER (React app)                        │
│                                                                    │
│   Lab → CreationLab → 3-column workbench                          │
│         ├─ left:   Category, Vessel selector, Ethical Pledge      │
│         ├─ center: Ingredient list, Warnings, Review button       │
│         └─ right:  Live VesselPreview, Composition, AI suggestion │
│                                                                    │
│   Auth: useAuth (Amplify SDK) ◄────► Cognito User Pool            │
│   Data: recipesService → apiClient (JWT) ──► API Gateway          │
└──────────────────────────────────────────────────────────────────┘
                                │
                                │ JWT (id-token in Authorization header)
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                       AWS BACKEND (CDK-deployed)                  │
│                                                                    │
│   Cognito User Pool ──► validates JWTs                            │
│         │                                                          │
│   API Gateway HTTP API ──► routes to Lambda                       │
│         │                                                          │
│   Lambda (Node 20) ──► reads/writes DynamoDB                      │
│         │                                                          │
│   DynamoDB single table  PK=USER#<sub>  SK=RECIPE#<ts>#<id>       │
└──────────────────────────────────────────────────────────────────┘
                                │
                                │ Optional: AI analysis
                                ▼
                  Google Gemini API (browser-direct)
```

---

## Repository layout

```
Concoct/
├── PLAN.md                       ← Original tech spec
├── DEPLOY.md                     ← Step-by-step deploy guide (AWS)
├── ARCHITECTURE.md               ← (this file)
├── README.md
├── amplify.yml                   ← Amplify Hosting build spec
├── package.json                  ← Frontend deps
├── vite.config.ts                ← Vite + Tailwind v4 plugin
├── tsconfig*.json                ← TypeScript configs
├── .env.example                  ← Template for env vars
├── .env.local                    ← Local secrets (gitignored)
├── .nvmrc                        ← Node 22
│
├── public/                       ← Static assets (favicon, etc.)
├── src/                          ← React app source
│   ├── App.tsx                   ← Top-level shell with view switching
│   ├── main.tsx                  ← React entry point + AuthProvider
│   ├── index.css                 ← Tailwind directives + design tokens
│   ├── types/index.ts            ← All TypeScript interfaces
│   ├── data/                     ← Static seed data
│   ├── services/                 ← External integrations
│   ├── hooks/                    ← React state hooks
│   ├── utils/                    ← Pure helpers
│   └── components/               ← UI components by domain
│
└── infra/                        ← AWS CDK app (separate npm project)
    ├── package.json
    ├── tsconfig.json
    ├── cdk.json
    ├── bin/concoct.ts            ← CDK app entry
    ├── lib/concoct-stack.ts      ← All AWS resources
    └── lambda/recipes/index.ts   ← API handler source
```

---

## Frontend (React app)

### Entry & shell

| File | Purpose |
|---|---|
| [src/main.tsx](src/main.tsx) | React entry. Wraps `<App />` in `<AuthProvider>`. |
| [src/App.tsx](src/App.tsx) | Top-level layout. Manages the active **View** (`lab`, `collective`, `archive`, `impact`) and the sign-in modal state. Wires Header → CreationLab/Collective/Archive. |
| [src/index.css](src/index.css) | Imports Tailwind. Defines the design-token palette (`--color-bone`, `--color-sage`, `--color-amber`, etc.) under `@theme`. |

### Type system

| File | Purpose |
|---|---|
| [src/types/index.ts](src/types/index.ts) | All shared TypeScript types: `Vessel`, `Ingredient`, `ProductCategory`, `AIAnalysisResult`, `LabState`, `CategoryInfo`, `CollectivePost`. **One source of truth.** |

### Static data (mock catalog)

| File | Purpose |
|---|---|
| [src/data/categories.ts](src/data/categories.ts) | 5 product categories (Lotion, Shampoo, Beard Oil, Face Serum, Body Butter) with icons and suggested vessel materials. |
| [src/data/vessels.ts](src/data/vessels.ts) | 13 vessel SKUs across Glass, Bamboo, Aluminum, Ceramic, and Recycled Plastic — with eco scores, capacities, prices, and incompatibility lists. |
| [src/data/ingredients.ts](src/data/ingredients.ts) | 19 ingredients across **Bases** (Shea, Jojoba, Argan…), **Actives** (Vitamin C, Retinol, HA, Niacinamide…), and **Scents** (Lavender, Tea Tree, Rose…). Each has ethical tags, vessel-material incompatibilities, and a hex color for the layered preview. |
| [src/data/collective.ts](src/data/collective.ts) | Sample community posts shown on the Collective page and in the testimonial strip. |

### Services (external integrations)

| File | Purpose |
|---|---|
| [src/services/awsConfig.ts](src/services/awsConfig.ts) | Reads `VITE_AWS_*` env vars and lazily configures Amplify. Exports `isAwsConfigured()` so UI can degrade gracefully when not set up. |
| [src/services/apiClient.ts](src/services/apiClient.ts) | Authenticated `fetch` wrapper. Pulls the Cognito **id-token** from `fetchAuthSession()` and sends it as `Authorization: Bearer <token>`. Used by all API calls. |
| [src/services/recipesService.ts](src/services/recipesService.ts) | High-level recipe CRUD (`loadUserRecipes`, `saveRecipe`, `deleteRecipe`) — calls the API Gateway routes through `apiClient`. |
| [src/services/geminiService.ts](src/services/geminiService.ts) | Calls Google Gemini for AI analysis of formulations. Has a deterministic mock fallback when no API key is set. |
| [src/services/compatibilityEngine.ts](src/services/compatibilityEngine.ts) | Pure functions: `isVesselCompatible()`, `getIncompatibilityReasons()`, `filterCompatibleVessels()`, `calculateBotanicalLoad()`. Used by both the vessel selector and the ingredient row to dim incompatible options. |

### Hooks

| File | Purpose |
|---|---|
| [src/hooks/useAuth.tsx](src/hooks/useAuth.tsx) | React **AuthContext** backed by Amplify v6. Exposes `user`, `signIn`, `signUp`, `confirmSignUp`, `resendCode`, `signOutUser`, `error`, `loading`, `configured`. Hooks into Amplify's `Hub` so the UI updates on token refresh. |
| [src/hooks/useRecipe.ts](src/hooks/useRecipe.ts) | Local state for the Lab wizard: category, vessel, ingredient list, AI result. Includes the **fail-safe** that auto-clears the vessel when the ingredient mix becomes incompatible. |

### Utilities

| File | Purpose |
|---|---|
| [src/utils/helpers.ts](src/utils/helpers.ts) | `cn()` (className join), `humanize()` (slug → Title Case), `formatEcoScore()`, `placeholderImage()`. |
| [src/utils/formulation.ts](src/utils/formulation.ts) | Pure calculators: `estimateCo2Impact()`, `estimateIngredientPrice()`, `calculateComposition()`. |

### Components — Layout

| File | Purpose |
|---|---|
| [src/components/layout/Header.tsx](src/components/layout/Header.tsx) | Sticky top bar with brand, multi-section nav (Lab View / Collective / My Formulas / Impact Report), cart count, and either a **Sign In** button or the `<UserMenu />` if signed in. |
| [src/components/layout/Footer.tsx](src/components/layout/Footer.tsx) | Minimal site footer. |

### Components — Auth

| File | Purpose |
|---|---|
| [src/components/auth/SignInModal.tsx](src/components/auth/SignInModal.tsx) | Animated modal with three modes: **sign-in**, **sign-up**, and **email-verify** (handles the Cognito 6-digit code flow). |
| [src/components/auth/UserMenu.tsx](src/components/auth/UserMenu.tsx) | Avatar + dropdown shown when signed in. Provides sign-out. |

### Components — Lab (the workbench)

| File | Purpose |
|---|---|
| [src/components/lab/CreationLab.tsx](src/components/lab/CreationLab.tsx) | The **3-column workbench** (inspired by AURA references). Hosts category list, vessel selector, ingredient rows, warnings, the live `<VesselPreview />`, composition panel, AI suggestions, and the "Review Formulation" CTA that hands off to the synthesis screen. |
| [src/components/lab/StageBase.tsx](src/components/lab/StageBase.tsx) | (Legacy stage component, retained for the older wizard mode.) |
| [src/components/lab/StageSoul.tsx](src/components/lab/StageSoul.tsx) | (Legacy.) |
| [src/components/lab/StageElements.tsx](src/components/lab/StageElements.tsx) | (Legacy.) |
| [src/components/lab/StageSynthesis.tsx](src/components/lab/StageSynthesis.tsx) | The "review your formulation" screen. Auto-triggers Gemini analysis on mount. Includes the **Save to Archive** card that calls `recipesService.saveRecipe()`. |
| [src/components/lab/EthicalPledge.tsx](src/components/lab/EthicalPledge.tsx) | Sidebar card displaying the Concoct sustainability pledge. |
| [src/components/lab/CompositionPanel.tsx](src/components/lab/CompositionPanel.tsx) | Right-sidebar panel showing the percentage breakdown of selected ingredients. |
| [src/components/lab/AISuggestionCard.tsx](src/components/lab/AISuggestionCard.tsx) | Right-sidebar card showing context-aware ingredient recommendations. |

### Components — Archive

| File | Purpose |
|---|---|
| [src/components/archive/Archive.tsx](src/components/archive/Archive.tsx) | The **My Formulas** view. Loads the signed-in user's saved recipes from DynamoDB via `loadUserRecipes()`. Handles empty/loading/error/sign-in-required states and supports deletion. |

### Components — Collective

| File | Purpose |
|---|---|
| [src/components/collective/ConcoctCollective.tsx](src/components/collective/ConcoctCollective.tsx) | Featured masterworks + community grid (currently from mock data). |
| [src/components/collective/TestimonialsStrip.tsx](src/components/collective/TestimonialsStrip.tsx) | 3-up testimonial bar shown below the Lab view. |

### Components — Reusable UI primitives

| File | Purpose |
|---|---|
| [src/components/ui/Button.tsx](src/components/ui/Button.tsx) | 4 variants (primary/secondary/ghost/danger), 3 sizes. 44px min-height for touch targets. |
| [src/components/ui/Card.tsx](src/components/ui/Card.tsx) | Shared card chrome with selected/disabled/interactive states. |
| [src/components/ui/Badge.tsx](src/components/ui/Badge.tsx) | Pill labels (sage/stone/amber/danger). |
| [src/components/ui/StepIndicator.tsx](src/components/ui/StepIndicator.tsx) | (Legacy from the wizard mode.) |
| [src/components/ui/IngredientRow.tsx](src/components/ui/IngredientRow.tsx) | Numbered, selectable ingredient row with price + add/remove action. |
| [src/components/ui/WarningCallout.tsx](src/components/ui/WarningCallout.tsx) | Color-coded inline alerts for ingredient interactions and vessel issues. |
| [src/components/ui/VesselIcon.tsx](src/components/ui/VesselIcon.tsx) | Small SVG glyph for the vessel-selector cards. Geometry varies by **size**, treatment by **material**. |
| [src/components/ui/VesselPreview.tsx](src/components/ui/VesselPreview.tsx) | Hero SVG bottle illustration. **Shape morphs by vessel size**, **surface treatment by material** (glass highlight, bamboo rings, brushed aluminum, ceramic speckle, recycled-plastic squeeze). Animates ingredient liquid layers. |

---

## Backend infrastructure (CDK)

The `infra/` folder is a **separate npm project** with its own dependencies. Deploys via `cd infra && npm run deploy`.

### CDK app

| File | Purpose |
|---|---|
| [infra/package.json](infra/package.json) | CDK + Lambda type deps. |
| [infra/tsconfig.json](infra/tsconfig.json) | TypeScript config for CDK code. |
| [infra/cdk.json](infra/cdk.json) | Tells the CDK CLI to run `bin/concoct.ts` via ts-node. |
| [infra/bin/concoct.ts](infra/bin/concoct.ts) | CDK app entry. Instantiates `ConcoctStack` in your default AWS account/region. |

### The stack

| File | Purpose |
|---|---|
| [infra/lib/concoct-stack.ts](infra/lib/concoct-stack.ts) | **The whole backend.** Provisions: Cognito User Pool + Web Client, DynamoDB single table, Node 20 Lambda (TypeScript bundled with esbuild), HTTP API Gateway with Cognito JWT authorizer + permissive CORS, all wired together. Outputs the IDs/URLs you need for the frontend. |

### What that one file creates in AWS

| AWS Resource | Logical name | Purpose |
|---|---|---|
| `AWS::Cognito::UserPool` | `ConcoctUserPool` | Stores users; manages email verification and password policies. |
| `AWS::Cognito::UserPoolClient` | `ConcoctWebClient` | The "app client" the React frontend uses to authenticate. |
| `AWS::DynamoDB::Table` | `ConcoctTable` (`concoct-data`) | Single-table data store. PK = `USER#<sub>`, SK = `RECIPE#<iso>#<id>`. PAY_PER_REQUEST. Point-in-time recovery enabled. |
| `AWS::Lambda::Function` | `RecipesFn` (`concoct-recipes`) | Node 20 TypeScript handler bundled with esbuild. Reads/writes DynamoDB. |
| `AWS::ApiGatewayV2::Api` | `ConcoctApi` | HTTP API with permissive CORS (lets browsers call from any origin). |
| `AWS::ApiGatewayV2::Authorizer` | `CognitoAuthorizer` | Validates Cognito JWT id-tokens on every request. |
| `AWS::ApiGatewayV2::Route` × 3 | `GET /recipes`, `POST /recipes`, `DELETE /recipes/{recipeId}` | Routes that all dispatch to the Lambda. |

**CloudFormation outputs** (printed after `cdk deploy`):
- `UserPoolId`        → `VITE_AWS_USER_POOL_ID`
- `UserPoolClientId`  → `VITE_AWS_USER_POOL_CLIENT_ID`
- `ApiUrl`            → `VITE_AWS_API_URL`
- `Region`            → `VITE_AWS_REGION`
- `TableName`         → (informational — useful for AWS Console queries)

### Lambda handler

| File | Purpose |
|---|---|
| [infra/lambda/recipes/index.ts](infra/lambda/recipes/index.ts) | The recipe CRUD logic. Reads the authenticated user's `sub` (Cognito user ID) from the API Gateway JWT claims and uses it as the partition key. Operations: list, create, delete. Strips internal `PK`/`SK` from responses. |

---

## Configuration & environment

### Frontend env vars (`.env.local`)

| Variable | What it is | Where it comes from |
|---|---|---|
| `VITE_AWS_REGION` | AWS region of your stack | CDK output: `Region` |
| `VITE_AWS_USER_POOL_ID` | Cognito user pool | CDK output: `UserPoolId` |
| `VITE_AWS_USER_POOL_CLIENT_ID` | Cognito app client | CDK output: `UserPoolClientId` |
| `VITE_AWS_API_URL` | HTTP API endpoint | CDK output: `ApiUrl` |
| `VITE_GEMINI_API_KEY` | (Optional) Google Gemini key | [Google AI Studio](https://aistudio.google.com/apikey). Without it, AI analysis falls back to a deterministic mock. |

For production (AWS Amplify Hosting), set the same vars under **Hosting → Environment variables**.

### Build pipeline (Amplify Hosting)

| File | Purpose |
|---|---|
| [amplify.yml](amplify.yml) | Tells Amplify how to build: `nvm use 22`, `npm ci --include=optional`, `npm run build`, publish `dist/`. |
| [.nvmrc](.nvmrc) | Pins Node 22 so local + CI match. |

---

## Data flow examples

### Sign-up → save a recipe → see it in the archive

```
User clicks "Sign up" in modal
   │
   ▼
SignInModal.handleSubmit()
   └─► useAuth.signUp(email, password, name)
         └─► amplifySignUp() → Cognito CreateUser
               └─► Cognito sends 6-digit code email
   │
   ▼
User enters code
   └─► useAuth.confirmSignUp() → amplifyConfirmSignUp()
         └─► Cognito marks user verified
   └─► useAuth.signIn() → returns JWT id-token (cached by Amplify)

User builds a formulation in the Lab → clicks "Review Formulation"
   ├─► CreationLab calls geminiService.analyzeFormulation() (browser → Gemini)
   └─► Renders StageSynthesis with the result

User names the recipe → clicks "Save"
   └─► recipesService.saveRecipe(uid, data)
         └─► apiClient.apiFetch('/recipes', POST)
               └─► Pulls JWT from Amplify session
               └─► fetch(API_URL + '/recipes', { Authorization: 'Bearer …' })
                     │
                     ▼
                 API Gateway → Cognito authorizer validates JWT
                     │
                     ▼
                 Lambda handler reads sub from event.requestContext.authorizer.jwt.claims
                     │
                     ▼
                 PutCommand → DynamoDB
                     PK=USER#<sub>  SK=RECIPE#<iso>#<id>

User clicks "My Formulas"
   └─► Archive.refresh() → recipesService.loadUserRecipes()
         └─► apiClient.apiFetch('/recipes', GET)
               └─► Lambda runs Query (PK=USER#<sub>) → returns array
                     │
                     ▼
                 React renders the recipe cards
```

### Compatibility check (purely client-side)

```
User picks Bamboo Forest Pot, then tries to add Vitamin C
   └─► IngredientRow's "wouldBreak" check
         └─► isVesselCompatible(vessel, [...selected, vitaminC])
               └─► returns false because vitamin-c.incompatibleVesselMaterials
                   includes 'aluminum' (different example, same logic)
   └─► Row disabled with "Incompatible with bamboo vessel" warning
```

---

## Glossary

| Term | Meaning |
|---|---|
| **Concocter** | Brand term for an end user of Concoct. |
| **Vessel** | The physical container — varies by material, size, eco score, and incompatibility list. |
| **Ingredient** | A base, active, or scent — has ethical tags and vessel-material incompatibilities. |
| **Botanical load** | A heuristic for how chemically demanding a formulation is. Higher load = fewer compatible vessels. |
| **Synthesis** | The Gemini-powered analysis stage that scores safety/efficacy and writes a poetic description. |
| **Eco score** | 1–10 sustainability rating per vessel (10 = bamboo, 6 = recycled plastic). |
| **JWT** | JSON Web Token. Cognito issues an id-token on sign-in; the React app sends it on every API request. |
| **Sub** | The unique `subject` claim in a Cognito JWT — used as the user's stable ID. Becomes the DynamoDB partition key. |
| **Single-table design** | DynamoDB pattern of putting many entity types in one table, distinguished by PK/SK prefix conventions. |
| **CDK** | AWS Cloud Development Kit — write infrastructure as TypeScript, synthesize to CloudFormation. |
| **Bootstrap** | One-time CDK setup per AWS account+region (creates a staging S3 bucket + IAM roles). |

---

## Quick links

- [DEPLOY.md](DEPLOY.md) — How to deploy from scratch
- [PLAN.md](PLAN.md) — The original technical specification
- [README.md](README.md) — Vite default landing page (TODO: replace)
