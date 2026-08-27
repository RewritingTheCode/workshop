# Production Checklist

Nobody leaves a 90-minute workshop production-ready. That is not the goal. **Knowing the list
is the goal**, because the gap between "it works on my laptop" and "other people depend on it"
is where most software gets into trouble.

Every row below points at something real - a file you can open in this repo, or an honest
admission that it is not here.

---

## What this repo actually has

### Documentation as you go

**Where:** [`docs/adr/`](adr/)

Six Architecture Decision Records, each written before the code it describes, each with a real
rejected-options section. The rejected options are the valuable part: they are the answer to
"why didn't you just use X?" from a version of you that still remembered.

A decision that is not written down gets relitigated every six months by people who were not
there. That is not a documentation problem, it is a throughput problem.

### Tests in the pipeline

**Where:** [`.github/workflows/ci.yml`](../.github/workflows/ci.yml),
[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml)

CI runs lint, typecheck, tests and build on every push and every pull request. The deploy
workflow declares `needs: [ci]`, so the deploy job cannot start until all four have passed.

That is the difference between a promise and a gate. A promise is a line in a README. A gate is
a job that will not run.

Locally, `npm run check` runs the same four steps in the same order, so green on your laptop is
a real prediction about green in CI.

**One honest caveat, because you will notice it.** On a fresh clone the *deploy* job does not
run at all - it shows up greyed out in the Actions tab. That is not the gate failing. The
workflow checks whether `NETLIFY_AUTH_TOKEN` and `NETLIFY_SITE_ID` exist as repository secrets
and skips the deploy when they do not, so that a clone with no Netlify account attached does not
show a red X on every push. It writes the reason into the run summary rather than leaving you to
guess. Until you add them, `npm run deploy` from your machine is how the site ships.

To turn on push-to-deploy, add the two values you already have in `.env` under
**Settings → Secrets and variables → Actions → New repository secret**, or from a terminal:

```bash
gh secret set NETLIFY_AUTH_TOKEN
gh secret set NETLIFY_SITE_ID
```

Both prompt for the value rather than taking it as an argument, which keeps the token out of
your shell history. After that, every push to `main` that passes CI deploys itself, and the
gate stops being a thing you take our word for.

### Security, inside-out

**Where:** the `npm audit --audit-level=high` step in
[`ci.yml`](../.github/workflows/ci.yml); the `deny` block in
[`.claude/settings.json`](../.claude/settings.json)

Two different things, both worth naming:

- **Your dependencies are your attack surface.** `npm audit` fails the build on a known
  high-severity advisory in anything you depend on, including things you did not choose and
  have never heard of. When it goes red, the fix is to update the dependency - that is the
  lesson, not an inconvenience.
- **Your tooling is your attack surface too.** `.claude/settings.json` puts `Read(./.env)` in
  the model's deny list, so Claude Code cannot read your Netlify token even if you ask it to.
  `Bash(git push:*)` is denied for the same reason: pushing should be a deliberate act, not
  something that happens while you are talking.

### Security, outside-in

**Where:** [`netlify.toml`](../netlify.toml)

Worth knowing that this one has teeth. The policy below blocks *any* script the page did not ask
for - including one the host itself injects. Deploy this site with the Netlify badge left on and
the browser console shows the policy refusing to run Netlify's own inline script. That is not a
bug to work around by loosening the policy; it is the policy doing precisely the job it is there
for.

Four response headers, applied to every path:

| Header | What it stops |
| --- | --- |
| `Content-Security-Policy` | A script from somewhere else running on your page |
| `X-Frame-Options: DENY` | Someone framing your site to trick people into clicking things |
| `X-Content-Type-Options: nosniff` | A browser guessing that your text file is really JavaScript |
| `Referrer-Policy: strict-origin-when-cross-origin` | Leaking your full URLs to every site you link to |

Four lines of config. Worth checking on every project you ever deploy, and almost never there
by default.

### Accessibility

**Where:** [`tests/a11y.test.tsx`](../tests/a11y.test.tsx)

`axe` runs against the fully rendered page and against the page after the filter has been used,
and both must return zero violations. There are also explicit assertions for one `<h1>`, no
skipped heading levels, and real landmarks.

