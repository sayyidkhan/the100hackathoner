# Asterix — the Vibe Check Console

The original house-and-domino metaphor communicated a generic assessment pipeline. The replacement gives the project a recognisable coding identity and a dominant silhouette: a ceramic assessment dial, teal code terminal and brass-held question cards.

## Sources reviewed

- https://github.com/sayyidkhan/asterix — README read through authenticated GitHub CLI. Natural-language assessment generation, yes/no and multiple-choice items, exactly three outcome categories, semantic search. The logged-out browser returns 404.
- https://www.instagram.com/reel/DQV0xxIk9ab/ — caption read in Instagram. Describes hackathon #45 as a vibe-coding addiction assessment tool for reflecting on dependence on vibe-coding tools.

The three dial regions evoke the three-outcome structure. They are an artistic metaphor, not verified score thresholds or clinical categories. The animated needle is illustrative and does not calculate a user score.

## Implementation

- New versioned light and dark artwork: `public/landing/assets/projects/045-asterix-{light,dark}-v2.png`.
- Built-in image_gen generation and lighting edit; exact prompts recorded in `outputs/asterix-review/artwork-prompts.json`.
- Rebuilt `public/landing/artifacts/asterix.js`: bevelled ceramic, ribbed instrument housing, brass bezel, engraved tick marks, six-spoke asterisk, code terminal with keycaps and three choice cards.
- Uses the existing UV-preserving modelling kit and gallery controls. Static geometry batches by material; only needle, cursor and typography are preserved separately. No additional display turntable.
- Existing responsive WebP image pipeline, light/dark switching, lazy 3D loading, pause, keyboard rotation and reduced-motion behavior remain in use.

## Validation

- `npx astro check`: zero errors and zero warnings (existing repository hints remain).
- `npx astro build`: 97 pages built successfully; responsive WebP variants generated.
- Geometry sanity check: all vertex positions finite, 15 meshes in the headless model, 84,120 triangles.
- Browser review: artwork and 3D in both themes, keyboard rotation while paused, reset, pause/resume, mobile at 390px with no horizontal overflow. No browser console errors observed.
- Screenshots in `outputs/asterix-review/`; the mobile 3D stage keeps the landscape ratio to avoid excessive empty space.
