# Stress Out, Bunny In — a meadow that settles

## Evidence

- [Project repository](https://github.com/sayyidkhan/art-x-tech-hackathon-2026), reviewed through its local checkout README and `app.js`.
- [Instagram post](https://www.instagram.com/p/DT49z3cE84y/): the January 24, 2026 Art x Tech hackathon, the “touch grass” theme, and a slide showing the sleepy ivory bunny with sage-green and sunset colors.
- Source behavior: curious, resistant, resting, and deep-calm states; interaction drains control energy, stillness restores calm. The source includes sunny, night, and wetlands palettes, breathing, ear movement, drifting clouds, and night fireflies.

## Direction

The bunny is the hero of a small mossy meadow. A compact crouching body, rounded brow and cheeks, two drooping pink-lined ears, glossy blinking eyes, connected front and hind legs, a soft matte surface, curved whiskers, and a breathing chest carry the emotion. Ferns, grasses, ivory daisies, apricot flowers, a jade pond, clouds, and warm sun provide a sheltered setting. The detached hand, clouds on sticks, saturated blue puddle, and black display pedestal are removed.

The core interaction is pickup and release. Drag the bunny to lift and carry it, then let go: gravity brings it back to the meadow with a small soft landing. A smaller bunny and an open meadow give this action room. Drops over the pond settle on the nearest reachable bank. Leaving the bunny alone gradually returns it to calm. The artwork shows a hand supporting the bunny above the meadow to communicate this action.

Space or Enter picks up/releases; arrow keys move the held bunny horizontally and vertically. Escape releases safely; Reset meadow restores its starting position. Drag the surrounding garden to rotate. Touch uses the same pointer interaction. Paused and reduced-motion releases settle immediately. Mode changes, window blur, and pointer cancellation release safely. The exhibit uses no camera or microphone.

## Implementation

- Artworks: `049-stress-bunny-dark-v3.png` and `049-stress-bunny-light-v3.png`; Astro produces responsive WebP variants. The v2 files preserve the earlier sleeping composition.
- Procedural 3D: `stress-bunny.js`, using the existing UV-preserving studio geometry batcher.
- Pickup and landing state machine: `stress-bunny-interaction.js`; pointer raycasting and keyboard controls are scoped to models exposing the manipulation API in `scene.js`.
- Ambient contact bake: `stress-bunny-surface.js` validates the geometry fingerprint before applying the local BAO2 asset. Direct shadows remain live.
- The movable bunny is excluded from static AO to prevent a ghost shadow after pickup. A moving soft contact shadow and live directional shadows ground it during motion.
- Scoped styling and studio lighting keep the scene legible in light and dark themes.
- The animation is derived from scene time. Breathing, ears, grass, cloud drift, water rings, and fireflies repeat deterministically over 120 seconds. Interaction restarts a bounded settling envelope without accumulation.

Rebake after geometry changes:

```sh
node scripts/bake-storybook-ao.mjs --model=bunny --rays=32 --distance=0.25 --cell=0.018
```

Run the geometry and behavior checks:

```sh
node outputs/stress-bunny-review/check.mjs
```

The complete generation prompts are in `outputs/stress-bunny-review/art-direction.md`.

## Artwork-matching 3D refinement

The updated sculpture replaces the horizontal loaf silhouette with a compact lop rabbit. Eye animation lives on retained groups so geometry batching cannot discard it. The earlier fiber treatment was removed because it read as speckles at normal viewing distance. The terrain now has irregular weathered rocks, mottled turf, thousands of fine grass blades, shorter fern fronds, and scattered flower clusters. Static flowers and lawn geometry are merged by material to keep draw calls bounded. Lighting uses a warmer rim and softer fill to retain facial shape.

The original artwork remains the visual reference; it is not replaced to disguise differences in the real-time model. Pickup, drop, bank landing, reduced motion, and reset behavior remain supported.

## Continuous rabbit sculpture

`bunny-sculpt.js` creates and caches smooth implicit surfaces with continuous gradient normals. The body joins the haunches, chest, and short forelegs; the head joins the brow, cheeks, and muzzle. Feet blend into their ankles. The tail is centered on the back. Broad, curled lop ears use stable cross-sections with inset pink panels. Glossy eyes stay open between short blinks, and the small rounded triangular nose sits above the muzzle surface.

Front, side, and rear views were reviewed in the browser, alongside pickup and release. Face visibility checks prevent eyes from being hidden inside the head after proportion changes. The full exhibit remains within the existing 300,000-triangle budget.

## Crouching proportions

The latest pass uses a lower, weight-bearing four-paw pose with fuller hindquarters, a smaller tapered head, and a short divided muzzle. Eyes and nose are attached using ray intersections against the head surface, rather than hard-coded depth guesses. Narrower ears curve from their roots before dropping, with slightly different folds on each side. The default three-quarter orientation exposes the body silhouette. The garden and artwork remain unchanged.
