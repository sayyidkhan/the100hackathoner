# GrowthGuru — garden of skills

Project 31, Mosque Tech Challenge, 15–16 April 2023.

## Evidence and scope

- Catalog: career / learning / mental health tracker.
- [App.js](https://github.com/sayyidkhan/growthguru/blob/master/src/App.js): a React `beautiful-skill-tree` prototype with FrontEnd, BackEnd and Database sections.
- [data.js](https://github.com/sayyidkhan/growthguru/blob/master/src/data/data.js): HTML → CSS → JavaScript; Internet → HTTP → programming languages; Databases → SQL → MySQL, alongside other branches.
- The exhibit shows representative paths, not every node. Backend compresses intermediate browser/programming-language categories. Progress is illustrative, not stored learner progress.
- The reflection pool is an artistic metaphor for the catalog's broader wellbeing idea. No claim that the repository implements mental-health care or tracking.

## Visual and interaction design

A brass learning tree grows from a curved open book, framed by a limestone arch. Coral, amber and jade distinguish the three paths. A walnut desk and laptop represent practice; a small reflection pool represents space to pause. Artwork and real geometry share this composition. Standard exhibit card, no additional promotional header or black display pedestal.

Select a path to restart its milestone illumination; Tour all paths advances every ten seconds. Branch lights, gentle leaves and pool ripples use the shared pause/reduced-motion lifecycle. Keyboard buttons, arrow-key orbit and Home reset are retained. No remote assets or runtime services are required.

## Artwork

Built-in imagegen tool. Final asset: `public/landing/assets/projects/031-growthguru-garden-v2.png`.

Generation prompt:

Use case: stylized-concept. Asset: landscape 3:2 hero artwork for GrowthGuru, a developer learning skill-tree hackathon project. Create an exquisitely crafted architectural miniature called a garden of skills, polished premium editorial CGI, NOT a UI screenshot. A warm ivory oval stone island with a fine brass rim, seen near frontal three-quarter view at modest elevation, fully in frame on a deep petrol teal studio background. Central hero is a sculptural branching brass learning tree rising from a large open cream book on a stepped round stone dais. Its graceful slender curved copper/brass branches spread into three distinct fans: left warm coral frontend, centre amber backend, right muted jade database. Each fan bears three round porcelain medallions with brass rims, inset simple symbols (angle brackets, curly braces, database cylinders), connected along the branches by tiny warm glowing beads. A few carefully sculpted sage green leaves accent branch tips; airy architectural branching silhouette, not a dense natural tree. Tree stands before a single large slender ivory architectural arch with a recessed fine brass inner border, open through the arch. Left foreground a beautifully detailed walnut study desk, open ivory laptop with dark teal screen and fine code lines, stacked tiny books and a slender brass desk lamp. Right foreground small circular teal reflection pool with fine concentric brass ripple rings and three small smooth stones, suggesting calm while learning. Tiny restrained plants at the two rear corners. Warm indirect lighting under the central dais. Three miniature enamel plaques across the front read exactly "FRONTEND", "BACKEND", "DATABASE". Materials tactile fine limestone, satin brass, matte porcelain, walnut grain, teal glazed water. Soft warm studio key from upper left, realistic ambient occlusion, exquisite edge bevels, controlled shadow, refined rich contrast. Composition fills 85 percent of frame, visually coherent single island, tree hero fills vertical space. No people, no trophy, no floating generic dashboards, no stock growth chart, no excessive foliage, no glitter particles, no giant black pedestal, no title text or watermark. Artistic interpretation of a learning prototype, not medical treatment or business analytics.

Framing refinement: pull the camera back about 18% so the whole arch and base remain visible with teal space on all edges; preserve the scene, materials and lighting.

## Validation

Refinement pass: raised ivory skill reliefs in glazed brass medallions, tapered tree branches, solid curved pages with a leather cover, a rounded limestone plinth, richer walnut/stone finishes and a dedicated studio-light profile. The rigid scene is flattened into material batches before a deterministic contact-occlusion bake. Moving leaves, lights and water retain live animation and lighting.

Rebuild contact shading after geometry edits with `node scripts/bake-growthguru-ao.mjs --rays=24 --distance=.65 --cell=.018`. The local bake uses the existing validated OAO1 loader from `astrodegen-occlusion.js`; it verifies every geometry signature before applying any shading. Asset: `public/landing/assets/growthguru-ao-v1.bin`.

`node --test scripts/tests/growthguru.test.mjs` verifies path selection, tour order, invalid-input handling, clock reset, finite geometry and replayable motion. `npm run build` checks Astro and generates the website. Browser checks cover desktop, narrow mobile, artwork/3D switching, three path selectors, tour, pause and keyboard orbit.

## Artwork matching pass

Raised the book dais and plaques, tightened the medallion arrangement, and moved the initial camera closer to a front view. Secondary brass twigs, shaped leaves, layered garden beds and rocks fill the silhouette. Warm additive halos follow the path lights and pulse gently; fine pool highlights move with the existing ripple animation. Small botanical veins use reduced geometry, while the rigid scenery remains batched by material.

This pass is checked with the model tests and production build. Live visual comparison remains pending because local browser access is disabled in Work settings. The browser checks described above refer to the previous refinement pass.