Automated checks catch maybe a third of real accessibility problems. They catch the third that
ships by accident - missing labels, broken heading order, controls that are not controls - and
they catch it before a person has to. The other two thirds still need a keyboard and a screen
reader.

### Dependency and version pinning

**Where:** [`package-lock.json`](../package-lock.json), [`.nvmrc`](../.nvmrc)

The lockfile is committed and CI uses `npm ci`, not `npm install`, so every build resolves the
exact same tree. `.nvmrc` pins Node 20, and both the CI workflow and `netlify.toml` read from
it rather than hardcoding a version in three places.

---

## What this repo does not have, and you should know it

These three rows are the most valuable ones on the page. A checklist with everything ticked
teaches you nothing.

### Monitoring and alerting - **not in this repo**

There is nothing here that tells you the site is down, slow, or throwing errors in someone
else's browser. If this site broke at 3am you would find out when somebody mentioned it.

For a static portfolio, that is a defensible place to stop. For anything people depend on, it
is not. The next steps, roughly in order of effort:

- **Netlify Analytics** - server-side traffic, no client script, no cookie banner needed
- **Sentry** - client-side error tracking; you find out about the broken browser you do not own
- **An uptime check** - Better Stack, Pingdom, or a cron job that curls the URL and shouts

The general rule: **you cannot fix what you cannot see, and users do not file bug reports.**

### Auth and secrets management - **not in this repo**

There is no authentication here, and that is a design decision, not an oversight. See
[ADR-002](adr/ADR-002-scope.md). No login means no session handling, no password storage, no
account recovery flow, no personal data to lose. **Choosing not to build auth is a security
decision, and usually a good one.**

Secrets are handled at the minimum viable standard: `.env` is gitignored, `.env.example` is
committed with names and no values, CI reads the token from GitHub Actions secrets rather than
from anything in the repo, and the model is denied read access to `.env`.

That last one is worth checking rather than believing. `Read(./.env)` sits in the `deny` block
of `.claude/settings.json`, and deny rules hold even in `--dangerously-skip-permissions`, which
is the mode most people run in. Ask Claude Code to print your `.env` and watch it be refused.
A security control you have personally watched work is worth more than one you were told about.

What a real system would add:

- A secrets manager rather than a `.env` file - AWS Secrets Manager, Doppler, 1Password
- Short-lived scoped credentials instead of a long-lived personal access token
- Rotation on a schedule, and rotation on staff changes
- An audit trail of who read what

One thing this repo gets right that is easy to get wrong: the token is never exported by hand
into a shell. `npm run deploy` reads `.env` for the length of that one command and nothing else.
A credential typed into a terminal lives in your shell history, and in the scrollback of
anything you were screen-sharing at the time.

**Rotate the Netlify token you made for this workshop when you are done with it.** It is
long-lived and broadly scoped, which was the right trade for a live demo and is the wrong one
forever.

### Capacity and performance - **not in this repo**

There is no load test, no performance budget, no caching strategy beyond what Netlify's CDN
does by default.

For this system, that is the right answer, and being able to say why is the point: **a static
site on a CDN has essentially no capacity problem at this scale.** There is no server to
saturate, no database to lock, no connection pool to exhaust. Files are copied to edge nodes
and served. That is not luck - it is the consequence of the architecture chosen in ADR-002 and
ADR-004.

Capacity becomes a real question the moment you add the first backend. If you ever put a
database behind this, this row stops being free and you need to reopen it.

---

## The short version

| Item | Status | Where |
| --- | --- | --- |
| Documentation as you go | Done | `docs/adr/` |
| Tests in the pipeline | Done | `ci.yml`, gated `deploy.yml` (deploy needs two Actions secrets) |
| Security, inside-out | Done | `npm audit` in CI, `.env` denied to the model |
| Security, outside-in | Done | CSP and headers in `netlify.toml` |
| Accessibility | Done | `tests/a11y.test.tsx` |
| Version pinning | Done | `package-lock.json`, `.nvmrc` |
| Monitoring and alerting | **Not here** | Netlify Analytics, Sentry, an uptime check |
| Auth and secrets management | **Not here** | No auth by design; rotate your token |
| Capacity and performance | **Not here** | Static on a CDN; revisit when you add a backend |

Three of nine are open. That is an honest score for 90 minutes of work, and an honest score is
worth more than a tidy one.
