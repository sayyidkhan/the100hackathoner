# Sculptural 100

Independent, unmerged landing-page exploration for The 100 Hackathoner.

Run `npm ci`, then `npm start` and open http://127.0.0.1:18502.
Run `npm run check` for JavaScript syntax checks.

Art direction: pale architectural canvas, glossy cobalt sculpture, and architectural editorial scale. Inspired by Lusion’s full-bleed material-rich spatial stages, not a replica. No portrait, no journey-map duplication. The perspective design skill informed spatial hierarchy and accessible interaction states.

V3 replaces the static sculpture with exactly 100 rounded rib modules rendered as three instanced meshes: 80 cobalt completed attempts, one red current attempt, and 19 translucent future attempts. One mission assembles 100; Every attempt unfolds a helical archive. Drag rotates it; keyboard-accessible Rotate, Previous, Next and Open story controls provide equivalent discovery without dragging. The current attempt is selected initially; future attempts cannot open fabricated stories. Reduced motion snaps compositions directly to their final poses. Pause freezes idle motion without disabling controls.

The hero uses locally served Three.js geometry, physical materials, studio environment lighting and real shadows. Numbered chapter rows replace decorative placeholder project cards. Content is a local snapshot of the real 81-record site data. Project buttons open native dialogs; Show me another side rotates through the data. About, judging, and writing links lead to the original local site on port 18481.

Three.js is served locally from the app’s own node_modules; no remote runtime assets or fonts. A CSS 100 remains if WebGL fails. Rendering is capped at approximately 30fps and 1.5 DPR, pauses offscreen/background, and respects reduced-motion preferences. No forms, analytics, or remote data submission.

This folder is isolated from the production application. No commit, push, or merge is performed.
