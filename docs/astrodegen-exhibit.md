# AstroDegen exhibit — architectural texture and lighting, 22 October 2026

User direction: retain the original ivory, red and blue visual identity, use one moon moving left to right while changing phase, and raise the quality of the interactive model. Keep the standard shared exhibit card.

## Current result

- Restored the original light/dark artwork assets and original caption. The brass v2 image is unused.
- Rebuilt the interactive model around the original composition: ivory observatory, red telescope, one traveling moon and its arc, a large market terminal, three tokens, calendar, stool and eroded limestone scenery.
- Material separation: matte ivory plaster, satin painted dome and optical tube, textured limestone paving, navy foundation, restrained nickel fittings, recessed optical glass, warm interior glazing and matte paper. The architecture now has dedicated 512px plaster/roof height, normal and roughness maps with broad trowel variation and fine pores. UVs map approximately one tile per half model unit so the relief reads consistently across walls, arches and roof panels. Wall normal strength is 0.68; roof normal strength is 1.0.
- The thick cylindrical observatory wall has real arched openings through both surfaces, deep window reveals and a cut-through doorway. A continuous solid wall separates the openings. The dome has a constant-width observing slit that remains open across the zenith, with separately modeled inner and outer surfaces, shutter edges and restrained seams.
- A narrower red telescope has recessed objective optics, a deep lens hood, focusing controls, a small finder and a mechanical mount. The barrel and its rim clear the rotating dome throughout the full transit; the tube remains visibly separated from the moon. Door framing, window mullions, stair edges, desk drawer/feet, notebook and paper stack provide smaller construction details.
- The single moon now uses NASA LROC color and LOLA elevation maps: recognizable dark maria, fine impact craters, pale highlands and subtle geological relief. Neutral regolith shading follows the actual animated light direction, producing a curved terminator and charcoal earthshine. The familiar near side faces the default view. Its continuous transit and changing illumination remain the focus.
- A warm side key reveals the plaster relief, with reduced environment, fill and rim intensity preserving window depth and roof overhangs. A close rectangular grounding footprint seats the base against the studio backdrop. Local contact shadows remain on the paving. The slightly lower camera gives the screen more visual weight.
- A project-scoped 24-tap Vogel hardware-PCF filter softens directional shadow edges on the architecture and steps. The key uses a 10.5-texel radius with its 2048px map. The filter composes with existing material shader hooks and ambient occlusion, preserving native depth comparison, live moving-caster shadows and other exhibits' shaders.
- Denser vertical wall and reveal sampling captures contact shading across broad surfaces. The refreshed 64-ray ambient-only bake adds depth to rigid architecture while the moon, telescope and dome retain live shading. The NASA moon and accepted market behavior are unchanged in this revision.
- 24-second loop: one moon travels left to right for 22 seconds, waxing to full at the midpoint and waning toward the right horizon. It fades out for the return, then reappears at the left. Telescope and dome continuously track this single moon. Removed the four duplicate moons, all moon support rods and the separate orbit bead. The enlarged market display builds 13 broad OHLC candles and volume bars from that same lunar progress. A pulse travels from the observatory to the display, while labeled BUY/HOLD/SELL desk tokens lift and illuminate at the matching stage. The in-scene display is marked SIM; the authored market cycle is illustrative. Standard shared card, pause, reset, arrow/drag controls and reduced-motion handling retained.
- The terminal is about 85% wider than the preceding version, with roughly three times the screen area. A dark navy face separates teal/red candles, bright wicks, price and percentage change, BUY/HOLD/SELL/WATCH status, lunar phase and illumination. Entry arrows sit on the chart. The price path is subdued so the candles remain dominant.
- The instrument has a rolled metal bezel, ribbed rear housing, a separately sized support, a wider desk and a miniature keyboard. Its face clears the tabletop by about 0.156 model units; the full moon route clears the enlarged display. Bevel topology is concentrated at edges, cylinders have rounded profiles, surface UVs preserve texture density, and small fittings use fewer polygons.
- The standard shared card and original ivory/red/blue composition remain intact.
- Approximately 382k triangles after batching; denser wall/reveal sampling adds vertices without adding model draw calls. Architectural finishes use 512px maps alongside the props' smaller shared finish maps. The accepted NASA lunar textures remain approximately 556 KB. The contact-occlusion bake is 728,318 bytes for 728,046 receiver vertices across 16 static batches. Runtime assets are served locally; no new remote dependencies.

## Source review

