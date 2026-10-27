# Life-Worth Evaluator — hackathon 13

## Source review

Original repository: https://github.com/sayyidkhan/test-app-net-worth-evaluator . Reviewed 27 October 2026 from a read-only checkout.

Reviewed source revision: `4825ce61447321373d88628634b14fe85b396626`.

`js/main.js` loads a Sheetsu JSON dataset and reads four fields: `Activity`, `Hours`, `Net worth of Activity/Day`, and `Net worth of Activity/Month`. `index-new.html` displays those fields with a Chart.js canvas. The chart itself retains unrelated population-template labels, while several data rows repeat the same dataset index. The source does not provide an activity-valuation formula or a complete optimization engine. The historic external dataset was not needed or called.

The portfolio record identifies Hack&Roll 2018, a two-day project at NUS with Jet New, and describes time optimization analytics. This exhibit visualizes the intended activity/hours/daily/monthly flow; it is a new conceptual design, not a recovered screenshot or a claim that the original prototype implemented these calculations.

## Illustrative data

One day: Focus 8h, Learning 2h, Travel 2h, Rest 8h, Life 4h = 24h. Focus and learning total 10h. An explicitly chosen $20/hour example gives $200/day; repeating the same day 20 times gives $4,000. These values are local demonstration data, not original dataset values, income predictions, or a measure of human worth. Rest and personal time remain visible in the whole-day breakdown.

## Art and model

Artwork: `public/landing/assets/projects/013-life-worth-observatory-v1.png`, generated using the built-in image-generation tool. Full prompt: `outputs/life-worth-review/artwork-prompt.txt`.

Model: `public/landing/artifacts/life-worth.js`. Canvas interface and timeline: `life-worth-screen.js`. Both share a brass 24-hour instrument, coloured activity arcs, glass hourglass, cream dashboard, daily readout, monthly bars/calendar, and travertine plinth. Clock arcs have proportions derived from the hours. The interactive calendar has exactly 20 cells; the generated artwork is a concept image.

## Animation and validation

28-second, four-stage loop: map the day → choose focus → illustrative daily value → monthly view. Sand and the clock hand continue moving during the explanatory stages. Daily and monthly physical readouts use the same values as the screen. The sequence plays automatically without workflow tabs below the scene. Pause/reduced motion use the viewer clock. The model retains deterministic manual seeking for tests.

`node --test scripts/tests/life-worth.test.mjs` checks 24-hour totals and the example arithmetic, clock/readout/calendar synchronization, manual/autoplay continuity, deterministic seeking and geometry budgets. Browser review covers artwork, 3D, pause, zoom, rotation/reset, and light/dark themes. The enlarged front-facing tablet uses a 1800×2400 texture, untinted ivory background, dark high-contrast text, and simplified screens with stable daily/monthly headline totals. Production validation: `npm run build`.
