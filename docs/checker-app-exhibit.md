# Checker App exhibit · #18

## Evidence and scope

Reviewed 23 October 2026. Source repository tree revision: `ce1c789eb01b3d4a255acbb0137bfbec2566dab1`.

- [README](https://github.com/sayyidkhan/checker-app/blob/master/README.md): WSG HR Hackathon 2018, Team I Know You, a web application to help HR professionals craft better job advertisements.
- [Original interface](https://github.com/sayyidkhan/checker-app/blob/master/index.html): textarea, sample-job-ad button, clear button, “Show Me”, and two categories of highlighted wording.
- [Behavior](https://github.com/sayyidkhan/checker-app/blob/master/raw%20files/index.js): jQuery keyword lists highlight terms in coral (“omit”) and amber (“improve”). The demonstration result is fixed text; it is not an AI-generated rewrite, candidate ranking system or live compliance assessment.
- [Instagram post 1](https://www.instagram.com/p/Bngpa4igs3o/) and [post 2](https://www.instagram.com/p/BngqOFTggiI/) are linked by the local hackathon record. Both failed to load through web retrieval, so no claims are derived from their unseen contents.

The exhibit is a physical editorial-workbench interpretation. The clipboard, inspection lens, two review trays and sample-result card map directly to entering text, inspecting wording, the two flag categories, and the prototype's result. It avoids people, hiring statistics, AI motifs and implied screening outcomes.

## Deliverables

- Artwork: `public/landing/assets/projects/018-checker-app-v1.png` (1536 × 1024).
- Three.js model: `public/landing/artifacts/checker-app.js`.
- Source `createArtifact(T)` contract, static geometry batching with preserved moving groups and canvas labels.
- Warm `lrnmate` studio lighting; ivory paper, porous stone bump maps, brushed brass, subtle transparent lens and teal enamel.
- Caption: **Review job-ad wording, distinguish terms to omit from terms to improve, and explore a sample rewrite.**
- Alt: **A brass magnifier examines an ivory job-ad clipboard beside coral and amber review trays and a revised document.**

## Choreography

A deterministic 16-second cycle uses the shared gallery clock (`realTimeAnimation: true`), so pause, reset and reduced motion apply. No random motion, independent wall clocks or perpetual rotation.

1. 0–2 s: enter a job description; lens waits above the text.
2. 2–6 s: the lens moves down the text once; coral and amber markers appear as the inspection reaches their rows.
3. 6–9 s: hold both review categories so the meaning is readable.
4. 9–13 s: a single brass bead follows the connection to the sample-result sheet; the sample lines and review seal reveal.
5. 13–16 s: lens eases back, result clears, and the scene rests before the next draft.

The model exposes `{index, step, title, detail, tone}` in `userData.story` each phase and `cycleDuration: 16` for the gallery narration. The check medallion denotes the displayed editorial result; it does not assert legal compliance or an approved candidate.

## Generation record

Mode: built-in image generation, `transparent_background: false`. Original retained under `/Users/sayyid/.codex/generated_images/01a1645c-361a-7e71-9a00-5cb980876f65/exec-bf61b6b0-a536-488a-93b9-8a3e1021247d.png`; project copy above.

Prompt:

> Use case: stylized-concept. Create a premium photorealistic museum miniature sculpture for Checker App, a 2018 job-description editing prototype. Landscape 3:2, full sculpture visible, close three-quarter front camera slightly above eye level, deep warm charcoal studio backdrop, warm softbox left and a restrained gold rim light, realistic contact shadows. Match this precise composition for a real interactive 3D replica: wide rounded rectangular ivory travertine plinth; LEFT a large upright slightly backward-leaning ivory job-ad clipboard with satin brass metal clip, engraved abstract grey text rows, exactly one coral red highlighted word row and one amber highlighted word row. CENTER a large elegant upright magnifying glass on a brass pivot stand, bronze circular rim, subtly transparent clear glass, short diagonal dark teal handle reaching down right, overlapping the clipboard's inner edge. In front of it on the plinth, two shallow letter trays side by side, one with coral insert and one amber insert, with tiny paper slips. RIGHT a smaller upright revised-job-ad ivory document in a brass holder, grey engraved text lines and a small teal checkmark medallion. A fine curved brass connection between document areas suggests editing workflow. Front of plinth a small dark teal and brass nameplate with exact text 'CHECKER'. Optional small text 'JOB AD' on left document and 'REVIEW' on right document, no other words or numbers. Materials: tactile ivory paper grain, fine porous travertine, brushed aged brass, dark teal enamel, coral and amber wax-like highlight strips. Rich detail in layered paper edges, clip screws, polished lens rim, tray corners and bevels. Precise sculptural craftsmanship, attractive editorial composition. No people, no robots, no computer screen, no charts, no invented AI or hiring metrics, no cartoon toy look, no floating unrelated objects. It visualises reviewing wording, not automatic candidate selection.

## Validation

`node --test --test-name-pattern=checker-app scripts/tests/early-exhibits.test.mjs` passes. This checks finite attributes and animation transforms, working preserved motion, nonempty story fields, exact loop/reset and deterministic seeking.

Integration polish: the three exhibits share `planning-exhibit-surfaces.js`, a deterministic local limestone pore/albedo map. Phase captions sit below the canvas, leaving the sculpture unobscured. Shared pause/resume and reset controls remain in place.
