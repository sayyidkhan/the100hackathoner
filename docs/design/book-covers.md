# Illustrated hardcover concepts

Generated with the built-in image generation tool on 30 October 2026. Original generated PNGs are retained in the tool's output directory; WebP delivery copies are stored in `public/images/books/`. Typography is part of the cover texture; animation and physical binding layers remain HTML/CSS.

## References

- Penguin Clothbound Classics: https://www.penguin.co.uk/series/CLOTBO/penguin-clothbound-classics
- Penguin's design process: https://www.penguin.co.uk/discover/articles/clothbound-classics-little-history-making-of
- Folio illustrated cloth binding: https://www.foliosociety.com/usa/klara-and-the-sun-signed-edition

These informed material treatment and the integration of illustration with binding, not copied artwork.

## Memoir prompt

Create a finished premium hardcover FRONT COVER artwork texture, portrait ratio 2:3. Straight-on orthographic edge-to-edge flat front surface only, no perspective, no mockup, no spine, no surrounding surface. This will be mapped onto an animated 3D hardcover. Literary memoir of a Singapore engineer's pursuit of 100 hackathons, a hero's journey through attempts, setbacks, people, growth. Exact prominent title in top 40%: 'THE' then large '100' then 'HACKATHONER'. Author bottom: 'SAYYID KHAN'. No other text. Sophisticated intricate copper and pale-gold foil stamped illustration on midnight navy woven book cloth, physically tactile fine linen grain and subtle debossed print edges, fine restrained highlights. Original cover art: a luminous winding copper path climbing through intricate engraved mountainous terrain, little architectural doorways, tiny prototype structures and distant Singapore urban silhouettes; one small lone traveller at the start, the path opening into a radiant circular sunrise near the middle. Illustrative literary fine-press craftsmanship, crisp engraved hatching, beautiful negative space around expertly typeset elegant large serif title, exquisite hierarchy, lush but restrained limited palette navy, antique copper and ivory. Ornamental corner details integrated with the route. Serious adult memoir, emotionally evocative, no cartoon, no generic tech icons, no circuit board, no glossy plastic. Title very legible, perfectly spelled, all artwork contained within cover edges.

Asset: `public/images/books/the-100-hackathoner-clothbound.webp`

## Principles prompt

Create finished premium hardcover FRONT COVER artwork texture, portrait 2:3, flat orthographic edge-to-edge front surface, no perspective, no book mockup, no spine or background. This is a texture for animated 3D hardcover. The book is a thoughtful founder/operator principles book from repeated hackathon practice. Exact title at top in elegant beautifully typeset large ivory serif letters: 'THE FORWARD' then 'DEPLOYED' then 'HACKATHONER'. Exact author at bottom: 'SAYYID KHAN'. No other text. Forest green tactile fine woven linen cloth with intricate antique brass and warm ivory foil embossed artwork. Lower 60% is an original sophisticated architectural engraving: an elegant impossible-looking but coherent ascending spiral of stone terraces and bridges, grounded foundations rising through four levels toward a sunlit open pavilion, precise isometric architectural linework, fine etched shadow hatching, a few tiny human figures for scale. Represents experimentation, adaptable judgement, ownership, compounding work. Architectural detail like a fine-press illustrated book, not a wireframe diagram. Top 40% has calm clear title with generous space. Thin double-line brass border with architect's registration details and discreet corner ornaments. Physically tactile cloth grain, foil recesses and tiny natural metallic highlights, polished art direction. Serious literary/business collector's hardcover; absolutely no clipart arrow, generic stock icons, gradients, cartoon, plastic, neon, or photos. All text perfectly legible and spelled exactly.

Asset: `public/images/books/forward-deployed-clothbound.webp`

## Back covers

Built-in image generation edited each corresponding front-cover reference into a matching text-free back texture. `BookBackCover.astro` adds crisp SVG text independently of the raster art, without fake reviews, publishing details or ISBNs. The loop closes the lid before showing the rear binding for roughly seven seconds.

### Memoir back prompt

Design the matching BACK COVER texture for this exact illustrated navy cloth hardcover. Flat orthographic edge to edge portrait 2:3, no perspective or mockup. Preserve navy woven linen and restrained antique copper/gold foil craftsmanship, thin double border and matching corner compass ornament. IMPORTANT no text, no letters, no typography, no ISBN or barcode: the upper 70% of the cover must be quiet very dark navy fine cloth, clean and empty for readable typesetting to be added in code. Only the bottom 27% has a beautifully detailed copper engraving continuing the front's journey: a small winding path from foreground crossing a graceful bridge toward distant Singapore skyline at the horizon. Landscape softly dissolves into plain navy above, no sun or bright region in the text area. Sophisticated back of literary memoir, finer and quieter than front, exquisite gold engraving and cloth detail. Border inside 4% margins.

Asset: `public/images/books/the-100-hackathoner-back.webp`

### Principles back prompt

Design the matching BACK COVER texture for this exact forest green cloth and antique brass hardcover. Flat orthographic edge-to-edge portrait 2:3, no mockup, no perspective. Match its finely woven forest-green linen and delicately stamped antique-gold border, discreet architectural corner registration ornaments. IMPORTANT no text, no letters, no typography, no ISBN, no barcode. Upper 70% must remain quiet uniformly dark green fine cloth for clearly readable blurb typesetting added later in code. Bottom 27% contains a beautiful intricate brass engraved vignette of solid architectural foundations with arches and a small ascending stair/terrace, a continuation of front's architectural illustration representing compounding foundations. Vignette dissolves softly into plain cloth above. Restrained, sophisticated back cover of a founder principles book, exact same collectible edition family, tactile cloth, gold fine linework, no bright areas in upper text field. Border inside 4% margins.

Asset: `public/images/books/forward-deployed-back.webp`
