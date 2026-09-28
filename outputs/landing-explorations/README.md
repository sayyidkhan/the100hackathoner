# Landing page explorations

Three independent review apps. These are design experiments, not merged website changes.

| Concept | Preview | Directory |
| --- | --- | --- |
| Museum of 100 Attempts | http://127.0.0.1:18501/ | `museum` |
| Sculptural 100 | http://127.0.0.1:18502/ | `sculptural` |
| Dark technical | http://127.0.0.1:18503/ | `dark-technical` |

Run `npm start` inside each directory to restart its preview. Each app runs independently on its own port. The existing Astro site remains at http://127.0.0.1:18481/.

## Shared brief

- A memorable personal brand for Sayyid Khan: builder, judge, speaker, and aspiring founder/operator.
- The journey to 100 hackathons is the central story, not a conventional developer portfolio.
- No large portrait in the opening section.
- Use actual project records, not invented projects or testimonials.
- Distinct visual concepts with functioning exploration interactions and responsive layouts.
- Do not merge, commit, or push until a direction is approved.

## How to compare

1. Does the first screen make you want to explore?
2. Is the site recognisably about your journey, rather than a generic agency or SaaS product?
3. Can a visitor discover a project and understand why they would invite you?
4. Does the interaction still make sense on mobile and with a keyboard?

Choose a direction first. Content and visual details can then be refined before integration into the main Astro site.

## Second design pass

The original three prototypes (including the approved red Museum palette) are
saved in commit `232fb28` on `codex/landing-explorations-checkpoint`.
The next pass is an uncommitted exploration, not approval to merge.

- Lead with **The 100 Hackathoner**, Sayyid Khan, and the mission to complete 100
  hackathons. Avoid generic portfolio headlines that could belong to anyone.
- Museum keeps the approved off-white, ink, electric-red palette with sparse cobalt.
- Sculptural explores a more substantial spatial experience inspired by
  [Lusion](https://lusion.co/), with original geometry rather than copied assets.
- Dark Technical explores a more immersive archive with the restrained luminous
  material language of [DesignCode](https://designcode.io/).
- Connect visuals to real projects and the living memoir. Never invent
  project-specific lessons, testimonials, or speaking credentials.
- Check each opening composition, project interaction, narrow-screen layout,
  readable content, and reduced-motion behavior before comparison.

## Third design pass

V2 is saved in `be88157` on `codex/landing-v2-checkpoint`. V3 remains an
uncommitted review pass. No main-site integration or remote push is authorized.

- **Museum:** tactile, spatially arranged project-artifact carousel. Original
  generated artwork is labelled as conceptual, not actual product photography.
  Inspired by the collection/wayfinding approach in
  [Ordinary People's SeMoCA Craft Archives](https://ordinarypeople.info/work/semoca-craftarchives)
  and the project-specific presentation of [Koto](https://koto.com/).
- **Sculptural:** a kinetic installation of 100 modules with alternate spatial
  arrangements and direct controls. Reference: [Lusion](https://lusion.co/).
- **Dark:** an interactive 3D chapter display. Reference:
  [Active Theory](https://activetheory.net/), with a readable interface retained
  around the immersive visual rather than forcing visitors through a game.

All three use real archive records. Their rendered objects are visual metaphors,
not claims that the projects were physical products. Source names and links in
each app's README explain the design references without copying their assets.
