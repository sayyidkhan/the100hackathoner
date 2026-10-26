# Fasight exhibit (#19)

## Source evidence

Reviewed 23 October 2026:

- https://github.com/sayyidkhan/fasight
- https://github.com/sayyidkhan/fasight/blob/master/README.md — “digital will planning made easy”, explicitly the version without a webserver.
- https://github.com/sayyidkhan/fasight/blob/master/account_page.html — four tabs: Personal Info, Distribution of Assets, Guarantors, Review digital will. Personal info includes ID document upload buttons; the assets list is for next of kin; the guarantor form includes relationship. The review tab contains placeholder copy.
- https://github.com/sayyidkhan/fasight/blob/master/index.html — presentation of free/open-source legacy planning and examples of assets such as real estate. Its proposed image recognition, biometric signing and release of funds are promotional concepts, not verified working implementation. This exhibit does not depict them as shipped functionality or claim legal validity.
- https://www.instagram.com/p/Bo6FW7zg0Zj/ — linked in the local hackathon record; public fetch unavailable. No image or caption facts inferred from it.

The repository files were read directly through GitHub API and raw URLs. The original application was not executed. This exhibit interprets the planning flow rather than claiming to reproduce a production financial service.

## Deliverables

- Artwork: `public/landing/assets/projects/019-fasight-v1.png`
- Interactive sculpture: `public/landing/artifacts/fasight.js`
- Caption: Personal details, assets and trusted people, brought together in a digital will-planning prototype.
- Alt: Fasight planning sculpture with an ivory ledger, miniature home and coin stacks, identity card, and a brass family tree on a limestone plinth.

## Shared art direction

One wide limestone plinth, dark petrol teal asset tray on the left, miniature ivory house, brass coin stacks and keepsake box. A large open paper ledger with teal leather cover and brass rings occupies the center. At right is a brass branching tree bearing five embossed ivory profile medallions. An identity card and fountain pen sit in front. Brass path inlays and a small Fasight plaque complete the composition. Stone/paper micro-bump, leather grain, bevelled edges and brushed brass create the tactile finish.

The cameo portraits symbolize relationships and are not live figures. No people walk aimlessly. The house, ledger, tree, pen and all cameo medallions stay physically anchored.

## Animation — revised 26 October 2026

Twenty-second deterministic loop using the shared elapsed-time clock and pause/reduced-motion support. Each five-second chapter has a visible physical action:

1. Personal details: a light trail travels from the identity card to the ledger; the pen lifts from its cradle and inks the three checklist rules.
2. Assets: the asset-tray perimeter and house windows illuminate while the ledger records the asset categories.
3. Trusted people: a light trail leaves the ledger for the tree, then five luminous branch paths draw from the roots toward their portrait medallions. Each portrait rim lights in sequence.
4. Draft review: the gathered connections remain lit while the book shows the overview. This is an illustrative draft, not a completed or legally valid will.

In every chapter the pen approaches for 0.8 seconds, fills the rows from 1–3.7 seconds, lifts between rules, then returns to its cradle by 4.35 seconds. A subdivided sheet curls and turns around the binding during 4.35–5 seconds. Ink and nib share one deterministic timeline (`fasightMoment`); no independent timers. Paper geometry updates only while the turn amount changes, and the 1024px canvas redraws at quantized ink increments rather than on every frame. No legal signature or approval seal is animated.

The new four chapter buttons call `setStep`. Manual inspection holds its frame; autoplay resumes continuously. Pause, reset and keyboard orbit remain shared with the gallery.

## 3D refinement — revised 26 October 2026

The ledger is larger and now has written chapter pages, a navigation checklist, paper shading, leather stitching, visible page edges and a bookmark. A brass-and-teal pen has a modelled nib, barrel rings, clip and a physical cradle. The asset tray is outlined instead of covered with a solid highlight. House windows and branch paths have a restrained emissive finish. A dedicated forest-and-amber studio profile improves separation and contact shadows. Framing uses component bounds; the limestone base sits on the studio floor. The existing artwork remains unchanged because this request targets the live 3D and its animation.

## Artwork generation

Built-in image generation tool (not CLI). Generated source:
`/Users/sayyid/.codex/generated_images/01a1645c-5b77-7a72-94cf-30593d7b4cf3/exec-bcad07bc-074f-4d27-bc8a-cbf7008ed94c.png`.

