# Sajjad Haider — Portfolio

The portfolio application is in [`portfolio/`](portfolio/): React, TypeScript, Vite and Three.js. This repository is dedicated to Sajjad Haider's portfolio; China Vibes lives in its own repository at <https://github.com/sajjadhaider1016-dot/China-Vibes>.

Live site: <https://sajjad-haider-portfolio.vercel.app/>

## Local development

```powershell
cd portfolio
npm install
npm run dev
```

## Deployment

Pushing to `main` deploys to Vercel. The Vercel project uses `portfolio` as its Root Directory, and [`portfolio/vercel.json`](portfolio/vercel.json) sets the Vite build, redirects and security headers. See [`portfolio/README.md`](portfolio/README.md) for content editing and contact-form setup.
