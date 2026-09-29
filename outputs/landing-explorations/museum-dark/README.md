# The 100 Hackathoner — Museum Dark

A separate, uncommitted hybrid exploration of the Museum landing page. The existing Museum, Sculptural, Dark Technical, and main Astro application remain separate.

## Run

```sh
npm ci
npm start
```

Open **http://127.0.0.1:18504/**. The server binds only to `127.0.0.1`.

```sh
npm run check
```

The check command validates JavaScript syntax in the controller, scene renderer, models, and server. It is not a browser or visual test.

## Two views, one collection

- **Artwork:** three original Museum concept still lifes. Drag horizontally, use the previous/next buttons, or choose a numbered exhibit.
- **Explore in 3D:** a studio presentation with real-time, rotatable Three.js objects on a neutral display base. Drag to rotate, use the arrow keys to turn, or choose Reset view. Pause motion controls the idle movement; the experience also respects reduced-motion preferences.

The header's **Light mode / Dark mode** control is independent of Artwork / 3D.
All four combinations work. The initial theme follows the device preference;
an explicit choice is remembered locally and restored before the first paint.
Theme changes update the 3D floor, display base and lighting without resetting
the selected project, rotation or pause state. Dark artwork uses dedicated charcoal
studio-background edits with no white frames. The original light artwork is unchanged.
Both variants load independently; only the theme-appropriate image is displayed.

Both views share one selected project: **81, 80, or 79**. Switching views preserves that selection, the caption, and the project opened by **Open the story**. The numbered selectors and previous/next controls work in either view. Artwork navigation and 3D rotation use separate gesture handlers so rotating an object does not accidentally change the selected project.

The 3D renderer loads only when requested. Rendering stops when the view is inactive, the gallery is offscreen, or the document is hidden. If 3D cannot initialize or its graphics context is lost, the controller returns to Artwork and keeps the project collection available.

## What the objects represent

| Attempt | Actual hackathon project | Concept object |
| --- | --- | --- |
| 081 | The Next 8 Seconds: Draw Your Way Home | Red storybook, paper landscape, house, and cobalt path |
| 080 | Itachi's Crow | Black folded-paper crow above a miniature city |
| 079 | Long Taa Borneo Eco Stay | Raised longhouse, forest, and cobalt river |

The still lifes are **generated concept artwork**, not screenshots, documentary photographs, or evidence of physical products. The 3D models are **hand-built interactive interpretations** of those concepts—not exact reconstructions of the raster artwork, real buildings, or deployed project interfaces.

The light JPGs are reused from Museum V3. Original generation prompts and provenance remain in [the Museum asset notes](../museum/assets/ASSET-NOTES.md). Dark-mode background edits were created with the built-in imagegen tool; their saved masters, web assets, and exact prompts are documented in [dark artwork notes](assets/DARK-ARTWORK-NOTES.md).

## Real project records

`hackathons.json` is a local snapshot containing **81 unique attempts and 24 award-bearing records**. The archive supports text search, award filtering, more results, and random project selection. All project details use this dataset rather than invented project outcomes.

Project dialogs use the recorded title, event, date, solution, categories, and award. External project links prefer the recorded GitHub URL, then the event URL, and accept only HTTP/HTTPS URLs. Native modal dialogs provide Escape dismissal and focus handling.

About, contact, judging, essays, and the main journey intentionally link back to the original app at port **18481**. That app must be running for those links to work.

## Files

- `index.html` — page structure, display controls, and shared exhibit selectors.
- `styles.css` — independent light/dark themes, Artwork/3D layouts, responsive layouts, focus styles.
- `app.js` — shared selection/mode state, asynchronous scene loading, artwork gestures, archive, and dialogs.
- `scene.js` — Three.js renderer, studio lighting, camera framing, rotation controls, visibility lifecycle, and cleanup.
- `models.js` — procedural models for the three concept objects.
- `assets/` — optimized Museum V3 JPG still lifes.
- `server.mjs` — local preview server with explicit image and module MIME types.
- `package.json` / `package-lock.json` — pinned local Three.js dependency.

Google Fonts is optional; system fallbacks are provided. The 3D implementation and artwork are served locally after dependency installation; no remote model or HDR environment downloads are required.

## Checkpoint and scope

The preceding three V3 explorations are checkpointed on **`codex/landing-v3-checkpoint`**, commit **`0e5ac90`** (`Checkpoint third-generation landing explorations`).

Museum Dark is a **new, uncommitted app** for evaluation. It has not been merged into the 100 Hackathoner Astro site, committed, or pushed. Pre-existing main-site working-tree changes are outside this app's scope.

## Verification

- Syntax checks pass for `app.js`, `scene.js`, `models.js`, and `server.mjs`.
- Preview HTML, controller, renderer, models, data, and local Three.js module return HTTP 200.
- The dataset contains 81 unique numbered records, 24 awards, and the three expected featured projects.
- Desktop (1280px) and mobile (390px) visual checks passed; the mobile page has no horizontal overflow.
- Verified all three 3D artifacts, full display-base framing, keyboard rotation, pause, and switching back to the same selected artwork.
- Verified independent theme/view switching, selection and pause preservation, theme persistence on reload, and a 390px mobile header without overflow.
- Verified the selected project dialog, Escape dismissal, archive search, award filtering, and focus transfer after loading more records.
- Camera projection checks cover 144 combinations of model, viewport shape, rotation, and elevation without clipping.
- Reduced-motion preferences disable idle motion and label its control explicitly. Initialization failure and context loss return to the artwork view; these fallback paths were reviewed in code, not simulated in browser QA.
