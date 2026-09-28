# Museum of 100 Attempts

An isolated landing-page exploration for The 100 Hackathoner. Nothing in the production Astro app is changed.

## Preview

Run `npm start` here, then open http://127.0.0.1:18501. No dependencies to install. `npm run check` checks JavaScript syntax.

## Direction

A contemporary living exhibition of **The 100 Hackathoner**, with a monumental condensed masthead and one curated, interactive display. The approved off-white, ink, and electric-red brand palette stays intact; cobalt appears only in selected artwork. The opening contains no portrait and no duplicate progress grid. The immersive design skill informed exhibit hierarchy, explicit interaction states, and keyboard accessibility; the user-approved palette overrides its green/pink defaults.

The three switchable objects are contextual concept artifacts, not product screenshots: a dimensional storybook for **The Next 8 Seconds**, a folded crow above a city grid for **Itachi’s Crow**, and a visitor pass for **Long Taa Borneo Eco Stay**. Selecting a tab changes both the object and the exhibit caption; opening the object shows the matching real project details.

The collection uses a local snapshot of all 81 source records and derives the 24 award-bearing records. Search, awarded filter, load more, and surprise-me work locally. Native modal dialogs support Escape and focus management. The narrative sections foreground Sayyid's engineer-to-operator journey and eventual book, rather than generic portfolio marketing.

About, principles, judging, and contact links intentionally lead back to the existing site at port 18481. Project links lead to recorded GitHub or event URLs. Google Fonts is optional; local font fallbacks preserve the layout.

## Checks

- `npm run check`: passed.
- Preview HTML and JavaScript: HTTP 200.
- Data: 81 records, 24 award-bearing; featured attempts 81, 80, 79 verified.
- Responsive breakpoints: 1600px, 1000px, and 650px.
- Keyboard focus, skip link, explicit button labels, native dialog, reduced-motion fallback included.

No commits, push, or merge performed.
