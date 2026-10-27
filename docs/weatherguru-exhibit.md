# Weather Guru — hackathon 15

The user approved a Singapore-context artwork before authorizing page integration and an interactive 3D version.

- Artwork: `public/landing/assets/projects/015-weatherguru-singapore-v2.png`
- Original review and prompt: `outputs/weatherguru-review/`
- Model: `public/landing/artifacts/weatherguru.js`
- Source: https://github.com/sayyidkhan/unesco-weatherguru

The original HTML/Tableau prototype provides rainy-day, rainfall-magnitude, clustering and flood-analysis views. The conceptual neighbourhood and moving water illustrate that subject; they do not represent a calibrated forecast or a specific Singapore flood event.

The revised 3D composition makes analysis the focal point: a brass-framed rainfall-history display, a clearly separated amber outlook window, physical annual-rainfall columns, and five pattern clusters. A compact Singapore precinct retains detailed HDB blocks, tropical planting, covered walkways, bus, taxi, canal and rain. The mineral and satin-metal plinth unifies the two parts. The original raster artwork remains available in its own tab. All plotted values are illustrative normalized values; no invented dates or probabilities are shown.

## Motion and controls

A deterministic 28-second sequence moves through History, Patterns, Risk window and Local impact. Rainfall bars rise, a scanner and tracer travel through the history, the forecast window appears only in the outlook stages, and a translucent street highlight connects the analysis to potential local exposure. Manual stages retain ambient rain and scanning motion. Pause freezes all motion through the shared viewer clock. The outlook is a conceptual risk window, not a calibrated flood date.

The original canal and rain retain roof clearance and pavement bounds after scaling. Per-component framing points fit the asymmetric exhibit without fitting empty corners. Dashed forecast geometry is batched to keep draw calls bounded.

## Validation

- Five Node tests: timeline and loop, scaled canal bounds and rain clearance, manual/auto/pause behaviour, finite geometry and rendering budget, forecast visibility and scanner/exposure stage behaviour.
- Astro check: 0 errors, 0 warnings; production build: 97 pages.
- Browser: revised scene and risk window, local-impact stage, pause/resume, rotation/reset, and auto-play checked; no browser errors.
