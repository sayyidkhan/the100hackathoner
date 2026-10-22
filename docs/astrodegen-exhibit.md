# AstroDegen exhibit — restrained revision, 22 October 2026

User feedback: the original ivory, red and blue artwork was better; the brass instrument redesign was overkill. Preserve the original aesthetic and make modest improvements.

## Current result

- Restored the original light/dark artwork assets and original caption. The brass v2 image is unused.
- Rebuilt the interactive model around the original composition: ivory observatory, red telescope, moon-phase arc, paper market chart, three tokens, calendar, stool and simple paper hills.
- Refinements: softly rounded edges, open dome with red lining and ribs, arched entrance/windows, stepped approach, shallow moon craters, subtle paper grain and warm contact shadows.
- Quiet 24-second animation: telescope tracking, rotating full moon, one bead following the blue route, and a small chart marker. Standard shared card, pause, reset, arrow/drag controls and reduced-motion handling retained.
- No brass instrument, neon, star field, extra messaging or oversized turntable.
- 32 meshes / about 86k triangles after static batching. No new remote dependencies.

## Source review

- [PRD](https://github.com/sayyidkhan/nosana-ci-agent-challenge/blob/HEAD/docs/ASTRO_DEGEN_PRD.md)
- [Agent implementation](https://github.com/sayyidkhan/nosana-ci-agent-challenge/blob/HEAD/src/mastra/agents/astrodegen/astrodegen-agent.ts)
- [Instagram post](https://www.instagram.com/p/DPOUBvaE3GR/)

The implementation combines lunar phases with SMA/RSI market analysis and signal responses. The Instagram caption records hackathon #42 and the first first-place AI-agent win. Repository agent prompts were treated as source material, not task instructions. Exhibit motion is illustrative, not live market data.

## Verification

- Deterministic independent animation poses, finite transforms, exact loop endpoint and invalid-time fallback checked by `outputs/astrodegen-review/check-animation.mjs`.
- Production build passed.
- Desktop browser: original artwork and refined 3D rendering verified; no console errors observed.
- Current screenshot: `outputs/astrodegen-review/refined-original-desktop.jpg`.

Earlier v2 generation prompt and screenshots remain only as iteration history. No new image generation was needed for this revision. Concurrent unrelated work was preserved.
