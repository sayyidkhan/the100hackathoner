# MediVoice — The Listening Room

The exhibit for hackathon 57 uses a calm architectural miniature to explain the demo’s patient-to-clinician workflow.

## Evidence reviewed

- Local source: `agora-hackathon/agora-medihealth/README.md` and `backend/main.py`, matching [the project repository](https://github.com/sayyidkhan/agora-medihealth).
- [Hackathon result post](https://www.instagram.com/p/DW9CxfwE6Ln/): third place, voice consultation, escalation, and MC approval after doctor verification.
- [Product post](https://www.instagram.com/p/DW_vFeIk0-2/): consultation from a phone; the visible product screen describes AI conversation reviewed by a licensed GP.
- Backend evidence: structured consultation prompt; clinical-summary cleanup; separate approve and escalate endpoints; digital MC PDF endpoint.

The sculpture is a conceptual interpretation. Its architecture, furniture, and illustrative certificate are art direction, not claims about the production interface or clinical outcomes. The model does not collect patient data or start consultations.

## Visual direction

Warm ivory and travertine, jade glass, a petrol phone display, brushed brass, and a walnut clinician desk. The phone and voice ribbons lead to a case summary beneath an open arch. A small certificate appears after clinician review. The artwork includes colored route lines; the interactive model uses a clean floor so those lines do not resemble loose cables.

New built-in Imagegen assets are versioned `057-medivoice-{light,dark}-v2.png`; v1 files remain available. The light image is an edit of the dark composition preserving geometry and camera while changing background and illumination. Astro generates responsive WebP derivatives at 480, 800, 1200, and 1536 pixels.

The Three.js model uses rounded geometry, articulated seated figures, a ribbed portal, curved desk, transparent ribbons, and local procedural material grain. Static geometry is batched by material; labels retain UVs. It uses the existing lazy-loaded renderer, keyboard orbit, pause, reset, reduced-motion handling, and offscreen suspension. Component bounds control camera framing. Four explicit journey buttons update the explanation and selected station.

The presentation and lighting changes are scoped to project 57. The card uses the same standard toolbar, neutral shell, and caption as HackAtlas; it has no promotional header or elevated branded card treatment. Generated hackathon catalog data is not edited.


## Animated rebuild

The 3D exhibit runs a deterministic 24-second cycle: six seconds each for conversation, case assembly, clinician review, and approval. Motion includes the voice display, flowing signal particles, ribbon deformation, staggered case rows, articulated head and arm gestures, certificate lift, seal, signature, and a guided camera move. The certificate remains hidden until the approval chapter. The end settles back into the opening state.

Manual chapter selection shows a representative pose even when paused or reduced motion is enabled. Auto-play restarts the journey. Dragging, arrow keys, and Reset view restore a full user-controlled view; selecting a chapter or auto-play re-enables the camera tour. The existing renderer suspends offscreen and hidden-document animation. Auto-play narration is not an ARIA live region.

The modeling kit preserves UVs while batching static geometry. Clothing uses curved profiles, while hands and faces include fine geometry. Deterministic local textures supply stone, cloth, and wood surfaces. An offline ambient-occlusion bake adds contact depth without freezing direct shadows. Bake geometry fingerprints are captured before asynchronous loading, so deforming ribbon vertices cannot invalidate a valid bake mid-load.

The patient has a continuous dark hair shell, side-swept fringe, low ponytail, and teal blouse. The shell sits outside the face, fixing the intersecting cap that previously left sparse visible strands. The case summary uses smooth paper, larger bold dark typography, and explicit Profile / Symptoms / History labels instead of faint decorative lines. Textures use higher-resolution type and anisotropic filtering; the MediVoice renderer retains up to 2× device resolution.

Rebake with `node scripts/bake-storybook-ao.mjs --model=medivoice --rays=32 --distance=0.30 --cell=0.016` after geometry changes. The bake loader rejects mismatched assets atomically. The generic baker keeps its existing defaults for other exhibits.

The interactive floor is a single rounded rectangular limestone slab with a softened edge, restrained grain, and a matching soft contact shadow. The stacked oval base, gold perimeter trim, decorative flecks, and raised route tubes were removed. Its finished top remains at the original furniture contact height.
