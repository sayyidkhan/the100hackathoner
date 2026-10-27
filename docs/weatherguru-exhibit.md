# Weather Guru — hackathon 15

The user approved a Singapore-context artwork before authorizing page integration and an interactive 3D version.

- Artwork: `public/landing/assets/projects/015-weatherguru-singapore-v2.png`
- Original review and prompt: `outputs/weatherguru-review/`
- Model: `public/landing/artifacts/weatherguru.js`
- Source: https://github.com/sayyidkhan/unesco-weatherguru

The original HTML/Tableau prototype provides rainy-day, rainfall-magnitude, clustering and flood-analysis views. The conceptual neighbourhood and moving water illustrate that subject; they do not represent a calibrated forecast or a specific Singapore flood event.

The approved composition is represented with three HDB blocks, access corridors and void decks, rooftop services, shelters, a kopitiam, tropical trees and palms, a green bus and taxi, concrete canal banks, drains, bridge, railings, level ruler, rain gauge, layered cloud, and a chart panel. Raster artwork remains available in its own tab.

## Motion and controls

A deterministic 28-second sequence moves through Rainfall, Runoff, Water level and Analysis. Rainfall precedes the rise in water level; the level recedes before the loop resets. Instanced rain stops above the building roofs. The canal stays below the roadway. Canal current and surface texture drift continue while a manual step holds the illustrative water level. Pause and reduced motion use the shared viewer's elapsed clock. The viewer supports manual steps, Auto-play, zoom, rotation and reset.

## Validation

- Four Node tests in `scripts/tests/weatherguru.test.mjs`: timeline/loop, rain clearance and canal bounds, manual/auto behavior and deterministic pause, finite/batched geometry.
- Astro check: 0 errors, 0 warnings (102 existing hints); 97 pages built.
- Browser: artwork and 3D loading, stage selection, pause/resume, rotation/reset and both themes checked; no console errors.
