# Mailbox IOT system — project 009

## Evidence and scope

- Catalog: Notifier Mailer system, Bosch IoT hackathon, Singapore, 2017.
- Original public Facebook post: https://www.facebook.com/sayyid.iskandar/posts/pfbid0YHWL1WEfz9ENeK6XvwKpywbbHukJhTSJmUzxmPmuohjWXK4GM2ckM1enzRRuHGNHl
- Read in Chrome on 27 October 2026. The post describes a first IoT project for smart buildings; the visible photo is a team/certificate photograph, not technical documentation.
- No linked source repository. The sensor type, notification UI, mailbox number and Singapore lobby arrangement are illustrative design choices, not verified prototype hardware. Catalog metadata is unchanged.

## Exhibit

Artwork: `public/landing/assets/projects/009-mailbox-lobby-v1.png`.
Model: `public/landing/artifacts/mailbox.js`; crisp canvas screen: `mailbox-screen.js`.

A coral cutaway letterbox makes the physical event visible beside a six-door apartment mailbox bank, walnut bench and tropical planter. One 20-second clock coordinates letter insertion, internal settling, sensor indication, the transmission pulse and the resident's phone notification. The loop resets without accumulating state. Drag, keyboard rotation, zoom, reset and pause use the shared gallery controls. No extra step tabs.

The code batches static geometry and retains only animation and display groups. Phone text uses an unlit high-resolution canvas texture. Reduced motion and disposal follow the gallery lifecycle.

## Validation

`node --test scripts/tests/mailbox.test.mjs` checks event ordering, synchronization, deterministic pause/replay, finite bounded geometry and rendering budget. `npm run build` verifies Astro types and asset generation. Browser review checks artwork, 3D, the phone notification and controls.

## Artwork generation

Generated with the built-in image generation tool. Final prompt:

```text
Use case: stylized-concept.
Asset type: 1536x1024 landscape artwork for a Singapore IoT mailbox notification hackathon exhibit.
Primary request: create a beautifully art-directed architectural miniature of a Singapore apartment mailbox lobby, explaining physical mail becoming a phone notification. Extremely refined miniature product photography, believable construction, immaculate model craftsmanship, no people.
Composition: isolated complete architectural diorama on a low thin rectangular terrazzo floor, front three-quarter view with only slight elevation; occupies 85% image width, dark muted petrol teal seamless studio backdrop. Left rear: a compact bank of six brushed aluminium apartment letterboxes (two columns, three rows), each with narrow horizontal mail slot, engraved small unit label and round key lock. Pale warm plaster half-height rear wall, a restrained sage-green wall strip, low walnut lobby bench and one tropical plant. Center foreground HERO: an enlarged single coral-orange rectangular letterbox with genuine open-front cutaway, dark navy interior, ivory envelope visibly passing into a narrow slot near its top, a tiny turquoise detection sensor inside with a discreet cyan beam. Side panel of the cutaway mailbox reveals the inner shelf and a few letters. It must clearly read as a MAILBOX not an oven or washing machine. On the right: upright graphite phone, restrained thin bezel, bright warm ivory screen with a large envelope icon and one legible notification card reading exactly "Mail has arrived", with smaller text "Ready to collect". A delicate curved turquoise signal path with three small luminous beads connects the sensor to the phone. Physical envelope and signal path form one understandable left-to-right story.
Materials: finely brushed metal, matte coral enamel, warm speckled terrazzo, realistic folded paper, walnut bench, clear optical sensor glass. Rounded metal hems, tiny screws and door seams, subtle wear-free construction. No lavish gold, no clouds, no globe, no trophy plinth, no random buildings, no giant text overlay, no watermark. Realistic soft shadows, warm daylight key, cool edge lighting, rich but restrained palette. Keep the entire base, mailbox, phone and plant in frame. Large readable silhouettes and calm negative space, sophisticated high-fidelity render.
```