Prompt:

> Use case: stylized-concept. Create a luxurious museum miniature sculpture photographed in a warm dark studio, landscape 3:2 image, for Fasight, an open-source digital will PLANNING prototype. Precisely compose this sculptural still life so it can be reproduced as an interactive 3D model: on one wide softly bevelled warm limestone plinth, left third a low dark petrol teal rectangular asset tray with a finely crafted small ivory gabled house, three short stacks of brass coins and a small ivory keepsake box; center a large open ivory paper ledger resting on a dark petrol teal book cover tilted up about 18 degrees towards the camera, two pages with fine engraved horizontal rules and brass binding rings at the center, one ivory page subtly curled at the outer corner; right third a beautiful branching brass relationship tree, shaped like a symmetrical elegant botanical sculpture, five branches ending in small round ivory portrait medallions with simple embossed profile cameos, on a round dark teal base. On the plinth foreground left a slightly angled small ivory identity card with tiny portrait and ruled lines, and foreground center a slender brass fountain pen. Small brass dotted inlay path connects identity card to asset tray to tree to ledger. Tiny inset brass-edged dark teal nameplate centered on front lip reading only 'Fasight'. Highly tactile ivory paper fibers, brushed aged brass, fine-grained limestone, dark teal leather binding, convincing bevels, rich contact shadows, warm key from upper left, gentle cool fill and rim, photographic material detail. Camera orthographic-ish front three-quarter, elevation about 25 degrees, entire sculpture fills most of frame with comfortable margins. Editorial product photography, refined thoughtful financial legacy theme. No living people, no figurines, no laptop, no UI overlay, no glowing holograms, no padlock, no legal seal, no extra text, no watermarks. The sculpture itself is the subject, one cohesive physical tableau.

## Original verification

Node geometry inspection: 18 meshes and 177,347 vertices without browser-only plaque text; all coordinates finite. Four expected phases and cycle reset verified. Static surfaces are batched by material; only the seven highlights, review group and route marker remain separately transformable. No per-frame geometry rebuilds or normal recomputation.

Integration polish: the three exhibits share `planning-exhibit-surfaces.js`, a deterministic local limestone pore/albedo map. Phase captions sit below the canvas, leaving the sculpture unobscured. Shared pause/resume and reset controls remain in place.

## V2 validation

`node --test scripts/tests/fasight-motion.test.mjs scripts/tests/exhibits-18-20.test.mjs` checks five cases: finite scenes, exact loops, random-access motion, chapter selection/autoplay continuity, nib-to-ink alignment including lifted row transitions, pen return before page turns, and branch illumination/reset. Browser review checks the written ledger, chapter controls and updated material/lighting treatment. The original project-source limitations above still apply.

### Fidelity pass — 26 October 2026

- Replaced identical silhouette cutouts with actual Microsoft Rocketbox portrait geometry, cropped and compressed into ivory reliefs in dark enamel medallions. Two authored meshes, five viewing angles; the source MIT licence remains in `public/landing/assets/lrnmate-people/`. Reproducible conversion: `scripts/assets/build-fasight-cameos.mjs`. Shared geometry has 5,256 vertices after deduplication, with preserved smooth normals.
- Rebuilt the miniature house with separate lapped slate tiles, ridge caps, masonry courses, quoins, recessed framed windows, steps, gutters and a brick chimney. Warm window panes are behind the mullions, avoiding overlapping signal geometry.
- Added separate 512px albedo, linear height and roughness maps for leather, limestone, paper, brushed metal and slate. Added enamel settings, beaded medallion rims, coin milling, an inlaid keepsake box and a lathed lacquer fountain pen.
- The ledger now has 22 layered leaves per side, thread stitching, a brass binding plate, a subtly curved writing surface and 1536px ink. Pen contact derives from the same paper-height function; writing and page-turn timing remain deterministic. Review inspection parks the pen in its cradle.
- Warm metal highlights replace mint/neon outlines. Dedicated reflected softboxes, stronger directional modelling and a modest three-quarter camera reveal depth while retaining the original exhibit composition.
- Validation: motion, seek/reset, page contact, finite geometry, portrait normals, texture colour spaces and a bounded scene draw-call/triangle budget are covered by the Fasight tests. This is a detailed real-time sculptural exhibit, not a photorealistic scan.
