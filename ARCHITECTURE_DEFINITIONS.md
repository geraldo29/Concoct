# Concoct — Architecture Definitions

> A plain-English guide to every AWS service and architectural concept used in Concoct. Read this if you're new to cloud, or if you've heard "Lambda" and "DynamoDB" but want to know what they actually *do*.

---

## Table of contents

1. [The big picture](#the-big-picture)
2. [Frontend concepts](#frontend-concepts)
3. [AWS services we use](#aws-services-we-use)
4. [How auth actually works](#how-auth-actually-works)
5. [How the data flows](#how-the-data-flows)
6. [Why we chose this architecture](#why-we-chose-this-architecture)

---

## The big picture

Concoct is a **serverless web app**. That means:

- **No servers to maintain.** AWS spins up the compute we need on-demand and tears it down when we're done.
- **You pay per request, not per hour.** No request? No bill.
- **It scales automatically.** From 1 user to 1 million, the same architecture works.

Here's what's in play:

```
┌────────────────────────┐
│   Your browser         │  ← The React app you wrote
│   (React + Vite)       │
└──────────┬─────────────┘
           │
           │  HTTPS requests
           ▼
┌────────────────────────┐
│   Amplify Hosting      │  ← Serves the static HTML/JS/CSS
│   (CloudFront CDN)     │
└────────────────────────┘

   Authentication                    Data
        │                              │
        ▼                              ▼
┌──────────────┐              ┌──────────────────┐
│  Cognito     │              │  API Gateway     │
│  User Pool   │              │  (the front door)│
└──────────────┘              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  Lambda          │
                              │  (your code)     │
                              └────────┬─────────┘
                                       │
                                       ▼
                              ┌──────────────────┐
                              │  DynamoDB        │
                              │  (the database)  │
                              └──────────────────┘
```

---

## Frontend concepts

### React
A library for building user interfaces with reusable **components**. Concoct is built almost entirely from small components like `<Button>`, `<Card>`, `<VesselPreview>` that compose into pages.

### Vite
A modern build tool. It does two things:
- **Dev mode:** runs a fast local server with instant hot-reload (`npm run dev`)
- **Production:** bundles your code into the smallest possible static files in `dist/` (`npm run build`)

### TypeScript
JavaScript with type checking. If you try to pass a `Vessel` where an `Ingredient` is expected, the compiler catches it before users do.

### Tailwind CSS
A "utility-first" CSS framework. Instead of writing `.button { background: black; padding: 8px }`, you write `className="bg-black p-2"`. Faster to iterate, easier to keep consistent.

### Framer Motion
An animation library for React. Powers the page transitions, the bottle filling up, and the modal pop-in.

---

## AWS services we use

### 🔐 Amazon Cognito (Authentication)

> **Plain English:** A managed sign-up / sign-in service. AWS stores your users, hashes their passwords, sends verification emails, and gives you back a secure token when someone logs in.

**Key parts:**
- **User Pool** — the database of your users (think "users table", but managed). Concoct has one called `concoct-users`.
- **App Client** — represents one application (your web app) that's allowed to call into the User Pool. Has its own ID.
- **JWT (JSON Web Token)** — when someone signs in, Cognito gives them a cryptographically-signed token that proves who they are. The browser sends this token on every subsequent API call.

**Why use it:**
- Don't have to write password reset flows, email verification, or token refresh logic.
- Free for up to 50,000 monthly active users.
- Integrates natively with API Gateway and Lambda.

---

### 🚪 Amazon API Gateway (the API front door)

> **Plain English:** A managed HTTP server that listens for incoming requests on a public URL, checks if they're authorized, and forwards them to your code.

In Concoct, the API URL looks like:
```
https://3po4kit9k1.execute-api.us-east-1.amazonaws.com
```

It exposes three routes:
| Method | Path | What it does |
|---|---|---|
| `GET`    | `/recipes`                | List the signed-in user's saved recipes |
| `POST`   | `/recipes`                | Save a new recipe |
| `DELETE` | `/recipes/{recipeId}`     | Delete one |

**Authorizer:** before forwarding any request to your Lambda, API Gateway checks the JWT in the `Authorization: Bearer <token>` header. If the token isn't valid (or is missing), it returns `401 Unauthorized` and your Lambda is never called.

**Why use it:**
- Built-in JWT validation — your code never has to verify tokens manually.
- Free for the first 1M requests/month for 12 months.
- Auto-scales with no config.

---

### ⚡ AWS Lambda (your code, on demand)

> **Plain English:** A way to run code without owning a server. You upload a function, AWS holds onto it, and runs it whenever a trigger fires (like an API request).

Concoct has **one** Lambda function — `concoct-recipes` — that handles all three API routes. Its code lives at [infra/lambda/recipes/index.ts](infra/lambda/recipes/index.ts).

**The lifecycle of a single API call:**
1. User's browser sends `GET /recipes` with a JWT
2. API Gateway validates the JWT, extracts the user ID (`sub`)
3. API Gateway "wakes up" the Lambda (cold start: ~200ms; warm: ~5ms)
4. Lambda receives an `event` object with method, path, headers, body, and the JWT claims
5. Lambda's code reads from DynamoDB
6. Lambda returns a JSON response
7. API Gateway forwards the response to the browser
8. Lambda goes back to sleep

**Why use it:**
- **No idle cost.** If no one uses your app, you pay $0.
- 1M requests/month + 400,000 GB-seconds free **forever**.
- Auto-scales from 0 to thousands of concurrent executions.
- Languages supported: Node.js, Python, Go, Java, Ruby, .NET, custom runtimes. We use **Node.js 20** with TypeScript bundled by **esbuild** for tiny startup times.

---

### 📦 Amazon DynamoDB (the database)

> **Plain English:** A NoSQL database that stores key-value pairs at any scale. No server to provision, no schema to define upfront.

Concoct's table is called `concoct-data`. It uses a **single-table design** — instead of separate tables for users, recipes, ingredients, etc., everything goes in one table distinguished by key prefixes.

**The schema:**

| Field | Example value | Purpose |
|---|---|---|
| `PK` (partition key) | `USER#abc123` | Groups all items belonging to one user |
| `SK` (sort key) | `RECIPE#2026-04-26T20:17:00Z#r-abc` | Sorts items within a partition |
| `id` | `r-abc` | Public-facing recipe ID |
| `name` | `"Midnight Velvet"` | User-given name |
| `category`, `vessel`, `ingredients`, etc. | (the recipe data) | |
| `createdAt` | `"2026-04-26T20:17:00Z"` | ISO timestamp |

**Why a sort key?** Because DynamoDB queries can say "give me all items where PK=X **and** SK starts with `RECIPE#`" — which returns all recipes for that user, sorted by timestamp, in a single fast lookup.

**Billing mode:** `PAY_PER_REQUEST` — we pay per read and per write, not for provisioned capacity. For a small app this is essentially free (25 GB + 25 read/write units/month forever).

---

### 🌐 AWS Amplify Hosting (where your React app lives)

> **Plain English:** A managed hosting service for static websites. Connects to your GitHub repo, runs `npm run build` on every push, and serves the result through a global CDN.

When you push to GitHub:
1. Amplify pulls the latest code
2. Runs the steps in [amplify.yml](amplify.yml) — `npm ci`, `npm run build`
3. Uploads the contents of `dist/` to AWS's edge CDN (CloudFront)
4. Invalidates the cache so your visitors see the new version

Free SSL, free CDN, free build minutes (1000/month).

---

### 🛠️ AWS CDK (Cloud Development Kit)

> **Plain English:** A library that lets you write your AWS infrastructure as code in TypeScript (instead of clicking around the AWS Console or writing YAML).

Concoct's entire backend (Cognito + DynamoDB + Lambda + API Gateway, plus all the IAM permissions tying them together) is defined in **one file**: [infra/lib/concoct-stack.ts](infra/lib/concoct-stack.ts).

**The workflow:**
- `npm run deploy` → CDK synthesizes your TypeScript into a CloudFormation template, then sends it to AWS
- AWS creates/updates only what changed
- `npm run destroy` → tears it all down (except resources marked `RETAIN`)

**Why use it:**
- **Reproducible.** Your infra is in git alongside your code. Anyone can re-deploy it from scratch.
- **Reviewable.** PRs can show infrastructure changes as code diffs.
- **Type-safe.** TypeScript catches mistakes (like passing a `Table` where a `Function` is expected) at compile time.

**Bootstrap:** before your first CDK deploy in any account+region, you run `cdk bootstrap` once. This creates a small staging S3 bucket and a few IAM roles that CDK uses to ship your code to AWS.

---

### 🔑 IAM (Identity and Access Management)

> **Plain English:** AWS's permissions system. Every service that talks to another service needs explicit permission, granted via IAM policies.

You'll see IAM mentioned in two places in Concoct:

1. **Your IAM user** (`geraldoIAM`) — has `AdministratorAccess`, used to deploy CDK stacks from your laptop.
2. **Lambda's execution role** — auto-created by CDK. Grants the Lambda permission to read/write the DynamoDB table (and nothing else). This is the **principle of least privilege**: each piece of infrastructure only gets the permissions it strictly needs.

You don't write IAM policies by hand in Concoct — CDK generates them for you when you say things like `table.grantReadWriteData(recipesFn)` in [concoct-stack.ts](infra/lib/concoct-stack.ts).

---

### 📋 CloudFormation (under the hood)

> **Plain English:** AWS's underlying "infrastructure as code" service. You describe what you want (in JSON or YAML), AWS makes it so.

You won't ever write CloudFormation directly — CDK generates it for you. But when something breaks, you'll see CloudFormation events in the console, like:
```
ConcoctStack | CREATE_IN_PROGRESS | AWS::Lambda::Function | RecipesFn
ConcoctStack | CREATE_COMPLETE    | AWS::Lambda::Function | RecipesFn
```

These events are CloudFormation's logs of building each resource one at a time, in dependency order.

---

## How auth actually works

Here's the full lifecycle of a user signing up and saving a recipe — every box is a real piece of the system.

### 1. Sign up

```
Browser                          Cognito User Pool          User's email inbox
   │                                    │                          │
   ├─ "create user(email, password)" ──►│                          │
   │                                    ├── store hashed password  │
   │                                    ├── send verification ────►│
   │                                    │                          │
   │◄────────── "needs confirmation" ───┤                          │
```

### 2. Verify email

```
Browser                          Cognito User Pool
   │                                    │
   ├─ "confirm(email, '123456')" ──────►│
   │                                    ├── mark verified
   │◄────────── "confirmed" ────────────┤
```

### 3. Sign in

```
Browser                          Cognito User Pool
   │                                    │
   ├─ "signIn(email, password)" ───────►│
   │                                    ├── verify password
   │◄── id-token (JWT) + refresh-token ─┤
   │
   └── store tokens locally (Amplify SDK does this)
```

The **id-token** is a long string that looks like:
```
eyJraWQiOiJhYmMxMjM..(header).eyJzdWIiOiJ4eXo3ODkiLCJlbWFpbCI6...(payload).XYZ123(signature)
```

It contains:
- `sub`: the user's stable Cognito ID
- `email`: their email
- `exp`: when it expires (1 hour by default)
- A cryptographic signature that only Cognito can produce

### 4. Save a recipe

```
Browser                       API Gateway                     Lambda                     DynamoDB
   │                              │                              │                          │
   ├─ POST /recipes ─────────────►│                              │                          │
   │  Authorization: Bearer <jwt> │                              │                          │
   │                              ├─ verify JWT signature        │                          │
   │                              ├─ extract sub claim           │                          │
   │                              ├─ invoke Lambda ─────────────►│                          │
   │                              │                              ├─ PutItem PK=USER#sub ───►│
   │                              │                              │                          │ store
   │                              │                              │◄─────── ok ──────────────┤
   │                              │◄────── { id, name, ... } ────┤                          │
   │◄─── 201 Created ─────────────┤                              │                          │
```

### 5. Load the archive

```
Browser → GET /recipes (with JWT)
       → API Gateway validates JWT, gets sub
       → Lambda runs Query on DynamoDB:
           "where PK = USER#sub AND SK starts with RECIPE#"
       → Returns the list, sorted newest-first
```

---

## How the data flows

Two concrete scenarios:

### Scenario A — Building a formulation (purely client-side)

Nothing here touches the network except the optional Gemini call.

```
1. User clicks "Lotion" in the category list
   └─► useRecipe.setCategory('lotion')
        └─► React re-renders the workbench

2. User clicks "Apothecary Vial"
   └─► useRecipe.setVessel(vessel)
        └─► VesselPreview re-renders with the new shape

3. User clicks "Vitamin C"
   └─► IngredientRow checks isVesselCompatible(vessel, [...selected, vitC])
        └─► If breaks → row is disabled with "Incompatible" label
        └─► Else → useRecipe.addIngredient(vitC)
              └─► VesselPreview animates a new colored layer in

4. User clicks "Review Formulation"
   └─► CreationLab calls geminiService.analyzeFormulation(category, vessel, ingredients)
        ├─► Gemini API key set → real call to Google
        └─► No key → deterministic mock returned
```

### Scenario B — Saving and reloading (the AWS path)

```
1. User signed in (already has JWT cached by Amplify)

2. User names recipe "Midnight Velvet" and clicks Save
   └─► saveRecipe(uid, { name, category, vessel, ingredients, aiAnalysis })
        └─► apiFetch('/recipes', POST)
              ├─► fetchAuthSession() → grabs JWT
              ├─► fetch with Authorization header
              └─► API Gateway → Lambda → DynamoDB.PutItem
                   PK = USER#abc123
                   SK = RECIPE#2026-04-26T20:17:00Z#r-xyz

3. User clicks "My Formulas" in the nav
   └─► Archive component mounts
        └─► loadUserRecipes() → apiFetch('/recipes', GET)
             └─► Lambda runs DynamoDB Query
                  └─► Returns array (newest first via ScanIndexForward: false)
        └─► React renders one card per recipe

4. User deletes a recipe
   └─► deleteRecipe(uid, recipeId) → apiFetch('/recipes/{id}', DELETE)
        └─► Lambda finds the SK by scanning user's recipes for matching id
        └─► DynamoDB.DeleteItem
        └─► Local state filters it out → row disappears
```

---

## Why we chose this architecture

| Decision | Alternative | Why we picked this |
|---|---|---|
| **Serverless** (Lambda + DynamoDB) | EC2 + RDS | $0 when idle. No patching. No 3am alerts. |
| **DynamoDB** | PostgreSQL | Single-digit ms latency at any scale. No JOIN-heavy queries needed. |
| **Single-table design** | Multiple tables | One Query call gets all of a user's data. Cheaper, faster, fewer round-trips. |
| **HTTP API Gateway** | REST API Gateway | 70% cheaper, lower latency, simpler config. We don't need REST API's extra features (request validation, models, etc.). |
| **Cognito** | Build our own auth | Nobody should write password hashing. Free up to 50K MAU. |
| **CDK** | Click-ops in console | Reproducible. Reviewable. Anyone can re-deploy from scratch. |
| **Vite** | Webpack/Next.js | Faster dev server. Smaller config. Static-only output (no Node server). |
| **Tailwind** | Styled-components | Smaller production CSS. Easier to keep design consistent. |
| **Amplify Hosting** | S3 + CloudFront manual | Auto-deploy on push. PR previews. Built-in SSL. Free tier. |

### What we explicitly don't have (yet)

- **No backend caching layer.** DynamoDB is fast enough. Add ElastiCache only if we hit hot keys.
- **No queues / async jobs.** All operations are synchronous request/response. Add SQS/EventBridge if we need async work.
- **No realtime updates.** When the archive loads, it loads. Add AppSync subscriptions if we want live updates across tabs.
- **No CI/CD beyond Amplify auto-deploy.** Add GitHub Actions if we want PR-time tests/lint.

---

## Quick reference: terms you'll hear

| Term | What it really is |
|---|---|
| **Stack** | A group of AWS resources deployed together. Concoct has one: `ConcoctStack`. |
| **Region** | A geographic AWS data center cluster (e.g. `us-east-1` = Northern Virginia). |
| **Endpoint / API URL** | The HTTPS URL your frontend talks to. Concoct's: `https://3po4kit9k1.execute-api.us-east-1.amazonaws.com` |
| **Cold start** | The first invocation of a Lambda after a period of idleness. Takes a few hundred ms. Subsequent calls are fast. |
| **Throttling** | When you exceed a service's rate limit. Lambda and API Gateway will queue or reject requests. |
| **CORS** | "Cross-Origin Resource Sharing" — browsers block JS from talking to a different domain unless that domain explicitly says it's OK. Our API Gateway sends `Access-Control-Allow-Origin: *` for this reason. |
| **Edge / CDN** | A network of servers around the world that cache your static files close to users. CloudFront powers Amplify Hosting. |
| **Bootstrap** | One-time CDK setup per account+region. Creates a staging bucket + IAM roles for CDK to use. |
| **Synth** | "Synthesize" — CDK turns your TypeScript into a CloudFormation JSON template. |

---

## See also

- [ARCHITECTURE.md](ARCHITECTURE.md) — File-by-file map of the codebase
- [DEPLOY.md](DEPLOY.md) — Step-by-step deployment instructions
- [PLAN.md](PLAN.md) — The original product/technical specification
