import { describe, expect, it } from 'vitest';
import { linkSchema, profileSchema } from '../src/content/schema';

/**
 * The security properties, made into failures.
 *
 * Everything here was true before it was tested - the point is that it stays
 * true. A URL scheme allowlist that nobody asserts gets loosened by the next
 * person who hits it and does not understand why it is there, and a header
 * block in a config file is exactly the kind of thing that gets rewritten
 * wholesale with two directives quietly dropped.
 *
 * See docs/adr/ADR-007-security-posture.md.
 */

/** The schemes that would ship an attack in an href if we let them through. */
const HOSTILE_URLS = [
  'javascript:alert(document.cookie)',
  // Case is not a defence. `z.url()` and the URL parser both lowercase.
  'JaVaScRiPt:alert(1)',
  'data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==',
  'vbscript:msgbox(1)',
  'file:///etc/passwd',
  // No scheme of its own: it borrows the page's and points at another host.
  '//evil.example/login',
];

describe('content URLs', () => {
  it.each(HOSTILE_URLS)('rejects %s as a link href', (href) => {
    const result = linkSchema.safeParse({ label: 'Click me', href });

    expect(
      result.success,
      `${href} was accepted as a link href - it would ship to a public page`,
    ).toBe(false);
  });

  it.each([
    'https://github.com/janedoe',
    'https://www.linkedin.com/in/janedoe',
    'mailto:jane.doe@example.com',
    // A path on this own site. There is no scheme to hijack.
    '/resume.pdf',
  ])('accepts %s as a link href', (href) => {
    const result = linkSchema.safeParse({ label: 'Fine', href });

    expect(result.success, `${href} was rejected, and it should not be`).toBe(true);
  });

  /*
   * `resumeUrl` and `avatar` were plain strings with no validation at all,
   * which made them the softest of the three. They land in an `href` and an
   * `src` like everything else.
   */
  it.each(HOSTILE_URLS)('rejects %s as a resumeUrl', (resumeUrl) => {
    const result = profileSchema.safeParse({ ...validProfile(), resumeUrl });

    expect(result.success, `${resumeUrl} was accepted as a resumeUrl`).toBe(false);
  });

  it.each(HOSTILE_URLS)('rejects %s as an avatar', (avatar) => {
    const result = profileSchema.safeParse({ ...validProfile(), avatar });

    expect(result.success, `${avatar} was accepted as an avatar`).toBe(false);
  });

  it('names the offending field when it rejects one', () => {
    const result = profileSchema.safeParse({
      ...validProfile(),
      resumeUrl: 'javascript:alert(1)',
    });

    expect(result.success).toBe(false);
    if (result.success) return;
    // The person hitting this is a stranger who forked the template. The error
    // has to point at the field, not just say "invalid".
    expect(result.error.issues[0]?.path).toEqual(['resumeUrl']);
  });
});

/**
 * A minimal profile that satisfies the schema, so a test about one field is not
 * silently passing because a different field was wrong.
 */
function validProfile() {
  return {
    name: 'Jane Doe',
    headline: 'Computer science student.',
    intro: 'Two or three sentences about me.',
    timeline: [
      {
        id: 'trailhead',
        kind: 'project',
        title: 'Trailhead',
        startDate: '2024-06',
        endDate: null,
        summary: 'A thing I built.',
      },
    ],
  };
}
