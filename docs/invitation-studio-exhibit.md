# Project 041 — The Invitation Studio

## Evidence and interpretation

- [Instagram reflection](https://www.instagram.com/p/DO0q1KYky3H/), read in the browser: the lesson from hackathon #41 was strengthening the title, description, image and CTA to persuade people to attend an event.
- [Prompt Alchemist source](https://github.com/sayyidkhan/prompt-alchemist-beta/blob/HEAD/index.html), read using authenticated GitHub CLI: community learning, prompt playbooks, AI classes, advertising campaigns, lead generation, and a NAS.IO event invitation for “AI Without AI”.

The earlier campfire scene overemphasised the community theme and missed the funnel-building lesson. The new sculpture depicts campaign creative → event invitation → community gathering. The auditorium and sun-and-dune artwork are illustrative metaphors, not a reconstruction of the actual venue or campaign. No conversion figures or attendance claims are made.

## Assets and implementation

- `public/landing/assets/projects/041-invitation-light-v2.png`
- `public/landing/assets/projects/041-invitation-dark-v2.png`
- Built-in image_gen; exact generation and lighting-edit prompts in `outputs/invitation-studio-review/artwork-prompts.json`.
- `public/landing/artifacts/prompt-alchemist.js`: a sculpted event page, relief image, real CTA typography, layered campaign cards, gold path, twelve volumetric upholstered armchairs, tiered auditorium, microphone and brass railing.
- `public/landing/artifacts/invitation-surface.js`: geometry-validated ambient contact shading. The asset is rejected if counts or hashes differ. Missing/stale data falls back to live lighting.
- `public/landing/assets/invitation-ao-v1.bin` and `.json`: 48-ray baked contact occlusion, approximately 776 KB. Rebuild with `node scripts/bake-storybook-ao.mjs --model=invitation --rays=48`.
- A dedicated invitation lighting profile in `scene.js`, responsive stage CSS, three-step funnel legend and updated project caption.
- Static meshes batch by material; typography and the soft floor footprint retain their UVs. Camera framing excludes the empty shadow margin. Existing lazy loading, reduced motion, pause, reset and keyboard controls remain in place.

## Verification

- Astro check: zero errors and zero warnings; existing repository hints remain.
- Production build: passed (97 pages).
- Geometry validation: finite positions, 21 meshes, 256,232 triangles.
- Actual bake loader validated against the generated model: status `ready`; all vertex counts and geometry hashes matched.
- Browser: both themes, artwork/3D modes, keyboard rotation, pause and reset. Mobile at 390px: no horizontal overflow.
- Screenshot evidence in `outputs/invitation-studio-review/`.
