# ADR-003: Keep all content in one typed file, validated by a Zod schema

- **Status:** Accepted
- **Date:** 2026-08-26
- **Deciders:** Kara Prado, Anatole Norland

## Context

At minute 22 of the workshop, every attendee drops their resume into the repo and
types roughly this:

> Read ./my-resume.pdf and rewrite src/content/profile.ts with my real information.

Sixty people run that at once, on sixty different resumes, with the presenter unable
to see any of their screens. It is the highest-leverage moment of the session - it is
where the site stops being a demo and becomes theirs - and it is also the moment most
likely to go wrong.

Two things decide whether that moment works:

1. **How many files the model has to touch.** One file that it rewrites wholesale is a
   task a model does reliably. Twelve components with strings scattered through them
   is a task that produces a plausible mess.
2. **Whether a mistake is visible.** If the model drops `endDate` from an entry, we
   want a red test naming that field - not a page that renders "undefined" and an
   attendee who does not notice until a recruiter does.

There is also a correctness constraint that is not really a technical one. This is a
public page about a real person. A fabricated internship is not a formatting bug; it
is a serious problem for the attendee.

## Decision

All personal content lives in **`src/content/profile.ts`**, a single typed export.
Its shape is defined by a **Zod schema** in `src/content/schema.ts`, and
`tests/content.test.ts` asserts that the instance satisfies the schema and reports the
exact failing field path when it does not.

`Profile` and `TimelineEntry` types are inferred from the schema with `z.infer`, so
the schema is the single definition - there is no separate TypeScript interface that
can drift away from it.

Two rules follow, and both are written into `CLAUDE.md` so the model reads them every
session:

- **Never a second source of truth.** No name, job title or date is ever hardcoded
  into a component. Components take props.
- **Never invent content.** If a field is not in the source the user provided, leave
  it out.

The `Timeline` component **sorts by date** - `endDate` descending, `null` (present)
first, ties broken on `startDate` descending. It never relies on array order, because
the model rewrites that array wholesale and nothing preserves ordering.

### Images are part of the contract, and `alt` is not optional

Timeline entries can carry an image. The field is optional - most work entries do not need one -
but when it is present, `alt` is **required** by the schema, not merely encouraged.

That is deliberate. "Remember to add alt text" is a rule people mean to follow and then do not,
especially at 1am adding a screenshot. Putting it in the schema means the failure is a red test
naming the entry, not a silent gap that only a screen reader user ever discovers. There is a
matching test asserting the file actually exists in `public/`, because a broken image path
typechecks perfectly.

**Nothing ships with a photograph.** Entries without an image get a cover drawn from their own
data: a stable hue derived from the entry id, and an icon chosen from the entry's most specific
tag - so a project tagged Leaflet gets a map and one tagged GTFS gets a bus. Nobody has to pick a
colour, no two entries look alike, and there is no image to load.

That is a deliberate trade. Stock photography on a portfolio is decoration: it tells a reader
nothing about the work, it is another thing to license and attribute, and it is bytes to download
over conference wifi. A generated cover is honest about being a placeholder while still giving
the page visual rhythm. When an attendee adds a real screenshot of something they built, that
wins - the image field takes precedence over the generated cover.

## Options we rejected

### Option: Plain TypeScript types, no Zod

Define `type Profile = { ... }` and let `tsc` enforce it. No runtime dependency, no
extra concept.

Rejected because TypeScript's error is compile-time and structural, and the failure
mode we actually care about is a *value* problem, not a shape problem. `startDate:
'June 2024'` typechecks perfectly and is wrong. `endDate: ''` typechecks and is wrong.
Zod's regex and `min(1)` constraints catch exactly the mistakes a model makes when
reading a messy PDF, and the failure arrives as a test that names the field. The cost
is one small dependency; the benefit is that the minute-22 block has a safety net.

### Option: Content in JSON or YAML

`profile.json` would be easier for a non-programmer to edit, and JSON has no syntax to
learn.

Rejected because JSON loses the type inference that makes the components safe, and it
loses comments. The comment block at the top of `profile.ts` telling you this is the
only file you edit is doing real work on stage. YAML adds a parser and a whole class
of whitespace bugs for no benefit here.

### Option: Markdown files with frontmatter, one per timeline entry

The conventional structure for a content-driven site, and genuinely nicer for long-form
writing.

Rejected because it turns "rewrite one file" into "create six files with consistent
frontmatter, delete the three you replaced, and do not leave an orphan." That is a
noticeably less reliable task for a model, and a noticeably harder one to review in
the ten seconds an attendee has. It also needs a loader and a build-time glob, which
is more machinery to explain than the content model deserves.

### Option: A CMS, or a small admin UI for editing content

Rejected in ADR-002 for scope reasons, and rejected again here for a teaching reason:
editing the typed file *is* the demo. Putting a UI in front of it would hide the thing
we are trying to show, which is that the content is code, in your repo, that you own.

### Option: Validate only in development, not in the test suite

Cheaper, and keeps the production bundle smaller.

Rejected because the validation running in CI is the point. `npm run check` failing on
a bad import is what turns "the model mangled my resume" from a mystery into a
one-line diagnosis. The bundle cost is a few kilobytes and we already accepted a much
larger one in ADR-001.

## Consequences

- **Good:** One file to edit, one schema to read, one test that names the broken field.
  The minute-22 block becomes reliable instead of a coin flip.
- **Good:** Types are inferred from the schema, so runtime validation and compile-time
  types cannot disagree.
- **Good:** Date-based sorting means the model can rewrite `profile.ts` in any order
  and the page still reads correctly.
- **Bad:** One file means merge conflicts if two people edit content at once. Not a
  problem for a personal portfolio; would be a real problem for a team site.
- **Bad:** Zod ships in the client bundle. We could validate at build time only and
  strip it, but that is a complication for a saving that does not matter at this size.
- **Note on the API used:** the schema uses Zod 4's top-level `z.url()` rather than the
  older `z.string().url()`. Same validation, current idiom; the older form is
  deprecated and will not survive the next major.
- **We will need to revisit this when:** content grows past what one file can hold
  comfortably, or when someone wants long-form prose per entry, at which point
  Markdown per entry becomes the right answer after all.

---

## Amendment, 2026-08-27: the content tests stop asserting a shape of career

**What changed:** `tests/content.test.ts` no longer requires the timeline to contain at
least one `work` entry *and* at least one `project` entry.

That assertion was written against the starter content, where both kinds exist because
we wrote them. It only ever looked correct. The moment an attendee runs the minute-22
prompt against a resume with no personal projects on it - or a resume that is nothing
but personal projects, which is a lot of first-year students - the test goes red, and
it goes red for having done the right thing.

The failure is worse than an ordinary red test because there is no honest way out of
it. `CLAUDE.md` says never weaken a failing test to make it pass, and the decision above
says never invent content. Together those leave an attendee with one option: put a job
on a public page about themselves that they did not have. A test that can only be
satisfied by fabricating something is not a safety net, it is a trap, and it was aimed
squarely at the least confident person in the room.

**What replaces it.** Nothing, in `content.test.ts` - "this person has had both a job
and a side project" is a fact about a life, not a property of the content model, and the
schema already guarantees every entry carries a valid `kind`. The behaviour that
actually became reachable is covered where behaviour belongs: `tests/timeline.test.tsx`
now asserts that filtering to a kind with no entries renders the empty state rather than
a blank stretch of page.

We are keeping the filter's three buttons even when one of them can only ever return
nothing. Hiding a control based on the data behind it is a rule that has to be explained,
tested and maintained, and "Nothing here yet." already tells the truth in one line.
