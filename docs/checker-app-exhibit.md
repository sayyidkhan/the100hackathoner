# Checker App exhibit · #18

## Evidence and scope

Source reviewed 23 October 2026; exhibit rebuilt 25 October 2026. Source repository tree revision: `ce1c789eb01b3d4a255acbb0137bfbec2566dab1`.

- [README](https://github.com/sayyidkhan/checker-app/blob/master/README.md): WSG HR Hackathon 2018, Team I Know You, a web application to help HR professionals craft better job advertisements.
- [Original interface](https://github.com/sayyidkhan/checker-app/blob/master/index.html): textarea, sample-job-ad button, clear button, “Show Me”, and two categories of highlighted wording.
- [Behavior](https://github.com/sayyidkhan/checker-app/blob/master/raw%20files/index.js): jQuery keyword lists highlight terms in coral (“omit”) and amber (“improve”). The demonstration result is fixed text; it is not an AI-generated rewrite, candidate ranking system or live compliance assessment.
- [Instagram post 1](https://www.instagram.com/p/Bngpa4igs3o/) and [post 2](https://www.instagram.com/p/BngqOFTggiI/) are linked by the local hackathon record. Both failed to load through web retrieval, so no claims are derived from their unseen contents.

The exhibit is a physical editorial-workbench interpretation. The clipboard, inspection lens, two review trays and sample-result card map directly to entering text, inspecting wording, the two flag categories, and the prototype's result. It avoids people, hiring statistics, AI motifs and implied screening outcomes.

## Version 2 rebuild

The original scene was too abstract: grey bars replaced readable wording, the result page was blank, and the magnifier inspected empty space. Version 2 rebuilds this as a specific editorial comparison. A teal folio holds the readable original draft; the enlarged lens view samples the **same document texture** below it. Coral flags `female`; amber flags `Pleasant personality`. The two physical annotation cards label the actions **OMIT** and **IMPROVE**, and a similarly scaled result sheet shows wording from the original demo. The displayed draft is an authored exhibit example using terms in the original source lists; it is not a screenshot of the original interface.

Materials now distinguish stitched leather, limestone, a walnut reveal, brushed metal and warm paper. Separate paper leaves, a curled corner seam, clip springs, folded clip lips, slotted screws, jointed magnifier support, note-card paperclips and an editor’s pencil add construction detail and scale. Text remains legible through local canvas textures.

## Deliverables

- Artwork: `public/landing/assets/projects/018-checker-app-v2.png` (1536 × 1024).
- Three.js model: `public/landing/artifacts/checker-app.js`.
- Local paper, document, annotation and wood maps: `public/landing/artifacts/checker-surfaces.js`.
- Source `createArtifact(T)` contract, static geometry batching with preserved moving groups and canvas labels.
- Warm `lrnmate` studio lighting; ivory paper, porous stone bump maps, brushed brass, subtle transparent lens and teal enamel.
- Caption: **Review job-ad wording, distinguish terms to omit from terms to improve, and explore a sample rewrite.**
- Alt: **An editorial desk with original and revised job-ad sheets, a brass magnifier, and coral OMIT and amber IMPROVE annotation cards.**

## Choreography

A deterministic 20-second cycle uses the shared gallery clock (`realTimeAnimation: true`). It exposes `{index, step, title, detail, tone}` as `userData.story` and `cycleDuration: 20`.

1. 0–2 s: read the first draft; the two action headings and a faint sample result are already present.
2. 2–7 s: an articulated magnifier tracks the actual `female` and `Pleasant personality` phrases. Its enlarged paper view tracks the original page UV coordinates, with no per-frame canvas redraw.
3. 7–11 s: hold both coloured underlines and expose the matching OMIT / IMPROVE annotation details.
4. 11–16 s: uncover the sample rewrite: relevant duties and clearer requirements. It remains an illustrative fixed rewrite from the prototype.
5. 16–20 s: the magnifier eases back and paper masks reset, with a quiet interval before the loop repeats.

Manual gallery phase selection uses `setStep(index, elapsed)` snapshots at 0, 4, 9, 14 and 18 seconds. Passing `null` resumes auto-play continuously from the selected snapshot.

All joint transforms and reveal states derive directly from time. The lens remains attached to two brass support links, feet and desk props remain fixed, and no unrelated objects wobble. Pause, reset and reduced motion use the shared gallery clock.

## Version 2 generation record

Mode: built-in image generation, `transparent_background: false`, using the actual revised 3D scene as a composition reference. Reference: `outputs/exhibits-18-20-v2/checker-reference.png`, manually held at 14 seconds. Original retained at `/Users/sayyid/.codex/generated_images/01a1645c-361a-7e71-9a00-5cb980876f65/exec-a967079a-06c7-46e1-b024-38b2da9aca54.png`; project copy: `public/landing/assets/projects/018-checker-app-v2.png`. The v1 artwork remains preserved.

Prompt:

> Use case: precise-object-edit. Create the polished landscape 3:2 artwork for this Checker App museum exhibit, using the supplied screenshot as an exact geometry/composition reference. Remove all website chrome, titles outside the exhibit, tabs, controls, borders, scrollbar and captions. Show only the complete miniature editorial workbench on a warm dark brown studio background. Preserve the actual object count, proportions, arrangement and design: wide low ivory limestone plinth with thin walnut underside and small front teal/brass CHECKER plaque; dark muted teal leather desktop mat; large left upright clipped original draft on teal folio; slightly smaller right upright revised document in wood/brass holder; two small tilted annotation cards in front; mounted brass magnifying glass over left document's lower-mid phrase with two brass support arms; slim teal pencil lying at right. The magnifier must have an open brass ring and show an enlarged portion of the same paper behind it, centred on a complete word 'personality'. Preserve these exact text anchors: left sheet 'Administrative assistant'; right sheet 'A clearer brief.'; left annotation 'OMIT' with 'female'; right annotation 'IMPROVE' with 'Pleasant personality'; plaque 'CHECKER'. Other document copy should remain discreet typeset lines matching the reference, not new content or invented scores. Improve only rendering polish: tactile warm paper grain and layered sheet edges, fine brushed brass, subtle leather texture, soft realistic contact shadows, warm directional light from top left and restrained fill. Keep realistic manufactured proportions, readable dark ink, and the same simple sculptural geometry as the reference. This is a high-quality render of the existing interactive 3D model, not a radically redesigned fantasy illustration. Preserve full plinth and generous margins, front three-quarter camera slightly above desk, no extra objects, no people, no robotics, no new panels or icons, no glow, no floating objects, no added ornamental details.

The generated artwork is an illustration, not the source interface. Exact wording and interaction semantics are maintained in the authored 3D document textures; fine print in the generated image is decorative. Composition and primary text anchors were visually reviewed against the live scene.

## Original version 1 generation record

Mode: built-in image generation, `transparent_background: false`. Original retained under `/Users/sayyid/.codex/generated_images/01a1645c-361a-7e71-9a00-5cb980876f65/exec-bf61b6b0-a536-488a-93b9-8a3e1021247d.png`; project copy above.

Prompt:

> Use case: stylized-concept. Create a premium photorealistic museum miniature sculpture for Checker App, a 2018 job-description editing prototype. Landscape 3:2, full sculpture visible, close three-quarter front camera slightly above eye level, deep warm charcoal studio backdrop, warm softbox left and a restrained gold rim light, realistic contact shadows. Match this precise composition for a real interactive 3D replica: wide rounded rectangular ivory travertine plinth; LEFT a large upright slightly backward-leaning ivory job-ad clipboard with satin brass metal clip, engraved abstract grey text rows, exactly one coral red highlighted word row and one amber highlighted word row. CENTER a large elegant upright magnifying glass on a brass pivot stand, bronze circular rim, subtly transparent clear glass, short diagonal dark teal handle reaching down right, overlapping the clipboard's inner edge. In front of it on the plinth, two shallow letter trays side by side, one with coral insert and one amber insert, with tiny paper slips. RIGHT a smaller upright revised-job-ad ivory document in a brass holder, grey engraved text lines and a small teal checkmark medallion. A fine curved brass connection between document areas suggests editing workflow. Front of plinth a small dark teal and brass nameplate with exact text 'CHECKER'. Optional small text 'JOB AD' on left document and 'REVIEW' on right document, no other words or numbers. Materials: tactile ivory paper grain, fine porous travertine, brushed aged brass, dark teal enamel, coral and amber wax-like highlight strips. Rich detail in layered paper edges, clip screws, polished lens rim, tray corners and bevels. Precise sculptural craftsmanship, attractive editorial composition. No people, no robots, no computer screen, no charts, no invented AI or hiring metrics, no cartoon toy look, no floating unrelated objects. It visualises reviewing wording, not automatic candidate selection.

## Validation

`node --test --test-name-pattern=checker-app scripts/tests/exhibits-18-20.test.mjs` passes. This checks finite attributes and animation transforms, working preserved motion, nonempty story fields, exact loop/reset and deterministic seeking. A separate in-memory assertion also verifies manual phase selection remains still as wall time advances and resumes without a pose jump.

Integration polish: the three exhibits share `planning-exhibit-surfaces.js`, a deterministic local limestone pore/albedo map. Phase captions sit below the canvas, leaving the sculpture unobscured. Shared pause/resume and reset controls remain in place.
