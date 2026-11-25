# Reference analysis: varunkhandelwal.in

Observed on 26 Nov 2026 from the live site (browser at 800x600, 1440x900 and 390x844) and from the publicly served HTML, CSS and JavaScript. Items marked "not inspected" were not checked.

## Visual design

### Colour
| Role | Value |
|---|---|
| Paper / surface | `#FFFFFF` / `#F1F1F3` |
| Ink, ink 2, ink 3 | `#141413`, `#57564F`, `#6B6A64` |
| Accent | `#2E54D1` |
| Night, night ink, night ink 2 | `#0B0D14`, `#F2F1EC`, `#A9ADBE` |
| Hairline | `rgba(20,20,19,.10)` |

The background is a fixed full-screen dithered sky: 3px cells, 4x4 Bayer matrix, four tones per moment. Scrolling changes the time of day:

| Time | Deep to light |
|---|---|
| 0.00 morning | #93A8E0 #BDCBEF #E0E6F5 #FFFFFF |
| 0.30 noon | #4F70D0 #86A0E4 #B9C9F0 #F4F5F8 |
| 0.56 afternoon | #5868B4 #98A3D6 #E2D2C4 #F8EADB |
| 0.76 dusk | #1D2150 #5A4886 #C47A76 #F3B98C |
| 0.90+ night | #0B0D14 #141A2C #243259 #4B61A6 |

It has drifting noise clouds, a sun that sets, a crescent moon, stars, a soft light around the pointer, calmer dithering behind headings, and an opening wipe from white (about 1.8s). Text and glass colours flip to light when the sky darkens.

### Typography
Geist (300/400/500), Geist Mono (tooltips and chat), Silkscreen (tape spines).

| Style | Size | Line height | Tracking |
|---|---|---|---|
| Display XL | clamp(2.6rem, 5.6vw, 5.25rem) | 1.02 | -0.045em |
| Display L | clamp(2.1rem, 4.2vw, 3.75rem) | 1.05 | -0.04em |
| Display M | clamp(1.6rem, 2.6vw, 2.25rem) | 1.12 | -0.03em |
| Body L | 19px | 1.55 | -0.01em |
| Card title | 18px / 500 | 1.35 | -0.015em |
| Body / small / caption | 16 / 14 / 13px | 1.65 / 1.5 / 1.45 | normal |

All headings are weight 400. Emphasis is a lighter ink, never italics.

### Layout
- Container: max 1240px, gutter clamp(16px, 4vw, 40px).
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.
- Radii: 8px cards, 24px sheets, pill buttons.
- Work grid: 2 columns, 64px x 24px gaps. Card media 4:3; about portrait 4:5.
- About: 5fr / 7fr with a sticky photo. Experience rows: 1.3fr / 1fr / auto with hairlines.
- Stage: height clamp(460px, 78vh, 780px).

### Glass, borders, shadows
Sheets: `linear-gradient(155deg, white 20%, transparent 42%)` over a translucent tint, `blur(34px) saturate(1.9)`, 1px inner top highlight and inner ring. The dock uses a brighter variant, with an SVG displacement "lens" filter in Chromium. Nearly no drop shadows; the paper CV tab is the exception.

## Interaction design
| Element | Behaviour |
|---|---|
| Hero deck | Four cards rest in a fan (width min(21vw, 300px); 42vw on phones), bob gently, and start as pixel art. On scroll they straighten, grow and fly into the work grid, staggered by 0.06, with cubic in-out easing. The glass frame fades by 75%. |
| Headings | Words appear through a 7-step Bayer mask, 560ms, 55ms apart, rising 0.12em. |
| Reveals | 20px rise (800/1000ms), 90ms stagger. Sheets rise 48px from scale .985. |
| Smooth scroll | Lenis 1.3. Off on case studies. |
| Cards | Media scales 1.02 over 900ms. Fine pointers get a blurred description sliding up. |
| Nav | Bottom dock. A dithered pill with stepped corners moves on a 4px grid at about 16fps; leading edge 260ms, trailing edge 520ms after 110ms with overshoot. Follows hover and the current section. |
| Cursor | Pixel-art SVG cursors (arrow, hand, text, grab). A pixel tooltip trails the pointer (lerp .25) and types at 32ms per character. |
| Music | Six "discs" backed by SomaFM live streams, a disc that flies into a sleeve, volume slider, spinning disc, saved choice. |
| CV | Paper tab on the right edge opens a side drawer with a 3D printer, then downloads a PDF. |
| Journey | 540vh pinned section: huge horizon, flat dithered map, globe, rotation along a route, place labels, avatar, then a dark glass text card. Scroll is smoothed at 4.5/s. |
| District | A live Three.js game preview in an iframe; the stage links to a separate playable game. |
| Terminal | Shows an SSH command with a Copy button (states: Copied / Select to copy). It is not an in-page terminal. The SSH service itself was not connected to. |
| Chat | Pixel robot bottom right; local keyword answers (no AI service), glass panel, mic input, animated dot equaliser, draggable. |
| Page transitions | Cross-document view transition: old page shrinks to 80%, new page rises and expands, 1180ms. |
| Reduced motion | Animations and smooth scroll are disabled. |

### Game (observed, not copied)
Title screen, WASD movement, talk key, doors, a journal with progress, and an arcade minigame. Only the opening plaza was played. The recreation deliberately uses an original game (see README).

### Responsive
- 1080px: About becomes one column; photo max 420px.
- 720px: one-column grid; stage description hidden; tools 2 columns; experience rows reflow.
- 560px: "Playground" becomes "Play"; the dock stacks, music above the nav and right-aligned.
- Touch: card descriptions show under titles; no tooltips.

## Architecture
**Home, in order:** hero with flying deck, My work (4 cards), About me (photo, bio, skills, experience, education, tool stack, button), journey globe, playable portfolio stage, contact (links, terminal card, copyright). Fixed layers: sky, dock, CV tab and drawer, chat buddy, tooltip.

**Pages:** `/`, `/about-me` (pinned video hero, experience, more about me, "gaming stack" disc cases), `/playground` (endless VHS shelf, filters, clamshell open view, photography link), case studies `/emr`, `/accenture`, `/smart-mirror` (the fourth is on Notion). Photography and every playground sub-project were not inspected. Case study and About pages were only partly inspected.

**Reusable:** work card, glass sheet, caption/heading block, button, chips, rows, dock, tooltip.
**Interactive:** sky, deck, nav, music, CV drawer, globe, stage, copy button, chat, tape shelf.

**Assets and libraries:** Google Fonts (Geist, Geist Mono, Righteous, Silkscreen); Lenis; Three.js r160; SomaFM streams; the owner's own videos, posters, portrait, avatar illustrations, cursor SVGs, robot sprite, globe texture, resume. The game also uses Cinzel and Crimson Pro.

**Asset policy for the recreation:** only open fonts and open-source libraries are reused. The owner's personal and creative assets are replaced with original ones. Land outlines come from Natural Earth (public domain, via `world-atlas`).
