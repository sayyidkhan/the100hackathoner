# The 100 Hackathoner

A fast Astro site documenting Sayyid Khan's journey to complete 100 hackathons.

The site is a public archive, field log, and memoir of ideas, teams, prototypes,
failures, wins, and lessons learned through repeated hackathon execution.

Live site: [the100hackathoner.vercel.app](https://the100hackathoner.vercel.app/)

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

The production site is deployed at
[the100hackathoner.vercel.app](https://the100hackathoner.vercel.app/). Vercel
supplies the production hostname automatically. On another host, set `SITE_URL`
to the canonical origin.

## Project Structure

```txt
src/
  components/        Shared UI components
  content/           Essays, judging logs, and principles
  data/              Static hackathon catalog consumed by Astro
  lib/               Hackathon catalog access
  layouts/           Base HTML layout
  pages/             Astro routes
  styles/            Global design system styles
scripts/             Spreadsheet-to-SQLite/catalog import jobs
docs/                Planning and project notes
data/                Workbook source and generated SQLite analysis database
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

Do not edit the generated database or catalog manually. Update the workbook,
then run:

```bash
npm run sync:hackathons
```

The batch creates `data/hackathons.db` for local analysis and
`src/data/hackathons.json` for the static site. Commit both generated files
with the workbook change. Production builds read only the JSON catalog and do
not require Excel or SQLite support on the deployment host.

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
award, and link tables, then exports the display view to a static JSON catalog.
Astro reads that catalog to generate `/hackathons/1/` through
`/hackathons/73/` without opening SQLite during deployment.

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
