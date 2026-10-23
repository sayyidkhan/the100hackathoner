# Source research: exhibits 23 and 27

Reviewed 23 October 2026. This records evidence and separates visual interpretation from implemented functionality.

## 23 — PestOverflow

Sources:
- [Repository](https://github.com/sayyidkhan/pestoverflow), revision `0b220a9f358f4762e5d4c3e12a8628eff6fc1a62`.
- [Actual Python source](https://github.com/sayyidkhan/pestoverflow/blob/0b220a9f358f4762e5d4c3e12a8628eff6fc1a62/send_sms.py).
- [README](https://github.com/sayyidkhan/pestoverflow/blob/0b220a9f358f4762e5d4c3e12a8628eff6fc1a62/README.md).
- Site record: `src/data/hackathons.json`, number 23, NUS Hack&Roll 2019, IoT pest detector.

The README describes a Raspberry Pi 3, PIR motion sensor, Pi camera and LED. Intended sequence: motion detection, a photograph of the pest/location, then SMS notification to the homeowner. It explicitly says extermination is a later manual action, and describes ML detection as a difficulty. Do not depict autonomous extermination or reliable species recognition as shipped features.

The actual `send_sms.py` imports RPi.GPIO and Twilio, sets BCM pin 23 as input, polls it, logs a detection and sleeps ten seconds to avoid multiple detections. Twilio credentials and telephone numbers are placeholders. The SMS body identifies detected pest/location and adds a randomly selected novelty challenge. Notably, the SMS creation occurs before the polling loop; the motion branch prints the message details rather than sending a new SMS. No camera capture appears in this checked-in source. Thus the exhibit should be labelled a concept interpretation of the documented prototype, not a faithful simulation of fully working software.

### Proposed miniature composition

One coherent domestic cross-section on a rounded limestone plinth: ivory kitchen corner with tiled floor, timber cabinet, small bin and one realistically scaled insect. Foreground left: an enlarged premium green PCB instrument with gold pins, black processor, white faceted PIR dome, camera lens and discreet red LED. Right: upright ivory telephone displaying one restrained blue notification card. Thin brass conductors connect sensor and phone. Warm domestic key light, cool blue sensor accents, crisp contact shadows and textured stone/wood distinguish the materials. Keep the detector and bug legible; avoid floating generic dashboards.

### Meaningful animation

Pest walks a short fixed floor route into the sensor's field. Sensor LED activates only after entry. One subtle camera aperture/flash cue follows (documented concept). A single blue pulse travels from detector to phone. Notification slides in, holds, then clears; bug exits or pauses before a quiet reset. No endless radar sweep, random floating phone, or unrelated walking people. Suggested 16-second cycle: approach 0–4, detect 4–5, capture 5–6, notify 6–8, hold 8–12, reset/rest 12–16. Include a calm reduced-motion pose with alert visible.

## 27 — GrabHunt

Available evidence: `src/data/hackathons.json`, number 27, title GrabHunt, AngelHack 2019, solution **E-credits via GrabPoints**, Finance & Commerce category, Singapore, PSB Academy STEM Campus. Listed organizers IBM, AngelHack, AWS and Grab. Both `githubUrl` and `projectUrl` are null. The saved Facebook record is [this post](https://www.facebook.com/share/p/1F5LDVBjUj/); its contents were not verified.

Repository lookup: retrieved all pages of `GET /users/sayyidkhan/repos?per_page=100` via GitHub API. No repository named GrabHunt, grab-hunt or related Grab project was found. `GET /search/repositories?q=grabhunt` returned no items. Focused public web queries returned an unrelated contemporary creator-marketing product and a Grab security initiative; neither is evidence for this 2019 hackathon. Do not reuse their claims or branding.

### Proposed miniature composition, constrained to known concept

An emerald and ivory rewards exchange on a limestone plinth: central upright phone showing a small stack of points; on the left an orderly brass token tray; on the right one emerald voucher/e-credit card with an embossed check mark, supported by a low curved counter. Inlaid brass channels connect points to credit. Fine milled edges, engraved token faces, subtly textured enamel, glass inset and warm studio lighting give it premium physicality. This is an abstract concept exhibit. Avoid inventing a map hunt, merchant integrations, redemption rates, payment rails or specific screens without source evidence.

### Meaningful animation

One points token travels along its fixed channel to the phone, the points indicator acknowledges receipt, then an e-credit card emerges and receives a check mark. Hold the completed state, then return quietly to rest. Suggested 14-second cycle: points transfer 0–4, acknowledgement 4–5, credit reveal 5–8, hold 8–11, reset/rest 11–14. This conveys only the saved points-to-credit concept; it makes no claim of verified production transactions.

Suggested public caption: “A concept for turning GrabPoints into e-credits, explored at AngelHack 2019.”
