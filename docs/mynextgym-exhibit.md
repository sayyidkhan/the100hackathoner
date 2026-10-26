# MyNextGym — footfall-led location analysis

## Product purpose and evidence

MyNextGym identifies a potential gym location using footfall. The exhibit makes that reasoning visible: count pedestrian arrivals at three candidate sites, compare the sample, select the busiest site, then show a proposed gym at that location.

The source repository was reviewed at master revision `626aae36b6dacd4adfd658d181e5b60652c8630b`:

- [Repository](https://github.com/sayyidkhan/my-next-gym): describes predicting the next best place to open a gym business.
- [`index.html`](https://github.com/sayyidkhan/my-next-gym/blob/626aae36b6dacd4adfd658d181e5b60652c8630b/index.html): district-analysis frontend embedding Tableau `XmarksDistrict/Story1`.
- [`sub-district-analysis.html`](https://github.com/sayyidkhan/my-next-gym/blob/626aae36b6dacd4adfd658d181e5b60652c8630b/sub-district-analysis.html): sub-district frontend embedding Tableau `shared/KT5QBRKSH`.

The source confirms location analysis, and the owner clarified footfall as the intended focus. The exhibit's A/B/C sites, transit/office/residential routes, counts and recommendation are an **illustrative sample scenario**. They are not live readings, retrieved footfall measurements, a reproduced Tableau dataset or a verified business forecast. The display explicitly says “Sample footfall” and “Illustrative scenario.” The proposed storefront is a visualization of the selected location, not an existing gym.

## City-first composition (v4)

The second 26 October refinement removes the oversized upright tablet entirely. A single thin, slate district model fills the 3D scene. The existing 68-person sample still feeds three candidate sites, but counts and comparison bars now live in an accessible, responsive HTML rail below the scene. The displayed totals are updated as arrivals occur, independently of camera angle, zoom or canvas resolution.

A navy editorial header introduces the location decision. The model uses a restrained slate, limestone, terracotta and mint palette. Dark curtain-wall frames, warm lit windows, rooftop gardens and solar panels, striped shop awnings, a cafe terrace, street furniture and greenery establish a more varied neighbourhood. The station, office towers and homes retain their original positions and explain the origins of the routes.

The proposed gym is taller and more prominent, with warm interior illumination, a genuinely transparent skylight opening, planted roof strip and entrance planters. Its coral B marker follows the emerging roof. No winner or gym appears before the comparison finishes. There are two subtle street lights and one interior light; these are inexpensive local point lights without shadow maps.

Framing uses actual component bounds to avoid fitting empty corners. The model disables automatic orbit, so its camera-fit sway is zero; other exhibits keep the renderer's default fit margin. Users can still rotate, zoom, pause and reset. Five selectable stages hold deterministic scene states; Auto-play returns to the 24-second sequence.

Five routes carry **68 individual pedestrian marks**:

| Site | Sample arrivals | Source routes |
| --- | ---: | --- |
| A | 12 | Transit |
| B | 36 | Transit, offices and homes; 12 each |
| C | 20 | Offices |

Arrivals at B are interleaved across its three routes. Each pedestrian follows a fixed horizontal path into an individual gathering position, then stops. These arrival positions exactly support the HTML figures. Density fields strengthen as arrivals accumulate. The comparison rail highlights each candidate before showing B as selected, and its “Illustrative sample” label remains visible.

New artwork, `public/landing/assets/projects/024-mynextgym-city-v4.png`, was generated from a screenshot of the implemented scene. It retains the city layout, gym, A/B/C markers and pedestrian paths with richer architectural lighting and material detail. It is concept artwork, not a pixel-identical realtime render. The prompt and provenance are recorded in `docs/mynextgym-artwork-v4.md`.

## 24-second sequence

| Time | Scene and comparison rail behaviour |
| --- | --- |
| 0–8 s | Pedestrians travel from their sources. A/B/C counts accumulate to 12/36/20 as people reach their destinations. No winner or gym is visible. |
| 8–12 s | Crowd holds still. Rail compares A, B and C in order, using the completed sample. |
| 12–15 s | Rail selects B. The coral pin descends during 12–14 s; the selection ring appears. The proposed gym remains hidden. |
| 15–21 s | Glazed proposed GYM storefront reveals at B, reaching full height at 17.5 s. The marker follows its roof and the rail retains the recommendation. |
| 21–22 s | Completed proposal holds for review. |
| 22–24 s | Crowd and selected-site geometry reduce before the exact replay reset. Counts restart when the next sample begins at 24 s. |

The loop is driven exclusively by the gallery's animation clock, with no Date-based state, timers or network requests. `gymMoment(time)` is pure and exposes counts, comparison, selection, reveal and fade values. Repeating any timestamp restores the same model, comparison and caption state. Shared pause, visibility and reduced-motion behaviour remain owned by the gallery renderer.

`root.userData.story` contains `index`, `step`, `title`, `detail`, `tone`, `phase` and counts. `candidateSites` and `flowRoutes` expose illustrative sample semantics; route metadata includes source, destination, sample size and control points. The story publishes its counts, comparison row and winner for the HTML rail and Node-side verification.

## Validation

`node --test scripts/tests/mynextgym.test.mjs` covers eight checks:

- Monotonic counts, 12/36/20 totals and sequential candidate comparison.
- No winner or storefront before comparison; marker descent before the gym reveal.
- Route totals and exact agreement between arrivals and displayed counts.
- Pedestrians staying on the map, at a fixed ground height, and stationary during comparison.
- Finite geometry, repeatable seeking, exact loop reset and no geometry below the foundation.
- Correct comparison-rail state and a raycast proving the skylight opening is transparent.
- Manual stage selection and return to timed playback.

The architectural refinement uses 127 meshes and approximately 308,000 stored vertices without browser-only label planes. Six room textures sit behind physical window reveals, thin mullions and transparent glazing. Residential balconies include balustrades and planters; roofs use recessed membranes, thin parapets and mechanical louvers. Trees use individual instanced leaves with varied colours, preserved through scene batching. Tests cap meshes at 130, stored vertices at 350,000 and expanded triangles (including every leaf instance) at 450,000. These are structural limits, not measured frame-rate claims.

The 22 relevant exhibit tests and the 97-page Astro production build pass. Browser review checks artwork/3D switching, counts, selected state, manual controls, rotation, lighting and console errors. Proofs are saved under `outputs/mynextgym-review/`.

## Files

- Scene: `public/landing/artifacts/mynextgym.js`
- Architectural facades, procedural surfaces and instanced trees: `public/landing/artifacts/mynextgym-architecture.js`
- Comparison UI: `src/components/ProjectExhibit.astro`, `public/landing/project-exhibit.js`
- Shared renderer: `public/landing/scene.js`
- Artwork mapping: `src/lib/project-art.ts`
- Tests: `scripts/tests/mynextgym.test.mjs`

The higher-fidelity pass also replaces glowing single-colour pedestrians with varied clothing and skin tones, corrects the station canopy to follow its curved ribs, and permits 2× device resolution for project 24. The eight MyNextGym tests, Astro check and 97-page production build pass. Browser review confirms rotation, proposed-gym selection and exact comparison totals without console errors. Current proof: `outputs/mynextgym-review/architectural-fidelity-3d.png`.
