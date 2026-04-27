# Concoct — Future Improvements & Roadmap

> A living document of features, infrastructure, and refinements deliberately left out of the MVP. Pick from this when you're ready to invest a sprint.

**Status legend:** 🟢 Quick win (≤ 1 day) · 🟡 Medium (2–5 days) · 🔴 Large (> 1 week) · 💰 Has measurable infra cost · 🔐 Touches auth/security

---

## Table of contents

1. [Top-priority enhancements](#top-priority-enhancements)
2. [Admin panel](#-admin-panel)
3. [S3 bucket integration](#-s3-bucket-for-user-uploads)
4. [Backend & data](#backend--data)
5. [Frontend & UX](#frontend--ux)
6. [Auth & community](#auth--community)
7. [DevOps & observability](#devops--observability)
8. [AI & intelligence](#ai--intelligence)
9. [Commerce](#commerce)
10. [Sustainability & impact](#sustainability--impact)

---

## Top-priority enhancements

The 3 things that would deliver the most user-visible value next:

| # | Improvement | Effort | Why |
|---|---|---|---|
| 1 | **Admin panel for catalog management** | 🟡 | Stop redeploying the app every time you add an ingredient. |
| 2 | **S3 bucket + photo uploads** for finished concoctions | 🟡 💰 | Lets users share *real* photos in the Collective. Massive engagement boost. |
| 3 | **Server-side AI proxy via Lambda** | 🟡 🔐 | Hide the Gemini key from the client bundle. Add per-user rate limiting. |

---

## 🛠 Admin panel

### What it is
A separate `/admin` route inside the same React app, gated by Cognito group membership, that lets you (the operator) manage the catalog and users without code deploys.

### What it would do

| Feature | Description |
|---|---|
| **Ingredient CRUD** | Add/edit/delete ingredients in the browser. Set name, type, ethical tags, vessel-material incompatibilities, and color. |
| **Vessel CRUD** | Same for vessels — material, size, capacity, eco score, price, incompatible-ingredient list. |
| **Category CRUD** | Create new product categories (e.g., "Perfume", "Bath Salts") without touching code. |
| **User list** | Browse Cognito users, search by email, see sign-up date, manually disable an account. |
| **Promote to admin** | Add/remove users from the `admins` Cognito group. |
| **Recipe moderation** | Browse all user recipes, hide ones that violate guidelines. |
| **Feature a recipe** | Mark a community recipe as "Featured Masterwork" so it appears at the top of the Collective view. |
| **Activity dashboard** | Counts: total users this week, total recipes saved, most-used ingredient, most-loved vessel. |

### What it requires

| Layer | Change |
|---|---|
| **Cognito** | Create a user group called `admins`. CDK: `userPool.addGroup(...)` |
| **API Gateway** | Add a second authorizer or check the `cognito:groups` claim in Lambda. Add admin-only routes: `/admin/ingredients`, `/admin/vessels`, `/admin/users`, `/admin/recipes/{id}/feature`. |
| **DynamoDB** | Move catalog from hardcoded `src/data/*.ts` into the same single table. New SK prefixes: `INGREDIENT#<id>`, `VESSEL#<id>`, `CATEGORY#<id>`. Use a GSI to query "all ingredients" without a scan. |
| **Frontend** | New `src/components/admin/` folder. Add `<RequireAdmin>` HOC. Tables with editable rows. Form modals. Re-fetch on save. |
| **Migration** | One-time script that reads the current TS data files and writes them into DynamoDB. After that, the TS files become an empty stub or are deleted. |

### Estimated effort: 🟡 4–6 days

### Risks / decisions needed

- Do you want to **keep the hardcoded catalog as a fallback** (in case DynamoDB is down)? Adds a few hours.
- Should ingredients have **versioning** (so you can change an ingredient and not corrupt old saved recipes)? Adds 1–2 days.
- Do you need **audit logs** ("Geraldo edited Vitamin C at 3:42pm")? Adds a day.

---

## 🪣 S3 bucket (for user uploads)

### What it is
An Amazon S3 bucket where users can upload photos of their finished products, and Concoct can also store any other large files (PDF exports, recipe-card image cards for sharing, etc.).

### What it would unlock

| Use case | Description |
|---|---|
| **Concoction photos** | After saving a recipe, let users upload an actual photo of their bottle/jar. Shows up in their Archive and (optionally) the Collective. |
| **Recipe card downloads** | Generate a printable PDF "label" for each recipe so users can stick it on the bottle. Render server-side, store in S3, present a download link. |
| **Open Graph preview images** | Auto-generate beautiful share-card images per recipe so links posted to social media look great. |
| **Vessel/ingredient catalog images** | If you ever want real photos instead of inline SVGs, S3 is where they'd live (served via CloudFront). |
| **CSV recipe import/export** | Power users could export their archive as CSV or import a collection. |

### What it requires

| Layer | Change |
|---|---|
| **CDK** | Add an `s3.Bucket` to the stack. Configure CORS to allow uploads from your Amplify domain. Enable versioning + lifecycle (delete old versions after 90d). |
| **API Gateway / Lambda** | New endpoint `POST /recipes/{id}/photo` that returns a **pre-signed S3 upload URL** (the browser uploads directly to S3, never through Lambda — cheap & fast). |
| **DynamoDB** | Add `photoKey` field on recipe items pointing to the S3 object. |
| **Frontend** | File picker on the synthesis screen. After upload, re-fetch the recipe to show the new photo. Image component with skeleton + error states. |
| **Optional: CloudFront** | Serve images through a CDN for faster loads. |

### Estimated effort: 🟡 2–3 days
### 💰 Cost: ~$0.023/GB/month + tiny per-request. Effectively free at small scale.

### Decisions needed

- Are uploaded photos **private to the user** or **public when they share to Collective**? Affects bucket policy.
- Do we need **server-side image resizing** (so we don't ship 4MB photos)? Add a Lambda triggered by S3 PUT events with `sharp`.
- **Content moderation** — should we run Amazon Rekognition on uploads to filter out inappropriate content before they show in the Collective?

---

## Backend & data

### 🟢 Server-side Gemini proxy
Move the Gemini API call out of the browser and into a new Lambda (`POST /analyze`). Hides the API key, adds per-user rate limiting, lets you log/cache analyses.
**Effort:** 1 day · **Touches:** Frontend + new CDK Lambda

### 🟡 Optimistic UI updates
Today, saving a recipe waits for the round-trip. Show it in the archive instantly, then reconcile with the server response. Big perceived speed boost.
**Effort:** 1 day

### 🟡 Pagination for large archives
Users with >100 recipes will see the archive grow slow. Use DynamoDB's `ExclusiveStartKey` + a "Load more" button.
**Effort:** 1–2 days

### 🟡 Recipe versioning
Let users save iterations of the same formulation (`Midnight Velvet v2`, `v3`) so they can compare and revert.
**Effort:** 2 days

### 🔴 Full-text search across recipes
Add an OpenSearch (or Algolia) index. Sync via DynamoDB Streams → Lambda. Lets users search by ingredient, name, or even free text.
**Effort:** 5–7 days · 💰

### 🟡 Recipe sharing via short URL
Generate a public-read read-only token per recipe. Anyone with the URL can view it. Great for sharing with friends without forcing them to sign up.
**Effort:** 2 days

---

## Frontend & UX

### 🟢 Replace mock testimonials with real ones
Pull from a Cognito group called `featured-creators`, or hard-code a curated list seeded by the admin panel.

### 🟢 Code-split the bundle
The JS bundle is ~1.2MB. Lazy-load the Collective and Archive views. Should drop initial download to ~400KB.
**Effort:** 0.5 day

### 🟡 Dark mode
Tailwind v4 makes this a few hours of work. Toggle in the user menu, persisted in localStorage.

### 🟡 Mobile-optimized lab
The 3-column workbench collapses to single-column on mobile, but the vessel preview disappears off-screen as you scroll. Add a sticky mini-preview pill at the bottom of mobile viewport.
**Effort:** 1–2 days

### 🟡 Onboarding tour
A first-time-visitor walkthrough that highlights each panel of the lab. Use a library like Driver.js.
**Effort:** 1 day

### 🟡 Localization (i18n)
Add `react-i18next`, externalize all strings, add a language toggle. Start with English + Portuguese (or another).
**Effort:** 3 days

### 🟢 Accessibility audit
Run axe-core, fix any WCAG AA violations. Most of the app is good but the modal close-on-escape and focus-trap could be tighter.
**Effort:** 1 day

---

## Auth & community

### 🟢 Sign in with Google
Cognito supports Google federation. Adds a "Continue with Google" button alongside email/password. Requires a Google OAuth client ID + a Cognito Hosted UI domain.
**Effort:** 0.5–1 day · 🔐

### 🟡 Profile customization
Let users set a display name, avatar (via S3), location, and bio. Show on Collective posts.
**Effort:** 2 days

### 🟡 Public profiles
Each user gets `/u/{username}` showing their featured recipes and bio.
**Effort:** 2 days

### 🟡 Like / save / comment on Collective recipes
Real engagement features. Each like = 1 DynamoDB write.
**Effort:** 3–4 days

### 🟡 Follow other Concocters
Asymmetric follow graph. New SK pattern: `FOLLOWS#<targetId>`.
**Effort:** 3 days

### 🔴 Notifications system
Email + in-app notifications when someone likes/comments on your recipe, or when a recipe you follow updates. Uses SNS or SES.
**Effort:** 5–7 days · 💰

---

## DevOps & observability

### 🟢 GitHub Actions CI
Run `npm run build` + `npm run lint` on every PR before Amplify ever touches it. Block merges if it fails.
**Effort:** 0.5 day

### 🟢 Preview environments
Amplify already supports per-PR preview URLs. One toggle in the Amplify console.

### 🟡 Lambda logging & alarms
Add CloudWatch metric filters for 5xx responses. SNS alarm to your phone if error rate spikes.
**Effort:** 1 day

### 🟡 X-Ray tracing
Distributed tracing across API Gateway → Lambda → DynamoDB so you can see which calls are slow.
**Effort:** 1 day

### 🟡 Sentry / error reporting
Frontend errors should ship to a dashboard, not just `console.error`.
**Effort:** 0.5 day · 💰 (~$26/mo at minimal tier, free tier exists)

### 🟡 Multi-region failover
For real high-availability, deploy the stack to a second region (`us-west-2`). Use Route 53 health checks. Honest take: not needed until you're a real business.
**Effort:** 5+ days · 💰

### 🟡 Backup verification
DynamoDB point-in-time recovery is on. Add a monthly manual export to S3 just in case. Lambda + EventBridge schedule.
**Effort:** 1 day

---

## AI & intelligence

### 🟡 Caching expensive AI calls
A single ingredient combination's AI analysis doesn't change. Cache by hash of `{category, vessel.id, sortedIngredientIds}` in DynamoDB. Saves cost + latency.
**Effort:** 1 day

### 🟡 Streaming AI responses
Use Gemini's streaming API so the poetic description types out word-by-word. More magical UX.
**Effort:** 1–2 days (also requires the Lambda proxy)

### 🟡 Image generation for recipe cards
Use Gemini Imagen or AWS Bedrock to auto-generate a poetic illustration per recipe.
**Effort:** 2–3 days · 💰

### 🔴 Personalized recommendations
Train a small embedding model on saved recipes per user, recommend ingredients they'd like.
**Effort:** 2+ weeks

### 🔴 Voice input
"I want a hydrating face serum with lavender" → AI builds the formulation. Uses Web Speech API + Gemini.
**Effort:** 1 week

---

## Commerce

### 🔴 Buy the actual ingredients/vessels
Partner with a fulfillment service. Add a "Order Kit" button that bundles everything you need for the recipe and ships it. Stripe checkout.
**Effort:** 4+ weeks · 💰

### 🟡 Affiliate links
Easier first step — link out to Amazon/etsy listings for each ingredient/vessel with your affiliate code.
**Effort:** 1–2 days

### 🟡 PDF recipe cards for printing
Server-side render a printable label (uses S3). $1 per download or free with subscription?
**Effort:** 2 days

### 🟡 Pro subscription
Unlimited saved recipes, AI image generation, priority support. Stripe + a `subscriptionTier` field on user.
**Effort:** 5–7 days

---

## Sustainability & impact

### 🟡 Real CO₂ data
Replace [estimateCo2Impact](src/utils/formulation.ts)'s placeholder math with a real lifecycle-assessment lookup table per ingredient + vessel.
**Effort:** 1 day (data sourcing is the harder part — could take a week)

### 🟡 Personal impact ledger
The "Impact Report" page is a stub. Build it: cumulative CO₂ saved across all your saved recipes, equivalent in real-world terms (trees planted, etc.).
**Effort:** 2 days

### 🟡 Sourcing map
A world map showing where each ingredient in your formulation comes from. Awesome marketing.
**Effort:** 3 days

### 🟡 Donate-a-percent at checkout
When commerce is live, add a "round up to plant a tree" option via a partner like Treedom.
**Effort:** 2 days

---

## How to use this document

1. When you have a free week, scan this list.
2. Pick one item that aligns with what users have been asking for.
3. Move it into a new section at the top called **"In Progress"**.
4. When done, move it to **"Shipped"** with a date.

This file is the long-term backlog — the canonical answer to "what's next?"
