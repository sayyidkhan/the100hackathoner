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
  content/           Essays, judging logs, and principles
  lib/               SQLite data access for the hackathon archive
  layouts/           Base HTML layout
  pages/             Astro routes
  styles/            Global design system styles
scripts/             Spreadsheet-to-SQLite import jobs
docs/                Planning and project notes
data/                Workbook source and generated SQLite archive
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

Hackathon archive source:

```txt
data/Hackathon CV.xlsx
```

The workbook is imported into `data/hackathons.db` before local development
and production builds. Do not edit the database manually. Update the workbook,
then run:

```bash
npm run sync:hackathons
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

Hackathon records use a normalized SQLite model generated from the workbook.
The import stores core event data plus relational organizer, participant, tag,
award, and link tables. Astro reads the display view during the static build to
generate `/hackathons/1/` through `/hackathons/73/`.

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
npm run sync:hackathons # Rebuild the SQLite archive from Excel
npm run build    # Run Astro checks and build static site
npm run preview  # Preview built site
```

## Tech Stack

- Astro
- TypeScript
- Markdown content collections
- Static site output
