import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
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

describe('response headers', () => {
  const netlifyToml = readFileSync(join(process.cwd(), 'netlify.toml'), 'utf8');

  /*
   * These four do NOT fall back to `default-src`. Leaving one out leaves it
   * unset, not restricted, which is the trap this test exists to catch.
   */
  it.each(['base-uri', 'frame-ancestors', 'form-action', 'object-src'])(
    'sets %s explicitly, because it does not inherit from default-src',
    (directive) => {
      expect(netlifyToml).toContain(`${directive} 'none'`);
    },
  );

  it.each([
    "default-src 'self'",
    "script-src 'self'",
    "connect-src 'self'",
  ])('locks %s to this origin', (directive) => {
    expect(netlifyToml).toContain(directive);
  });

  it.each([
    'Strict-Transport-Security',
    'X-Content-Type-Options',
    'X-Frame-Options',
    'Referrer-Policy',
    'Permissions-Policy',
    'Cross-Origin-Opener-Policy',
    'Cross-Origin-Resource-Policy',
  ])('sends %s', (header) => {
    expect(netlifyToml).toContain(header);
  });
});

/**
 * An SVG is a document, not just a picture. Served from `public/` it lands on
 * this site's own origin, so a `<script>` inside one runs as us the moment
 * anybody navigates straight to the file - and `img-src` does not stop that,
 * because it is a navigation and not an image load.
 *
 * The reason this is a test and not a code review note: `public/` is exactly
 * where a forker drops the avatar they exported from somewhere else.
 */
describe('assets in public/', () => {
  const publicDir = join(process.cwd(), 'public');
  const svgs = readdirSync(publicDir).filter((file) => file.endsWith('.svg'));

  it('has SVGs to check', () => {
    expect(svgs.length).toBeGreaterThan(0);
  });

  it.each(svgs)('%s carries no script, handler or remote reference', (file) => {
    const svg = readFileSync(join(publicDir, file), 'utf8');

    expect(svg, 'contains a <script> element').not.toMatch(/<script/i);
    expect(svg, 'contains an inline event handler').not.toMatch(/\son\w+\s*=/i);
    // `xmlns="http://www.w3.org/2000/svg"` is a namespace identifier and is
    // never fetched. An href that leaves the file is a different thing.
    expect(svg, 'references a remote resource').not.toMatch(/(?:xlink:)?href\s*=\s*["']https?:/i);
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
