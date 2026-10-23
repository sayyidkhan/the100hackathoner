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

## Animation

Twenty-second deterministic loop using the gallery's existing elapsed-time clock, with pause/reduced-motion support inherited from the gallery:

1. 0–5 s: identity card rule is highlighted; story describes personal details.
2. 5–10 s: asset tray is highlighted and one small teal marker follows the brass desk route toward the relationship tree.
3. 10–15 s: the upper tree medallion gets a fine teal rim; story describes selecting a trusted person.
4. 15–20 s: a fine brass review line draws across the ledger and holds. The story explicitly describes review as a concept whose source screen remains a placeholder.

No signature, legal seal, approval claim, automatic fund transfer or floating object animation. All phases are directly seekable. `cycleDuration: 20`, `realTimeAnimation: true`, and `story` fields (`index`, `step`, `title`, `detail`, `tone`) support the shared overlay.

## Artwork generation

Built-in image generation tool (not CLI). Generated source:
`/Users/sayyid/.codex/generated_images/01a1645c-5b77-7a72-94cf-30593d7b4cf3/exec-bcad07bc-074f-4d27-bc8a-cbf7008ed94c.png`.

Prompt:

> Use case: stylized-concept. Create a luxurious museum miniature sculpture photographed in a warm dark studio, landscape 3:2 image, for Fasight, an open-source digital will PLANNING prototype. Precisely compose this sculptural still life so it can be reproduced as an interactive 3D model: on one wide softly bevelled warm limestone plinth, left third a low dark petrol teal rectangular asset tray with a finely crafted small ivory gabled house, three short stacks of brass coins and a small ivory keepsake box; center a large open ivory paper ledger resting on a dark petrol teal book cover tilted up about 18 degrees towards the camera, two pages with fine engraved horizontal rules and brass binding rings at the center, one ivory page subtly curled at the outer corner; right third a beautiful branching brass relationship tree, shaped like a symmetrical elegant botanical sculpture, five branches ending in small round ivory portrait medallions with simple embossed profile cameos, on a round dark teal base. On the plinth foreground left a slightly angled small ivory identity card with tiny portrait and ruled lines, and foreground center a slender brass fountain pen. Small brass dotted inlay path connects identity card to asset tray to tree to ledger. Tiny inset brass-edged dark teal nameplate centered on front lip reading only 'Fasight'. Highly tactile ivory paper fibers, brushed aged brass, fine-grained limestone, dark teal leather binding, convincing bevels, rich contact shadows, warm key from upper left, gentle cool fill and rim, photographic material detail. Camera orthographic-ish front three-quarter, elevation about 25 degrees, entire sculpture fills most of frame with comfortable margins. Editorial product photography, refined thoughtful financial legacy theme. No living people, no figurines, no laptop, no UI overlay, no glowing holograms, no padlock, no legal seal, no extra text, no watermarks. The sculpture itself is the subject, one cohesive physical tableau.

## Verification

Node geometry inspection: 18 meshes and 177,347 vertices without browser-only plaque text; all coordinates finite. Four expected phases and cycle reset verified. Static surfaces are batched by material; only the seven highlights, review group and route marker remain separately transformable. No per-frame geometry rebuilds or normal recomputation.

Integration polish: the three exhibits share `planning-exhibit-surfaces.js`, a deterministic local limestone pore/albedo map. Phase captions sit below the canvas, leaving the sculpture unobscured. Shared pause/resume and reset controls remain in place.
