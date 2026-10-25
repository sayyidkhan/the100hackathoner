# App-first artwork for exhibits 23 and 24

Generated using the built-in image-generation tool on 2026-10-25. The user clarified the intended app outcomes: pest detection with owner notification, and strategic gym siting using footfall. These are concept visualizations; the gym traffic is illustrative.

## Integration and verification

- Both assets are wired into `src/lib/project-art.ts` and optimized to responsive WebP variants by Astro.
- Each animated scene now has a readable story strip below the canvas and zoom controls alongside pause/reset.
- Browser review checked both scenes, notification ordering, the footfall comparison/result, pause/resume and zoom/reset. Text visibility defects found during review were corrected.
- `node --test scripts/tests/early-exhibits.test.mjs scripts/tests/mynextgym.test.mjs`: 10 passing tests covering sequence ordering, bounded/finite geometry, replay, clear labels and mouse movement.
- `npm run build`: succeeded, 97 pages. Existing repository unused-variable diagnostics remain.
- Review captures: `outputs/exhibits-23-24-review/pestoverflow.jpg` and `outputs/exhibits-23-24-review/mynextgym.jpg`.

## PestOverflow

Asset: `public/landing/assets/projects/023-pestoverflow-owner-alert-v2.png`

Prompt:

```text
Use case: stylized-concept
Asset type: landscape 3:2 hero artwork for a premium interactive 3D portfolio exhibit, PestOverflow.
Primary request: clearly communicate an app detecting a pest at a property and notifying its owner. The owner phone alert is the main hero; polished architectural setting explains where the alert came from.
Composition: one coherent, physically plausible miniature product tableau on a wide shallow rounded ivory limestone plinth. Left 55 percent is an open kitchen cutaway, only low rear and left warm plaster walls, three oak cabinet fronts and cream worktop at rear, gridded ivory stone tiled floor in front. A tiny wall camera points down toward a detailed small brown mouse crossing the clear floor in front of the cabinets. Coral corner brackets precisely frame that mouse on the floor. Right 45 percent is a large upright charcoal smartphone, about twice the wall height, facing the viewer, with a sophisticated clearly readable app screen.
Phone UI exact hierarchy: small "PestOverflow", large coral status card "PEST DETECTED", location "Kitchen", a small room-plan diagram with one coral event dot, and a small confirmation "Owner notified". Clear generous modern typography, actual meaningful app layout, no dense gibberish. A thin coral luminous notification arc with three small travelling dots runs from the sensor toward the phone. Keep phone anchored upright on the same plinth, not floating. No person needed.
Materials and lighting: finely textured ivory limestone, satin plaster, real oak grain, brushed champagne metal accents, charcoal glass phone with soft reflections, believable brown mouse fur. Warm large softbox key upper left, gentle cool fill, soft contact shadows, dark warm charcoal studio background. Precise bevels and polished high-fidelity product CGI, refined adult design. Camera elevated 28 degrees, almost front-on, all objects fully framed at 80% image width. Restrained coral alert and jade confirmation accents.
Constraints: app-first visual storytelling, obvious pest -> detected location -> owner's notification. No oversized circuit board or electronics centerpiece, no rats larger than cabinets, no oversized toy people, no logos beyond PestOverflow, no watermark, no extra headlines outside phone.
```

## MyNextGym

Asset: `public/landing/assets/projects/024-mynextgym-footfall-v2.png`

Prompt:

```text
Use case: stylized-concept
Asset type: landscape 3:2 hero artwork for a premium interactive 3D portfolio exhibit, MyNextGym.
Primary request: clearly communicate a location analytics app choosing a strategic place for a new gym based on footfall. The data map and location comparison are the heroes, not a standalone gym building.
Composition: one coherent premium physical app tableau on a wide shallow rounded ivory limestone plinth. Left two-thirds is a large low landscape tablet set almost horizontal at a slight tilt, thin ivory rim, dark ink map screen. Its clean stylized neighbourhood map has three small candidate sites marked A, B, C, a few tiny ivory urban blocks on the map's rear edge as context only, and three labelled arrival origins "TRANSIT", "OFFICES", "HOMES". Teal and warm amber pedestrian flow trails and small luminous pedestrian dots travel along coherent street routes from those origins toward the candidates. Soft translucent amber/teal density contours show strong footfall converging around candidate B in the front centre; A left front and C right rear have weaker flows. A restrained coral pin marks B.
Right third is one upright rectangular dark analytics screen in a refined slim ivory shell, facing the viewer, dominant enough to read. Screen title "MyNextGym", heading "Footfall comparison", three large rows "A" with short amber bar, "B" with long teal bar, "C" with medium muted bar. Beneath: large selected card "B  /  RECOMMENDED", secondary label "Strongest footfall". Tiny footer "Illustrative analysis". Crisp readable sans-serif UI, meaningful hierarchy, no numbers or fabricated real geography. A thin teal link connects map site B to the matching comparison row.
Materials and lighting: finely textured limestone plinth, satin ivory device frames, anti-reflective ink glass, precise champagne-metal bevels, softly glowing teal and amber data paths. Warm large softbox key upper left, gentle cool fill, soft contact shadows, dark warm charcoal studio background. High-fidelity clean product CGI, refined adult design. Camera elevated 32 degrees almost front-on, make entire map and screen readable, all objects fully framed at 85% image width.
Constraints: viewer immediately sees app helping choose new gym location by footfall. Map is main area, no gym equipment, no giant gym pavilion, no skyline obscuring map, no toy people as heroes, no busy charts, no stock tickers, no watermark, no extra headlines outside devices.
```
