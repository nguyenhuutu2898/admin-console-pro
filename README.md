## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy to Vercel (CI/CD)

### Router
- The app uses `BrowserRouter` for clean URLs. Vercel handles SPA fallback via `vercel.json`.

### Vercel configuration
- `vercel.json` includes a rewrite sending all routes to `index.html`.

### GitHub Actions
- Workflow at `.github/workflows/ci.yml`:
  - Builds on push/PR to `main`.
  - Optional deploy job using Vercel CLI.

### Secrets required for deploy job
- In your GitHub repo Settings → Secrets and variables → Actions, add:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

### First-time Vercel setup
1. Create a project on Vercel and link to your GitHub repo.
2. Framework preset: Vite. Build command: `vite build` or `npm run build`. Output: `dist`.
3. Environment variables: add any needed (e.g., API base URLs).
4. On push to `main`, CI builds and deploys (if secrets are set).

### Local production build
```
npm run build && npm run preview
```
