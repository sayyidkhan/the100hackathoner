# Nestash — impact research studio

## Context and provenance

Hackathon #12 is recorded as Nestash, an impact-investment search tool for the 2017 NTU Intuition Hackathon, with Blackrock listed as client. The catalogue has no GitHub repository URL. The user explicitly identifies Nestash as the predecessor to Iceigloo; the exhibit retains Nestash's own name and does not import the later project's Shariah-screening workflow or mascot.

The original Drive folder was inspected:
https://drive.google.com/drive/u/0/folders/0BzUcUD5nonwBU0RxbjNJNjk2TDQ?resourcekey=0-MHJwzuOzUoBdQRq20cMFFg

It contains datasets, a prototype folder, Blackrock API notes, reference links and Nestash branding. The prototype folder contains fintech.zip; the Drive archive preview exposes a Bootstrap HTML/CSS/JS site structure. The contents of index.html and the Google Docs were not successfully readable in this session. The exhibit is therefore explicitly an illustrative interpretation, not a verified reconstruction of the original interface or investment-selection algorithm. Clean energy, water and sustainable cities are illustrative research themes. There are no company recommendations, fabricated returns or investment scores.

## Art and model

- Artwork: `public/landing/assets/projects/012-nestash-impact-v1.png`
- Built-in image generation; complete prompt: `outputs/nestash-review/artwork-prompt.txt`
- Three.js scene: `public/landing/artifacts/nestash.js`
- Landscape geometry: `public/landing/artifacts/nestash-landscapes.js`
- Contact shading: `public/landing/assets/nestash-ao-v1.bin`
- Dashboard and deterministic timeline: `public/landing/artifacts/nestash-screen.js`

The artwork and model share a navy-and-brass research desk, ivory tablet, three circular landscape platforms, solar panels and turbines, reservoir and sluice, planted buildings, notebook, pen and research shortlist. Bevelled surfaces, stone relief, fabric bump maps, fine solar cells, foliage and architectural details support the miniature aesthetic. Lighting is scoped to the Nestash scene. The existing viewer handles rotation, zoom, disposal, off-screen rendering and reduced motion.

## Animation

24-second sequence: explore themes (0–5s), type the clean-energy search (5–11s), inspect the matching theme (11–17s), reveal the research shortlist (17–24s). The selection ring appears after the search has advanced; the card appears only in the final stage and lowers before restart. Turbines turn, reservoir ripples move, and signals travel from the console to the landscape on the same clock. The public exhibit follows the compact #60 card layout: artwork/3D toggle, reset, pause and a short caption, without step buttons, extra zoom buttons or a narrative panel. The model retains deterministic stage support internally. Global pause and reduced motion freeze the shared clock.

## Validation

`node --test scripts/tests/nestash.test.mjs` checks causal order, dashboard/story synchronization, loop reset, deterministic seeks, manual-stage hold/resume, finite geometry and model budgets. `npm run build` passed (97 pages). Browser review covered artwork, 3D, stage selection, auto-play and pause/resume; no runtime warnings or errors were reported.

## Landscape refinement

Rebuilt the three miniatures with uneven terrain, a curved maintenance road, six individually detailed solar modules, tapered turbine blades, a raised forest reservoir and animated spillway, and recessed city glazing with floor slabs, mullions and planted terraces. Fine foliage clusters and rocks replace the earlier rounded tree masses. Leather grain, honed stone, restrained brass and scoped warm studio lighting bring the interactive view closer to the artwork. Camera framing fits the actual component bounds without reserving unused auto-orbit space.

Static contact shading is baked with `node scripts/bake-growthguru-ao.mjs --model=nestash --rays=24 --distance=.40 --cell=.018`. The 366 KB bake affects indirect light only, leaving animated turbines and water under live lighting. All 26 geometry signatures were verified against the generated cache. Tests remain within 85 meshes / 250,000 triangles. The final refinement passed all three animation/geometry tests and the 97-page production build; browser review reported no warnings or errors.
