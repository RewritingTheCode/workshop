/**
 * Runs before `npm install`, via the `preinstall` script.
 *
 * Two jobs. The first is the original one: without this check, an attendee on an
 * older Node installs everything successfully and then hits an unrelated-looking
 * crash a minute later. Failing here, with a sentence they can act on, is worth
 * the eight lines.
 *
 * The second is newer. Node 20 reached end of life on 2026-04-30 and this repo
 * was still pinned to it, which meant building on a runtime that no longer gets
 * security releases - and nothing in the toolchain says so, because the runtime
 * is not a dependency. The floor here is a supported-versions floor, not just a
 * works-with-Vite floor. See docs/adr/ADR-008-node-runtime-support.md.
 */
const [major, minor] = process.versions.node.split('.').map(Number);

// Node 22 is supported until 2027-04-30, Node 24 until 2028-04-30. Anything
// newer is fine too - this is a floor, not a list.
const supported = (major === 22 && minor >= 13) || major >= 24;

if (!supported) {
  console.error(`
  Node ${process.versions.node} will not work with this project.
  You need Node 24 (the current LTS), or Node 22.13 or newer.

  Node 20 reached end of life on 30 April 2026 and no longer receives security
  updates, so this project does not build on it.

  Install the current LTS from https://nodejs.org, close and reopen your
  terminal, then run npm install again.
`);
  process.exit(1);
}
