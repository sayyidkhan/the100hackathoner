# CO2unter — exhibit 020

## Evidence reviewed (23 October 2026)

- Local record `src/data/hackathons.json`, number 20: CO2unter, NASA Space Hackathon 2018, 20–21 October 2018, Singapore; recorded solution “Data visualization app.” No repository URL is recorded in that row.
- Original public project submission: [CO2UNTER on Devpost](https://devpost.com/software/co2unter). The indexed submission identifies Sayyid Iskandar Khan and Yan Sheng Choo, the 2018 NASA Space Apps event, Flutter and Tableau. It describes carbon data converted to familiar comparisons including chickens, wood, cigarettes and bananas. The search result exposed the full relevant project story; direct fetch later failed with cache miss.
- An authenticated GitHub search found the original accessible Flutter converter source. Read `lib/main.dart`, `lib/unit_converter.dart`, and the repository tree. It has input/output unit selection and carbon-input/quantity-output labels. No source, dataset or images were copied into this exhibit. The repository is marked private, so its URL is deliberately not added to the public portfolio.
- Instagram links from the record, [post one](https://www.instagram.com/p/BpMRvP0g435/) and [post two](https://www.instagram.com/p/BpMd-mignvt/), could not be fetched. No visual claims were inferred from them.
- The Tableau story linked by Devpost could not be fetched. No scientific measurements, conversion coefficients, live-data functionality or quantitative results are represented by the exhibit. The claim about real-time NASA data belongs to the historical project submission and was not independently verified as implemented.
- Search also returned unrelated 2024 Kraków projects with the same name; these were excluded.

## Redesign — 25 October 2026

The second design makes the phone the central object instead of a small placard. Its rounded ivory/brass housing contains a complete locally rendered interface: carbon input, Banana/Wood segmented choice, illustrated comparison card, and phase status. The screen selection and physical illuminated specimen always agree. It deliberately contains no made-up conversion value.

The phone is taller than the globe; the wood pedestal is now a tall fluted column and the banana specimen is a larger four-fruit bunch. Seeded banana-skin speckles, irregular bark geometry, a dedicated bark map, concentric end-grain texture, cut-face cracks and polished collars provide detail that remains visible at normal viewing size. The underlying Natural Earth coastlines and attribution are unchanged. A rounded limestone platform, brass reveal and larger title plaque unify the composition.

Manual inspection uses `setStep(index, elapsed)`, with snapshots at 2.5, 8.5, 12.5 and 20.5 seconds. `setStep(null, elapsed)` resumes autoplay from that same moment without jumping. Suggested buttons: Carbon input; Choose bananas; Banana comparison; Wood comparison.

## Design and interpretation

A tactile carbon-data instrument: blue ceramic globe and brass graticule on the left; ivory smartphone converter at the centre; familiar physical specimens on the right. Four ochre bananas at the front and three wood logs at the rear echo two categories explicitly mentioned by the original submission. These object counts are composition, not conversion quantities. The globe uses public-domain Natural Earth 1:110m land silhouettes, retaining geographic coastlines but not displaying scientific measurements. The taller wood stage keeps the rear comparison clearly visible above the bananas.

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
- Land: 125,175 rendered vertices; complete v2 sculpture: 269,774 vertices, 107 mesh draw objects in the headless check (canvas-label meshes are added in-browser).

## Assets and checks

- Model: `public/landing/artifacts/co2unter.js`
- Specimen textures and changing screen UI: `public/landing/artifacts/co2unter-surfaces.js`
- Current artwork: `public/landing/assets/projects/020-co2unter-v2.png`
- Earlier artwork retained: `public/landing/assets/projects/020-co2unter-v1.png`
- Test: `scripts/tests/co2unter-exhibit.test.mjs`
- Reuses `medivoice-studio.js` without modifying it; animated groups and canvas labels are preserved during batching.
- Test command: `node --test scripts/tests/co2unter-exhibit.test.mjs`
- Verified finite positions/normals, deterministic random-access animation, exact 24s reset, stationary comparison holds, correct story phases and bounded geometry. V2 also checks manual snapshot persistence, screen/physical-comparison agreement and seamless return to autoplay.

## Artwork generation — version 1

Built-in imagegen, use case `stylized-concept`, generated 23 October 2026. Final PNG copied from the built-in generated-images destination into the repository. Prompt:

> Use case: stylized-concept. Asset type: premium museum exhibit artwork for CO2unter, an actual 2018 NASA Space Apps carbon-emissions visualisation and familiar-unit converter mobile prototype. Make a photoreal tabletop sculpture, landscape 3:2 composition, fully visible wide rounded ivory limestone plinth on dark warm brown studio backdrop, soft amber key light and cool soft rim, finely carved edges, convincing ambient contact shadows. Exact composition to match the real 3D exhibit: LEFT a large deep petrol-blue terrestrial globe (cream raised continents with fine brass latitude-longitude lines) mounted in a brushed brass semicircular meridian ring and pedestal. CENTER a tall slightly backward-tilted ivory-and-brass smartphone on a stepped stand, screen dark teal with small readable heading CO2unter, two cream rounded selection panels connected by downward conversion arrows; input label CARBON and output label COMPARE, no numeric figures. RIGHT two low circular limestone display pedestals: front one bears a detailed yellow-ochre banana bunch of three curved bananas, rear one bears three realistic cut wooden logs with end grain. Small engraved brass labels BANANAS and WOOD on their pedestal fronts. Thin brass inset paths on plinth lead from globe to phone then fork to the two display pedestals, with tiny turquoise indicator beads. A small brass museum plaque on front edge reads CO2unter. High craft quality, tactile limestone pores, subtle metal patina, blue ceramic glaze, fine woodgrain. All objects firmly supported on the base, no floating cards, no arbitrary orbits, no people, no satellite, no smoke, no trees, no extra text, no logos, no fabricated scientific quantities. The concept is making large carbon data understandable using everyday objects, not emissions measurement or carbon sequestration. View from front and slightly above, 50mm studio product photograph, sharp detailed complete sculpture filling frame.

Integration polish: the three exhibits share `planning-exhibit-surfaces.js`, a deterministic local limestone pore/albedo map. Phase captions sit below the canvas, leaving the sculpture unobscured. Shared pause/resume and reset controls remain in place.

## Artwork generation — version 2

Built-in imagegen on 25 October 2026. Reference: `outputs/exhibits-18-20-v2/co2unter-reference.png`, an actual browser screenshot of the rebuilt 3D scene at the banana step. The final image is `public/landing/assets/projects/020-co2unter-v2.png`; the earlier image is retained. The generated artwork intentionally follows the browser model's relative object sizes and stylisation rather than introducing an unattainable new visual composition.

Final prompt:

> Use case: stylized-concept. Create the final artwork counterpart for the interactive 3D CO2unter exhibit shown in the reference screenshot. The screenshot is a composition reference, not a UI design target. REMOVE ALL WEBSITE CHROME, buttons, headings, caption and borders; render only the sculpture as a clean landscape 3:2 image on a warm dark-brown studio backdrop. Preserve the actual sculpture arrangement and relative size precisely: rounded wide cream limestone base; LEFT smaller blue-and-ivory Earth globe with recognisable real coastlines in a slender brass meridian ring on turned brass stand; CENTRE tallest object is the large upright ivory phone with rounded corners, thin brass rim and dark teal real interface; RIGHT foreground shallow cream circular pedestal with a sculpted yellow four-banana bunch; RIGHT background a substantially taller fluted cream column displaying three stacked bark-covered wood logs, cut faces pointing toward viewer. The phone remains taller than the globe. Fine inset brass connector paths run along plinth from globe to phone to two specimens. Exactly the reference perspective: nearly frontal with slight view down onto base, coherent object scale, all supported and grounded. Phone screen should read 'CO2unter', 'YOUR FOOTPRINT', large 'CO2', 'COMPARE WITH', a segmented control with 'Bananas' selected and 'Wood', and a simple drawn banana with the result heading 'Bananas'. No numeric scientific claims. Use restrained museum model craftsmanship matching the reference, satin deep teal enamel, lightly porous ivory limestone, brushed champagne brass, warm yellow banana skin, brown bark and clearly visible fine concentric wood end-grain rings. Refine surface detail and soft contact shadows, but do NOT change the composition, add people, extra scenery, floating icons, bars or effects. Small front plinth nameplate reads CO2unter. Small comparison labels BANANAS and WOOD. Crisp sculpture edges, balanced soft warm light, gentle cool rim, no cartoon look, no photography of real fruit pasted into the sculpture. Fill frame with complete sculpture and comfortable narrow margins. This is a coherent product-diorama render at the same level of stylisation as its interactive model.
