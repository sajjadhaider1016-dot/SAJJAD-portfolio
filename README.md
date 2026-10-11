# Sajjad Haider — Portfolio

Premium personal site for **Sajjad Haider**, AI & Full-Stack Developer.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Production

```bash
npm run lint
npm run build
npm start
```

Deploy on Vercel by importing this repository.

## Edit content

Most copy and links live in:

- `src/data/site.ts` — name, email, GitHub, LinkedIn, CV path
- `src/data/projects.ts` — project cards, live URLs, features
- `src/data/skills.ts`
- `src/data/content.ts` — about, services, achievements, education

## CV

Place your real CV at:

```
public/CV.pdf
```

The **Download CV** buttons already point to `/CV.pdf`. The file currently in that path is a **placeholder PDF only** — replace it with your actual CV. Do not rely on generated CV content.

## Notes

- BZU AI Assistant details come from the public GitHub repo description plus the live Railway app (auth, university chat topics, OCR / PDF-DOCX / voice / history).
- Recoveriest details come from the live product at [recoveriest-app.vercel.app](https://recoveriest-app.vercel.app/). Implementation stack beyond Vercel was not verified from source — add it in `src/data/projects.ts` when you want it listed.
- LinkedIn: [linkedin.com/in/sajjadhaider56](https://www.linkedin.com/in/sajjadhaider56/)
