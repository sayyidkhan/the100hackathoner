# Uncle Dustbin — artwork and moving house exhibit

Reviewed the original Facebook post, four album photos and the linked 15-second demo in the user's Chrome session on 26 October 2026.

## Source evidence

- [Original post](https://www.facebook.com/sayyid.iskandar/posts/pfbid02HTKxyfqPKL2uR4n9zFFxAzkXbE7FYNjkzzuQpqRpEgeCBzYnqvfko88xe9nDPD4kl): identifies the 29th hackathon as Intuition 2019 and describes a robotics dustbin system with the hashtag UncleDustbin.
- [Branding slide](https://www.facebook.com/photo/?fbid=10218782439124824&set=pcb.10218782442044897): orange/blue palette, glasses-and-moustache mascot, UNCLE DUSTBIN name and a blue educational robot.
- [Concept slide](https://www.facebook.com/photo/?fbid=10218782439524834&set=pcb.10218782442044897): open rectangular bin raised on diagonal supports above a blue wheeled chassis.
- [Physical prototype](https://www.facebook.com/photo/?fbid=10218782439804841&set=pcb.10218782442044897): large white cardboard bin with kraft interior, slender wooden supports, blue robot, light wheel hubs, clear electronics cover and a dark taped floor course.
- [Album demo](https://www.facebook.com/1015751381/videos/pcb.10218782442044897/10218782440204851): the same bin-carrying robot on a taped test course.

The user corrected the name to **Uncle Dustbin** on 26 October 2026, matching the historical slides. Excel `Hackathons!K30`, the synced catalog, artwork lettering and 3D bin now use that name. Neither the photos nor the visible demo establishes a litter-grabbing mechanism; the artwork and 3D therefore show a robot carrying an open bin, with no arm or gripper. The existing catalog solution description was not edited in this task.

## Interpretation and integration

The illustration preserves the recognisable blue two-wheel chassis, paired ultrasonic sensors, clear electronics cover, oversized open bin and diagonal timber struts. The miniature home, parquet, furnishings, planted kitchen, tiny route markers and paper already inside the bin are an artistic interpretation rather than a reconstruction of demonstrated capabilities.

- Active asset: `public/landing/assets/projects/029-uncle-dustbin-v2.png`.
- Created with built-in imagegen at 1536 × 1024.
- Imported by `src/lib/project-art.ts` for #29.
- Model: `public/landing/artifacts/uncle-dustbin.js`.
- Materials: `public/landing/artifacts/uncle-dustbin-surfaces.js`.
- Caption: “A little help at home. Follow Uncle Dustbin through the hallway to collect rubbish from residents in the bedroom, living room and kitchen.”

## Moving 3D scene — partitioned apartment revision

The current native Three.js scene is a roof-off apartment with four separate rooms arranged around a central hallway. Real partition meshes and framed openings define the living room, bedroom, kitchen and bathroom. The front and interior walls are cut down to keep the contents visible; rear walls and door frames retain their height. Every room has a hall entrance. The bedroom is not used as a passage into the living room, and the robot does not enter the bathroom.

- Living room: upholstered sofa, woven rug, coffee table, lamp and curtained window.
- Bedroom: double bed with headboard, pillows and folded throw, two bedside tables, wardrobe and an occupied study desk.
- Kitchen: fitted cupboards, sink, hob, refrigerator, tiled work area and pantry shelves.
- Bathroom: hollow toilet bowl and oval seat, cistern, vanity basin, wall-mounted mirror, walk-in shower with glass screen, towel rail and laundry hamper.
- Hall: entry door, open room doorways and the robot's charging spot.

Three residents sit at the bedroom desk and sofa or stand in the kitchen. A 48-second collection loop starts in the hallway, enters the bedroom, returns to the hall, visits the living room, crosses the hall to the kitchen, then returns to the dock. The robot pauses for a paper ball, used cup and empty bottle. Each resident reaches over the rim, releases their item, and withdraws their hand; the rubbish falls into the bin and remains aboard. The robot turns on the spot before reversing through a doorway. All motion, handoffs and pauses use the shared deterministic clock, including reverse seeking and replay. This domestic demonstration is the user's requested concept interpretation, not a claim about the historical prototype's autonomous capabilities.

The blue two-wheel chassis, pale wheel hubs, ultrasonic sensors, exposed PCB, acrylic cover, timber struts and open branded cardboard bin retain the prototype's identity. Local textures and material batching avoid external model/texture dependencies. Visitors can rotate, zoom, pause or replay the scene.

Model files:
- `uncle-dustbin.js`: robot, four route legs and collection sequence.
- `uncle-dustbin-house.js`: base architecture and existing living/study/kitchen furnishings.
- `uncle-dustbin-rooms.js`: partitions, doorways, bedroom and bathroom.
- `uncle-dustbin-residents.js`: residents and articulated handoffs.
- `uncle-dustbin-surfaces.js`: local textures.

Validation on 26 October 2026: production build completed with 97 pages; 15 targeted tests passed across Uncle Dustbin, Amigo and the early exhibits. Tests cover finite geometry, deterministic pause/replay/seeking, transformed gallery placement, natural arm reach, continuous handoff/landing, cargo containment, wheel contact, and full rotated-bin clearance against every partition and furniture obstacle. A route-sequence test verifies hall → bedroom → hall → living room → hall → kitchen → hall. The live preview was checked for visible room separation, bathroom fixtures, bedroom furnishings, robot travel, and pause/resume.

The Excel name correction remains limited to `Hackathons!K30`; other cells, styles and package parts were verified unchanged in the preceding artwork task. The approved artwork remains `029-uncle-dustbin-v2.png`; these revisions rebuild its interactive interpretation.

## Name correction prompt

Built-in imagegen edited only the lettering in v1 and preserved the approved scene. The old asset is retained as a historical iteration.

> Use case: text-localization. Edit target: the attached Uncle Dustin robot artwork. Change ONLY the small terracotta uppercase branding text on the front of the large ivory bin from 'UNCLE DUSTIN' to the exact text 'UNCLE DUSTBIN' (U N C L E space D U S T B I N). Preserve the typography, letter spacing, angle, surface lighting and ink texture. Keep the glasses and moustache emblem exactly the same. Preserve the complete robot, blue chassis, sensors, wheels, four timber supports, open bin shape and contents, the house, sofa, kitchen, plants, route on the floor, all materials and composition. No other changes. Landscape 3:2.

## Final generation prompt

> Use case: stylized-concept. Asset: landscape 3:2 hero artwork for Uncle Dustin, a 2019 hackathon robotics dustbin prototype. Create one exquisite editorial product photograph of a handcrafted architectural miniature. Source-grounded subject: a small blue anodized two-wheel educational robot chassis with two large black rubber drive wheels, pale circular wheel hubs, exposed small black circuit board under a clear acrylic electronics cover, paired round forward-facing ultrasonic transducers like two little metal eyes. Four slender pale timber diagonal support struts rise from the chassis and hold a much larger rectangular open-top ivory cardboard wastebasket above the robot; the wastebasket is about twice the width of the chassis, with a warm kraft-brown interior, thin folded rim, slightly rounded corners. This top-heavy open bin carried on skinny struts is the unmistakable hero, NOT a humanoid and NOT a vacuum cleaner. No gripper or robotic arm. On the front of the bin, small tasteful uppercase terracotta lettering reads exactly 'UNCLE DUSTIN'; underneath is a tiny simple round-glasses-and-moustache emblem rendered as a small ink stamp, no human face. Compose the robot at center foreground, turned 20 degrees so front sensor eyes, side wheel, open interior and all support struts can be seen clearly. It sits on a low ivory cutaway home-floor model with subtle miniature oak parquet, a dark charcoal tape-like route that winds from the rear corner to beneath the robot, tiny recessed terracotta route markers. Make this a domestic robot test environment, not a street. Rear left a small low walnut sofa with warm oatmeal cushions and a tiny side table, rear right an ivory kitchen counter with sage cabinet doors and a small potted plant, only half-height cream walls at far back so the robot remains fully unobstructed. One crumpled paper ball and a small paper cup are already INSIDE the open bin. The floor is clean; no robot picking litter from the floor. Precise structural design, believable engineering, fine rubber tread, screw heads, subtle wiring, tangible cardboard fibers, satin blue aluminum, warm timber, clean soft shadows. Studio backdrop deep desaturated midnight teal, warm large area light from upper left and soft cool rim light. Full miniature footprint visible with generous 7 percent margin, near-frontal three-quarter camera at modest elevation. Robot occupies 55 percent of image height and is larger than furniture, clearly the hero. Sophisticated contemporary diorama, high fidelity macro detail, physical crafted materials, restrained premium art direction. Avoid brass museum pedestals, giant phones, glowing holograms, chart graphics, extra robots, humanoids, generic round dustbins, lids covering the open bin, magic collection arms, exaggerated cartoon eyes, dense text, watermark and cropped base.
