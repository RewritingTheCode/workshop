# ADR-002: Ship one page, and say out loud what we are not building

- **Status:** Accepted
- **Date:** 2026-08-26
- **Deciders:** Kara Prado, Anatole Norland

## Context

An attendee has roughly 25 minutes of hands-on time to get a real site of their own on
the internet. What we choose to build in that window is the whole product decision,
and it is also the lesson: slide 10 is about scope, and this file is the evidence that
we took our own advice.

The forces:

- The site has to look **finished** on first load. An attendee decides in the first
  thirty seconds whether this is worth their morning. A skeleton with placeholder
  boxes fails that test even if it is technically correct.
- Every feature is a thing that can break live, in front of sixty people.
- Anything with a backend brings hosting cost, secrets, and a security surface that
  we cannot responsibly teach in 90 minutes.
- Attendees keep this repo. Whatever we ship, they maintain.

## Decision

We build **a single-page portfolio**. One page, no subpages, no login, no CMS.

In scope:

- A hero: name, one-line headline, photo, short intro paragraph
- One chronological **timeline** mixing work history and projects
- A **filter** on that timeline: All / Work / Projects
- **Anchor navigation**, so it reads like real navigation without being multi-page
- A links block: GitHub, LinkedIn, email, resume download
- **Responsive down to 320px.** It has to survive a phone.
- Accessible: real headings, real landmarks, keyboard-reachable filter, visible focus

Out of scope, deliberately. The right-hand column here is the teaching point:

| Not building | Why we say so out loud |
| --- | --- |
| Login and accounts | Nobody needs an account to read your portfolio. Auth you half-build is worse than no auth. |
| A CMS to edit content | The content is a typed file in the repo. Editing it *is* the demo. A CMS would hide the interesting part. |
| A blog engine | Different product. Scope creep with a friendly face. |
| Animations, a design system | Cost is unbounded, value at MVP is near zero, and both are easy to add later against a working site. |
| A backend, a database | Adds hosting cost, secrets, and a whole security surface. A static file on a CDN is the correct architecture at this scale. |
| Dark mode | Nice, not MVP. Deliberately left on the table as the audience feature request in the live session. |

## Options we rejected

### Option: A multi-page site with a router

Separate `/about`, `/projects`, `/contact` routes. This is what most people picture
when they hear "portfolio site."

Rejected because a recruiter reads a portfolio in about ninety seconds and never
clicks a second page. Routing would add a dependency, a navigation state to keep in
sync, and a class of 404 bugs, in exchange for hiding content behind clicks. Anchor
navigation gives the *feel* of nav - a real `<nav>`, real section links, a URL that
changes - with none of that cost.

### Option: Separate "Work" and "Projects" sections instead of one filtered timeline

Simpler to build. No filter state at all.

Rejected for two reasons. First, it is worse for the user: a career is chronological,
and splitting it hides the fact that the interesting project happened during the
boring job. Second, it is worse for the workshop: the filter is the one piece of real
interactive behaviour on the page, which makes it the thing worth writing a behaviour
test against. `tests/timeline.test.tsx` only exists because we made this choice.

### Option: A contact form

The single most-requested portfolio feature, and the one attendees will ask for live.

Rejected because a form that sends email needs a backend, an email provider, an API
key, and spam handling. That is four new concepts and a secret to manage, for
something a `mailto:` link does adequately. When an attendee asks for this in the live
session, the answer is a scoping demonstration, not a refusal: "that needs a backend
and an email provider - great candidate for your week two."

### Option: Let attendees pick their own layout

More personal, more fun.

Rejected because divergence kills a hands-on session. If everyone's tree looks the
same, a presenter can say "open `src/content/profile.ts`" and sixty people are looking
at the same thing. Personalisation belongs in the content and the colours, both of
which are one file each.

### Option: Ship it deliberately unfinished, as an exercise

"Here is the skeleton, you fill in the components."

Rejected outright. Attendees who fall behind would have nothing, and attendees who
keep up would have spent their 25 minutes on typing rather than on the loop. The
starter is finished on purpose. The lesson is in changing something that works.

## Consequences

- **Good:** Everything in scope is visible on one screen, which means the whole
  product can be demonstrated without scrolling past anything unexplained.
- **Good:** No backend means no secrets in the attendee's repo, no hosting bill, and a
  site that stays up untouched for years.
- **Good:** The "not building" list is reusable content. It is what we point at when
  an audience request is out of scope.
- **Bad:** Some attendees will want the excluded features, and dark mode in particular
  will be asked for. That is fine - it is a pre-vetted live request precisely because
  it is cheap and self-contained.
- **Bad:** One page limits how much work someone with a long career can show. The
  timeline filter mitigates it; a person with fifteen years of history should
  eventually paginate or trim.
- **We will need to revisit this when:** an attendee's portfolio outgrows one page,
  which is a good problem and a good excuse to write their own ADR.