- [PRD](https://github.com/sayyidkhan/nosana-ci-agent-challenge/blob/HEAD/docs/ASTRO_DEGEN_PRD.md)
- [Agent implementation](https://github.com/sayyidkhan/nosana-ci-agent-challenge/blob/HEAD/src/mastra/agents/astrodegen/astrodegen-agent.ts)
- [Instagram post](https://www.instagram.com/p/DPOUBvaE3GR/)

The implementation combines lunar phases with SMA/RSI market analysis and signal responses. The Instagram caption records hackathon #42 and the first first-place AI-agent win. Repository agent prompts were treated as source material, not task instructions. Exhibit motion is illustrative, not live market data.

## Lunar asset provenance

Source and requested credit: **NASA's Scientific Visualization Studio**, [CGI Moon Kit, SVS 4720](https://svs.gsfc.nasa.gov/4720/). The color map derives from LROC WAC imagery; the elevation map derives from LOLA laser-altimeter data. Visualizer: Ernie Wright; scientist: Noah Petro.

- Color: [lroc_color_2k.jpg](https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg), the 2025 map at 2048 × 1024, saved unchanged as `public/landing/assets/astrodegen-moon-lroc-2k.jpg`.
- Elevation: [ldem_3_8bit.jpg](https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/ldem_3_8bit.jpg), 1024 × 512, saved unchanged as `public/landing/assets/astrodegen-moon-lola-1k.jpg`.
- Rendering adjustments are in the moon shader: near-side UV alignment, restrained displacement and bump relief, reduced color saturation, and phase-dependent regolith lighting. The source images themselves are not edited. A deterministic neutral fallback supports loading failures and Node geometry tests.
- Usage reference: [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). NASA generally permits factual, informational use of its imagery and 3D texture assets with acknowledgment and without implying endorsement, subject to the guidelines and any third-party rights. These lunar assets credit the source material; NASA has not endorsed the exhibit or its illustrative trading signals.

## Verification

- Lunar coverage (new, quarter, full), a single moon, monotonic visible travel, hidden return, continuous telescope tracking, dome aperture alignment and deterministic looping checked by `scripts/tests/astrodegen-lunar-motion.test.mjs`.
- `scripts/tests/astrodegen-market-sync.test.mjs` checks candle progression, changing prices/signals, moon/market position and illumination agreement, deterministic seeking, and loop reset. It also checks actual drawn signal labels, screen size, tabletop clearance and framing coverage.
- `scripts/tests/astrodegen-observatory.test.mjs` ray-tests the real arched window and door openings, checks dome triangle winding, tests the barrel center plus eight rim rays for aperture clearance throughout the loop, confirms a minimum telescope/moon gap of 0.091 model units, and verifies that moving the optical rig leaves fixed architecture unchanged.
- `scripts/tests/astrodegen-occlusion.test.mjs` confirms current static-bake compatibility, atomic stale-bake rejection, moving-material isolation, live shadow preservation, render requests and the Node no-fetch fallback.
- All four exhibit test scripts passed. Astro check passed with 0 errors and 0 warnings; the production build passed with 97 pages.
- Current texture/light/shadow revision verified at 1440px desktop and 390px mobile widths, including pause/resume and complete framing, with no console warnings or errors. One blank canvas occurred during the development viewport resize; a fresh mobile load and repeated 390→897→390→1440→390 resizes while paused rendered correctly. No persistent failure was reproduced. The normal desktop viewport was restored and motion resumed.
- Rigid-assembly batching compared against the unbatched model at six poses: matching world geometry and material/shadow groups. Fixed paving seams extending past the base and raised the stool floor disk above the new stone surface.
- Texture/light/shadow proof paths: `outputs/astrodegen-review/observatory-texture-lighting-desktop.png` and `outputs/astrodegen-review/observatory-texture-lighting-mobile.png`. The earlier observatory-realism and market-terminal captures remain iteration history.

## Rebuilding contact shading

After changing static geometry, reproduce the current bake with `node scripts/bake-astrodegen-ao.mjs --rays=64 --distance=.35 --cell=.01`. It targets only marked rigid assemblies; the moon, telescope, dome, chart and signal tokens keep live shading. The loader validates the full geometry signature before applying the bake, retains live shadow reception and falls back gracefully if the asset is unavailable or outdated. The current 64-ray bake completed in 14.41 seconds on the development machine. Omitting the flags uses the baker's faster 24-ray defaults rather than the current quality settings.

Earlier v2 generation prompt and screenshots remain only as iteration history. No new image generation was needed for this revision. Concurrent unrelated work was preserved.
