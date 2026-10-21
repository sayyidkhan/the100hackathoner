# Hedera Agents Hub — autonomous exchange exhibit

## Evidence and direction

Reviewed the project README at https://github.com/sayyidkhan/HederaAgentsHub and the public caption at https://www.instagram.com/reel/DQjw5Lik-5m/ on 21 October 2026.

The README describes a Hedera testnet agent economy: ERC-8004 identity/reputation/validation registries, buyer/seller negotiation, x402 payments, and HCS audit logging. Its example buyer searches for an iPhone within S$1,000. The README mixes completed infrastructure with planned/in-progress end-to-end demonstrations, so the exhibit is explicitly illustrative, not live commerce. The Instagram caption frames the project as agents doing commerce on behalf of people. No Instagram changes or posts were made.

The previous generic ivory/red/blue miniature did not make those mechanisms legible, and its block-based live model lost the artwork's character. The replacement uses an obsidian/jade autonomous exchange, a Hedera portal, rounded ceramic agents and four connected transaction tiles.

## Implementation

- New built-in imagegen artwork: `public/landing/assets/projects/046-hedera-exchange-v2.png`.
- Exact generation prompt: `outputs/hedera-review/artwork-prompt.txt`.
- One intentional dark exhibit palette within both surrounding site themes.
- Responsive Astro WebP variants at 480, 800, 1200 and 1536 pixels; build outputs approximately 28–182 KB.
- Rebuilt `hedera-agents.js` with bevelled bodies, faceplates, articulated arms, devices, registry panels, custom stage, circuitry and animated transaction packets.
- Existing lazy-loading viewer handles motion pause, reduced motion, keyboard rotation, reset, hidden/offscreen suspension and WebGL fallback.
- Four selectable concept stages: Discover, Negotiate, Pay, Record. Selecting a stage stops step auto-play; motion can be paused independently.
- Project-specific styling in `public/landing/hedera-agents.css`; scoped markup in `ProjectExhibit.astro`, art references in `project-art.ts`, and a Hedera-only lighting branch in `scene.js`.

## Verification

- Astro check: no errors or warnings (existing repository hints).
- Astro production build: passed, 97 pages.
- JavaScript syntax and diff whitespace checks: passed.
- Browser: artwork/3D switching, manual step selection, pause, keyboard rotation and reset exercised; no logged browser errors or warnings during inspection.
- Desktop and 390px mobile inspected in surrounding light/dark presentation; no horizontal overflow at 390px.
- Corrected selected-button contrast inherited from the surrounding light theme.
- Screenshots in `outputs/hedera-review/`.

Changes remain local; no deployment, commit, or Instagram publication was performed. Other existing and concurrent exhibit edits were preserved.

## Card layout follow-up

At the user’s request, the card now uses the same shared layout as Natalie’s Tempeh: “THE PROJECT, REIMAGINED” toolbar, standard Artwork / Explore in 3D buttons, image/stage, standard rotation controls, and the shared caption. Removed the custom promotional heading, protocol badges, dark card theme, custom caption and additional walkthrough panel. The new artwork, 3D model and automatic transaction animation remain. Only the 3D stage retains its jade lighting backdrop; the card follows the site theme. This supersedes the custom card styling and selectable walkthrough described above.

## Animated 3D refinement

The next revision replaces the earlier miniature with smooth rounded-cuboid geometry and analytic normals, ceramic clearcoat, dark visors, metallic ear caps, jointed fingers, hand-attached devices, seats, layered machined portal rings, a local veined-stone texture, inlaid routes, and soft contact shadows. Lighting is isolated to the Hedera studio profile. The standard Natalie’s Tempeh card layout is unchanged.

A 24-second absolute-time animation performs four six-second phases: discovery scans, negotiation with an illustrative S$999 offer, a moving phone and x402 payment packets, and a verified HCS receipt. Agents blink, look around, lean, gesture and acknowledge the exchange. Portal machinery, scanning rings, orbit lights and registry panels animate throughout. The shared viewer provides pause/resume, reset, keyboard orbit, offscreen suspension and reduced-motion behavior.

`outputs/hedera-review/check-animation.mjs` checks all four stages, finite transforms, repeatable seeking, exact loop endpoints and invalid-time handling using a mocked canvas for geometry construction. Rendering was separately inspected in the browser. Static architecture is batched without losing UVs; the final model has approximately 241k triangles, down from approximately 353k in the first refinement pass.

Verification: Astro check (zero errors/warnings), production build, timeline checks, desktop/mobile browser inspection at 390px, no horizontal overflow or browser errors. Pause screenshots showed an unchanged scene; only the browser scrollbar faded. Screenshots: `animated-exchange-v3.jpg`, `motion-phase-a.jpg`, `mobile-motion.jpg`.

Final motion QA also uses `outputs/hedera-review/animation-review.html` to inspect exact poses at 1, 8, 14 and 19 seconds through the same renderer. Offer/receipt panels were moved forward over the table with stronger contrast to avoid obscuring the rear agent’s face. The model opts into elapsed-time animation so frame throttling does not slow its choreography; the shared physics delta remains bounded, and pause/offscreen/hidden states reset the timing clock.
