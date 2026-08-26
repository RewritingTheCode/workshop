/**
 * Runs before `npm install`, via the `preinstall` script.
 *
 * Vite and ESLint need Node 20.19+ or 22.12+. Without this check, an attendee on
 * an older Node installs everything successfully and then hits an unrelated-looking
 * crash a minute later. Failing here, with a sentence they can act on, is worth the
 * eight lines.
 */
const [major, minor] = process.versions.node.split('.').map(Number);

const supported =
  (major === 20 && minor >= 19) || (major === 22 && minor >= 12) || major === 23 || major >= 24;

if (!supported) {
  console.error(`
  Node ${process.versions.node} will not work with this project.
  You need Node 20.19 or newer, or 22.12 or newer.

  Install the current LTS from https://nodejs.org, close and reopen your
  terminal, then run npm install again.
`);
  process.exit(1);
}
