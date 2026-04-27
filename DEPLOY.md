# Deploying Concoct on AWS

End-to-end deployment guide. **Two parts:**

1. **Backend** — provision AWS resources with CDK (Cognito + DynamoDB + Lambda + API Gateway).
2. **Frontend** — host the React app on AWS Amplify Hosting from GitHub.

---

## Architecture

```
Browser (React)
   │
   ├── Cognito User Pool ───── sign-up / sign-in / verify
   │                           returns JWT id-token
   │
   └── HTTP API Gateway ────── JWT authorizer
              │
              └── Lambda (Node 20) ──── DynamoDB (single table)
```

| Resource          | Purpose                                  | Free tier             |
|-------------------|------------------------------------------|-----------------------|
| Cognito User Pool | Auth (email + password)                  | 50,000 MAU forever    |
| API Gateway HTTP  | Public API endpoint with JWT auth        | 1M requests/mo (12mo) |
| Lambda            | `/recipes` CRUD                          | 1M req/mo forever     |
| DynamoDB          | Stores recipes per user                  | 25 GB + 25 RCU forever|
| Amplify Hosting   | Static React site, GitHub-driven         | 1000 build min/mo     |

---

## Prerequisites

- An [AWS account](https://aws.amazon.com/free) (any region works; default is `us-east-1`)
- [AWS CLI v2](https://aws.amazon.com/cli/) installed and configured (`aws configure`)
- Node.js **22+** (see [.nvmrc](.nvmrc))
- A [GitHub account](https://github.com)

---

## Part 1 — Deploy the backend (CDK)

### 1.1 One-time CDK bootstrap

If this is your first time using CDK in this AWS account/region, bootstrap it:

```powershell
cd infra
npx cdk bootstrap
```

(Skip this if you've already used CDK in this account.)

### 1.2 Deploy the stack

```powershell
cd infra
npm install
npm run deploy
```

CDK will show a summary of resources to be created and ask for approval. Type `y`.
After ~3 minutes you'll see outputs like:

```
ConcoctStack.UserPoolId       = us-east-1_AbCdE12345
ConcoctStack.UserPoolClientId = 1a2b3c4d5e6f7g8h9i0j
ConcoctStack.ApiUrl           = https://abc123.execute-api.us-east-1.amazonaws.com
ConcoctStack.Region           = us-east-1
```

**Copy these values into your [.env.local](.env.local):**

```bash
VITE_AWS_REGION=us-east-1
VITE_AWS_USER_POOL_ID=us-east-1_AbCdE12345
VITE_AWS_USER_POOL_CLIENT_ID=1a2b3c4d5e6f7g8h9i0j
VITE_AWS_API_URL=https://abc123.execute-api.us-east-1.amazonaws.com
```

### 1.3 Test sign-up locally

```powershell
cd ..
npm run dev
```

Open http://localhost:5173 → Sign In → Sign up → enter email + password → check inbox for verification code → enter it → save a formulation in the lab → switch to **My Formulas** to see it persist.

### 1.4 Updating the backend later

Any time you change [infra/lib/concoct-stack.ts](infra/lib/concoct-stack.ts) or
[infra/lambda/recipes/index.ts](infra/lambda/recipes/index.ts):

```powershell
cd infra
npm run diff       # preview changes
npm run deploy     # apply them
```

To tear everything down (and stop all costs):

```powershell
cd infra
npm run destroy
```

> ⚠️ User Pool and DynamoDB table have `RemovalPolicy.RETAIN` to prevent accidental data loss. Delete them manually in the AWS Console if you really want them gone.

---

## Part 2 — Deploy the frontend (Amplify Hosting)

### 2.1 Push to GitHub

```powershell
cd c:\repos\src\Concoct
git add .
git commit -m "Migrate backend to AWS (Cognito + DynamoDB + Lambda)"
git push
```

### 2.2 Connect Amplify

1. Sign in to the [AWS Amplify console](https://console.aws.amazon.com/amplify/home).
2. **Create new app → Host web app → GitHub** → authorize → pick your repo + branch.
3. Amplify auto-detects [amplify.yml](amplify.yml).
4. Under **Advanced settings → Environment variables**, add:

   | Key                            | Value                                               |
   |--------------------------------|-----------------------------------------------------|
   | `VITE_AWS_REGION`              | from CDK output                                     |
   | `VITE_AWS_USER_POOL_ID`        | from CDK output                                     |
   | `VITE_AWS_USER_POOL_CLIENT_ID` | from CDK output                                     |
   | `VITE_AWS_API_URL`             | from CDK output                                     |
   | `VITE_GEMINI_API_KEY`          | (optional) your Gemini key                          |
   | `_LIVE_UPDATES`                | `[{"name":"Node.js version","pkg":"node","type":"nvm","version":"22"}]` |

5. **Save and deploy**.

### 2.3 SPA rewrite (deep-link refresh fix)

In Amplify → **Hosting → Rewrites and redirects → Manage redirects**:

| Field   | Value                                                                                  |
|---------|----------------------------------------------------------------------------------------|
| Source  | `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webmanifest)$)([^.]+$)/>` |
| Target  | `/index.html`                                                                          |
| Type    | `200 (Rewrite)`                                                                        |

### 2.4 Lock down the Gemini API key

Because [geminiService.ts](src/services/geminiService.ts) runs in the browser, the Gemini key
ships in the JS bundle. Restrict it in [Google AI Studio](https://aistudio.google.com/apikey):

- **Application restrictions → HTTP referrers**:
  - `https://main.<app-id>.amplifyapp.com/*`
  - `https://your-custom-domain.com/*` (if added)
  - `http://localhost:5173/*` (local dev)

(Cognito and the API Gateway don't need this kind of restriction — the JWT authorizer rejects anonymous calls automatically.)

---

## Local development

```powershell
cd c:\repos\src\Concoct
Copy-Item .env.example .env.local
# Fill in VITE_AWS_* from your CDK outputs

npm install
npm run dev          # http://localhost:5173
npm run build        # production build to dist/
npm run preview      # preview the production build locally
```

The app degrades gracefully when `VITE_AWS_*` is missing — sign-in is hidden behind a
"AWS not configured" notice, but the Lab itself still works (without persistence).

---

## Cost expectations

For a personal/small project:

- **Cognito** — free up to 50K monthly active users.
- **API Gateway HTTP** — first 1M req/mo free for 12 months, then $1/M.
- **Lambda** — first 1M req/mo + 400K GB-sec free forever.
- **DynamoDB** — 25 GB storage + 25 RCU/WCU free forever (more than enough on PAY_PER_REQUEST).
- **Amplify Hosting** — 1000 build min/mo, 15 GB transfer + 5 GB storage free.
- **Custom domain SSL** — free (managed by ACM).

Total realistic monthly cost for early users: **$0**.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `cdk bootstrap` fails with credentials error | Run `aws configure`. Confirm with `aws sts get-caller-identity`. |
| Sign-in says "AWS not configured" | The `VITE_AWS_*` vars aren't loaded. Did you restart `npm run dev` after editing `.env.local`? |
| Sign-up email never arrives | Cognito sandbox mode only sends to *verified* emails by default. Either verify your test address in the SES console or move Cognito out of sandbox. |
| API call returns 401 | Token expired or sign-out happened. Reload and sign in again. |
| API call returns 404 | The Lambda is up but the route isn't matching — check method + path in [concoct-stack.ts](infra/lib/concoct-stack.ts). |
| Build fails in Amplify with `Cannot find module` | Confirm Node 22 in env vars (see `_LIVE_UPDATES` above). |
| Refresh on `/anything` returns "Access Denied" | Add the SPA rewrite rule (Part 2.3). |

---

## What's where

| Folder / file | Purpose |
|---|---|
| [infra/](infra/) | CDK app — provisions backend |
| [infra/lib/concoct-stack.ts](infra/lib/concoct-stack.ts) | All AWS resources |
| [infra/lambda/recipes/index.ts](infra/lambda/recipes/index.ts) | API handler |
| [src/services/awsConfig.ts](src/services/awsConfig.ts) | Amplify SDK config |
| [src/services/apiClient.ts](src/services/apiClient.ts) | Authed `fetch` wrapper |
| [src/services/recipesService.ts](src/services/recipesService.ts) | Recipe CRUD client |
| [src/hooks/useAuth.tsx](src/hooks/useAuth.tsx) | Cognito-backed auth context |
| [amplify.yml](amplify.yml) | Frontend build spec |
