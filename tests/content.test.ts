import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { profile } from '../src/content/profile';
import { SECTION_IDS, profileSchema } from '../src/content/schema';

/**
 * The contract test.
 *
 * When you point Claude Code at your resume and it rewrites `profile.ts`, this
 * is what tells you whether it got the shape right - and if it did not, which
 * field it got wrong. That is the whole reason the content lives in one typed
 * file instead of being scattered through the components.
 */
describe('profile content', () => {
  it('satisfies the schema', () => {
    const result = profileSchema.safeParse(profile);

    if (!result.success) {
      const problems = result.error.issues
        .map((issue) => `  ${issue.path.join('.') || '(root)'}: ${issue.message}`)
        .join('\n');
      throw new Error(`src/content/profile.ts does not match the schema:\n${problems}`);
    }

    expect(result.success).toBe(true);
  });

  /*
   * There is deliberately no test here requiring both a `work` entry and a
   * `project` entry. Plenty of real resumes are one or the other, and a test
   * that can only be satisfied by inventing a job is worse than no test at all.
   * See the 2026-08-27 amendment in docs/adr/ADR-003-content-model.md. The
   * behaviour that made reachable - filtering to a kind you have none of - is
   * covered in tests/timeline.test.tsx.
   */

  it('rejects a sections list that repeats a section, because ids are anchors', () => {
    const result = profileSchema.safeParse({ ...profile, sections: ['timeline', 'timeline'] });
    expect(result.success).toBe(false);
  });

  it('rejects a section id that nothing knows how to render', () => {
    const result = profileSchema.safeParse({ ...profile, sections: ['about-me'] });
    expect(result.success).toBe(false);
  });

  it('names only sections that exist', () => {
    for (const id of profile.sections) {
      expect(SECTION_IDS, `profile.sections names "${id}", which is not a section`).toContain(id);
    }
  });

  it('gives every entry a unique id, because ids are React keys and anchors', () => {
    const ids = profile.timeline.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every image real alt text', () => {
    for (const entry of profile.timeline) {
      if (!entry.image) continue;
      expect(entry.image.alt.trim().length, `${entry.id} has an image with empty alt text`).
        toBeGreaterThan(0);
      expect(
        entry.image.src.startsWith('/'),
        `${entry.id} image src should be a root-relative path, got "${entry.image.src}"`,
      ).toBe(true);
    }
  });

  it('points every image at a file that actually exists', () => {
    for (const entry of profile.timeline) {
      if (!entry.image) continue;
      const onDisk = join(process.cwd(), 'public', entry.image.src);
      expect(existsSync(onDisk), `${entry.id} points at ${entry.image.src}, which is not in public/`).toBe(
        true,
      );
    }
  });

  it('never ends an entry before it starts', () => {
    for (const entry of profile.timeline) {
      if (entry.endDate === null) continue;
      expect(
        entry.endDate >= entry.startDate,
        `${entry.id} ends (${entry.endDate}) before it starts (${entry.startDate})`,
      ).toBe(true);
    }
  });
});
