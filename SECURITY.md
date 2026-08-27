# Security

This is a static site. There is no backend, no database and no login - by design, and
permanently (see [`docs/adr/ADR-002-scope.md`](docs/adr/ADR-002-scope.md)). That removes most
of what usually goes wrong, and it means the things that *can* go wrong here are worth naming
precisely.

## Reporting something

Open a [private security advisory](https://github.com/RewritingTheCode/workshop/security/advisories/new)
on this repository. Please do not open a public issue for anything exploitable.

If you forked this to make your own portfolio: the bug is in your fork, and this is your call
to make. Fix it there.

## What we care about, in order

**1. A leaked Netlify token.** `.env` is gitignored, absent from every commit reachable from
every ref, and in the Claude Code deny list so the assistant cannot read it even when asked.
`.env.example` is the file that is safe to put on a screen. `npm run deploy` loads the token for
the length of one command rather than exporting it into a shell that has history and scrollback.

**2. Supply chain.** The deploy job is the one place in this repo holding a credential, so it is
the place hardened hardest:

- `netlify-cli` is pinned to a major range, not `@latest`
- every third-party GitHub Action is pinned to an immutable commit SHA, version in the comment
- `actions/checkout` runs with `persist-credentials: false`
- CI installs with `npm ci --ignore-scripts`, so no dependency's lifecycle script runs in a job
  that has the token
- `npm audit` fails the build at moderate; `dependency-review-action` blocks the PR that
  introduces a vulnerable package
- Dependabot updates npm packages and Action SHAs weekly, so the pins stay current
- CodeQL (`security-extended`) runs on push, on PRs, and weekly on a schedule

**3. Content injection.** `src/content/profile.ts` is treated as untrusted input, because in a
template it is - people fill it from a resume, from an AI, from a friend's page. URLs are
validated against a scheme allowlist in `src/content/schema.ts`: links take `https:` and
`mailto:`, assets take a same-origin path, `https:` or `data:image/*`, and everything else -
`javascript:`, `data:text/html`, `vbscript:`, `file:`, protocol-relative `//host` - fails
`npm test` with the field name rather than shipping.

**4. The visitor's browser.** CSP (with `base-uri`, `frame-ancestors`, `form-action` and
`object-src` stated explicitly, since none of them inherit from `default-src`), HSTS,
`Permissions-Policy`, COOP, CORP, frame and MIME protections - all in `netlify.toml`, all
asserted in `tests/security.test.ts`.

**5. Doxxing the author.** `.gitignore` excludes dropped documents by pattern rather than by
filename, because a real resume carries a phone number and a home address. `tests/security.test.ts`
also refuses an SVG in `public/` that carries a script or an event handler - an SVG served from
your own origin is a document, not just a picture.

The reasoning behind all of it, including what was deliberately *not* done and why, is in
[`docs/adr/ADR-007-security-posture.md`](docs/adr/ADR-007-security-posture.md).

## Running the review yourself

    /security-audit

That is a prompt in [`.claude/commands/security-audit.md`](.claude/commands/security-audit.md).
It walks the same passes in the same order, and it is written to make the model prove its
findings by executing them rather than list plausible ones.

## If you forked this

Three things are yours now, and nobody else can do them for you:

- **Your own `.env` and your own Netlify token.** Never commit it, never paste it into a chat,
  `chmod 600` it, and rotate it if you ever screen-share a terminal that had it in the
  environment. The workshop token in particular is long-lived and broadly scoped - rotate it
  when you are done.
- **What you put in `profile.ts`.** The schema stops a hostile URL. It cannot stop you typing
  your home address into an intro paragraph.
- **Your headers, on the wire.** A header in a config file that never reaches the response is
  worth nothing. After your first deploy:

      curl -sI https://your-site.netlify.app | grep -i 'content-security\|strict-transport'
