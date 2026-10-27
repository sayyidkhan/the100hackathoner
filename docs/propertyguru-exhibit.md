# PropertyGuru Smart Algorithm — exhibit #3

## Evidence and interpretation

Primary source: [Big Data Analysis of Property Guru — Team 14](https://www.slideshare.net/slideshow/big-data-analysis-of-property-guru-67557908/67557908), linked from Sayyid's original Facebook post dated 24 October 2016.

Slide 5 describes a recommendation engine combining cluster analysis of property listings (property similarity) and market-basket analysis of enquiries (behavioural similarity). Slide 3 proposes machine-curated choices and data-informed defaults. Slide 6 proposes owner-completed listing fields and anomaly detection.

This exhibit visualises the recommendation mechanism. The Singapore buildings, shortlist interface and moving signals are a contemporary illustrative interpretation, not screenshots of the original product or a working recommendation service. The proposed conversion and revenue gains in the deck are forecasts, not measured results, and are omitted from the exhibit.

Metadata discrepancy remains for review: the catalog says 1 October 2016 and “Best Project”; the deck says 22 October 2016, while the original 23 October Facebook post describes a commendation and a Yellowfin mini award. Catalog metadata was not silently changed.

## Presentation

- Artwork: public/landing/assets/projects/003-propertyguru-recommendations-v1.png
- Live model: public/landing/artifacts/propertyguru.js
- Canvas interface: public/landing/artifacts/propertyguru-screen.js
- 24-second sequence: similar properties → enquiry patterns → curated shortlist → enquiry.
- Both input signals complete before the recommendation appears. Screen, location marker, highlighted footprint and explanatory caption use one deterministic clock.
- Standard #60-style exhibit card: scene, rotate/keyboard hint, Reset view and Pause motion, then the caption. No walkthrough strip or zoom-button row.
- Refined model: 50 meshes and 236,132 stored vertices in the headless check; 293,242 vertices including instanced tropical planting (browser canvas labels add a few meshes). Architecture includes recessed window bays, balcony railings and planters, terracotta roof tiles, two-storey terrace homes, a pool deck, roof machinery and paving joints. The shortlist uses crops from the approved artwork. A 48-ray contact-shading bake adds depth without baking direct-light shadows.

## Artwork generation

Tool: built-in image_gen; generation mode, no reference images, opaque background. Generated output copied from the tool's saved file into the repository. No manual image processing.

Final prompt:

```text
Use case: stylized-concept.
Asset type: landscape 1536x1024 portfolio artwork for a 2016 Singapore PropertyGuru property recommendation engine.
Primary request: make the mechanism of property recommendations tangible: similar homes plus patterns in property enquiries become a curated shortlist. A meticulously crafted architectural analysis miniature, cinematic but restrained, sophisticated real-estate editorial art, grounded physical objects.
Composition: complete isolated miniature arranged on a low thin warm limestone rectangular architectural drafting board with rounded corners, navy blue seamless studio backdrop, front three-quarter view, slight camera elevation. Leave ample margins all sides, keep every object fully in frame. Left two-thirds is a small lovingly detailed Singapore residential neighbourhood: at left rear an ivory HDB apartment slab with subtle coral service-core stripe, open void deck, external corridors, repeated windows, parapet and rooftop water tank; at centre a mint and ivory condominium with two offset stepped towers, glass balcony railings, landscaped podium, a small turquoise pool; front-left a pair of low terracotta-roof terrace houses with timber doors and hedges. Buildings grouped into three small outlined zones on the same continuous architectural board, realistic walkways and tropical planting. Make the condo clearly the highlighted recommendation with a thin warm coral luminous outline around its footprint, a small red location pin, and a matching coral detail on the facade.
Along the FRONT edge of the board a small angled ivory analytical panel showing six circular enquiry tokens joined by thin fine lines into two clusters. Only short crisp label 'ENQUIRY PATTERNS'. Thin blue and coral signal paths embedded in the base connect the property groups and enquiry panel to a small flat circular junction near the condo, then continue to the screen. Not a road network and no oversized arrows.
RIGHT third: an upright landscape-oriented charcoal and ivory property-search display, on two slim supports, visibly a refined browser interface rather than a giant smartphone. Short title 'SMARTER PROPERTY CHOICES'. Three compact property recommendation rows with tiny architectural thumbnail images, first row selected coral with exact label 'Recommended home', next rows mostly visual with a couple clean short lines. One large button labelled 'Enquire'. A small footer label 'CONCEPT / 2016'. The screen should be crisp, readable and secondary in scale to the architectural buildings. No fake prices, percentages or financial results.
Materials: finely stippled limestone, warm white painted concrete, lightly weathered terracotta, satin red enamel, translucent blue-green architectural glass, real tropical foliage, dark brushed aluminium. Beautifully modelled balconies, window recesses, doors, slim railings, aircon ledges, roof cornices, tiny paving joints. Warm sunlight grazing buildings, soft blue rim light, grounded ambient shadows, carefully controlled reflections. Avoid cheap plastic, simple block toys, excessive gold, people figurines, trophies, keys, money, robots, literal funnels, floating text banners, unrelated Singapore landmarks, watermark. Keep an elegant readable silhouette and a strong relationship between the highlighted condo and the selected listing.
```

## Validation

Automated checks: evidence ordering, synchronized screen/marker/story, loop replay, finite geometry and bounds. All 6 focused PropertyGuru and shared-profile WinWinCusine tests pass. Production build completes with 97 pages. Browser review confirms the artwork, highlighted property and matching shortlist render in the live page; pause, rotation while paused, reset to the first step and resume were exercised. Review screenshots are under outputs/propertyguru-review/.


## Refinement verification

The four PropertyGuru tests cover evidence ordering, animation replay, finite instanced geometry and bounds, and exact geometry hashes for the contact-shading asset. Astro check reports zero errors; the production build generates 97 pages. The approved artwork is unchanged.

## Second refinement

Replaced the rounded canopy clusters with folded-leaf instances, reduced HDB height and widened its footprint, added curved condo balcony glazing, opened the pool courtyard, modelled planter walls and path lanterns, and built individually jointed limestone paving. Stone uses a world-scale procedural mineral finish; occupied-volume camera fitting gives more space to the buildings. The glass and signal materials explicitly opt out of shadow casting through the shared renderer's adoption flags.

Runtime geometry including instances decreased from 611,927 to 293,242 vertices. The 48-ray architecture-only contact bake is 201,245 bytes and validates against exact geometry hashes. Current browser review has no console errors or warnings. Card controls now follow exhibit #60; source artwork and the evidence-before-recommendation sequence remain unchanged.
