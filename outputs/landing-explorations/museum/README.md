# Museum / The 100 Hackathoner — V3

A standalone spatial-exhibition concept. The main Astro site is untouched.

## Preview

Run `npm start` here, then open http://127.0.0.1:18501. No dependencies to install. `npm run check` checks JavaScript syntax.

## Direction

A living collection of **100 attempts / one life in progress**, not a generic developer portfolio. The opening establishes the 100-hackathon mission and real 81/100 progress before inviting visitors to explore three physical concept objects.

The approved paper, ink, and electric-red palette remains intact. Cobalt is limited to details within artwork. A full-width spatial carousel replaces V2's large wordmark and boxed single-exhibit layout. Generated studio still lifes give each featured project a tangible object, with adjacent exhibits visible as an invitation to explore.

No portrait hero, duplicate progress grid, fabricated case-study outcomes, or invented speaking credentials.

## References and translation

- [Ordinary People — SeMoCA Craft Archives](https://ordinarypeople.info/work/semoca-craftarchives): the documented identity builds a coherent archive system around organizing and stacking objects. This informed the numbered labels, spatial collection, and consistent wayfinding.
- [Koto](https://koto.com/): work entries pair projects with concise ideas and clear categorization. This informed the project-specific “what if” captions and visual-first opening.
- The immersive skill informed explicit interaction states, exhibit hierarchy, keyboard controls, and reduced-motion support. User-approved colors override its default green/pink palette.

The concepts are original interpretations, not copies of those sites.

## Artwork

Three local still lifes represent actual projects:

1. **The Next 8 Seconds** — red open book, folded-paper landscape, house and cobalt path.
2. **Itachi's Crow** — sculptural crow and miniature city.
3. **Long Taa Borneo Eco Stay** — miniature longhouse and forest.

These are labeled **concept objects**, not product screenshots. Native labels carry the actual project names and numbers. Asset provenance and prompts are in [assets/ASSET-NOTES.md](assets/ASSET-NOTES.md).

## Interaction

- Drag horizontally, use previous/next buttons, or choose pagination dots.
- Select a side object to bring it to the center; select the active object to open its real project record.
- Arrow-left/right keys also change the active exhibit when focus is in the stage.
- Vertical mobile scrolling stays native through `touch-action: pan-y`; pointer capture begins only after a horizontal gesture.
- Search, award filter, show-more, and random project selection use all 81 local records.
- Native modal dialogs support Escape and focus return.
- Reduced-motion preference removes transitions.

## Content and routes

The local JSON snapshot contains **81 attempts and 24 award-bearing records**. The memoir sections foreground the engineer-to-founder/operator transition and eventual book. The shipping quote is taken from the existing “What Deadline Pressure Teaches You” essay.

About, principles, essays, judging and contact links intentionally return to the main site on port 18481. Project links use recorded GitHub or event URLs.

## Files

- `index.html` — semantic content and exhibition markup.
- `style.css` — readable archive, document and modal foundations.
- `exhibition.css` — readable V3 art direction and responsive spatial layout.
- `app.js` — carousel gestures, collection filtering and dialogs.
- `server.mjs` — standalone HTTP server, with image MIME types.
- `assets/` — optimized JPG artwork plus original generated PNGs and provenance.

## Verification

- JavaScript and server syntax checks passed.
- HTML, CSS, JavaScript and all three JPEG assets return HTTP 200.
- JPEGs served as `image/jpeg`.
- Source data: 81 attempts, 24 awarded; featured 81/80/79 matched.
- Parent visual QA at desktop and 390px mobile passed.
- Parent interaction QA confirmed next-exhibit selection and correct crow-project dialog.
- Diff whitespace checks passed.

No commit, push or merge performed for V3.
