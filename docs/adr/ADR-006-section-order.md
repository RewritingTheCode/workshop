# ADR-006: Page section order is content, and lives in `profile.ts`

- **Status:** Accepted
- **Date:** 2026-08-27
- **Deciders:** Kara Prado

## Context

"Can I put my projects above my work history?" is the most common thing anyone asks
about a portfolio, and it is a fair question. A new graduate with three side projects
and one summer job wants the projects first. Someone two years into a career wants the
opposite. There is no order that is right for both, which means the order is a
property of the person, not of the codebase.

Before this decision, the order lived in two places at once:

- `src/App.tsx` rendered `Hero`, then `Timeline`, then `LinksBlock`, in that literal
  order.
- `src/components/AnchorNav.tsx` held its own hardcoded `SECTIONS` array - `top`,
  `timeline`, `links` - to build the nav.

They agreed only because someone kept them agreeing. Reordering the page meant editing
both, and forgetting the second one produced a nav whose links were in a different
order from the page they pointed at. That is precisely the "second source of truth"
failure that [ADR-003](ADR-003-content-model.md) forbids for names and dates, and there
is no reason order should get an exemption.

There is also a teaching reason. The strongest argument for putting all content in one
typed file is that changing the file changes the site. A reader who can reorder their
whole page by moving one string in `profile.ts`, and watch the navigation follow, has
seen that argument work rather than been told about it.

## Decision

`profile.sections` is an **ordered array of section ids** in `src/content/profile.ts`,
validated by the schema in `src/content/schema.ts`:

```ts
sections: ['timeline', 'links'],
```

The array is the order the sections render in, top to bottom, and the order they appear
in the anchor navigation. Move an id and both move together. Remove an id and the
section leaves the page and the nav at the same time.

Three pieces make that work:

- **`SECTION_IDS` in `src/content/schema.ts`** is the single list of ids that exist.
  The Zod schema validates against it, and `SectionId` is inferred from it, so an
  unknown id is a test failure naming the field rather than a blank screen.
- **`src/components/sections.tsx`** maps each id to the one definition of that section:
  its nav label, its nav icon, and how to render it. Both the page and the navigation
  read from this map, so neither can drift from the other.
- **`src/components/Page.tsx`** takes a `Profile` and lays it out. `App.tsx` does
  nothing but hand it the real profile. That split is what makes section order testable
  against a fixture instead of only against the shipped content.

The `Hero` is deliberately **not** a section. It carries the `<h1>` and the `#top`
anchor, every page needs exactly one of it, and a portfolio whose first block is not
the person's name is not a portfolio. Pinning it removes a way to produce a broken page
and costs nothing anybody wants.

The schema **rejects a repeated id**. Each section id is a DOM `id`, an anchor target
and a React key; repeating one produces duplicate ids, an anchor that jumps to the
wrong block, and invalid HTML. That is a real failure with a confusing symptom, so it
is caught in the schema where the error can name it.

## Options we rejected

### Option: Drag-and-drop reordering in the browser

The literal reading of "let people rearrange the blocks", and the demo everybody
pictures.

Rejected on three counts, any one of which would be enough. It needs somewhere to
persist the result - `localStorage` at best, which is per-browser and invisible to the
recruiter opening the link, or a backend, which [ADR-002](ADR-002-scope.md) rules out
outright. Accessible drag-and-drop is genuinely hard: pointer handling is the easy
half, and the keyboard and screen-reader half is where these implementations quietly
fail, which would put a fresh accessibility violation into a repo whose test suite
gates on `axe` returning zero. And it answers the wrong question - the order is a
decision the owner makes once, not an interaction they perform.

### Option: Leave the order in `App.tsx` and just fix the nav to match

Smaller. Delete `AnchorNav`'s hardcoded array, derive the nav from whatever `App`
renders.

Rejected because deriving a nav from rendered children means reading the tree, and the
honest version of that is fragile enough that people reach for `useEffect` and DOM
queries. It also leaves the order in code rather than in content, so changing it stays
a developer's job in a file the content model says you should not have to touch.

### Option: Give every section a full config object - order, plus a title and a toggle

`sections: [{ id: 'timeline', title: 'What I have built', enabled: true }]`. More
powerful, and the shape a CMS would use.

Rejected as configuration that nobody asked for. `enabled: false` is what deleting a
line from an array already does, and more legibly. A custom title per section is a real
request, but it is a separate decision with its own trade-offs - headings feed the
document outline that the accessibility tests assert on - and inventing the extra
fields now to avoid a later edit is guessing. An array of strings is the smallest thing
that answers the actual question, and widening it later is a schema change and a
migration of exactly one file.

### Option: Sort sections by a numeric `order` field on each one

`order: 10`, `order: 20`, the pattern most CMSs use.

Rejected because it is the array, with arithmetic. Renumbering to insert something in
the middle is a chore that array order does not have, two sections can collide on the
same number, and the file no longer reads top-to-bottom in the order the page does.

## Consequences

- **Good:** One place decides section order, and the navigation cannot disagree with
  the page, because both read the same array.
- **Good:** Reordering a portfolio is a one-line content edit, in the file the project
  already tells you is the only one you edit.
- **Good:** `Page` takes a `Profile`, so layout behaviour can be tested against a
  fixture. Before this, every layout assertion had to run against the shipped content.
- **Bad:** Adding a new section is now a two-file change - `SECTION_IDS` in the schema,
  and an entry in `sections.tsx` - where it used to be one line in `App.tsx`. That is
  the price of the ids being validated, and it is paid by the person adding a section
  rather than by everyone reordering one.
- **Bad:** Removing `'timeline'` from the array hides the timeline while
  `profile.timeline` still requires at least one entry. The content is intact and
  invisible, which is a confusing state to be in. It is explicit enough that we would
  rather allow it than add a rule about which sections are mandatory.
- **We will need to revisit this when:** somebody wants two of the same section with
  different filters - "Work" and "Projects" as separate blocks. That needs a section
  *instance* with its own id and config, which is the config-object option above, and
  at that point it becomes the right answer.
