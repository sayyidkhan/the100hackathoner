# CO2unter — exhibit 020

## Evidence reviewed (23 October 2026)

- Local record `src/data/hackathons.json`, number 20: CO2unter, NASA Space Hackathon 2018, 20–21 October 2018, Singapore; recorded solution “Data visualization app.” No repository URL is recorded in that row.
- Original public project submission: [CO2UNTER on Devpost](https://devpost.com/software/co2unter). The indexed submission identifies Sayyid Iskandar Khan and Yan Sheng Choo, the 2018 NASA Space Apps event, Flutter and Tableau. It describes carbon data converted to familiar comparisons including chickens, wood, cigarettes and bananas. The search result exposed the full relevant project story; direct fetch later failed with cache miss.
- An authenticated GitHub search found the original accessible Flutter converter source. Read `lib/main.dart`, `lib/unit_converter.dart`, and the repository tree. It has input/output unit selection and carbon-input/quantity-output labels. No source, dataset or images were copied into this exhibit. The repository is marked private, so its URL is deliberately not added to the public portfolio.
- Instagram links from the record, [post one](https://www.instagram.com/p/BpMRvP0g435/) and [post two](https://www.instagram.com/p/BpMd-mignvt/), could not be fetched. No visual claims were inferred from them.
- The Tableau story linked by Devpost could not be fetched. No scientific measurements, conversion coefficients, live-data functionality or quantitative results are represented by the exhibit. The claim about real-time NASA data belongs to the historical project submission and was not independently verified as implemented.
- Search also returned unrelated 2024 Kraków projects with the same name; these were excluded.

## Design and interpretation

A tactile carbon-data instrument: blue ceramic globe and brass graticule on the left; ivory smartphone converter at the centre; familiar physical specimens on the right. Three ochre bananas at the front and three wood logs at the rear echo two categories explicitly mentioned by the original submission. These object counts are composition, not conversion quantities. The globe uses public-domain Natural Earth 1:110m land silhouettes, retaining geographic coastlines but not displaying scientific measurements. The wood pedestal is raised 0.32 scene units to keep the rear comparison visible behind the bananas.

The generated artwork and browser 3D share this layout, warm limestone plinth, brass paths, teal highlights, carved labels, globe scale and material family. Surface detail is carried by seeded stone/wood bump textures, rounded edges, meridian ticks, continent relief, concentric cut-log rings, bark ridges, banana ridges, phone trim and inset screen. Labels are generated as canvas textures at runtime, not remote assets.

Suggested caption: **Carbon-emissions data translated into familiar comparisons. CO2unter’s 2018 mobile-converter concept, reimagined as an interactive exhibit.**

Suggested alt: **A blue-and-ivory globe feeds a brass-trimmed phone converter, with bananas and cut wood displayed on limestone pedestals to the right.**

## Animation

24-second deterministic cycle; `realTimeAnimation: true` uses the shared scene clock and existing pause/reduced-motion support. No independent intervals or uncontrolled animation loops.

1. 0–5s: carbon-data intake; one turquoise sample travels along the inset brass path from globe toward phone, then stops.
2. 5–10s: converter selection; input/output indicators change, and one sample travels along the banana branch during 7–10s.
3. 10–16s: banana comparison is held by a lit pedestal ring. All physical specimens stay supported and still.
4. 16–24s: sample follows the wood branch during 16–19s; wood ring lights during 19–23s, then a quiet reset.

Each phase exposes `userData.story` with `index`, `step`, `title`, `detail`, `tone`. The shared renderer places this explanatory text beneath the canvas. `cycleDuration: 24` supports deterministic review. No random floating, arbitrary orbiting objects, or numeric values.

## Globe geography refinement

- Source: [Natural Earth 110m land](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson), upstream blob `04811d72fff2701ec67587e30ad8942675b511e3`. [Natural Earth terms](https://www.naturalearthdata.com/about/terms-of-use/) place the dataset in the public domain.
- Local `co2unter-land.js` contains 127 polygons and 5,143 geographic vertices, rounded to 0.001 degree; no runtime network request.
- Coastlines are triangulated with holes, preserving the source’s clipped antimeridian boundaries. The only >180° source segment closes the south pole. Long triangle edges are adaptively bisected to at most 4° before projection onto the sphere, preventing continent interiors sinking into the ocean sphere.
- Land: 125,175 rendered vertices; complete sculpture: 245,976 vertices, 108 mesh draw objects before renderer setup.

## Assets and checks

- Model: `public/landing/artifacts/co2unter.js`
- Artwork: `public/landing/assets/projects/020-co2unter-v1.png`
- Test: `scripts/tests/co2unter-exhibit.test.mjs`
- Reuses `medivoice-studio.js` without modifying it; animated groups and canvas labels are preserved during batching.
- Test command: `node --test scripts/tests/co2unter-exhibit.test.mjs`
- Verified finite positions/normals, deterministic random-access animation, exact 24s reset, stationary comparison holds, correct story phases and bounded geometry.

## Artwork generation

Built-in imagegen, use case `stylized-concept`, generated 23 October 2026. Final PNG copied from the built-in generated-images destination into the repository. Prompt:

> Use case: stylized-concept. Asset type: premium museum exhibit artwork for CO2unter, an actual 2018 NASA Space Apps carbon-emissions visualisation and familiar-unit converter mobile prototype. Make a photoreal tabletop sculpture, landscape 3:2 composition, fully visible wide rounded ivory limestone plinth on dark warm brown studio backdrop, soft amber key light and cool soft rim, finely carved edges, convincing ambient contact shadows. Exact composition to match the real 3D exhibit: LEFT a large deep petrol-blue terrestrial globe (cream raised continents with fine brass latitude-longitude lines) mounted in a brushed brass semicircular meridian ring and pedestal. CENTER a tall slightly backward-tilted ivory-and-brass smartphone on a stepped stand, screen dark teal with small readable heading CO2unter, two cream rounded selection panels connected by downward conversion arrows; input label CARBON and output label COMPARE, no numeric figures. RIGHT two low circular limestone display pedestals: front one bears a detailed yellow-ochre banana bunch of three curved bananas, rear one bears three realistic cut wooden logs with end grain. Small engraved brass labels BANANAS and WOOD on their pedestal fronts. Thin brass inset paths on plinth lead from globe to phone then fork to the two display pedestals, with tiny turquoise indicator beads. A small brass museum plaque on front edge reads CO2unter. High craft quality, tactile limestone pores, subtle metal patina, blue ceramic glaze, fine woodgrain. All objects firmly supported on the base, no floating cards, no arbitrary orbits, no people, no satellite, no smoke, no trees, no extra text, no logos, no fabricated scientific quantities. The concept is making large carbon data understandable using everyday objects, not emissions measurement or carbon sequestration. View from front and slightly above, 50mm studio product photograph, sharp detailed complete sculpture filling frame.

Integration polish: the three exhibits share `planning-exhibit-surfaces.js`, a deterministic local limestone pore/albedo map. Phase captions sit below the canvas, leaving the sculpture unobscured. Shared pause/resume and reset controls remain in place.
