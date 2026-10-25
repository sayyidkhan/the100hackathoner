# MyNextGym — footfall-led location analysis

## Product purpose and evidence

MyNextGym identifies a potential gym location using footfall. The exhibit makes that reasoning visible: count pedestrian arrivals at three candidate sites, compare the sample, select the busiest site, then show a proposed gym at that location.

The source repository was reviewed at master revision `626aae36b6dacd4adfd658d181e5b60652c8630b`:

- [Repository](https://github.com/sayyidkhan/my-next-gym): describes predicting the next best place to open a gym business.
- [`index.html`](https://github.com/sayyidkhan/my-next-gym/blob/626aae36b6dacd4adfd658d181e5b60652c8630b/index.html): district-analysis frontend embedding Tableau `XmarksDistrict/Story1`.
- [`sub-district-analysis.html`](https://github.com/sayyidkhan/my-next-gym/blob/626aae36b6dacd4adfd658d181e5b60652c8630b/sub-district-analysis.html): sub-district frontend embedding Tableau `shared/KT5QBRKSH`.

The source confirms location analysis, and the owner clarified footfall as the intended focus. The exhibit's A/B/C sites, transit/office/residential routes, counts and recommendation are an **illustrative sample scenario**. They are not live readings, retrieved footfall measurements, a reproduced Tableau dataset or a verified business forecast. The display explicitly says “Sample footfall” and “Illustrative scenario.” The proposed storefront is a visualization of the selected location, not an existing gym.

## Composition and app

A warm stone foundation holds a landscape street-map tablet on the left and one upright comparison app on the right. The map uses a dark blue-ink surface, readable streets, amber/teal routes, three labelled sources and small contextual buildings. Density patches indicate the catchment areas without hiding the pedestrian paths. Three clear A/B/C badges establish the alternatives.

Five routes carry **68 individual pedestrian marks**:

| Site | Sample arrivals | Source routes |
| --- | ---: | --- |
| A | 12 | Transit |
| B | 36 | Transit, offices and homes; 12 each |
| C | 20 | Offices |

Arrivals at B are interleaved across its three routes. Each pedestrian follows a fixed horizontal path into an individual gathering position, then stops. This makes the numerical totals and the map animation describe the same sample. The destination spread keeps the proposed storefront clear.

The upright app uses a single 1024 × 1608 canvas texture, rather than separate mesh labels/cards. Its dark navy interface contains MyNextGym branding, “Where to open?”, three prominent sample counts with comparison bars, and a final “OPEN AT B” recommendation. The highlighted row progresses through A, B and C before the selected result appears. The screen redraws only when integer counts or discrete phase/comparison state change, avoiding texture uploads on every frame. Map density fields grow with the observed sample totals.

A coral B pin descends onto the selected location after comparison. Once selection completes, a compact glazed storefront with a GYM sign rises at B. Its stone base, brass mullions, dark glazing and cream roof communicate the proposal without overwhelming the analytics map. The pin follows the emerging roof to remain visible. Before selection, there is no winner pin, selection ring or proposed gym.

Materials use warm ivory stone, blue-ink enamel, muted teal, amber, brass and coral. The scene requests the dedicated `mynextgym` renderer profile and supplies framing points that prioritize both the flat map and upright app. Source/context architecture remains subordinate to the location decision.

## 24-second sequence

| Time | Scene and app behaviour |
| --- | --- |
| 0–8 s | Pedestrians travel from their sources. A/B/C counts accumulate to 12/36/20 as people reach their destinations. No winner or gym is visible. |
| 8–12 s | Crowd holds still. App compares A, B and C in order, using the completed sample. |
| 12–15 s | App selects B. The coral pin descends during 12–14 s; the selection ring appears. The proposed gym remains hidden. |
| 15–21 s | Glazed proposed GYM storefront reveals at B, reaching full height at 17.5 s. The marker follows its roof and the app retains the recommendation. |
| 21–22 s | Completed proposal holds for review. |
| 22–24 s | Crowd and selected-site geometry reduce before the exact replay reset. Counts restart when the next sample begins at 24 s. |

The loop is driven exclusively by the gallery's animation clock, with no Date-based state, timers or network requests. `gymMoment(time)` is pure and exposes counts, comparison, selection, reveal and fade values. Repeating any timestamp restores the same model, app and caption state. Shared pause, visibility and reduced-motion behaviour remain owned by the gallery renderer.

`root.userData.story` contains `index`, `step`, `title`, `detail`, `tone`, `phase` and counts. `candidateSites` and `flowRoutes` expose illustrative sample semantics; route metadata includes source, destination, sample size and control points. The app screen publishes its phase, counts, comparison row and winner for Node-side verification.

## Validation

Run `node --test scripts/tests/mynextgym.test.mjs`. The six tests cover:

- Monotonic integer counts, correct 12/36/20 totals and sequential comparison of all candidates.
- No winner or storefront before comparison; pin descent before proposed-gym reveal.
- Route sample totals and exact agreement between arrived pedestrian positions and app counts.
- Pedestrians staying inside the map footprint, on one horizontal surface, and stationary while results are compared/reviewed.
- Finite geometry, repeatable seeking, complete story/app integration, exact 24-second reset and no geometry below the foundation.
- Node app fallback and invalid-input clamping, plus screen raycasts that catch housing occlusion.

The scene currently measures 103 meshes and 312,777 vertices without browser-only label planes. Tests allow fewer than 125 meshes and 350,000 vertices to bound accidental geometry growth. This is a structural budget, not a claim of a measured browser frame rate.

Live browser review verified the updated artwork, readable counts, descending selection pin, completed glazed gym, pause/resume and absence of console errors. Node tests cannot establish visual quality. Previous 22-second qualitative LOW/HIGH/MEDIUM scenes and earlier architectural pavilion screenshots are superseded and should not be presented as proof of this version.

Matching artwork: `public/landing/assets/projects/024-mynextgym-location-choice-v3.png`. Its final generation prompt and provenance are recorded in `docs/mynextgym-artwork-v3.md`. Both views share the three candidate sites, sample counts and the proposed gym at B. The 3D uses a glazed station canopy, taller offices and residential blocks to make the footfall origins visible.

## Files

- Scene: `public/landing/artifacts/mynextgym.js`
- Integrated app: `public/landing/artifacts/mynextgym-app-screen.js`
- Tests: `scripts/tests/mynextgym.test.mjs`
- This documentation: `docs/mynextgym-exhibit.md`
