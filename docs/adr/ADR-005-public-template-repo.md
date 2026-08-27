# ADR-005: Publish this repo publicly, as a GitHub template

- **Status:** Accepted
- **Date:** 2026-08-27
- **Deciders:** Kara Prado

## Context

`docs/SETUP.md` is pre-work. It goes out 48 hours ahead and it tells every attendee to run:

```bash
git clone https://github.com/RewritingTheCode/workshop.git my-portfolio
```

The repo is **private**. That command fails for all of them, and it fails badly: GitHub
returns `Repository not found` for a repo that is private just as it does for one that does
not exist. An attendee reading that message has no way to tell "I am not allowed in" from "I
typed it wrong," so the support burden lands on us in the hour before the session, sixty
people at once, on the one step we asked them to do alone.

The same wall sits in front of the two other entry points the setup guide promises. The
Codespaces fallback - the answer for anyone whose work laptop will not install Node - starts
on the repo page they cannot open. And `docs/SETUP.md` points at the green **Use this
template** button, which does not exist, because the repo has never been flagged as a
template.

So there are three doors into this project and all three are locked. The forces:

- **It has to be open before the pre-work email goes out**, not on the day.
- **The thing attendees leave with is a portfolio on their resume.** Whatever we choose
  determines what a recruiter sees at the top of their repo page.
- **This repo is also the presenter's working copy.** Whatever is in its history becomes
  permanently public the moment we flip the switch, and un-publishing does not recall the
  clones and forks made in between.

## Decision

We make this repo **public** and mark it as a **GitHub template repository**, and we make
**Use this template** the recommended path in `docs/SETUP.md`, with a direct clone kept as
the read-only alternative for people who only want a look.

We flip the switch only after auditing what becomes public. That audit is done and recorded
here rather than left implied:

- **A clean clone actually works.** Cloned to a fresh directory, `npm install` then
  `npm run check` - lint, typecheck, 22 tests, production build - passes with nothing from
  the presenter's machine. This is verified, not assumed.
- **No secret has ever been committed.** `.env` is untracked and appears in no commit on any
  branch. The only credential-shaped file in the history is `.env.example`, which holds
  variable names and no values.
- **`WORKSHOP-BRIEF.md` never entered the history.** It names internal repos and run-of-show
  detail, it is gitignored, and `git log --all` confirms it was never added.
- **A clone with no Netlify secrets stays green.** `.github/workflows/deploy.yml` resolves
  whether the secrets exist and skips the deploy job with an explanatory job summary, so a
  cloner's first push shows a green check rather than a red X on a workflow they never set up.

We also set the description and topics. An empty description is not neutral - on a repo
someone is deciding whether to trust with their portfolio, it reads as abandoned.

## Options we rejected

### Option: Keep it private and add attendees as collaborators

Preserves the current privacy setting, and nothing in the repo changes.

Rejected on arithmetic. It is sixty invitations to send and sixty acceptances to chase before
minute 0, each one a person who has to notice an email. It also gives strangers push access to
the repo the presenter is about to demo from, which is the wrong direction entirely. And it
still does not fix the real problem: collaborators can clone, but the portfolio they build
would live in our org, not in their account, where it is no use to them afterwards.

### Option: Public, but an ordinary repo - let people fork

One switch instead of two, and forking is the flow most people already know.

Rejected because of the label. A fork carries a permanent "forked from
RewritingTheCode/workshop" line at the top of the page, and it cannot be removed without asking
GitHub support to detach it. The deliverable here is something an attendee puts on a resume; a
recruiter opening it should see their project, not a copy of ours with our name above theirs.
A template gives them the same code with a history that starts at their own first commit. The
second switch is worth it.

### Option: Public and a template, but keep `git clone` as the headline in SETUP.md

Least churn in a document that sixty people are about to follow.

Rejected because it would leave the better path as a footnote. A plain clone gives an attendee
a working directory whose `origin` they cannot push to - so the moment they try to save their
work, they hit a permission error at exactly the point in the session where they are proudest.
Making the template button the first instruction costs one paragraph and removes a failure that
would otherwise land on the people who got furthest.

### Option: Ship a `.zip` download instead

No GitHub account needed, no permissions to reason about.

Rejected because it deletes the point of the workshop. Half of what we are teaching is that the
git history, the CI gate and the deploy are one connected loop. A zip has no history, no remote,
no Actions tab - the attendee would have to build all of that by hand before reaching minute 1,
or never see it at all.

### Option: Split into two repos - a private presenter repo, a public starter

The tidiest version on paper: internal notes stay somewhere they can never leak.

Rejected as a second source of truth, which is the thing this project's own rules forbid.
Two repos means every fix landing twice, and the day one of them drifts is the day an attendee
follows a setup guide that no longer matches the code. The problem it solves is already solved
by one line of `.gitignore` keeping `WORKSHOP-BRIEF.md` out, which is verified above.

### Option: Publish it under the presenter's personal account

Faster - no org permissions to think about.

Rejected because this outlives the session. It is RTC's teaching material, attendees will link
to it, and it should not depend on one person's account still existing in two years.

## Consequences

- **Good:** All three documented entry points - clone, template button, Codespaces - work for
  a stranger with no account of ours.
- **Good:** Attendees leave owning a repo with a clean history and no fork label on it.
- **Good:** The audit above is now written down, so the next person to add a file to this repo
  knows that "is this safe to publish?" is a standing question, not a one-off.
- **Bad:** Public is not really reversible. Clones and forks taken while it is public survive
  us setting it back to private. Everything committed here from now on is published the moment
  it is pushed.
- **Bad:** The `.gitignore` entry for `WORKSHOP-BRIEF.md` is now load-bearing. It is one line
  standing between internal run-of-show detail and the public internet, and a `git add -f` or a
  rename would step straight past it.
- **Bad:** Issues are open to the public on a repo with no maintainer rota behind it. We should
  expect questions from beyond the cohort and be honest that answers are best-effort.
- **We will need to revisit this when:** a second cohort runs and the starter has drifted from
  what the deck teaches - at which point tagging a release per cohort is the answer, so that an
  attendee's setup guide and their code are pinned to the same version.
