# Xueyiyi 1.0 and 2.0 exhibits

## Evidence reviewed, 27 October 2026

- Public source: https://github.com/sayyidkhan/xueyiyi at `19401b292bd5bbe044621f4fa1e0ad6f26e52a52`.
- Reviewed README.md, index.html, js/main.js and images/xueyiyi-logo.png through GitHub API. README calls it “learn easy”; repository description identifies a First Media Design School coursework project.
- index.html lines 85–100 describe virtual/mobile workplace learning; lines 157–203 name recognition/leaderboards, task-assisted learning, the 3 R, ubiquitous learning, infographics roadmap, rewards, peer coaching and guided learning. Its portfolio groups office, F&B and fitness examples. JavaScript inspected implements navigation, not a production learning backend.
- Local records: #001 Education Technology Hackathon, September 2016; #002 Innovplus 2016, same source URL, workplace-learning focus.
- Neither record contains Instagram links. Web search for Xueyiyi/Instagram produced unrelated results, so those were not used. The linked Facebook post could not be retrieved. No social content was inferred.
- The shared repository does not establish separate version-specific implementations. The visual distinction is explicitly a **concept interpretation**: two microlearning sample lessons and visual palettes. Do not present these scenes as screenshots of a shipped 2016 app. The user clarified that microlearning is the core product; the earlier workplace miniatures have been replaced.
- Corporate logos, partnership claims, free-hosting claims and old prices from the marketing page are deliberately not repeated as verified facts.

## Current deliverables — microlearning rework

- `public/landing/assets/projects/001-xueyiyi-microlearning-v2.png`
- `public/landing/assets/projects/002-xueyiyi-microlearning-v2.png`
- `public/landing/artifacts/xueyiyi.js` — native Three.js product scene
- `public/landing/artifacts/xueyiyi-screen.js` — shared UI drawing and illustrative lesson content
- `xueyiyi-v1.js` / `xueyiyi-v2.js` edition entrypoints

Both artwork images generated with the built-in imagegen tool. Exact prompts are saved in [xueyiyi-microlearning-prompts.txt](xueyiyi-microlearning-prompts.txt). Previous image assets retained. The 3D has local materials and canvas UI; no runtime remote dependencies.

## Product and visual direction

A hero smartphone, thin floating lesson and quiz cards, a small lesson stack and a four-step progress indicator. No workplace pavilions or coaching furniture. Cream/silver hardware, jade/lime for 1.0 and indigo/lime for 2.0. The screen is the main subject in both artwork and 3D.

The concept demonstrates a short lesson → three practical takeaways → one scenario question → answer explanation and progress. 1.0 uses an illustrative three-minute listening lesson; 2.0 uses an illustrative four-minute feedback lesson. These topics, durations, daily streaks and UI are contemporary concept content, not claims about the archived releases. The quiz selection is a scripted example, not a functioning learning backend.

## Motion and controls

Deterministic 24-second loop with four six-second stages: Discover, Short lesson, Quick check, Progress. Phone changes content with each stage. The relevant card steps slightly forward; the quiz card becomes feedback on completion. Progress dots advance with the stages. Manual stage selection holds the selected state; autoplay resumes without a jump. Screen frames reuse one GPU texture, while static geometry is batched. Existing shared viewer handles pause, reduced motion, hidden pages, inactive scenes, rotation and zoom.

## Validation

`node --test scripts/tests/xueyiyi.test.mjs` checks finite and bounded geometry, stage selection, deterministic seeking, loop reset and no-jump resume. Browser review checks both scenes, screen legibility, artwork, manual stage changes and autoplay. `npx astro check` and `npx astro build` check integration without the data-sync prebuild.
