# Client Tracker

Dark, minimal client/leads tracker. Next.js 14 + TypeScript + JSON file storage.

Tracks: Name · Date Started · Leads · Cost Per Lead · Date Last Contacted

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: client tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/client-tracker.git
git push -u origin main
```

## Deploy to Railway

**Option A — via dashboard (easiest):**
1. Go to https://railway.app/new
2. Pick "Deploy from GitHub repo" → select your `client-tracker` repo
3. Railway auto-detects Next.js (the included `nixpacks.toml` ensures Node 20)
4. Once deployed, click the service → **Settings → Networking → Generate Domain**
5. (Recommended) Add a Volume so data survives redeploys:
   - Service → **Volumes → New Volume**
   - Mount path: `/app/data`
   - In **Variables**, add: `DATA_DIR=/app/data`

**Option B — via CLI:**
```bash
npm i -g @railway/cli
railway login
railway init
railway up
railway domain
```

## How it works

- Data lives in `data/clients.json` (gitignored)
- In production, set `DATA_DIR` to a persistent volume path so it survives restarts
- API routes: `GET/POST /api/clients`, `PATCH/DELETE /api/clients/[id]`

## Stack

- Next.js 14 (App Router)
- TypeScript
- Zero external UI deps — pure CSS, e2b.dev-inspired dark theme
