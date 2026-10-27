# Smart Food Bridge — hackathon 14

## Source context

- Repository record: `src/data/hackathons.json`, #14, Smart Food Bridge, “Dietary food locator”, SPSEC SP Hackathon 2018, third place. No GitHub or project URL is recorded.
- Original public Instagram post: https://www.instagram.com/p/BgWUFk4FOSa/ . Reviewed through the browser on 26 October 2026. The caption describes building a smart bridge application to collate menus in one place and says an app link would be posted later. The visible photograph is the award presentation; it does not document a UI or specific dietary filters.
- This exhibit is therefore a conceptual interpretation of menu aggregation and dietary food discovery. Noodle House, Garden Bowl, Fish & Rice, the vegetarian example, menu map and route are illustrative. They are not verified restaurants, live directions, or a dietary-safety assessment. Do not present this as a recovered original application or verified original feature set.

## Art direction

`public/landing/assets/projects/014-smart-food-bridge-v1.png` is generated artwork: three warm Singapore-inspired food stalls, a jade phone, a ceramic vegetarian bowl, terrazzo base, brass detail and a green route to the middle stall. The corresponding Three.js module is `public/landing/artifacts/smart-food-bridge.js`.

The real-time model uses fluted timber counters, tiled backsplashes, striped canvas awnings with valances, hanging lamps, menus, jars, bowls, utensils, stools, plants and a physically modelled meal with rice, shaped leaves, tofu, tomatoes and cucumber. All geometry and screen content are local. Existing source metadata and original posts are preserved.

The UI refinement enlarges the phone and replaces the generic screen with four distinct layouts: a photo-led menu list, dietary preferences, selected dish details and a food-court route map. `food-bridge-screen.js` owns the interface and `food-bridge-details.js` supplies timber/terrazzo surfaces, cooking stations, ingredient trays, bamboo steamers, condiments, plates and café tables. The centre walkway remains open. A matching label appears on Garden Bowl with the selected dish; the green route traces the walkway instead of appearing as a permanent brass cable.

`014-food-menu-photos-v1.png` is an AI-generated three-panel food-photo atlas, used locally for illustrative menu thumbnails and the dish detail screen. Dish names, prices and ingredients are demonstration content. These are not original project screenshots or live restaurant listings.

## Sequence and controls

A deterministic 24-second sequence: browse three menus → select a vegetarian preference → highlight Garden Bowl → trace a route and settle its pin after arrival. The phone reflects the same stages. The route fades before restarting. Manual stage selection holds the chosen state; Auto-play resumes from there without jumping. Shared controls provide pause, rotation, zoom and reset.

Motion remains visible during the reading portions: a sweep scans each menu in order, steam rises from serving bowls, the matched destination pulses, and four progress strips advance on the phone. All movement uses the same seekable clock, so pause and manual stages freeze the whole scene. Explicitly enabling Auto-play also resumes a paused #14 walkthrough (while respecting reduced-motion preferences).

Artwork and 3D are separate views of the same concept. The scene is a miniature interpretation, not an operational food-finding service.

## Checks

`scripts/tests/smart-food-bridge.test.mjs` verifies stage order, arrival-before-pin-drop timing, screen/marker/route agreement, replay and looping, manual/auto continuity, finite indices and geometry, and mesh/triangle budgets. Browser checks cover both views and controls. Build validation uses `npm run build`.
