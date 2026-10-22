# Hackathon 40 — Two Rivers, One Future

## Research and interpretation

Reviewed the four Instagram links and the Facebook post attached to record 40 on 22 October 2026.

- https://www.instagram.com/reel/DOQFqH8kfeT/ — the actual design/marketing submission. Its caption names **Two Rivers, One Future – A Journey Beyond**, a Sarawakian Tree of Life combining rainforest and Supertrees, daytime canopy walks, nighttime drones and lighting, an immersive boat ride from heritage to innovation, merging rivers of light, bamboo coasters, recycled carts, solar rides and an Eco-Quest AR idea. This is the primary source for the exhibit.
- https://www.instagram.com/p/DOQcqfMk4Wk/ — the creator's 40th hackathon; learning Loveart and Newhero for visual storytelling, presentations, video and social marketing collateral. The image identifies Team Stock Surfers and remote participation.
- https://www.instagram.com/p/DOVACxLE9PW/ — completion and Best Novel Hackathon Finisher trophy; photos show a wooden award and the team at a park.
- https://www.instagram.com/reel/DOVLDxsE37O/ — caption identifies a personal account of the hackathon experience. The spoken audio was not transcribed; no additional claims are inferred from it.
- https://www.facebook.com/meetwanwei/posts/pfbid02fC64ffhqpB8RDBYo11hz17WicCZDaaXkjpTUG7WmZN2Dqb9GJNEP8q9fH87ARNrQl — Soh Wan Wei congratulates the team on finishing despite missed flights and detours to Kuching. Visible photos corroborate the team and wooden trophy.

The exhibit depicts the submitted eco-theme-park concept, rather than inventing a software product for a record with no repository. It is a conceptual architectural miniature, not a built park, actual site plan or engineering design. The pavilion, landscaping and precise attraction arrangement are artistic interpretations. The event title and award data remain unchanged.

## Design and implementation

Shared standard Artwork / Explore in 3D card. Separate daylight and night artwork follows the site theme, with the same composition in both variants. The native Three.js miniature follows the same arrangement: paired turquoise tributaries, a golden branching Tree of Life with planted crowns, left-hand timber pavilion and canopy bridge, right-hand bamboo coaster and solar pavilion, and a front title plaque.

The two boats converge onto the same river; a five-car train follows a closed track; lights gently orbit the canopy. Animation is driven by the shared gallery clock, so pause, reduced motion, offscreen suspension and keyboard rotation retain their existing behavior. Static geometry is batched by material; animated vehicles remain separate. No additional runtime dependencies.

Artwork was generated with built-in image_gen. Night prompt: `outputs/two-rivers-review/artwork-prompt.json`; asset: `public/landing/assets/projects/040-two-rivers-v1.png`. The daylight edit preserves that composition: prompt `outputs/two-rivers-review/daylight-prompt.json`; asset `public/landing/assets/projects/040-two-rivers-light-v2.png`.

The second fidelity pass separates the stable entry point from `two-rivers-world.js` and `two-rivers-surfaces.js`. It replaces the flat disk with a carved heightfield and stratified stone edge; uses dense, individual folded leaves and palms; adds timber flooring, roof shingles, veranda balusters, window mullions, coaster braces, photovoltaic cells, passenger boats and visitors. Procedural local maps supply wood grain, rock strata, soil and animated water normals. Night mode adds lit windows, branching trunk light strips, subtle brass emission, crown lights and drones; daylight turns the practical glows off.

This remains a realtime procedural interpretation, not a pixel-identical or photorealistic reconstruction of the generated artwork. Geometry is batched by material. The model contains approximately 636,154 triangles and 151 mesh objects including moving vehicles; performance on physical low-end mobile devices has not been benchmarked.

## Verification — second fidelity pass, 22 October 2026

