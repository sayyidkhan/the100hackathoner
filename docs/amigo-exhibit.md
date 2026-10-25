# Amigo — reciprocal conversation, saved vocabulary

## Source evidence

Reviewed `sayyidkhan/amigo`, master revision `9b78cca10a6443a4fdae0e07e021a7f309de9228` on 23 October 2026.

- [README](https://github.com/sayyidkhan/amigo/blob/9b78cca10a6443a4fdae0e07e021a7f309de9228/README.md): matching a person fluent in A and learning B with the reciprocal partner; translation into flashcards for offline use. Lists Agora video and SYSTRAN translation as intended stack.
- [Home screen](https://github.com/sayyidkhan/amigo/blob/9b78cca10a6443a4fdae0e07e021a7f309de9228/amigo/lib/screens/home.dart): profile image, Firestore-streamed word cards and Add to Word Bank dialog. Submission currently closes the dialog; this is a prototype, not evidence of a working end-to-end video/translation service.
- [Model](https://github.com/sayyidkhan/amigo/blob/9b78cca10a6443a4fdae0e07e021a7f309de9228/amigo/lib/model/model.dart): vocabulary `name` and `native_translation` fields.
- [Main](https://github.com/sayyidkhan/amigo/blob/9b78cca10a6443a4fdae0e07e021a7f309de9228/amigo/lib/main.dart): Amigo title, deep-orange theme, login prototype and success animation.

The exhibit interprets the intended exchange and word-bank concept. English/Spanish greetings and the apple example are illustrative. It does not claim live functionality or that an actual meeting occurred.

## Current direction — conversation café (v3, 25 October 2026)

The phone-and-globe composition was rejected as too similar after the v2 material pass. Version 3 replaces it with an architectural language-exchange café. The setting is a visual metaphor for reciprocal conversation, not a claim that the prototype provided an in-person café service.

Both artwork and 3D contain two terracotta/teal upholstered tub chairs, a shared walnut table with cups and an open notebook, an arched window, warm pendant lamp, olive tree, Hello/Hola speech bubbles and three bilingual word cards. A low terrazzo floor replaces the rectangular display plinth. The rear wall has a real arched opening; the chairs use continuous padded shells, rounded cushions and wooden legs.

The live model uses local deterministic wood, linen and stone textures. Static geometry is batched by material; complete moving assemblies preserve their lettering. Component framing points fit the architecture without padding for empty upper corners. No external runtime texture requests are needed.

## Motion

Deterministic 14-second sequence:
- 0–1s: rest.
- 1–4.6s: Hello lifts gently and a warm message travels to Hola.
- 5.2–8.6s: Hola lifts and the message returns.
- 8.8–13s: the three vocabulary cards rise with a slight stagger, then settle.
- All transforms return to their initial state at 14 seconds.

Animation is driven through `root.userData.animate(time)`, with `realTimeAnimation: true`. Existing pause, reduced-motion and keyboard rotation behavior remains with the shared renderer.

## Integration

- Artwork: `public/landing/assets/projects/026-amigo-cafe-v3.png`
- Model: `public/landing/artifacts/amigo.js`
- Materials: `public/landing/artifacts/amigo-surfaces.js`
- Browser capture: `outputs/amigo-review/amigo-cafe-v3-3d.png`
- Caption: “Pull up a chair. Exchange a greeting. Take a new word with you. Amigo reimagines reciprocal language practice.”
- Earlier v1/v2 image assets remain as historical iterations; the site imports v3.

## Artwork generation

Built-in imagegen, new image rather than an edit of the previous composition. Generated at 1536 × 1024 and copied into the repository.

Final prompt:

> Use case: stylized-concept. Asset: Amigo language-exchange portfolio artwork, landscape 3:2. Create a completely new premium miniature architectural scene: a welcoming conversation cafe, with NO phones and NO globe. Full diorama visible, frontal three-quarter view at modest elevation, dark petrol-teal studio background. One low circular cream terrazzo floor with thin terracotta edge. A curved ivory half-height cafe wall at rear, a large central dark teal inset arched window with fine walnut mullions, small uppercase AMIGO lettering above the window, delicate warm pendant lamp hanging from a thin curved brass stem. Two plush sculptural tub armchairs, left burnt orange, right deep teal, angled slightly toward each other; beautifully upholstered rounded backs and cushions, slender walnut legs. A round walnut pedestal cafe table between them with two tiny ivory ceramic espresso cups and an open notebook. Above the left chair floats a cream rounded speech bubble reading 'Hello', above the right one a cream rounded speech bubble reading 'Hola'; connected by one slim flowing coral ribbon arch carrying three small warm glowing dots. In front of the table, three upright little collectible vocabulary cards on a low ivory display ledge: middle card larger with a sculpted red apple icon and clear small 'apple / manzana' text; side cards slightly angled with simple sun and leaf icons. Small potted olive tree at rear right and a stack of two books near left chair. Handcrafted contemporary architectural maquette, soft tactile woven upholstery, real wood grain, fine terrazzo, satin brass details, beautiful soft shadows and warm afternoon lighting. Strong silhouette, airy clear composition, sophisticated contemporary editorial image, exquisite realistic physical detail. No humans, no huge device screens, no giant lettering, no globe, no phone, no floating island, no massive plinth, no UI. Warm terracotta and cream balanced with deep teal, restrained metal. The two conversation chairs and speech bubbles are the main focus; objects match a plausible interactive Three.js sculpture.

## Verification

`node --test scripts/tests/amigo.test.mjs`: two passing tests covering finite geometry and transforms, deterministic seeking, a seamless 14-second loop, reciprocal message direction, greeting order and word-card lift/reset. Production build and live browser review check integration, composition, text and gallery controls.
