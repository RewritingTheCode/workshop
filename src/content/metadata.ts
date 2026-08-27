/**
 * The page's `<title>` and meta description, derived from the profile.
 *
 * These two strings are the last place a name used to be hardcoded. `index.html`
 * is not a component, so the "never a second source of truth" rule in
 * `CLAUDE.md` was easy to read as not applying to it - and the result was a
 * browser tab that still said "Jane Doe" long after the rest of the site was
 * yours.
 *
 * This module is build-time only: `vite.config.ts` imports it and substitutes
 * the tokens in `index.html` while serving and while building. It is never
 * imported by anything under `src/components/`, so none of it reaches the
 * browser bundle. It lives beside the schema because it is derived from the
 * content contract, and it should move when that moves.
 */
import type { Profile } from './schema.ts';

/** The tokens `index.html` carries in place of the real values. */
export const TITLE_TOKEN = '__PAGE_TITLE__';
export const DESCRIPTION_TOKEN = '__PAGE_DESCRIPTION__';

/** Browser tab, bookmark, search result heading. */
export function pageTitle(profile: Profile): string {
  return `${profile.name} - Portfolio`;
}

/**
 * The grey line under the link in a search result, and the preview when someone
 * pastes the URL into a chat. The headline is already the one sentence about
 * yourself that you chose, so it is the honest thing to put here.
 */
export function pageDescription(profile: Profile): string {
  return profile.headline;
}

/**
 * Escaped because both values are content someone typed. A name with an
 * ampersand in it, or a headline with a quotation mark, would otherwise end up
 * as broken markup in the one file we cannot typecheck.
 */
function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Substitutes both tokens. Used by the Vite plugin in `vite.config.ts`. */
export function applyPageMetadata(html: string, profile: Profile): string {
  return html
    .replaceAll(TITLE_TOKEN, escapeHtml(pageTitle(profile)))
    .replaceAll(DESCRIPTION_TOKEN, escapeHtml(pageDescription(profile)));
}
