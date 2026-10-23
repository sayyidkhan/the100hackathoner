# Amigo — reciprocal conversation, saved vocabulary

## Source evidence

Reviewed `sayyidkhan/amigo`, master revision `9b78cca10a6443a4fdae0e07e021a7f309de9228` on 23 October 2026.

- [README](https://github.com/sayyidkhan/amigo/blob/9b78cca10a6443a4fdae0e07e021a7f309de9228/README.md): matching a person fluent in A and learning B with the reciprocal partner; translation into flashcards for offline use. Lists Agora video and SYSTRAN translation as intended stack.
- [Home screen](https://github.com/sayyidkhan/amigo/blob/9b78cca10a6443a4fdae0e07e021a7f309de9228/amigo/lib/screens/home.dart): profile image, Firestore-streamed word cards and Add to Word Bank dialog. Submission currently closes the dialog; this is a prototype, not evidence of a working end-to-end video/translation service.
- [Model](https://github.com/sayyidkhan/amigo/blob/9b78cca10a6443a4fdae0e07e021a7f309de9228/amigo/lib/model/model.dart): vocabulary `name` and `native_translation` fields.
- [Main](https://github.com/sayyidkhan/amigo/blob/9b78cca10a6443a4fdae0e07e021a7f309de9228/amigo/lib/main.dart): Amigo title, deep-orange theme, login prototype and success animation.

The exhibit interprets the intended exchange and word-bank concept. English/Spanish greetings and the apple example are illustrative. It does not claim live functionality or that an actual meeting occurred.

## Visual composition

Paired rust and teal conversation terminals flank a brass-mounted globe. Thin brass paths carry reciprocal message beads. Phrasebooks, a pencil and a listening badge occupy the front left; a walnut vocabulary drawer occupies the front right. Both artwork and 3D use the same ivory stone plinth, brass seam and AMIGO nameplate. Detailed object craftsmanship avoids placeholder people.

The globe uses [Natural Earth 1:110m land boundaries](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson), public-domain geographic data, rounded to 0.01 degrees and stored locally in `amigo-land.js`. The texture is generated deterministically at creation; no remote runtime requests. The map is illustrative, not for navigation.

## Motion

14-second deterministic loop:

- 0–1s: calm composition.
- 1–4.2s: rust greeting travels left to right; only its source waveform moves.
- 4.2–5.2s: listening pause.
- 5.2–8.4s: teal reply returns right to left; only its source waveform moves.
- 8.8–12.7s: front bilingual flashcard rises for inspection and settles back into its drawer.
- Final rest before repeating.

Animation receives elapsed time through `root.userData.animate(time)` with `realTimeAnimation: true`; gallery pause/reduced-motion behavior remains owned by the existing renderer. No independent timers, random frame changes, camera orbit or perpetual object wobble. Static components are batched by material. Approximately 198k vertices, 47 geometry meshes before browser-only lettering.

## Integration

- Artwork: `/landing/assets/projects/026-amigo-v1.png`
- Model: `/landing/artifacts/amigo.js`
- Suggested alt: `A tactile Amigo language-exchange diorama with rust and teal conversation terminals, a brass globe, phrasebooks and a bilingual vocabulary drawer.`
- Suggested caption: `A conversation becomes a word worth remembering. Amigo explores reciprocal language practice and a translated word bank.`
- Browser capture: `outputs/amigo-review/amigo-3d.png`
- Test: `node --test scripts/tests/amigo.test.mjs`

## Artwork generation

Built-in imagegen tool, not CLI. Generated 1536 × 1024 PNG saved into the repository; original generated asset retained.

Final prompt:

> Use case: stylized-concept. Create one exquisite photoreal studio photograph of a tangible handcrafted miniature diorama for Amigo, a language exchange app. Landscape 3:2 composition, the entire object fills 85% of frame, elevated frontal three-quarter view, warm dark espresso background, soft amber key light from upper left and subtle cool rim. Exact composition to build as real interactive 3D: low wide rounded rectangular warm ivory travertine plinth with thin brass inlay, a small front dark nameplate reading 'AMIGO'. On left stands a tall rounded rust-orange smartphone-shaped conversation terminal, on right a matching deep teal conversation terminal, both inward-angled but facing camera, on small brass cradles. Each terminal has an ivory inset screen with a restrained embossed sound waveform, a circular camera dot and tiny etched speaker grille, plus one small cream chat bubble. Left bubble says 'Hello', right says 'Hola'. Between them is a detailed dark teal tabletop globe about two thirds the phone height, finely etched brass longitude and latitude grid and flat warm gold continents, held in tilted brass meridian ring and brass pedestal. Two thin brass curved communication arcs pass over the globe between terminals, with one rust enamel message bead and one teal enamel message bead. Foreground right: a small walnut word-bank card tray holding five cream index cards with brass tabs; front card has a simple red apple relief and small labels 'apple' and 'manzana'. Foreground left: a short stack of two linen-bound phrasebooks, a mechanical pencil and small round brass listening badge. Tactile microtexture, refined bevels, believable fine craft, deep contact shadows, warm ivory, rust orange, petroleum teal and brushed brass palette. No humans, no toys, no floating screens, no oversized random labels, no UI screenshot, no magical smoke. The sculptural exhibit communicates conversation becoming a saved vocabulary card. Keep it plausible to reproduce in detailed Three.js geometry.

## Verification

Node test checks finite geometry/transforms, correct exhibit ID, time-driven animation, distinct greeting/reply/card stages, seek determinism and seamless 14-second loop. Isolated Chrome render checked composition, message position, depth of lettering and the globe texture. No runtime page errors during that render. Main app integration/build is verified by the coordinating agent.
