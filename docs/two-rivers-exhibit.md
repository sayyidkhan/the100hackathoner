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

Shared standard Artwork / Explore in 3D card. A single versioned cinematic artwork works in either site theme. The native Three.js miniature follows the same arrangement: paired turquoise tributaries, a golden branching Tree of Life with planted crowns, left-hand timber pavilion and canopy bridge, right-hand bamboo coaster and solar pavilion, and a front title plaque.

The two boats converge onto the same river; a three-car train follows a closed track; lights gently orbit the canopy. Animation is driven by the shared gallery clock, so pause, reduced motion, offscreen suspension and keyboard rotation retain their existing behavior. Static geometry is batched by material; animated vehicles remain separate. No additional runtime dependencies.

Artwork was generated with built-in image_gen. Exact prompt: `outputs/two-rivers-review/artwork-prompt.json`. Final asset: `public/landing/assets/projects/040-two-rivers-v1.png`.

## Verification

- `npm run build` passed: Astro checks and 97 generated pages, including responsive WebP variants of the new artwork.
- `node --check public/landing/artifacts/two-rivers.js` and `git diff --check` passed.
- Live browser review at 1280px and 390px: 3D, artwork, dark and light themes; mobile document width equals viewport width (390px).
- Paused screenshots were byte-identical; resumed screenshots differed. Keyboard rotation and reset were exercised. No browser console errors observed.
- Mobile viewport override reset after review. Screenshots saved in `outputs/two-rivers-review/`.
- The reduced-motion/offscreen lifecycle is inherited from the shared gallery implementation; no separate OS reduced-motion simulation was run.
