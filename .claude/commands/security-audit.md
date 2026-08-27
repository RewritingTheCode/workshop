---
description: Full security pass - verify, validate and harden this repo against its real threat model
---

# Security audit: verify, validate, harden

You are doing an offensive-minded security review of this repository, then fixing what you
find. Work through every section. Do not skip a section because it "looks fine" - say what
you checked and what the result was.

## Rules that override your instincts

1. **Verify, do not pattern-match.** Every finding must be demonstrated, not asserted. If you
   claim a schema accepts a `javascript:` URL, run it and paste the output. If you claim a
   header is missing, `curl -I` the deployed site or read the config. A finding you could not
   reproduce is not a finding - drop it or label it clearly as unverified.
2. **No invented vulnerabilities.** A speculative "an attacker could theoretically..." with no
   path to impact is noise. Rank by *reachability first, severity second*.
3. **This is a static site with no backend, no database, no auth, and no user input.** That is
   a deliberate architectural decision (see `docs/adr/`). Do not propose adding a backend, a
   WAF, rate limiting, input sanitisation middleware, or auth. Findings that only apply to a
   server do not apply here. Say so and move on.
4. **Never add a dependency** to fix a finding without saying what it is, what it costs, and
   what the no-dependency alternative was.
5. **Never read, echo, print, or `cat` `.env`.** Not to check it, not to verify a fix. Prove
   things about it with `git check-ignore`, `ls -l`, and `git log` instead. This repo is
   demoed on a shared screen.
6. Follow the loop in `CLAUDE.md`. Anything you change gets an ADR in `docs/adr/` first and a
   test that would fail without the fix.

## Threat model - who actually attacks this

Rank findings against these, in order. If a finding does not serve one of them, it is a
nice-to-have and should be labelled as such.

- **T1 - Credential leak.** The Netlify token, in the repo, in git history, in the build
  output, in CI logs, on a shared screen. This is the one that costs real money and a real
  account takeover.
- **T2 - Supply chain.** A malicious or compromised npm package or GitHub Action running with
  the deploy token in its environment. The deploy step is the crown jewel: it has the token.
- **T3 - Content injection.** This is a *template*. Strangers fork it and paste content in from
  resumes, from LLM output, from a friend. Content is untrusted input to this codebase even
  though it lives in a `.ts` file.
- **T4 - The visitor's browser.** Clickjacking, MIME sniffing, referrer leakage, mixed content,
  reverse tabnabbing, and whatever a stray injected script would be able to reach.
- **T5 - Doxxing the author.** A real resume in the repo, a home address in a PDF's metadata,
  an email harvested from the built page. Low severity for a machine, high for a person.

## The passes

### 1. Secrets and git history
- Is `.env` ignored *and* absent from every commit reachable from every ref? Check history,
  not just the working tree.
- Scan all of history for token shapes: `nfp_`, `ghp_`, `github_pat_`, `AKIA`, `sk-`,
  `-----BEGIN * PRIVATE KEY`, long base64 blobs assigned to a suspicious name.
- Is any secret inlined into `dist/`? Vite inlines anything prefixed for client exposure -
  confirm nothing sensitive is prefixed that way.
- File modes on any local secret file. Are they readable by every user on the box?
- Does `.gitignore` cover personal documents by *pattern*, not just by the one exact filename
  someone used last time?

### 2. Supply chain and the deploy path
- `npm audit`. Report the true count; do not round it to zero.
- Is every third-party GitHub Action pinned, and to what - a mutable tag or an immutable
  commit SHA? State the trade-off honestly rather than pinning reflexively.
- Does `actions/checkout` persist credentials into `.git/config` for later steps to reach?
- Is any CLI invoked as `@latest` in a step that has a secret in its environment? Name the
  window of exposure that creates.
- Workflow `permissions:` - is the token scoped down at the top level, and does any job
  widen it?
- Can a pull request from a fork reach a job that holds a secret? Check the triggers.
- Is there anything keeping dependencies current after the workshop ends, or does this repo
  rot the day it is handed over?
- Are lockfile installs enforced (`npm ci`, not `npm install`) everywhere it matters?

### 3. Content as untrusted input
- Read the content schema. For every field that reaches the DOM as a URL, an `src`, or an
  attribute: **what does the validator actually accept?** Write a scratch script and feed it
  `javascript:`, `JaVaScRiPt:`, `data:text/html;base64,...`, `vbscript:`, `file:///`,
  a protocol-relative `//evil.tld`, and a plain relative path. Paste the real results.
- Do not stop at "the framework blocks that." Establish *whether* it does, in the installed
  version, and then decide whether the app should depend on that behaviour. A defence you got
  by accident is a defence that leaves the day you change frameworks.
- Any `dangerouslySetInnerHTML`, `innerHTML`, `eval`, `new Function`, `document.write`?
- Anything interpolated into `index.html` at build time - is it HTML-escaped, and is there a
  test proving it?
- Any `target="_blank"` without `rel="noopener"`?

### 4. Response headers
Read the headers config, then evaluate the CSP directive by directive. For each of
`default-src`, `script-src`, `style-src`, `img-src`, `connect-src`, `font-src`,
`object-src`, `base-uri`, `frame-ancestors`, `form-action`: is it present, does it fall back
to `default-src` if absent (several do **not**), and is the value as tight as this site can
actually tolerate?

- Justify every `unsafe-*` that stays, in the ADR, with the specific code that requires it.
- Check for `Strict-Transport-Security`, `X-Content-Type-Options`, `Referrer-Policy`,
  `Permissions-Policy`, `Cross-Origin-Opener-Policy`, and frame protection.
- If the site is live, `curl -sI` it and diff what is actually served against the config.
  Headers that exist in a file but not on the wire are worth nothing.

### 5. What ships to the public
- `git ls-files` and the contents of the publish directory: is anything in there that a
  stranger should not have? Personal documents, internal notes, presenter material, an
  unredacted resume.
- Check PDF and image metadata in the published assets for author names, GPS tags and paths.
- Does the repo tell a forker how to report a vulnerability?

## Output

Report as a table, worst first: **finding / threat (T1-T5) / evidence / fix**. Separate
"fixed now" from "recommended, needs a human decision". Then state plainly what you checked
and found clean - a security report with no clean list is a report you cannot calibrate.

Finish the loop: ADR, then fix, then a test per fix, then `npm run check`.
