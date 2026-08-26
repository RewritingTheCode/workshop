import { describe, expect, it } from 'vitest';
import { profile } from '../src/content/profile';
import { profileSchema } from '../src/content/schema';

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

  it('has at least one timeline entry of each kind', () => {
    const kinds = new Set(profile.timeline.map((entry) => entry.kind));
    expect(kinds.has('work')).toBe(true);
    expect(kinds.has('project')).toBe(true);
  });

  it('gives every entry a unique id, because ids are React keys and anchors', () => {
    const ids = profile.timeline.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
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
