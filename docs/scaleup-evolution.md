# ScaleUp AI: one idea, three builds

Projects 36, 37 and 38 are presented as one evolving project. The UI keeps the existing exhibit format and adds chapter navigation, what carried forward, what changed, and where each edition led. Every 3D exhibit opens on its own edition and can show the other two without leaving the page.

## Source basis

- The user's account establishes continuity across all three hackathons.
- Local catalog: Super AI (17–19 June 2025), Bolt.New (21 June), OOJU × Manus.AI (27 June). The last edition earned second place.
- [Bolt edition README](https://github.com/sayyidkhan/scaleupai-bolt): F&B SMEs, dashboard, financials, growth coach, reviews analytics, social media and trends.
- [Devpost submission](https://devpost.com/software/jslw-scaleupai-bolt-edition): affordable AI business consulting and actionable roadmaps.
- [VR edition additional README](https://github.com/sayyidkhan/manus-im-hackathon/blob/HEAD/README%202.md) and repository tree: substantially the same dashboard foundation. The local catalog identifies this as the VR edition. The spatial scene is explicitly a concept interpretation; the repository review did not establish a completed VR runtime.
- Original Super AI repository returned 404. Its scene uses the catalog description and the user's continuity statement rather than claiming a source audit.

This is a narrative of capability and interface evolution. It does not assert increases in customers, revenue, deployments or commercial scale. The café is a visual metaphor for the SME/F&B focus.

## Artwork

Generated with the built-in imagegen tool. Prompts are in [scaleup-artwork-prompts.md](./scaleup-artwork-prompts.md). The same artwork is used in both site themes; surrounding UI and 3D lighting adapt to the theme.

- `public/landing/assets/projects/036-scaleup-origin-v2.png`
- `public/landing/assets/projects/037-scaleup-platform-v2.png`
- `public/landing/assets/projects/038-scaleup-spatial-v2.png`

## Interactive scene

`public/landing/artifacts/scaleup-evolution.js` builds one shared café, ledger, six dashboard panels, portal and headset. Per-edition wrappers choose the initial chapter. Shared geometry preserves visual continuity. Material batching reduces draw calls. High-resolution canvas labels remain separate from the geometry batches. Moving data beads and floating spatial panels use deterministic time-based motion. Chapter selection works while paused; automatic progression is opt-in. The existing renderer handles reduced motion, offscreen suspension, rotation, keyboard controls and disposal.

## Validation

- `node --test scripts/tests/scaleup-evolution.test.mjs`: all three edition tests pass. Tests cover initial chapter, manual selection, automatic progression, invalid selections, finite vertices, increasing visible geometry and deterministic animation seeking.
- `npm run build`: Astro check and production generation pass.
- Browser: all three page links, correct initial chapters, artwork/3D switching, manual stages and pause checked. Mobile 390px layout has no horizontal overflow. No warning/error logs in the reviewed tab.
