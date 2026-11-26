# Sajjad Haider: portfolio

React, TypeScript, Vite and Three.js.

**Design credit:** the page layout and interaction style follow Varun Khandelwal's portfolio (see `REFERENCE_ANALYSIS.md`). The code, artwork and the game were written for this project. Before publishing, credit that site or ask its owner.

## Run
Needs Node 20.19 or newer. Run these inside the `portfolio` folder.

    npm install
    npm run dev        # http://localhost:5173
    npm run build      # type-check and build into dist/
    npm run preview    # serve the build, http://localhost:4173
    npm run terminal   # the portfolio in your terminal

## Edit your content
Everything lives in `src/data/`:

| File | Contents |
|---|---|
| `profile.json` | name, headline, About text, contact links, résumé path |
| `projects.json` | all projects: description, features, contribution, tags, links, screenshot |
| `experience.json`, `education.json` | roles and studies |
| `skills.json`, `services.json` | skill groups and services |
| `certifications.json`, `achievements.json` | certificates and recognition |
| `headings.json` | section titles and introductions |

To change your CV, replace `public/CV.pdf`, and replace `public/cv-page-1.png` with an image of its first page: that is what the printer feeds out.

`content.ts` types the data and defines the project filter categories. Assets are in `public/`: `CV.pdf`, `identity/` and `projects/`.

The home page's first four projects are the ones that fly in from the top. Adding a project or category to the data updates the cards, filters, project pages, tape shelf, chat and terminal.

## Deployment
Pushing to `main` deploys to Vercel (Root Directory: `portfolio`). `vercel.json` sets the Vite build, the security headers, and redirects from the previous site's page addresses (`/about`, `/projects` and so on).

**Contact form.** `api/contact.js` hands the form the Web3Forms key from the `WEB3FORMS_ACCESS_KEY` environment variable, the same name the previous site used. Without a key, the form offers a prefilled email draft. To test delivery on your machine, copy `.env.example` to `.env.local` and add `VITE_WEB3FORMS_ACCESS_KEY` (the dev server does not run `api/`). Never commit `.env.local`.

`public/sitemap.xml` lists every page: update it when you add or remove a project.

## Signal Isles (`/play`)
Fly Pip between five islands, scan each beacon and recover eight shards to bring the relay online. There is no way to lose: the end is a results screen with your time and best time.

**Controls:** WASD or arrows to fly, Shift to boost, E to scan, J for the journal (with "Fly there" autopilot), drag or Q/R to turn the view, wheel to zoom, C to recentre, Esc to pause. On touch: joystick (push past the ring to boost), swipe to turn, Scan button.

| File | Role |
|---|---|
| `game/world.ts` | layout, collisions, autopilot routes, beacon text |
| `game/engine.ts` | renderer, camera direction, movement, post-processing, quality scaling |
| `game/art/` | sky and clouds, islands, landmarks, Pip, beacons and relay |
| `game/sound.ts` | synthesised sound effects |
| `pages/Play.tsx`, `styles/game.css` | start, HUD, panels, ending, fallback |

Performance: static geometry is merged or instanced, shadows are rendered once, edge smoothing happens in the final pass, and resolution drops (then bloom) if frames stay slow. Touch and narrow screens start in Light graphics; the pause menu switches modes. Nothing renders in a hidden tab, and the home preview runs only while visible, capped at 30 fps. Without WebGL, the page lists links to every section. Reduced motion calms the camera and animation.

## Differences from the previous site
- The "illustrated 3D world" of ten rooms is replaced by Signal Isles.
- Project panels that expanded in place are now cards with their own pages.
- The Studio B DTLA live preview is on its project page.
- Projects without a screenshot show artwork made from their listed features. It is not a product screenshot.
- "Multan, Pakistan" comes from your brief; the old site did not state a location.
- Old `#section-…` and `#project-…` links still scroll to the right place.
- The old generated social-share image is replaced by your portrait.
