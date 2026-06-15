# The 100 Hackathoner

A fast Astro site documenting Sayyid Khan's journey to complete 100 hackathons.

The site is a public archive, field log, and memoir of ideas, teams, prototypes,
failures, wins, and lessons learned through repeated hackathon execution.

## Getting Started

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Astro will print the local URL, usually:

```txt
http://localhost:4321
```

If port `4321` is already used, Astro will automatically choose another port.

## Build

Run type checks and generate the static site:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Project Structure

```txt
src/
  components/        Shared UI components
  content/
    essays/          Field notes and memoir essays
    hackathons/      Hackathon chapter entries
    judging/         Judging logs and pattern notes
    principles/      Evolving 100-hackathon principles
  layouts/           Base HTML layout
  pages/             Astro routes
  styles/            Global design system styles
docs/                Planning and project notes
data/                Source data files
```

## Common Edits

Homepage:

```txt
src/pages/index.astro
```

Global styles and design tokens:

```txt
src/styles/global.css
```

Navigation:

```txt
src/components/Header.astro
```

Footer:

```txt
src/components/Footer.astro
```

Hackathon entries:

```txt
src/content/hackathons/
```

Essay entries:

```txt
src/content/essays/
```

Judging logs:

```txt
src/content/judging/
```

Principles:

```txt
src/content/principles/
```

## Content Format

Hackathon entries are Markdown files with frontmatter:

```md
---
number: 64
title: "Data Center Destroyer"
event: "AI Game Jam"
date: "2026-05-01"
result: "Built prototype"
project: "Data Center Destroyer"
stack:
  - React
  - Phaser
  - OpenAI
  - Vercel
lesson: "A working demo beats an elegant idea that no one can touch."
demoUrl: ""
githubUrl: ""
coverImage: "/images/hackathons/data-center-destroyer.png"
---

## Summary

Write the chapter here.
```

Essay entries use:

```md
---
title: "Why I Keep Joining Hackathons"
date: "2026-05-12"
description: "A short summary of the essay."
---

Essay content goes here.
```

Judging logs use:

```md
---
title: "Judging Event Title"
event: "Hackathon Name"
date: "2026-01-01"
role: "Judge"
domain: "AI / SaaS / Sustainability / Developer Tools"
criteria:
  - Problem clarity
  - Working demo
  - User value
patterns:
  - Strong teams made the value obvious quickly.
lesson: "What judging this event taught me as a builder."
links: []
---

## What I Judged

Write the judging log here.
```

Principles use:

```md
---
number: 1
title: "Ship the Smallest Complete Loop"
date: "2026-01-01"
theme: "Execution"
statement: "A working loop beats an impressive incomplete system."
evidence: "Repeated pattern from recent hackathons."
relatedHackathons:
  - 64
---

## Why This Principle Exists

Write the principle note here.
```

Template files already exist in:

```txt
src/content/judging/template.md
src/content/principles/template.md
```

They are marked `draft: true`, so they do not render publicly.

## Scripts

```bash
npm run dev      # Start local development server
npm run build    # Run Astro checks and build static site
npm run preview  # Preview built site
```

## Tech Stack

- Astro
- TypeScript
- Markdown content collections
- Static site output
