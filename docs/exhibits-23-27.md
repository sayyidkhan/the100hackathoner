# Exhibits 23–27

Created 23 October 2026 with four subagents and parent integration. Artwork uses the built-in imagegen tool. The detailed notes below include repository evidence, final prompts and animation choreography.

| No. | Exhibit | Artwork | Model | Source and prompt notes |
|---|---|---|---|---|
| 23 | PestOverflow | [PNG](../public/landing/assets/projects/023-pestoverflow-v1.png) | [Three.js](../public/landing/artifacts/pestoverflow.js) | [Notes](pestoverflow-exhibit.md) |
| 24 | MyNextGym | [PNG](../public/landing/assets/projects/024-mynextgym-v1.png) | [Three.js](../public/landing/artifacts/mynextgym.js) | [Notes](mynextgym-exhibit.md) |
| 25 | NeuroSurge | [PNG](../public/landing/assets/projects/025-neurosurge-v1.png) | [Three.js](../public/landing/artifacts/neurosurge.js) | [Notes](neurosurge-exhibit.md) |
| 26 | Amigo | [PNG](../public/landing/assets/projects/026-amigo-v1.png) | [Three.js](../public/landing/artifacts/amigo.js) | [Notes](amigo-exhibit.md) |
| 27 | GrabHunt | [PNG](../public/landing/assets/projects/027-grabhunt-v1.png) | [Three.js](../public/landing/artifacts/grabhunt.js) | [Notes](grabhunt-exhibit.md) |

All five entries are integrated in `src/lib/project-art.ts`, using the existing artwork/3D switch and shared pause/reset/reduced-motion controls. No remote runtime image or model dependency.

Validation: Astro check has zero errors/warnings; production build succeeds. Node regression coverage checks geometry, deterministic animation and sequencing. Browser control is disabled in the parent session, so a complete five-page interactive visual pass remains outstanding. MyNextGym and Amigo have captured model previews in `outputs/mynextgym-review/dark.png` and `outputs/amigo-review/amigo-3d.png`, respectively. Six targeted regression tests pass.

GrabHunt has no saved or discoverable public repository; its caption explicitly frames the exhibit as an interpretation of the recorded GrabPoints-to-e-credits concept.
