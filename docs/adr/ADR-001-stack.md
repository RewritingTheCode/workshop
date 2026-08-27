# ADR-001: Build the portfolio on React 19, TypeScript, Vite and Tailwind v4

- **Status:** Accepted
- **Date:** 2026-08-26
- **Deciders:** Kara Prado, Anatole Norland

## Context

This repo is the starter for RTC's "How RTC Builds Real Software with AI" workshop.
Sixty-odd attendees clone it at minute 0 and have a deployed site by minute 40, on
laptops we have never seen, over conference wifi.

That puts hard constraints on the stack, and they are not the constraints you would
have on a normal product:

- **It has to install and run on any laptop with Node 20.** No Docker, no local
  database, no API keys, no account signups beyond GitHub and Netlify.
- **Every concept in it costs presenter minutes.** We have 90 minutes total and
  maybe 25 of them for building. Anything an attendee has to be told about - a
  router, a server runtime, a config file - is time not spent on the actual lesson.
- **It has to be the stack RTC really uses.** Slide 17 claims the myRTC platform is
  built this way. If the workshop stack were something else, that slide would be a
  lie, and it is the slide that makes the whole session credible.
- **`npm run build` has to produce a folder of static files.** That is what makes the
  deploy step a 30-second command instead of a hosting lesson.

## Decision

We build with **React 19 + TypeScript**, bundled by **Vite**, styled with **Tailwind
CSS v4**, tested with **Vitest + Testing Library + jest-axe**, linted by **ESLint 9
flat config**, on **Node 20 or newer**. Content is validated by a **Zod** schema.

> **Node floor superseded by [ADR-008](ADR-008-node-runtime-support.md).** Node 20 reached
> end of life on 2026-04-30; the build targets Node 24. The rest of this decision stands.
Output is a static `dist/` folder, deployed to **Netlify** (see ADR-004).

React and TypeScript are what the myRTC platform is written in, so slide 17 is
literally true. Vite gives an instant dev server and a static build from one
dependency. Tailwind v4 needs no `tailwind.config.js`, which is one less file to
explain on screen. Zod turns "the model mangled my resume import" into a test failure
that names the field.

## Options we rejected

### Option: Next.js

The default answer for a React app in 2026, and a good one for most products.

Rejected because it brings server rendering, a routing model, a build/runtime split
and a deployment target we do not need for a single static page. Each of those is a
concept the presenter has to either explain or visibly skip past, and visibly
skipping past things teaches attendees that the stack is bigger than they can hold.
It also makes the deploy story more complicated than "upload this folder," which is
exactly the step we most need to keep simple.

### Option: Astro

Honestly the better technical fit. A portfolio is content-first, mostly static, and
Astro ships almost no JavaScript for a page like this one. If this were a product
decision rather than a workshop decision, Astro would probably win.

Rejected because nobody on the myRTC team uses it. That breaks the "this is the exact
workflow our team uses" claim, which is the most valuable thing the workshop has to
offer. An attendee can get a faster portfolio elsewhere; what they cannot get
elsewhere is a working engineer's real loop. We are not going to trade that for a
few kilobytes.

### Option: Plain HTML, CSS and a little JavaScript, no build step

Genuinely tempting. Zero install, zero config, works everywhere, and every attendee
could read all of it.

Rejected because the workshop's real subject is the *engineering loop* - spec, build,
test, ship - and half of that loop needs tooling to exist. There is no `npm test` to
run green on screen before the deploy, and no typecheck to catch the undefined-import
class of error. Removing the build step would make the starter simpler and the lesson
weaker.

### Option: Vue or Svelte

Both are excellent, both are smaller to learn than React.

Rejected for the same reason as Astro: not what RTC builds on. Also, React is what
most attendees will meet in an internship, so the transferable value is higher.

### Option: A component library - MUI, Chakra, shadcn/ui

Would make the starter look polished with less code.

Rejected because the point is that attendees can change how it looks. A component
library puts a layer of abstraction between them and the CSS, and the first thing a
person wants to do with their own portfolio is change the colours. Tailwind utilities
in the markup mean the thing they want to change is right there in the file they are
already looking at.

### Option: Jest instead of Vitest

Rejected because Vitest reuses the Vite config we already have, starts in about a
second, and needs no separate transform setup. On stage, `npm test` finishing before
the presenter finishes their sentence is worth real money.

## Consequences

- **Good:** One dependency tree, one config style, `npm install && npm run dev` works
  on a fresh clone. `npm run check` runs lint, types, tests and build in well under a
  minute on a laptop.
- **Good:** Everything on screen during the workshop is the same technology the
  attendee would meet on an RTC engineering team.
- **Bad:** Ships more JavaScript than this page needs. A 200KB bundle for one static
  page is not something to be proud of; it is a price we are knowingly paying for
  stack continuity with myRTC.
- **Bad:** We are on the newest major of several tools at once. Version churn is a
  real maintenance cost for a repo meant to be re-run at future workshops. The
  `package-lock.json` is committed for exactly this reason - a fresh clone gets the
  versions we rehearsed with, not whatever npm resolves that morning.
- **We will need to revisit this when:** myRTC's own stack moves, or when a workshop
  wants to teach something this stack cannot show - a real backend, auth, or a
  database. At that point this is the wrong starter, not a starter to extend.
