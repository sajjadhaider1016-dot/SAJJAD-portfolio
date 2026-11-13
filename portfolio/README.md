# Sajjad Haider — Illustrated Portfolio

An interactive architectural portfolio built with the Next.js App Router and Three.js. The corridor is assembled from original geometry, a generated wood texture, pencil-line details, and hinged room doors. The content is based on the public portfolio and project information available at build time.

## Run locally

Use Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Controls

- Move with **WASD** or the **arrow keys**.
- Click the corridor to enable mouse look; press **Escape** to release the pointer.
- Click a labeled 3D door to open its section. Use the persistent room map to jump directly to any section.
- On touch screens, drag the scene to look and use the on-screen directional controls to move.
- The room map and all content remain available if WebGL is unavailable.

## Email delivery

The contact form sends directly from the visitor's browser to Web3Forms. Create an access key for `sajjadhaider1016@gmail.com` at [web3forms.com](https://web3forms.com/); Web3Forms sends the key to that inbox. Add it as `WEB3FORMS_ACCESS_KEY` in `.env.local` for local development and in the Vercel project's Production environment, then redeploy. The server route returns this public form identifier to the browser; Web3Forms documents browser-side submissions as the supported approach for this API.

If the key is missing or delivery fails, the form offers a prefilled email draft instead of showing a false success.

## Project map

```text
app/
  api/contact/route.ts    Exposes the configured public Web3Forms form key
  page.tsx                Portfolio entry point
  layout.tsx              Metadata and document shell
  styles.css              Paper, timber, and responsive interface system
components/
  CorridorScene.tsx       Three.js corridor, doors, camera, movement, and avatar stand-in
  PortfolioExperience.tsx Persistent map, keyboard and touch controls, scene orchestration
  SectionPanel.tsx        Home, biography, projects, career, and contact rooms
  ContactForm.tsx         Accessible validated contact form
data/
  portfolio.ts            Verified portfolio copy, links, skills, and milestones
```

## Identity assets

The About room uses Sajjad's profile photo recovered from the published source repository at `public/identity/sajjad-haider.jpg`. The scene includes a proportioned, professionally dressed procedural 3D stand-in. A custom photorealistic avatar model (GLB) was not available; replace the stand-in in `components/CorridorScene.tsx` when one is supplied.

The gallery uses available Study Buddy and Recoveriest product screenshots from the source repository; other project previews are clearly labeled, replaceable placeholders. Project descriptions, links, tools, employment details, and credentials are kept in `data/portfolio.ts`.

## GitHub data

The Home room requests the public GitHub profile and recently updated repositories from GitHub’s public API. If GitHub is unavailable or rate-limited, the profile link remains available and no statistics are invented.

## Build and deploy

```bash
npm run build
npm start
```

Deploy by importing this project into Vercel, selecting the Next.js framework preset, and adding `WEB3FORMS_ACCESS_KEY` to the Vercel Production environment. Do not commit `.env.local`.
