# Gold Igloo — hackathon 17

Approved artwork: `public/landing/assets/projects/017-goldigloo-research-v4.png`.
Review source: `outputs/goldigloo-review/goldigloo-mascot-v4.png`.
Model: `public/landing/artifacts/goldigloo.js`.

The user approved the revised IceIgloo mascot before requesting the page integration and 3D implementation. The exhibit follows the approved investment-research desk composition: pale ice-block mascot on research reports, glass Shariah and impact panels, ivory shortlist folio, brass pen, and planted solar garden. Earlier dome/gate concepts are not used.

Product research: https://github.com/sayyidkhan/goldigloo (README, original index and about pages). The 2018 prototype uses business-activity screening, financial screening, and dividend purification, then sustainable-impact research. Its original stack includes HTML/CSS/JavaScript, Tableau, and Google Sheets. The page uses the repository's Gold Igloo name while retaining IceIgloo as the mascot reference. Company cards in the exhibit are illustrative.

## Interaction

The 24-second deterministic loop advances through business activity (0–4s), financial screening (4–8s), purification (8–12s), impact (12–17s), and shortlist (17–24s). Check marks appear progressively. A gold scan line visits each criterion, with impact check marks appearing in sequence. The shortlist cards lift 0.42 units, tilt toward the viewer and settle one by one; their badges follow the reveal. IceIgloo waves in greeting phrases, blinks and breathes, while the garden plants sway around their stem bases. The mascot's waving hand remains attached to the body. Manual stage controls hold the chosen research step while ambient motion continues; Auto-play resumes the timeline. All motion uses the shared elapsed clock, so pause and reduced-motion mode stop both story and ambient animation. Rotation, zoom, pause/resume and reset use the shared exhibit controls.

The model batches static geometry by material and preserves only animation roots. The ivory lettering uses canvas textures. The deep green studio backdrop is retained in both page themes for contrast. Reduced-motion behavior is inherited from the shared viewer.

## Validation

- `node --test scripts/tests/goldigloo.test.mjs`: 5 tests pass, covering stage gates, manual/auto modes, badges, attached hand, deterministic replay, finite geometry and bounds.
- `npx astro check && npx astro build`: succeeds; 97 pages built. Astro check: 0 errors, 0 warnings, 102 hints.
- Browser checked artwork/3D switching, shortlist selection, pause, zoom/reset, and light/dark appearance. No browser errors captured.
- Screenshots: `outputs/goldigloo-review/page-artwork.png`, `outputs/goldigloo-review/page-3d.png`.

Animation refinement verified on 2026-10-26: five Node tests cover sequential card lifting/settling, moving scan line, blink, continuous ambient motion during manual step selection, exact replay/pause determinism and scene bounds. Browser playback, selected-step motion and pause/resume checked.
