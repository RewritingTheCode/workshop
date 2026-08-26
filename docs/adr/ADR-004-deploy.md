# ADR-004: Deploy to Netlify with a personal access token, gated on CI

- **Status:** Accepted
- **Date:** 2026-08-26
- **Deciders:** Kara Prado, Anatole Norland

## Context

The event description makes four promises: **plan, build, test, ship**. "Ship" means an
attendee leaves with a public URL that is theirs. It is the deliverable, and it is also
the single highest-risk step of the session.

The risks are specific:

- `netlify login` opens a **browser OAuth flow**. On a shared screen that is slow, it
  puts the presenter's account UI in front of sixty people, and it can hang with no
  obvious way out. A hang at minute 36 costs the rest of the session.
- The first `netlify deploy` **asks which site to link to**, interactively. Any prompt
  is a place where a live demo stalls.
- If sixty people create Netlify accounts in the same three minutes, some will hit
  **email verification delays** that no amount of presenter skill can fix.
- Slide 14 claims the deploy is **gated on tests**. If that is only true on the slide
  and not in the repo, an attendee who opens the Actions tab catches us out.

## Decision

We deploy to **Netlify**, and we pre-stage every part of it.

- **Authentication is a personal access token**, read from `NETLIFY_AUTH_TOKEN` in the
  environment. No browser login, ever, on stage. The site is created ahead of time and
  its id lives in `NETLIFY_SITE_ID`, so `npx netlify-cli deploy --build --prod` runs
  with zero prompts.
- **`.env` holds the token locally and is gitignored.** `.env.example` is committed
  with the variable names and no values. `.claude/settings.json` puts `Read(./.env)` in
  the model's **deny** list, so Claude Code cannot read the token even if asked.
- **`npm run deploy` loads `.env` into the environment before calling the CLI.** This is not a
  detail. The Netlify CLI reads `NETLIFY_AUTH_TOKEN` from the *process environment*, and a
  `.env` file is not the process environment - nothing loads it implicitly. With the token
  sitting correctly in `.env`, calling the CLI directly still fails with "Authentication
  required", which is a genuinely confusing error to hit in front of an audience. The deploy
  script pipes the file through `dotenv-cli` so the one documented command always works.
- **Account creation is pre-work**, not a live step. It goes in the email 48 hours
  ahead, so nobody is waiting on a verification email at minute 34.
- **CI gates the deploy.** `.github/workflows/ci.yml` runs lint, typecheck, test and
  build on every push and pull request. `.github/workflows/deploy.yml` runs on pushes to
  `main` with `needs: [ci]`, so it cannot start until CI is green. The promise on the
  slide is enforced by the repo.
- **Security headers ship with the site.** `netlify.toml` sets a Content-Security-Policy,
  `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` and a `Referrer-Policy`.
  These are the concrete artifact for the "security, two directions" segment: outside-in
  protection you can point at, in four lines, in the repo.

## Options we rejected

### Option: Vercel

Equally good for this. Excellent CLI, excellent free tier, arguably a nicer dashboard.

Rejected on logistics rather than merit. The deck and the pre-work email already say
Netlify, the account-creation instructions are already written against it, and its
personal access token flow is the simplest one to pre-stage. Changing hosts a week out
would mean rewriting the pre-work email that sixty people are about to follow, for zero
technical gain. This is a real reason and worth writing down: sometimes the deciding
factor is that something is already true.

### Option: GitHub Pages

Free, already tied to the repo the attendee just created, no third account needed.

Rejected because it cannot set response headers. The entire `netlify.toml` header block
would be impossible, and that block is load-bearing for the Part Three security segment.
Pages also puts the site on a `github.io` subpath, which means base-path configuration in
Vite - a footgun that produces a blank white page with no obvious cause, which is the
worst possible failure mode at minute 36.

### Option: telling people to `export NETLIFY_AUTH_TOKEN=...` in their terminal

The zero-dependency way to get the token into the environment, and what Netlify's own docs show.

Rejected for two reasons. It does not survive a new terminal tab, so an attendee who reopens
their editor at minute 50 silently loses their token and gets an error that looks like a Netlify
problem. And it puts a live credential in shell history and in the scrollback of a screen share.
A gitignored file that one command reads is both more durable and safer to demonstrate.

### Option: making `netlify-cli` a direct dependency instead of running it through `npx`

Would make the deploy instant on the day, with no download.

Rejected on install weight. The CLI pulls in a very large dependency tree, and `npm install` at
minute 0 is on conference wifi for sixty people at once. `npx` keeps the starter install small;
the pre-work asks people to run the CLI once beforehand so the download is already cached.

### Option: `netlify login` and the browser OAuth flow

The documented happy path, and what an attendee will find if they search.

Rejected for the live session: a browser flow on a shared screen is slow, exposes account
UI, and can hang. Attendees may absolutely use it on their own machines afterwards -
`docs/SETUP.md` mentions it - but the presenter never does it on stage.

### Option: Netlify's Git integration - connect the repo, deploy on push, no CLI

Genuinely the best long-term setup, and what most of these sites should end up using.

Rejected as the *first* deploy because it hides the thing we are trying to teach. When
the deploy is a webhook, "ship" is something that happens invisibly somewhere else. Running
`npx netlify-cli deploy --build --prod` and watching a URL come back makes the last step of
the loop concrete. `docs/PRODUCTION-CHECKLIST.md` points at the Git integration as the
natural next move.

### Option: Deploy straight from CI only, never from a laptop

Cleaner, and closer to how a real team works.

Rejected because it puts a GitHub Actions queue between the attendee and their URL. At
minute 38, "it is queued" is not the same feeling as "here is your link." Both exist in
this repo - the CLI for the live moment, the workflow for every push after it.

### Option: Skip the CI gate, deploy on every push

One fewer file, faster feedback.

Rejected because it would make slide 14 false. The gate is not there for this site, which
is four components and cannot really break. It is there so that an attendee has seen what
a gate looks like in a repo small enough to read in full.

## Consequences

- **Good:** The deploy command is non-interactive and rehearsable. The presenter runs the
  exact same command on stage that they ran the day before.
- **Good:** `NETLIFY_AUTH_TOKEN` never touches the repo, and the model is explicitly denied
  read access to `.env` - a one-second, visible demonstration of secrets hygiene.
- **Good:** The security headers and the CI gate are real artifacts, so every Part Three
  claim can be backed by opening a file.
- **Bad:** One more dependency - `dotenv-cli`, eleven packages - purely to make one command
  work reliably. Worth it: the alternative is an error message that costs live minutes.
- **Bad:** A personal access token is long-lived and broadly scoped. It is the right
  trade-off for a workshop and the wrong one for a production pipeline; the honest version
  in `docs/PRODUCTION-CHECKLIST.md` says to rotate it afterwards.
- **Bad:** Attendees now depend on a third-party account. Free tiers change. If Netlify's
  free tier changes, this ADR is the first file to reopen.
- **Bad:** There is no monitoring, no alerting and no error tracking. That gap is named
  honestly in `docs/PRODUCTION-CHECKLIST.md` rather than papered over.
- **We will need to revisit this when:** an attendee wants a custom domain, preview deploys
  per pull request, or anything with a server - all of which point at the Git integration
  and, past that, at a different architecture entirely.
