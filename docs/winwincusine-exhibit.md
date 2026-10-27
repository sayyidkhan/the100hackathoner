# WinWinCusine — project 021

## Evidence

- Excel: `data/Hackathon CV.xlsx`, Hackathons!I22: “Group food recommendation app”.
- Project spelling: Hackathons!K22, “WinWinCusine”.
- Original Instagram post: https://www.instagram.com/p/BqADJkbAn8x/ — team photograph and caption confirming the 21st hackathon, SP, Singapore, 2018. It does not show the prototype.
- The user confirmed on 27 October 2026 that the app combines everyone’s food preferences and recommends a place the group can agree on.
- The kopitiam, “Good Together” venue, three preferences, dishes and phone UI are conceptual examples. They are not claimed original screens, actual restaurant recommendations, a verified matching algorithm or dietary guarantees.

## Deliverables

- Artwork: `public/landing/assets/projects/021-winwincusine-kopitiam-v1.png`.
- Live Three.js scene: `public/landing/artifacts/winwincusine.js`.
- Readable, unlit phone display: `public/landing/artifacts/winwincusine-screen.js`.

The two-storey Singapore shophouse has clay roof tiles, louvered shutters, patterned tile frieze, jade lower tiles, an open shop, shelves and cups, a counter, pendant lights and folding doors. A shared timber table with three coloured stools connects the three preference cards. A 22-second deterministic loop moves each preference into the shared junction, updates the phone count, combines all three, and reveals the meal and recommendation together. No extra step tabs. The shared gallery supplies pause, reduced motion, rotation, zoom and replay.

Static geometry is batched by material. Only labels and animated groups remain independent. Phone textures redraw when state changes.

## Validation

`node --test scripts/tests/winwincusine.test.mjs` checks recommendation ordering, shared clock/replay, finite geometry and bounded animation. `npm run build` checks Astro and generates responsive artwork variants. Browser review checks artwork, legible phone, roof geometry, motion, pause and replay.

## Artwork prompt

Generated using the built-in image generation tool.

```text
Use case: stylized-concept.
Asset type: landscape 1536x1024 project artwork for WinWinCusine, a Singapore group food recommendation app.
Primary request: an exquisitely crafted miniature explaining three friends combining their food preferences to find one place to eat together. Premium architectural model photography, believable miniature materials, joyful restrained colors, sophisticated editorial composition.
Composition: isolated complete diorama with a thin rounded warm terrazzo floor, dark deep forest teal seamless studio backdrop, front three-quarter camera from slightly above. Entire scene in frame, fills 85 percent width. Center-rear: a jewel-like Singapore kopitiam shophouse facade, two-storey pale peach plaster with detailed mint louvered shutters above, cream pilasters, terracotta tiles, striped jade-and-cream retractable awning. Ground floor is a warmly glowing open dining shop with an elegant small sign reading exactly "GOOD TOGETHER", timber double doors, tiled lower walls, two warm pendant lamps, a slim display counter and subtle menu details. No pagoda, no generic skyline.
Foreground center: a beautifully made round timber communal dining table with three low stools upholstered coral, mint and mustard. Three distinct porcelain dishes on table: noodle soup, rice with vegetables, and curry with rice; delicate chopsticks, spoons, clear drinking glasses. A thin circular mint illuminated inlay surrounds the table, subtly connecting the three seats.
Left foreground: three small upright rounded ivory preference cards in a staggered fan on a slim dark teal holder, with a coral, mint, or mustard circular avatar icon and respectively large clear labels "NOODLES", "VEGGIE", "MILD". Delicate color-matched paths inset into the floor connect these three cards into one shared junction leading to the restaurant.
Right foreground: a compact upright portrait phone with thin charcoal bezel on a small ceramic stand, its screen entirely legible and uncluttered: small title "WinWinCusine"; main heading "A place for everyone"; three colored avatar circles; large green check mark; a minimal restaurant card labelled "GROUP MATCH". Keep this modest in size so the table and venue remain the main subject.
Materials: glazed ceramic bowls, real timber grain, terrazzo flecks, finely ribbed shutters, woven awning fabric, brushed muted brass hardware, textured plaster, translucent glass. Two tropical potted plants frame storefront. Warm inviting interior, broad soft key light, cool edge light, beautifully grounded contact shadows, realistic global illumination, crisp surfaces and readable silhouettes. This is a conceptual interpretation, not a screenshot of real product.
Avoid: human figures, toy people, oversized gold platform, floating food, excessive labels, diagram arrows, tall giant phone, sci-fi holograms, unrelated landmarks, visual clutter, watermark.
```