- `npm run build` passed: Astro checks and 97 generated pages, including responsive WebP variants of the daylight artwork.
- Syntax checks on both new modules and `git diff --check` passed. A construction sanity check found zero non-finite geometry coordinates or animated positions across five sample times and both themes.
- Live browser review at 1280px and 390px: 3D, artwork, dark and light themes; mobile document width equals viewport width (390px).
- Paused screenshots were byte-identical; resumed screenshots differed. Keyboard rotation and reset were exercised. No browser console errors observed.
- Mobile viewport override reset after review. Updated screenshots: `outputs/two-rivers-review/day-3d-v2.png`, `night-3d-v2.png`, and `mobile-3d-v2.png`.
- The reduced-motion/offscreen lifecycle is inherited from the shared gallery implementation; no separate OS reduced-motion simulation was run.

## Wider river mouths — third pass

The river landform is now separated into `two-rivers-terrain.js`: carving channels extend beyond the island boundary while boat routes stay within it. Both tributary entrances flare towards the edge; the front channel expands into a broad estuary (over 2.5 units wide at z=2.1, compared with the previous 1.3-unit channel). Riverbanks gain irregular stones and low plants. Water uses a tessellated surface with shallow-water colors and irregular noise-based ripples. Stone maps have softer granular strata, palm leaflets are larger, and the initial camera is slightly lower. Daylight has more ambient fill; night has brighter warm key and environment lighting. Existing separate day/night artwork remains connected to the theme toggle.

Validation: four Node topology tests pass (estuary width, open tributaries, navigable boat routes, raised building/tree pads). Geometry construction and animation sanity check reports zero non-finite coordinates. Production build passes with 97 pages; desktop browser review passes in both themes with no console errors. New screenshots: `day-3d-v3.png` and `night-3d-v3.png` in `outputs/two-rivers-review/`. No physical-device performance benchmark was performed.

## Distinct day/night rendering

The fourth pass strengthens the actual 3D material and lighting response to the theme toggle. Night has cool, reduced ambient illumination, emissive golden framework, warm windows, blue water and four local warm canopy/trunk lights. Day restores neutral foliage, brighter natural illumination and blue window reflections, and switches off local lights and emission. Both rendered modes were reviewed in the browser without console errors; screenshots are `day-mode-v4.png` and `night-mode-v4.png`. Production build passes.

## Atmosphere pass

Added a local `two-rivers-atmosphere.js` layer: night-only drifting fireflies, soft canopy halos and broken warm reflections; day-only low river haze and floating sunlit dust. All movement uses the gallery clock, with deterministic haze positions so pausing freezes the effects. Morning lighting now arrives from a lower angle against warm ivory/sage; night uses a deeper blue backdrop with stronger cool rim light. Lower brass emission preserves the branching structure, while local canopy lights illuminate foliage. Both themes reviewed in-browser without console errors. Screenshots: `day-ambience-v5.png`, `night-ambience-v5.png`. Four terrain tests pass.

## Visible clouds and river mist

The sixth pass replaces the faint additive day wisps with a dedicated `two-rivers-weather.js` layer shared by both modes. Five large cloud banks sit behind/alongside the crowns, while six low mist banks interleave the river, bridge and forest at different depths. Two local procedural alpha textures provide puffed cloud silhouettes, turbulent detail and soft transparent edges. Normal alpha blending and untonemapped cloud colors keep weather visible against the new blue daytime sky as well as the dark sky. Day uses white clouds and pale mist; night uses moonlit blue clouds and cyan mist. Sprites are depth tested, use two shared textures, add eleven draw calls, and never cast shadows. Their drift is derived directly from the gallery clock.

Seven atmosphere/terrain tests pass, including soft texture density/borders, resource reuse on theme changes and deterministic animation. Desktop review confirms visible clouds/mist in both themes without hiding the boats/buildings, with no console errors. Paused browser captures are byte-identical. At 390px the document remains 390px wide and clouds remain visible; viewport restored after review. Screenshots: `day-clouds-v6.png`, `night-clouds-v6.png`, `mobile-clouds-v6.png`. These are lightweight layered billboard effects rather than raymarched volumetric clouds.
