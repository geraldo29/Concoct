# Deploying Concoct to AWS Amplify

End-to-end deployment guide — GitHub source → AWS Amplify Hosting → live HTTPS URL.

---

## Prerequisites

- An [AWS account](https://aws.amazon.com/free) (Amplify free tier covers most small projects)
- A [GitHub account](https://github.com)
- Node.js **22+** locally (see [.nvmrc](.nvmrc))
- Optional: [GitHub CLI](https://cli.github.com) for one-line repo creation

---

## 1. Push to GitHub

```powershell
cd c:\repos\src\Concoct
git add .
git commit -m "Initial Concoct scaffold"

# Option A — GitHub CLI (recommended)
gh repo create concoct --public --source=. --push

# Option B — Manual
# 1. Create the repo at github.com/new (do NOT initialize with README)
# 2. Run:
git remote add origin https://github.com/<your-username>/concoct.git
git branch -M main
git push -u origin main
```

---

## 2. Create the Amplify app

1. Sign in to the [AWS Amplify console](https://console.aws.amazon.com/amplify/home).
2. **Create new app → Host web app**.
3. Choose **GitHub** → **Continue**, then authorize AWS Amplify to access your repos.
4. Select repository **`concoct`** and branch **`main`** → **Next**.
5. **App build settings**: Amplify auto-detects [amplify.yml](amplify.yml) — leave it as-is.
6. Expand **Advanced settings**:
   - Under **Environment variables**, add:
     | Key                    | Value                            |
     |------------------------|----------------------------------|
     | `VITE_GEMINI_API_KEY`  | *(your Gemini API key)*          |
     | `_LIVE_UPDATES`        | `[{"name":"Node.js version","pkg":"node","type":"nvm","version":"22"}]` |
7. **Next → Save and deploy**. First build takes ~3 minutes.

Your app is now live at `https://main.<app-id>.amplifyapp.com`.

---

## 3. Add the SPA rewrite rule

Concoct is a single-page app. Without this rule, deep-linking or refresh on any non-root URL returns 404.

1. In your Amplify app → **Hosting → Rewrites and redirects → Manage redirects**.
2. **Add rule**:

   | Field   | Value                                                                                  |
   |---------|----------------------------------------------------------------------------------------|
   | Source  | `</^[^.]+$|\.(?!(css|gif|ico|jpg|js|png|txt|svg|woff|woff2|ttf|map|json|webmanifest)$)([^.]+$)/>` |
   | Target  | `/index.html`                                                                          |
   | Type    | `200 (Rewrite)`                                                                        |

3. **Save**.

---

## 4. Lock down the Gemini API key

Because [geminiService.ts](src/services/geminiService.ts) runs in the browser, the key ships in the JS bundle. Restrict it so a leaked key cannot be abused:

1. Open [Google AI Studio → API keys](https://aistudio.google.com/apikey).
2. Edit your key → **Application restrictions → HTTP referrers**.
3. Add:
   - `https://main.<app-id>.amplifyapp.com/*`
   - `https://your-custom-domain.com/*` (if you add one)
   - `http://localhost:5173/*` (for local dev)

---

## 5. (Optional) Add a custom domain

In the Amplify console → **Hosting → Custom domains → Add domain**.
Amplify can manage the domain via Route 53 *or* point you at the DNS records to add at any registrar. SSL is provisioned automatically.

---

## 6. Continuous deployment

Every `git push origin main` now triggers an Amplify build & redeploy automatically. Pull request previews can be enabled per branch under **Hosting → Previews**.

---

## Local development

```powershell
cd c:\repos\src\Concoct
Copy-Item .env.example .env.local
# Edit .env.local and add your VITE_GEMINI_API_KEY
npm install
npm run dev          # http://localhost:5173
npm run build        # production build to dist/
npm run preview      # preview the production build locally
```

The app works **without** an API key — [geminiService.ts](src/services/geminiService.ts) automatically falls back to a deterministic mock analysis.

---

## Cost expectations

For a small/personal project, Amplify Hosting typically costs **$0–$5/month**:

- **Build minutes:** 1000/mo free, then ~$0.01/min
- **Hosting:** 15 GB transfer + 5 GB storage free, then $0.15/GB
- **Custom domain SSL:** free (managed by ACM)

---

## Troubleshooting

| Problem | Fix |
|---|---|
| Build fails with `Cannot find module` | Confirm Node 22 in env vars (step 2.6). |
| Refresh returns "Access Denied" | Add the SPA rewrite rule (step 3). |
| AI analysis returns mock text | Confirm `VITE_GEMINI_API_KEY` is set in Amplify env vars and you've redeployed since adding it. |
| 403 from Gemini | Your referrer restriction (step 4) doesn't include the deployed domain. |
