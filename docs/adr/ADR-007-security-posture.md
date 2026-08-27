# ADR-007: Treat profile content as untrusted input, and pin the deploy path

- **Status:** Accepted
- **Date:** 2026-08-27
- **Deciders:** Kara Prado

## Context

This repo is going public as a template (ADR-005). That changes who the attacker is.

While it was one person's portfolio, "content" and "author" were the same trusted thing, and
the only real security question was whether the Netlify token stayed out of git. As a template
it gets forked by people who will fill `profile.ts` by pointing an AI at a resume, or by
pasting from a friend's page, or from a job board. Content arrives from somewhere other than
the person who reviews it. It happens to live in a `.ts` file, which makes it *look* like
code the author wrote. It is input.

A full audit - the passes are written down in `.claude/commands/security-audit.md` so the next
one is the same review and not a different one - found the codebase in good shape on
everything it had decided deliberately. The token is gitignored, denied to the model, and
absent from every commit reachable from every ref. No token shape appears anywhere in history.
Nothing sensitive is inlined into `dist/`; no variable is prefixed for client exposure. There
is no `dangerouslySetInnerHTML`, `innerHTML`, `eval` or `document.write` in the tree. The
`index.html` substitution was already HTML-escaped and already tested. Workflow permissions
were already `contents: read`, and `npm audit` was already a gate.

What the audit found was the seams - the places nobody had decided anything, so the default
held:

- **`z.url()` accepts any scheme a URL parser accepts.** Verified by running it, not assumed:
  `javascript:alert(1)`, `JaVaScRiPt:`, `data:text/html;base64,...`, `vbscript:` and
  `file:///etc/passwd` all pass `linkSchema`. `resumeUrl` was worse - `z.string()`, no
  validation at all, rendered straight into an `href`. So were `avatar` and `image.src`.
- **React 19 was the only thing stopping that.** `react-dom@19.2.8` rewrites a `javascript:`
  href into a thrown error, so it was not live-exploitable. That is a defence we got by
  accident. It covers exactly one scheme, it is in no test of ours, and it leaves with the
  framework.
- **The deploy step holds the token and ran `npx netlify-cli@latest`**, so whatever the
  registry served at that second executed with `NETLIFY_AUTH_TOKEN` in its environment. The
  same job installed dependencies with lifecycle scripts enabled, and `actions/checkout` left
  a git credential behind for every later step.
- **Four CSP directives that do not inherit from `default-src` were simply unset**, which is
  not the same as restricted.
- **Nothing kept any of it current** after the repo was handed to somebody else.

## Decision

**Content URLs are validated against a scheme allowlist in the schema**, not left to the
renderer. `src/content/schema.ts` gains one `safeUrl` helper. Links accept `https:` and
`mailto:`; assets accept a same-origin path, `https:`, or a `data:image/*` URI; the resume
accepts a same-origin path or `https:`. Protocol-relative `//host` is rejected everywhere -
it has no scheme of its own and points at somebody else's host. Everything else fails at the
contract with an error naming the field, so a forker who pastes a `javascript:` URL finds out
from `npm test` rather than from a stranger.

**Response headers state every directive that matters explicitly**, including the four that do
not fall back to `default-src`, plus HSTS, `Permissions-Policy`, COOP and CORP.

**The path that touches the token is pinned and de-privileged.** `netlify-cli` moves from
`@latest` to a major range. Third-party actions are pinned to immutable commit SHAs with the
version in a trailing comment. `actions/checkout` stops persisting credentials. CI installs
with `npm ci --ignore-scripts`.

**Something keeps it current.** Dependabot watches npm and Actions weekly and updates SHA pins
and their comments together. CodeQL runs on push, on PRs, and on a weekly schedule, so a query
written six months from now still runs against a fork nobody has touched since the workshop.
`actions/dependency-review-action` blocks the PR that introduces a vulnerable package, rather
than waiting for `npm audit` to notice it after the merge.

**All of it is tested.** `tests/security.test.ts` asserts the scheme allowlist field by field,
asserts each header and CSP directive is present in `netlify.toml`, and asserts no SVG in
`public/` carries a script, an event handler or a remote reference.

## Options we rejected

### Option: Sanitise in the components instead of the schema

Wrap every `href` in a `safeHref()` at the point of render. It would work, but it puts the
security property in six places instead of one, and every new component is a chance to forget.
The schema is already the single contract for content, and `npm test` already runs it. Put the
rule where the contract is.

### Option: Rely on React's `javascript:` blocking

It is real, it is in the installed version, and we verified it. We are still not relying on it.
It covers exactly one scheme - `data:text/html` renders untouched - it is documented as
behaviour React reserves the right to change, and it produces a broken link with a cryptic
console error rather than a test failure that names the field. Depending on it also means the
schema silently accepts garbage, which is the thing this repo exists to prevent.

### Option: Tag-pin the GitHub Actions and move on

