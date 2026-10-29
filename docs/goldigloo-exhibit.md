# Gold Igloo / IceIgloo — Nestash's evolution

## Context

Hackathon #17 is Gold Igloo (#Mosque-Tech Challenge 2018). The user identifies IceIgloo as Nestash's evolution, combining sustainability and Islamic finance. The original repository describes that combination and uses Ice Igloo in its introduction: https://github.com/sayyidkhan/goldigloo . Its historical prototype uses business-activity screening, financial screening and dividend purification alongside impact research. The original stack was HTML/CSS/JS, Tableau and Google Sheets.

The page retains the catalogue's Gold Igloo title and the previously approved ice-block mascot. The three landscapes and shortlist cards are illustrative research themes, not live company results or a compliance certification.

## Matched artwork and 3D

- Artwork: `public/landing/assets/projects/017-goldigloo-evolution-v5.png`
- Generated with the built-in image-generation tool from the previous approved mascot artwork and Nestash's artwork. Prompt: `outputs/goldigloo-evolution/artwork-prompt.txt`.
- Scene: `public/landing/artifacts/goldigloo.js`
- Shared landscape geometry: `public/landing/artifacts/nestash-landscapes.js`
- Static contact shading: `public/landing/assets/goldigloo-ao-v1.bin`

The composition keeps Nestash's navy leather, brass edges, limestone miniatures and warm studio lighting. IceIgloo sits on research journals at left. Two legible ivory research panels distinguish Islamic finance from sustainability. The right side reuses Nestash's detailed energy, reservoir and planted-city models, making the progression visible. Two brass paths converge on the shortlist folio. Each theme card gains paired research checks after screening completes.

The 3D uses actual geometry throughout; the artwork remains a higher-detail rendered interpretation. The base and framing accommodate the wider composition. Static geometry is batched by material; the 336 KB contact bake modifies indirect lighting only, retaining real-time shadows and animated surfaces.

## Animation

The deterministic 24-second loop follows business activity (0–4s), financial screening (4–8s), purification (8–12s), sustainability (12–17s) and shortlist (17–24s). Each criterion is scanned and checked. The sustainability platforms illuminate in row order. Separate signals leave the research panels only after the respective research stages complete; the shared junction lights when the shortlist stage begins. Cards lift and settle sequentially and show paired checks only after both research paths finish.

The mascot waves, blinks and breathes. Turbines turn and reservoir water moves on the same shared clock. Manual stage selection holds the story while ambient motion continues. Pause, reduced motion and visibility handling are inherited from the shared viewer. Rotation, zoom and reset remain available.

## Validation

`node --test scripts/tests/goldigloo.test.mjs` covers stage order, manual mode, deterministic replay, attached hand, blink, paused-clock stability, bounded geometry, sequential card movement, research-route gates, impact-platform highlights and loop reset. The scene stays under 130 meshes and 450,000 vertices in the headless geometry check.

Rebuild contact shading after geometry edits:

`node scripts/bake-growthguru-ao.mjs --model=goldigloo --rays=24 --distance=.38 --cell=.018`

The bake validates geometry signatures before applying, preventing stale shading after model changes. Final browser proof is saved under `outputs/goldigloo-evolution/`.
