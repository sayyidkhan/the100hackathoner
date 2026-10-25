# PestOverflow exhibit

## Product story

PestOverflow watches a property for pest activity and informs the owner where to act. The exhibit presents that sequence through one coherent kitchen miniature and a prominent owner phone. It uses the documented pest-detection and notification concept; it does not centre the electronics prototype.

Source evidence remains in [23/27 research](exhibits-23-27-research.md), including the pinned README and Python source. The README joins PIR motion detection, a camera-equipped Raspberry Pi and a location-bearing SMS to the homeowner. The checked-in Python prototype does not implement the complete intended service. The miniature and app are therefore an interpretation of the product concept, not a demonstration of deployed pest recognition, live camera capture or actual message delivery.

## Architecture and materials

The room occupies the left side of an 8 × 4.05-unit honed-stone foundation. Two 2.53-unit plaster walls establish the kitchen. Five flush oak cabinet fronts have dark reveals, inset toe-kicks, restrained brass pulls and a stone worktop. The worktop has a genuine opening over a recessed steel sink; an arched brass faucet, cutting boards, ceramics, herbs and an oak shelf supply domestic scale. A discreet articulated camera sits high on the left wall. There is no oversized circuit board, separate hardware display or trophy-style nameplate.

The right-hand phone is approximately 4.02 units high and 2.08 wide, with a dark metal body, narrow steel bezel, inset display, lens notch and side buttons. It is the dominant vertical form. The mouse travels across the open floor foreground, in front of the cabinetry. Coral corners mark the detection area only after entry. A thin notification path appears transiently between the camera and owner phone.

`pestoverflow-surfaces.js` generates independent 512 × 512 color, height and roughness maps for three materials:

- Oak: long flowing fibres, annual growth bands, fine interrupted grain and elongated pores.
- Travertine: cream mineral clouds, quiet strata and irregular pits.
- Warm plaster: broad limewash/trowel variation, fine chalk grain and pinholes.

The textures are deterministic and tileable. Color maps use sRGB; height and roughness maps remain linear. Material color is white, roughness is controlled by the roughness map, and fine bump scale preserves miniature proportions. Metals, porcelain, foliage and the camera lens use separate materials. The scene requests the dedicated `pestoverflow` lighting profile from the shared renderer.

## Integrated app display

`pestoverflow-app-screen.js` draws one 768 × 1536 conceptual app interface onto a single screen plane. Using one display surface avoids the previous stack of physical cards and separately positioned text labels. The screen uses an unlit, non-tone-mapped material so scene lighting does not wash out typography. Canvas redraws occur only when the scene phase changes.

The interface includes:

- PestOverflow branding and an illustrative residence name.
- Monitoring and pest-detected status.
- A stylized kitchen camera-event illustration that uses the same cabinets, floor and mouse vocabulary as the physical room.
- Kitchen / Camera 01 location information.
- An owner-notified receipt after the signal arrives.
- A property overview and conventional app navigation.

The camera illustration is locally drawn concept artwork, not a feed from the 3D model or a real camera. The address, floor plan and interface are illustrative, and navigation is decorative within the exhibit. No camera data is requested, no SMS is sent and no incident history is persisted. The Node fallback preserves phase metadata and geometry without requiring a DOM canvas.

## Animation

One seekable 18-second sequence runs on the shared pause/reduced-motion clock:

| Time | Behaviour |
| --- | --- |
| 0–4 s | Mouse approaches across the clear kitchen floor; the app remains in monitoring state. |
| 4–5.2 s | Mouse is inside the sensor area. Coral floor corners and the sensor indication activate; the camera illustration marks the activity. |
| 5.2–6.5 s | One coral signal travels from the room camera toward the owner phone. The app has not yet confirmed notification. |
| 6.5–12 s | The app shows the pest event and owner-notified receipt. The mouse rests with planted paws. The connection leaves view at 8.2 seconds. |
| 12–13 s | Mouse turns on the open floor. |
| 13–17 s | Mouse returns along the same lane. The detection and app receipt clear at 16.5 seconds. |
| 17–18 s | Mouse returns to its initial heading for an exact loop reset. |

The continuous mouse model retains fine coat bump, cupped ears, inset glossy eyes, whiskers and a tapered tail. Paws articulate during travel and stay fixed during the hold. No global orbit, unrelated object swaying or floating phone distracts from the detection-to-owner sequence.

`root.userData.story` publishes `index`, `step`, `title`, `detail`, `tone` and `phase` for shared captions. `pestMoment(time)` exposes phase timing. The app screen publishes its own phase metadata so notification order remains testable without rasterizing the display.

## Validation and limits

`node --test scripts/tests/early-exhibits.test.mjs` covers finite geometry, deterministic seeking, exact loop reset, owner-phone prominence, sensor scale, detection before transmission before receipt, the matching app phases, stationary resting paws, and a floor route that avoids cabinetry. Raycasts through the display's title, image and footer regions ensure the app plane is ahead of the phone body. Material tests check deterministic PBR channels, dimensions, color spaces, mipmapping and meaningful variation. GrabHunt's existing test remains intact.

These tests do not assess aesthetic quality or real application functionality. The parent task owns live browser visual review, pause/resume checks and comparison with the artwork. The web exhibit remains a rotatable visual story of the hackathon concept.

Implementation files: `public/landing/artifacts/pestoverflow.js`, `pestoverflow-mouse.js`, `pestoverflow-surfaces.js`, `pestoverflow-app-screen.js`; tests in `scripts/tests/early-exhibits.test.mjs`.