This was the original call, on the grounds that a wall of 40-character hashes is a real
comprehension cost in a repo attendees are told to read. It was wrong, and it is worth saying
why the answer changed rather than quietly changing it. The cost of a SHA pin is paid once, by
a reader who sees `# v7.0.1` on the same line and understands it instantly. The cost of a tag
pin is paid on the day somebody's maintainer account is phished, in the job that holds our
deploy token. And the comprehension argument assumed the pins would rot - with Dependabot
updating the hash and the comment together, they do not. Pin the SHA.

### Option: Tighten `img-src` from `'self' data: https:` to `'self' data:`

Strictly better containment: with `https:` allowed, an injected script has an exfiltration
channel through an image URL. Rejected because it breaks the first forker who points
`image.src` at a screenshot hosted anywhere else, and it only matters *after* script execution,
which `script-src 'self'` with no inline script and no `eval` already makes very hard. Revisit
if inline script ever becomes necessary.

### Option: Drop `style-src 'unsafe-inline'`

Cannot. `Hero.tsx` and `EntryCover.tsx` set `style={{...}}`, which is an inline style attribute,
and Tailwind v4's generated custom properties need it too. Removing the directive removes the
gradients. Written down here so nobody spends an afternoon on it twice.

### Option: `--ignore-scripts` locally as well as in CI

Tempting for symmetry, and rejected. This repo's own `preinstall` runs `scripts/check-node.mjs`,
which is the thing that tells an attendee on Node 18 why nothing works - by far the most likely
failure in the first ten minutes of a workshop. In CI the node version comes from `.nvmrc` via
`setup-node`, so the guard is redundant there and the flag costs nothing. Verified before
adopting it: the only dependency in the tree declaring an install script is `fsevents`
(macOS-only, optional), and the build is unchanged without it.

### Option: Ship a `.well-known/security.txt`

RFC 9116, and the right thing for a site that is only ever one organisation's. Rejected for a
template: `public/` is copied wholesale by every fork, so every attendee's portfolio would tell
the internet to report vulnerabilities to RTC. `SECURITY.md` lives in the repo, where a fork
inherits the *structure* and can put its own contact in it, and does not get served as a claim
about a stranger's site.

### Option: OpenSSF Scorecard

A good scoreboard, and mostly a scoreboard for the controls this ADR already adopts. The badge
would not change a decision here. Left out to keep the Actions tab legible for people whose
first ever CI run is in this repo.

## Consequences

- **Good:** A pasted `javascript:` or `data:text/html` URL fails `npm test` with the field name,
  on the forker's machine, before it is ever public.
- **Good:** The security properties are now tested. The CSP cannot be quietly deleted, the
  schema cannot regress, and a hostile SVG cannot be dropped into `public/`, without something
  going red.
- **Good:** The window where a compromised `netlify-cli` release meets our token shrinks from
  "whatever npm serves right now" to "a major version we chose", and no dependency lifecycle
  script runs in that job at all.
- **Good:** The repo now degrades slowly instead of quickly. A fork that nobody touches still
  gets a weekly CodeQL run and weekly Dependabot PRs.
- **Bad:** A forker who genuinely wants an `http:` link, or a scheme we did not think of, hits a
  test failure and has to edit the schema. That is the intended trade, but it is a papercut.
- **Bad:** More config surface, and Dependabot will open PRs on a repo whose owner has moved on.
  A stale fork with three open Dependabot PRs looks worse than one with none, and is safer.
- **Bad:** `security-extended` CodeQL queries on a repo this small will mostly find nothing.
  That is the correct outcome and it still costs a minute per run.
- **We will need to revisit this when:** the site needs an external script (analytics is the
  usual one), which means revisiting `script-src` and probably a nonce - do not reach for
  `'unsafe-inline'`; or when React's URL handling changes, which the schema now makes a
  non-event.

## Not fixed here

Two controls live in GitHub's repository settings rather than in a file, so no commit can turn
them on. Both are free on a public repo and both belong on:

- **Secret scanning**, and **push protection** in particular. It is the control that would catch
  the one mistake this whole ADR is arranged around - a token pasted into a commit - at the
  moment of `git push`, which is the last point where it is still cheap. Attempting it from here
  returns `403 Resource not accessible by integration`: the workshop container's token has no
  admin scope, correctly. **Settings → Code security → Secret scanning, and push protection.**
- **Require the CI check on `main`.** `deploy.yml` gates the deploy on CI, which is the promise
  in the workshop slides and is real. It does not stop a direct push to `main` from landing
  unreviewed - only a branch protection rule does that.

And one on the machine: `.env` in the workshop container is mode `0666`, readable by every user
on the box. The fix is `chmod 600 .env`, and it is deliberately not automated - the tooling in
this repo is barred from touching that file at all, which is the more valuable property of the
two. It belongs on the setup checklist instead, and it is on it.
