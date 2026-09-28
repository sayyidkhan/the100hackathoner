# Dark technical / Concept 03

Independent landing-page exploration for The 100 Hackathoner. Nothing in the main app is changed by this prototype.

## Run

`npm install` once, then `npm start` → http://127.0.0.1:18503

`npm run check` checks JavaScript syntax. No build step is required. Three.js is a pinned local dependency; the scene does not load runtime code from a CDN or another preview app.

## Direction

Version 3: The 100 Hackathoner / Journey Engine. A real WebGL archive stages three dimensional hackathon artifacts inside layered glass records: a home rising from a page, a faceted crow above a city, and a raised Borneo longhouse. Selecting a chapter changes the model, the typographic record, lighting colour, and genuine project details. The previous 2D orbit is removed.

Primary references reviewed: [Active Theory](https://activetheory.net/), [Linear](https://linear.app/), and [Resend](https://resend.com/). The direction combines immersive project presentation with restrained technical framing and actual-work storytelling; no assets or layouts are copied. The Dramatic skill informs cinematic contrast, clear hierarchy, accessible chapter buttons, and explicit motion controls.

Project artifacts are symbolic 3D models, not product screenshots. All titles, dates, awards and descriptions come from a local snapshot of the site's hackathon data (81 entries / 24 award-bearing entries). The judging image is an existing site asset. The page does not claim a speaking history.

## Review

- Select chapter 081, 080, or 079 to change the 3D artifact and the active-project details. The open-attempt action opens the correct real record.
- Artifact models are original symbolic artwork, not product screenshots. The page labels this explicitly. The three hero chapters are not repeated as another featured-card grid below.
- Browse all 81 attempts expands a searchable archive; All / Award-bearing / 2026 filters combine with the text search. Empty searches have explicit feedback.
- Project buttons open a native modal with real descriptions and source links.
- Escape, close button and outside click dismiss the modal; native dialog preserves keyboard focus.
- Responsive single-column layout below 720px; reduced-motion preference pauses ambient 3D movement by default and makes chapter changes immediate. A visible pause/play control works independently. Rendering skips offscreen and hidden tabs; device pixel ratio is capped at 1.75.
- If WebGL cannot start, an illustrated CSS record appears and the real chapter text and controls continue to work.
- About, full journey and essay links intentionally return to the main preview on port18481.
- Google Fonts are optional; sans-serif fallbacks work without network access.

The memoir manifesto, first judging experience, eventual-book ambition, and real field-note excerpts centre the content on The 100 Hackathoner. No speaking credentials or project-specific lessons are fabricated.

No check-in, push or merge has been performed for v3. The previous version remains available in checkpoint be88157.
