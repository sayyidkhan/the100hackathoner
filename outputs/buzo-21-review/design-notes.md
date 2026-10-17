# Buzo 2.1 exhibit redesign

Reviewed the current `gigradarapp/gr-frontend` README through GitHub. Its product story is Singapore-first nightlife discovery: fragmented event sources, taste-based recommendations, credible options and planning. `gr-ask-buzo-v2` README contains only a title. Entry #68 has no direct repository URL, so the frontend repository is product context, not proof that every current feature existed at the June finals.

Sources:
- https://github.com/gigradarapp/gr-frontend
- https://github.com/gigradarapp/gr-ask-buzo-v2
- https://www.instagram.com/p/DZ3itBVzLwN/ — read through browser; author identifies the 68th hackathon as UCWS 2026 finals.
- https://www.instagram.com/p/DZ7AtfFndkJ/ — read through browser; additional finals photos.

Direction: a miniature night-out district, organized around the concierge and event shortlist. Music club, art gallery and rooftop lounge are illustrative venue categories, not named partners or actual app listings. The globe is a small supporting detail, not the focal point. No new claims about bookings, ticket purchases or global coverage were added.

Artwork was generated with the built-in imagegen tool. Exact prompt: `artwork-prompt.txt`. Saved asset: `public/landing/assets/projects/068-buzo-21-night-v2.png`. Both site themes use this intentionally nocturnal artwork. The Three.js interpretation shares its composition and materials; it is stylized rather than a photoreal reconstruction.

The native Three.js scene includes individually modeled instruments, marquee bulbs, gallery floors and artworks, pergola lights, lounge furniture, fluted brass-and-coral reception desk, event recommendation cards, miniature visitors, planted edges and paving. Shared renderer and other exhibits were not edited. Existing reduced-motion and pause controls are retained.

Validation: desktop light/dark, artwork load, mobile width without overflow, pause stability, no page errors; production build. Screenshots and browser check in this directory.

## Artwork alignment pass

The original real-time model underrepresented the artwork. Reworked the open stage and draped curtains, taller glazed gallery, art sculpture, lounge seating/canopy/railings, human proportions, planted roof beds, courtyard benches, canal and bridge. Removed the floating speech bubble from above the phone and placed typing dots inside its screen. Added stone grain, warmer practical lights and baked ambient contact shading.

Rebuild shading after geometry edits:
`node scripts/bake-buzo-atlas-ao.mjs --model=buzo-21 --rays=12 --cell=0.06 --out=public/landing/assets/buzo-21-ao-v1.bin`

The baker now accepts buzo-21 while retaining its existing atlas options. The runtime uses the existing shared baked-AO loader and validates geometry signatures. Artwork is unchanged. The model remains a real-time stylized interpretation; it does not reproduce the generated artwork's photographic people or every surface detail.
