# NeuroSurge exhibit — hackathon 25

## Evidence and interpretation

Inspected the actual [NeuroSurge repository](https://github.com/sayyidkhan/neurosurge), `master` tree revision `b2645bfc4addbd1f6f1ef5b0aff8ddd9ee01f581`, through the connected GitHub tool on 23 October 2026.

- [Home screen](https://github.com/sayyidkhan/neurosurge/blob/master/src/pages/home/home.html): Level 1 remembers a grocery list; Level 2 learns and recalls a recipe list.
- [Recipe learning](https://github.com/sayyidkhan/neurosurge/blob/master/src/pages/learning-level2/learning-level2.html): roasted asparagus and mushrooms, olive oil and rosemary.
- [Mnemonic data](https://github.com/sayyidkhan/neurosurge/blob/master/src/services/mock-quizqns.ts): concrete food cues include avocado, blueberries, broccoli, mushrooms and rosemary. The exhibit represents the associative exercise, without reproducing inappropriate or medically misleading phrases in the old demo data.
- [Quiz logic](https://github.com/sayyidkhan/neurosurge/blob/master/src/pages/quiz-level2/quiz-level2.ts): compares typed answers with item names without case sensitivity and stores a true/false state. This is a prototype learning/recall interaction, not proof of memory improvement or prevention of disease.
- [Recorded Instagram post](https://www.instagram.com/p/Bxo5Ka1FLrR/) could not be retrieved (web cache miss). No unseen post content was inferred.

The miniature is an interpretive exhibit of this source flow, not a screenshot or a recreation of a clinical product.

## Shared artwork and 3D composition

Walnut grocery cabinet at left, three cream botanical mnemonic cards in the middle, cream oven and copper skillet at right. Produce references are blueberry, avocado and broccoli. The three cards and matching foreground recall tiles depict asparagus, mushroom and rosemary. An olive oil bottle completes the documented recipe. Brass joins, travertine plinth, warm ivory ceramics and restrained blue markers tie the objects together.

Artwork: `public/landing/assets/projects/025-neurosurge-v1.png` (1536 × 1024).

Interactive model: `public/landing/artifacts/neurosurge.js`.

Deterministic color textures: `public/landing/artifacts/neurosurge-surfaces.js`.

Textures are generated locally as small DataTextures, so the exhibit has no external runtime asset dependency. Botanical geometry includes asparagus tips, mushroom cap undersides and radial gills, and individual rosemary leaves. Cabinet shelves, oven handle, knobs, inset window, cookware, food bowl, bottle, label planes and beveled trim remain full 3D geometry. The renderer reuses the existing warm `lrnmate` studio profile; this change does not edit shared renderer settings.

## Animation

The scene uses the gallery's elapsed time, pause, inactive and reduced-motion behavior. No independent timers are started.

A deterministic 22-second loop:

1. 0–6 seconds: the three cues are introduced in order with a small lift and a blue marker emphasis.
2. 6–7.2 seconds: cards turn over, concealing their ingredient faces and showing a recall prompt.
3. 8–13 seconds: the matching foreground recall checks appear sequentially.
4. 14–17 seconds: three markers travel along the brass path toward the recipe, after recall is complete.
5. 17–18.4 seconds: cards ease back and checks clear.
6. 18.4–22 seconds: quiet rest before the next cycle.

This is a conceptual animation, not a claim that the original app used automated scoring of visible 3D items.

## Integration fields

- model: `/landing/artifacts/neurosurge.js`
- artwork: `/landing/assets/projects/025-neurosurge-v1.png`
- caption: “Grocery cues become memorable associations, then recipe ingredients are recalled in a mnemonic-learning prototype.”
- alt: “A miniature mnemonic kitchen with a walnut grocery cabinet, asparagus, mushroom and rosemary cards, recall tiles and a copper pan on a cream oven.”

## Validation

`node --test scripts/tests/neurosurge.test.mjs` passes. Checks verify finite geometry, deterministic time seeking, exact loop reset, concealed cues before recall, ordered recall, and feedback only after retrieval. `node --check public/landing/artifacts/neurosurge.js` passes. The generated artwork was visually inspected. Browser rendering was not inspected in this worker: local browser use is disabled in Work settings, and Playwright has no installed browser executable.

## Artwork generation

Generated with the built-in imagegen tool (no CLI/API fallback), then copied from its generated-images directory into the project path above. Final prompt:

> Use case: stylized-concept. Asset: landscape hero artwork for NeuroSurge, a 2019 mnemonic-learning hackathon prototype with grocery-list learning and recipe recall. Create one beautifully crafted, photoreal miniature exhibition sculpture, 3:2 landscape composition, warm dark charcoal studio backdrop, camera looking from slightly above and front, entire sculpture visible. Exact composition to also be recreated as interactive 3D: wide rounded rectangular ivory travertine plinth with brass rim and small dark front plaque reading 'NeuroSurge'. On the left, a low finely grained walnut grocery cabinet with two open shelves and brass edge trim; upper shelf a ceramic bowl of blueberries, avocado halves with brown pits and broccoli; lower shelf a folded ivory grocery list and two small glass jars. In the middle, three substantial upright ivory cards in brass feet, staggered gently back to front, each with an engraved ingredient title: 'ASPARAGUS', 'MUSHROOM', 'ROSEMARY'. Each card has a detailed sculpted botanical bas-relief of that ingredient. A fine curved brass rail with three small blue beads links the cards to the right. On the right, a compact vintage cream oven with a dark glazed window and brass knobs, a warm copper skillet on top containing asparagus and mushrooms, beside an olive-green oil bottle and a delicate sprig of rosemary. In foreground three small square recall tiles with asparagus, mushroom and rosemary reliefs, the final tile marked with a subtle blue check. Include paper edges, bevels, ceramic glaze, fine travertine pores, realistic brushed brass, walnut grain and copper patina. Palette ivory, olive green, walnut brown, muted cobalt blue, copper. Warm cinematic key light from upper left, soft shadows and ambient occlusion, restrained premium museum product photography, very high material fidelity, everything solid and physically buildable. No people, no brains, no neon, no floating abstract shapes, no medical imagery, no medical claims, no extra text, no interface outside the sculpture.
