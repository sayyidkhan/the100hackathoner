# Weather Guru — hackathon 15

Source: https://github.com/sayyidkhan/unesco-weatherguru . The original HTML/Tableau prototype provides rainy-day, rainfall-magnitude, clustering and flood-analysis views. The scene is an illustrative interpretation, not a calibrated forecast or a specific Singapore flood event.

## Rebuilt flood atlas — 27 October 2026

The previous dashboard, miniature precinct, glass cloud, physical bars and brass plinth have been replaced. `public/landing/artifacts/weatherguru.js` now constructs a single architectural precinct with a continuous sinuous canal, steel arch footbridge, HDB void decks and access galleries, rooftop services, terracotta shophouses, covered linkway, bus shelter, tropical planting and street furniture. A wide analysis ribbon sits above the buildings with 12 historical observations and a visually separate amber outlook. No dates or probabilities are invented.

The existing approved raster artwork remains at `public/landing/assets/projects/015-weatherguru-singapore-v2.png`. This request rebuilt the interactive 3D view only.

## Motion

A deterministic 32-second cycle samples one shared series: 12 historical rainfall observations followed by an illustrative outlook and recession. A white rainfall curve, blue lagged canal-response curve, cursor, active bar and live status strip all read the same sample. Rain density/intensity follows rainfall; the gauge and water height follow the response. Above the overflow threshold, strongly coloured water spreads across both road lanes and riverside paths. An animated foam edge marks the advancing boundary; elevated ROAD FLOODED / PATH FLOODED labels identify the affected areas. The extent is deliberately exaggerated for legibility, remains within the site, and leaves the footbridge deck above water. The flood recedes as the response drops. Rain stops above roofs and the bridge; animated currents stay in the channel. This compresses annual observations into a visual scenario, not a hydrological simulation or depth measurement.

Manual stages hold the graph cursor, rainfall intensity, water level and flood extent together while retaining ambient droplet/current motion. Pause freezes the shared animation clock. History and forecast remain visually distinct. Four existing stage buttons, rotation, zoom and reset remain available.

## Validation

Seven Node tests cover timeline lead/lag and loop continuity, per-sample graph/rain/gauge/water/flood synchronization, roof/bridge clearance and flood extent, manual-stage synchronization, deterministic pause, outlook/overflow visibility, finite geometry, rendering budget, and explicit road/path coverage at the peak followed by complete withdrawal. Static geometry is batched and foliage, rain and currents use instancing.

Run `node --test scripts/tests/weatherguru.test.mjs` and `npm run build`. Browser review includes the new scene, forecast and local-impact stages, rotation/reset and pause. Review screenshot: `outputs/weatherguru-review/page-flood-atlas-visible-flood.png`.
