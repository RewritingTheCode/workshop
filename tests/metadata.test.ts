import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { profile } from '../src/content/profile';
import {
  DESCRIPTION_TOKEN,
  TITLE_TOKEN,
  applyPageMetadata,
  pageDescription,
  pageTitle,
} from '../src/content/metadata';
import type { Profile } from '../src/content/schema';

/**
 * `index.html` is the one file in the project that TypeScript never sees, which
 * is exactly why a name got hardcoded into its `<title>` and stayed there. These
 * tests are the guard: the tokens have to still be in the file, the file must
 * not contain the name, and substituting them has to produce the real thing.
 */
const indexHtml = readFileSync(join(process.cwd(), 'index.html'), 'utf8');

const fixture: Profile = {
  name: 'Ada & "Annabella" Lovelace <the first>',
  headline: 'Mathematician. I write about engines.',
  intro: 'Notes on a machine that does not exist yet.',
  avatar: '/avatar-placeholder.svg',
  sections: ['timeline'],
  links: [],
  timeline: [
    {
      id: 'analytical-engine',
      kind: 'project',
      title: 'Analytical Engine',
      startDate: '1843-01',
      endDate: null,
      summary: 'Note G.',
      highlights: [],
      tags: [],
      links: [],
    },
  ],
};

describe('page metadata', () => {
  it('derives the title from the profile name', () => {
    expect(pageTitle(fixture)).toBe(`${fixture.name} - Portfolio`);
  });

  it('uses the headline as the description', () => {
    expect(pageDescription(fixture)).toBe(fixture.headline);
  });

  it('escapes content on its way into markup', () => {
    const filled = applyPageMetadata(`<title>${TITLE_TOKEN}</title>`, fixture);

    expect(filled).toBe(
      '<title>Ada &amp; &quot;Annabella&quot; Lovelace &lt;the first&gt; - Portfolio</title>',
    );
    expect(filled).not.toContain('<the first>');
  });

  it('leaves no token behind in the real index.html', () => {
    const filled = applyPageMetadata(indexHtml, profile);

    expect(filled).toContain(`<title>${pageTitle(profile)}</title>`);
    expect(filled).toContain(`content="${pageDescription(profile)}"`);
    expect(filled).not.toContain(TITLE_TOKEN);
    expect(filled).not.toContain(DESCRIPTION_TOKEN);
  });

  it('keeps index.html free of the name, so profile.ts stays the only source', () => {
    expect(indexHtml).toContain(`<title>${TITLE_TOKEN}</title>`);
    expect(indexHtml).toContain(`content="${DESCRIPTION_TOKEN}"`);
    expect(indexHtml).not.toContain(profile.name);
  });
});
