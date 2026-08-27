# Portfolio Starter - Project Rules

A single-page personal portfolio. Built live during RTC's "How RTC Builds Real Software with AI"
workshop, and yours to keep extending afterward.

## The loop

Every change follows the same five steps. No exceptions, including for small changes.

1. **Context** - ask what this is and who it is for, before proposing anything
2. **Spec** - write the decision down as an ADR in `docs/adr/`, before writing code
3. **Build** - implement the ADR. The ADR is the instruction.
4. **Validate** - `npm run check`. Look at it at 320px wide.
5. **Ship** - `npm run deploy`. It is not done until it is on the internet.

## Content

All personal content lives in `src/content/profile.ts` and must satisfy
`src/content/schema.ts`. Never add a second source of truth for content. Never hardcode a name,
a job title, or a date into a component.

That includes `index.html`. Its `<title>` and meta description are filled in from `profile.ts`
at build time by the plugin in `vite.config.ts` - see `src/content/metadata.ts`. Leave the
`__PAGE_TITLE__` and `__PAGE_DESCRIPTION__` tokens alone.

Page section order is content too: `profile.sections` is the order of the page and of the
anchor nav. Adding a section means adding its id to `SECTION_IDS` in the schema and an entry
in `src/components/sections.tsx` - never a hand-placed component in `Page.tsx`. See
`docs/adr/ADR-006-section-order.md`.

**Never invent content.** If information is not in the source the user gave you, leave the field
out. This is a public portfolio - a fabricated job or project is a serious problem, not a
formatting detail.

## Code

- React 19 + TypeScript + Tailwind v4 + Vite. Match the existing patterns in `src/components/`.
- Mobile first. Start at the phone layout with no prefix, add width at `sm:` and `md:`.
- **It must work at 320px.** No fixed widths in the page shell.
- Real semantics: one `<h1>`, headings that do not skip levels, `<nav>` for the nav,
  `<button>` for buttons. Never a `<div>` with an onClick.
- Visible focus states on everything interactive.
- Keep files under 200 lines. Split a component before it gets long.

## Tests

Every behavior change needs a test that would fail without it. `npm test` must be green before any
deploy. Do not delete or weaken a failing test to make it pass - fix the code.

The one exception is a test that asserts something about the *person* rather than the code -
"this resume has at least one side project on it" is not a property this repo gets to require.
If a test can only be made green by inventing content, the test is wrong. Say so, and write
down why in the ADR it belongs to.

## Never

- Never commit `.env` or any token, key, or password
- Never `git push` without being asked
- Never add a dependency without saying what it is for and what it costs
- Never add a backend, a database, or auth to this project. It is a static site on purpose.

## Deploying

Deploy only through `npm run deploy`. It loads `.env` into the environment first. Running the
Netlify CLI directly will fail: the CLI reads the process environment, and a `.env` file is not
the process environment. Never work around that by echoing a token into a terminal that is
being screen-shared.

## Commands

    npm run dev        start the local server
    npm run check      lint + types + tests + build - run this before shipping
    npm test           tests only
    npm run deploy     build and deploy to Netlify production
