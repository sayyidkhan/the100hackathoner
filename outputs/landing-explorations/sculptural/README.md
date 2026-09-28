# Sculptural 100

Independent, unmerged landing-page exploration for The 100 Hackathoner.

Run `npm ci`, then `npm start` and open http://127.0.0.1:18502.
Run `npm run check` for JavaScript syntax checks.

Art direction: pale architectural canvas, glossy cobalt sculpture, and architectural editorial scale. Inspired by Lusion’s full-bleed material-rich spatial stages, not a replica. No portrait, no journey-map duplication. The perspective design skill informed spatial hierarchy and accessible interaction states.

The interactive hero is real Three.js geometry with beveled extrusions, physical materials, studio environment lighting, shadows and a brushed-metal plinth. Native CSS project artwork is conceptual and labeled as abstract studies, not product screenshots. Project content is a local snapshot of the real 81-record site data. Project buttons open keyboard-accessible native dialogs, and Show me another side rotates through that data. About, judging, and writing links lead to the original local site on port 18481.

Three.js is served locally from the app’s own node_modules; no remote runtime assets or fonts. A CSS 100 remains if WebGL fails. Rendering is capped at ~30fps and 1.65 DPR, pauses offscreen/background, and respects reduced-motion preferences. No forms, analytics, or remote data submission.

This folder is isolated from the production application. No commit, push, or merge is performed.
