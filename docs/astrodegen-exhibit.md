# AstroDegen exhibit — crafted miniature, 22 October 2026

User direction: retain the original ivory, red and blue visual identity, use one moon moving left to right while changing phase, and raise the quality of the interactive model. Keep the standard shared exhibit card.

## Current result

- Restored the original light/dark artwork assets and original caption. The brass v2 image is unused.
- Rebuilt the interactive model around the original composition: ivory observatory, red telescope, one traveling moon and its arc, a large market terminal, three tokens, calendar, stool and eroded limestone scenery.
- Material separation: textured limestone, glazed ivory dome, clear-coated red enamel, navy foundation, nickel fittings, optical glass, warm recessed windows and matte paper.
- Construction details: stone courses, recessed door, window mullions, dome seams and rivets, shutter edges, telescope objective and focusing knobs, finder scope, desk drawer/feet, notebook and paper stack. Irregular limestone clusters replace cone scenery.
- A larger, sculpted moon has overlapping crater basins/rims, lunar seas and fine procedural surface maps. Its single continuous transit and changing illumination remain the focus.
- Stronger side light, restrained fill, warm rim light and photographic reflection strips reveal the material differences. Local contact shadows sit on the stone surface. Ambient-only vertex occlusion adds depth to rigid architecture without freezing shadows from moving parts. The slightly lower camera gives the screen more visual weight.
- 24-second loop: one moon travels left to right for 22 seconds, waxing to full at the midpoint and waning toward the right horizon. It fades out for the return, then reappears at the left. Telescope and dome continuously track this single moon. Removed the four duplicate moons, all moon support rods and the separate orbit bead. The enlarged market display builds 13 broad OHLC candles and volume bars from that same lunar progress. A pulse travels from the observatory to the display, while labeled BUY/HOLD/SELL desk tokens lift and illuminate at the matching stage. The in-scene display is marked SIM; the authored market cycle is illustrative. Standard shared card, pause, reset, arrow/drag controls and reduced-motion handling retained.
- The terminal is about 85% wider than the preceding version, with roughly three times the screen area. A dark navy face separates teal/red candles, bright wicks, price and percentage change, BUY/HOLD/SELL/WATCH status, lunar phase and illumination. Entry arrows sit on the chart. The price path is subdued so the candles remain dominant.
- The instrument has a rolled metal bezel, ribbed rear housing, a separately sized support, a wider desk and a miniature keyboard. Its face clears the tabletop by about 0.156 model units; the full moon route clears the enlarged display. Bevel topology is concentrated at edges, cylinders have rounded profiles, surface UVs preserve texture density, and small fittings use fewer polygons.
- No brass instrument, neon, star field, extra messaging or oversized turntable.
- 42 meshes / about 317k triangles at the start of the cycle after static batching. Four shared 256px surface maps and a 649 KB contact-occlusion bake. No new remote dependencies.

## Source review

- [PRD](https://github.com/sayyidkhan/nosana-ci-agent-challenge/blob/HEAD/docs/ASTRO_DEGEN_PRD.md)
- [Agent implementation](https://github.com/sayyidkhan/nosana-ci-agent-challenge/blob/HEAD/src/mastra/agents/astrodegen/astrodegen-agent.ts)
- [Instagram post](https://www.instagram.com/p/DPOUBvaE3GR/)

The implementation combines lunar phases with SMA/RSI market analysis and signal responses. The Instagram caption records hackathon #42 and the first first-place AI-agent win. Repository agent prompts were treated as source material, not task instructions. Exhibit motion is illustrative, not live market data.

## Verification

- Deterministic independent animation poses, finite transforms, exact loop endpoint and invalid-time fallback checked by `outputs/astrodegen-review/check-animation.mjs`.
- Lunar coverage (new, quarter, full), a single moon, monotonic visible travel, hidden return, continuous telescope tracking, dome aperture alignment and deterministic looping checked by `scripts/tests/astrodegen-lunar-motion.test.mjs`.
- Market synchronization tests check candle progression, changing prices/signals, moon/market position and illumination agreement, deterministic seeking, and loop reset. They also check actual drawn signal labels, screen size, tabletop clearance and framing coverage.
- Production build passed.
- Browser: refined 3D rendering, pause/reset and 390px mobile framing verified. No rendering errors observed; the local Vite websocket logged a connection error, so source updates were verified after an explicit page reload.
- Astro check: 0 errors, 0 warnings (68 hints across the workspace). Production build: 97 pages.
- Contact-occlusion regression tests confirm bake compatibility, atomic stale-bake rejection, moving-material isolation, live shadows and the Node no-fetch fallback.
- Rigid-assembly batching compared against the unbatched model at six poses: matching world geometry and material/shadow groups. Fixed paving seams extending past the base and raised the stool floor disk above the new stone surface.
- Current screenshots: `outputs/astrodegen-review/market-terminal-sell.png` and `outputs/astrodegen-review/market-terminal-mobile.png`. Desktop and 390px mobile verified with legible candle colors and signal badges. No browser warnings or errors observed on the final render.

## Rebuilding contact shading

After changing static geometry, run `node scripts/bake-astrodegen-ao.mjs`. The bake targets only marked rigid assemblies; the moon, telescope, dome, chart and signal tokens keep live shading. The loader validates the full geometry signature before applying the bake, retains live shadow reception and falls back gracefully if the asset is unavailable or outdated. The default 24-ray bake takes about six seconds on the development machine.

Earlier v2 generation prompt and screenshots remain only as iteration history. No new image generation was needed for this revision. Concurrent unrelated work was preserved.
