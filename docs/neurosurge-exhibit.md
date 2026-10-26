# NeuroSurge — a memory journal

## Source and interpretation

Rechecked the original public repository on 26 October 2026:

- [Home](https://github.com/sayyidkhan/neurosurge/blob/master/src/pages/home/home.html) offers remembering a grocery list, remembering a recipe list, and recalling the recipe list.
- [Mnemonic data](https://github.com/sayyidkhan/neurosurge/blob/master/src/services/mock-quizqns.ts) includes avocado, blueberries and broccoli, with imaginative associations.
- [Recipe lesson](https://github.com/sayyidkhan/neurosurge/blob/master/src/pages/learning-level2/learning-level2.html) teaches asparagus, mushrooms, olive oil and rosemary.
- The previously reviewed [quiz logic](https://github.com/sayyidkhan/neurosurge/blob/master/src/pages/quiz-level2/quiz-level2.ts) checks typed answers case-insensitively.

The previous kitchen display made cooking look like the product. This revision centres on the learning mechanism: see a list, associate each item with something memorable, hide the cues, recall and check.

The avocado sailboat, blueberry planets and broccoli tree are **new illustrative mnemonics**, not copied original app screens or claims about the original wording. The exhibit says so in its Associate step. Inappropriate or medically misleading old demo phrases are not reproduced. No clinical or disease-prevention claim is made. The original source and social links on the project page remain intact.

## Artwork and live geometry

- Artwork: `public/landing/assets/projects/025-neurosurge-v2.png`, 1536 × 1024.
- Model: `public/landing/artifacts/neurosurge.js`.
- Matching composition: ivory desktop with walnut edge, coral open journal with curved layered pages, three pastel hinged association cards, grocery clipboard and produce tray on the left, plum recall tablet on the right.
- Three-dimensional produce, sculpted avocado sailboat, orbiting blueberry composition, broccoli tree, tablet answer rows and individual checks.
- New plum studio lighting is scoped to `studioProfile: neurosurge`; other projects retain their lighting.
- An optional `framingTargetY` centres wide tabletop scenes without altering default framing for existing models.
- Text uses local high-resolution canvas textures; all geometry and surfaces run locally with no external asset request.

## Interaction

Four selectable stages: Learn, Associate, Recall, Check answers. Auto-play runs a deterministic 28-second sequence:

1. 0–6 seconds: introduce the grocery cues.
2. 6–12 seconds: gentle sailboat, planet and tree motion illustrates the associations.
3. 12–19 seconds: cards rotate to their question-mark backs; grocery names and loose produce disappear; answer slots remain blank.
4. 19–26 seconds: answers and checks appear in order on the tablet.
5. 26–28 seconds: answers clear and cards return for the next cycle.

Manual stage selection holds that state for inspection. This is a guided demonstration, not a scored memory test. Drag/arrow rotation, zoom, pause, reduced motion and offscreen suspension use the existing gallery renderer and clock.

## Artwork generation

Generated with the built-in imagegen tool, text-to-image mode. Final prompt: [neurosurge-artwork-prompt.txt](neurosurge-artwork-prompt.txt). The original v1 image is preserved; the project now imports v2.

## Validation

- Node tests verify cue concealment, ordered answer reveal, invalid stage handling, deterministic seeking, exact loop reset and finite geometry.
- Production Astro build and existing early-exhibit regression tests.
- Live browser checks: artwork/3D switching, each story stage, pause, zoom and keyboard rotation. Review screenshots saved under `outputs/neurosurge-review/`.
