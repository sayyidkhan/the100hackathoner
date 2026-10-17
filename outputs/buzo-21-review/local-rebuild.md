# Buzo 2.1 — local reference-led rebuild

The user requested a local modeled reconstruction instead of an external generation service. No external generation request was made for this revision.

## Implemented
- Broader theatre with layered stone arch, curved glazed roof, pleated velvet curtains, interior instruments and guests.
- Reproportioned two-storey gallery with transparent glazing, fine mullions, stone panels, interior sculpture, planted rooftop and completed rear elevation.
- Lounge with double-sided draped fabric sails, hanging lanterns, upholstered seats, palms and flowering vines.
- Concierge desk with marble-colored counter, fluted red front, brass edges, female host and guests facing her.
- Detailed cobbled paving, practical street lamps, water shader, extended canal and continuous stone bridge arch.
- Reference imagery used as UV textures only on the real phone display and gallery paintings. Architecture and characters are full geometry, not projected artwork.
- Dedicated nightlife lighting and optional local HDR glow pass with multisampled render target; target/material disposal is tied to viewer disposal.
- Adaptive geometry detail keeps approximately 925,000 triangles and 35 model meshes; the final AO file is approximately 5.5 MB. No measured device FPS claim is made.

## Verification
- `node node_modules/astro/astro.js check`: 0 errors, 0 warnings, 58 repository hints.
- `node node_modules/astro/astro.js build`: successful, 97 pages.
- `node outputs/buzo-21-review/check.mjs`: desktop light/dark, mobile 390px with no horizontal overflow, artwork switching, keyboard side/rear rotation, pause/resume, reduced motion, valid AO geometry signature, no page or WebGL shader errors.
- Browser captures: 3d-dark.png, 3d-light.png, 3d-side.png, 3d-rear.png, mobile.png.
- Existing user browser tab refreshed and set to Explore in 3D.

The reference is a photoreal generated image. This revision improves the real-time reconstruction substantially but does not reproduce its photographic faces, foliage density or global illumination exactly. Rear details are inferred because the reference shows only one angle.

Other agents' changes in shared files were preserved. No commit or push was performed in this revision.
