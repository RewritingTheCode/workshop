# ADR-008: Build on a Node version that still gets security patches

- **Status:** Accepted
- **Date:** 2026-08-27
- **Deciders:** Kara Prado

## Context

The security pass in ADR-007 audited the dependencies thoroughly and never looked at the thing
running them. **Node 20 reached end of life on 2026-04-30.** This repo pinned it in five places
and has been building, testing and deploying on an unsupported runtime for four months.

That is not a theoretical problem. End of life means no more security releases: a
vulnerability found in Node 20 today gets fixed in 22, 24 and 26, and never in 20. `npm audit`
does not report it, because it is not a dependency. Dependabot does not report it, because it
is not in the manifest. The only thing that would have caught it is somebody checking the
runtime's support date, and nothing in the audit told anybody to.

It surfaced sideways. Dependabot - added an hour earlier by ADR-007 - proposed jsdom 30, whose
`engines` field is `^22.22.2 || ^24.15.0 || >=26.0.0`. CI went red, and the reason it went red
was that the project's floor was a version the ecosystem had already moved off. The dependency
update was not the problem; it was the messenger.

Verified against `nodejs/Release`, not from memory:

| Line | Maintenance ends |
| --- | --- |
| Node 20 | 2026-04-30 - **gone** |
| Node 22 | 2027-04-30 |
| Node 24 | 2028-04-30 |
| Node 26 | 2029-04-30 |

## Decision

**The build targets Node 24**, and the supported floor becomes `^22.13.0 || >=24.0.0`.

`.nvmrc`, `netlify.toml`, the devcontainer image, `package.json` engines,
`scripts/check-node.mjs` and the docs all move together - the point of having the version in
`.nvmrc` and reading it from there is defeated if half the places carry their own copy.

Node 24 for the pinned build because it is Active LTS with the longest runway of anything
shipping today, and this is a template: the fork that matters is the one nobody opens again
after the workshop. Node 22 stays inside the *supported* range because it is a real LTS until
April 2027 and there is no reason to refuse somebody who has it installed.

**The audit prompt gains a runtime and platform lifecycle pass**, because the gap that let this
through was the prompt's and not the reviewer's. It now asks, in as many words: what runs this
code, when does that version stop getting security patches, and is that date in the past. It
asks the same of the CI runner image, the Netlify build image, and the base image in
`.devcontainer/`.

**Two Dependabot updates are held**, each with the condition for releasing it written next to it:

- **jsdom majors.** jsdom 30 wants `^22.22.2 || ^24.15.0`, tighter than the floor above. Not a
  security update, and the alternative - moving the floor to the newest patch of two lines -
  would refuse an install on any Node that is merely a few weeks stale, including the one in
  the workshop container today. Release it when the floor next moves.
- **TypeScript majors.** TypeScript 7 is out; `typescript-eslint@8.68.0`, the newest there is,
  still declares `typescript: >=4.8.4 <6.1.0`. There is no resolution, which is why Dependabot's
  own run errored rather than opening a PR. Release it when typescript-eslint ships TS 7 support.

## Options we rejected

### Option: Stay on Node 20 and ignore jsdom 30

The smallest possible change, and it was briefly tempting because CI was green before Dependabot
said anything. It amounts to muting the messenger and keeping the unpatched runtime, on a repo
whose whole claim is that the security work here is real. Also self-defeating: the ecosystem
will keep dropping Node 20, so this trade gets re-offered every few weeks and gets worse each
time.

### Option: Node 22

Supported until April 2027, and the smaller jump. Rejected as the *pinned* target because eight
months of runway on a repo that gets handed to a stranger and abandoned is not much - the whole
failure mode this ADR exists to fix is nobody looking again. It stays in the supported range,
which costs nothing and helps anyone who already has it.

### Option: Node 26

The longest runway of all, and wrong for this. It is not LTS yet, the Netlify build image and
the devcontainer base track LTS, and asking sixty workshop attendees to install a current-line
Node is a support burden with no security benefit over 24.

### Option: Raise the floor to `^22.22.2 || >=24.15.0` and take jsdom 30

Coherent, and it makes the held update unnecessary. Rejected because a floor written to the
newest patch releases breaks `npm install` for anybody a few weeks behind - including the
workshop's own devcontainer, which is on 24.14.0 today. A version floor should be the oldest
thing that works, not the newest thing available. jsdom 29 works.

### Option: Automate the EOL check in CI

A step that fails the build when the pinned Node passes its end-of-life date would have caught
this without anybody thinking about it. Genuinely appealing and deliberately not done now: it
means a network call to a schedule endpoint in every CI run, a new failure mode when that
endpoint is down, and a build that breaks on a date rather than on a commit - which is a nasty
surprise for a fork whose owner has moved on. The audit prompt asking the question is the
cheaper half of the benefit. Revisit if this is missed a second time.

## Consequences

- **Good:** The runtime gets security patches again, with the longest LTS runway available.
- **Good:** The version lives in one decision instead of five copies that drifted.
- **Good:** The audit prompt now covers runtimes and base images, so the next pass asks about
  the thing this pass forgot. That is worth more than this one fix.
- **Bad:** An attendee on Node 20 is now refused at `preinstall` rather than warned. That is the
  correct behaviour and it is still a person who cannot start until they install something.
- **Bad:** Two held Dependabot updates are two things somebody has to remember to unhold. The
  conditions are written down, which is the most this can do.
- **We will need to revisit this when:** Node 24 approaches April 2028; or sooner, when
  typescript-eslint supports TypeScript 7 and the TS hold can come off.
