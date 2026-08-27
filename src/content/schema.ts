/**
 * The content contract.
 *
 * `profile.ts` is the only file you edit to make this site yours. This file
 * describes the shape that file has to have. `tests/content.test.ts` asserts
 * that the instance satisfies the contract, so when an import goes wrong the
 * test names the exact field instead of leaving you to hunt for it.
 *
 * Do not add a second source of truth for content.
 */
import { z } from 'zod';

/**
 * The schemes a URL is allowed to use, by where it ends up in the page.
 *
 * `z.url()` accepts anything a URL parser accepts - `javascript:alert(1)`,
 * `data:text/html;base64,...`, `vbscript:` and `file:///etc/passwd` all pass
 * it - and every string below is rendered straight into an `href` or a `src`.
 *
 * This is a template. The person filling in `profile.ts` is often pasting from
 * a resume, a chat window or somebody else's page, which makes content
 * untrusted input even though it lives in a `.ts` file. React 19 happens to
 * block `javascript:` hrefs, but that covers one scheme, it is not in a test,
 * and it leaves with the framework. The rule belongs in the contract.
 *
 * See docs/adr/ADR-007-security-posture.md.
 */
const SCHEME = /^[a-z][a-z0-9+.-]*:/i;

function safeUrl(schemes: readonly string[], hint: string) {
  const allowed = new Set(schemes);

  return z.string().min(1).refine(
    (value) => {
      // `//evil.tld/x` has no scheme of its own - it borrows the page's and
      // points at somebody else's host. It is not a path on this site.
      if (value.startsWith('//')) return false;

      const match = SCHEME.exec(value);
      // No scheme at all: a path on this own site. Nothing to hijack.
      if (!match) return true;

      const scheme = match[0].slice(0, -1).toLowerCase();
      if (!allowed.has(scheme)) return false;

      // `data:` is allowed for inline images and nothing else. `data:image/*`
      // in an `<img>` is inert - browsers refuse to run script inside it -
      // whereas `data:text/html` is a document, and allowing one media type
      // through a check named "images" would be an easy thing to miss.
      if (scheme === 'data') return /^data:image\//i.test(value);

      return true;
    },
    { message: hint },
  );
}

export const linkSchema = z.object({
  label: z.string().min(1),
  href: safeUrl(
    ['https', 'mailto'],
    'href must be an https:// link or a mailto: address. Other schemes are rejected - a javascript: or data: URL pasted in here would ship to a public page.',
  ),
});

/**
 * An image belonging to an entry. `alt` is required, not optional - if there is
 * an image there has to be a description of it, and the schema is the right
 * place to enforce that rather than hoping someone remembers.
 */
export const imageSchema = z.object({
  /** A path in `public/`, an https URL, or an inline `data:` image. */
  src: safeUrl(
    ['https', 'data'],
    'image src must be a path in public/, an https:// URL, or a data: URI',
  ),
  alt: z.string().min(1),
  /** Photographer and source, when the image is not yours. */
  credit: z.string().optional(),
});

export const timelineEntrySchema = z.object({
  /** Stable, unique, kebab-case. Used as the React key and the anchor id. */
  id: z.string().min(1),
  kind: z.enum(['work', 'project']),
  /** "Software Engineer Intern" or "Trailhead" */
  title: z.string().min(1),
  /** Employer or school. Omit for a personal project. */
  organization: z.string().optional(),
  /** "2024-06" */
  startDate: z.string().regex(/^\d{4}-\d{2}$/),
  /** "2025-01", or null for present. */
  endDate: z.string().regex(/^\d{4}-\d{2}$/).nullable(),
  location: z.string().optional(),
  /** One or two sentences. */
  summary: z.string().min(1),
  /** A screenshot, photo or cover image. Optional - plenty of entries need none. */
  image: imageSchema.optional(),
  highlights: z.array(z.string()).default([]),
  /** "React", "Python" */
  tags: z.array(z.string()).default([]),
  links: z.array(linkSchema).default([]),
});

/**
 * The sections of the page, in the order `profile.sections` may name them.
 *
 * This is the single list of sections that exist. The schema validates against
 * it, `SectionId` is inferred from it, and `src/components/sections.tsx` has to
 * have an entry for every one - so adding a section here and forgetting to
 * render it is a type error, not a blank space on the page.
 *
 * The hero is not in this list on purpose. It carries the `<h1>` and the `#top`
 * anchor, and every page needs exactly one of it. See ADR-006.
 */
export const SECTION_IDS = ['timeline', 'links'] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const profileSchema = z.object({
  name: z.string().min(1),
  /** "Computer science student. I build things for the web." */
  headline: z.string().min(1),
  /** Two or three sentences, first person. */
  intro: z.string().min(1),
  location: z.string().optional(),
  avatar: safeUrl(
    ['https', 'data'],
    'avatar must be a path in public/, an https:// URL, or a data: URI',
  ).default('/avatar-placeholder.svg'),
  /** A path in `public/`, or an https link to a resume hosted elsewhere. */
  resumeUrl: safeUrl(
    ['https'],
    'resumeUrl must be a path in public/ or an https:// URL',
  ).optional(),
  links: z.array(linkSchema).default([]),
  timeline: z.array(timelineEntrySchema).min(1),

  /**
   * Section order, top to bottom. Drives the page and the anchor nav from the
   * same array, so the two cannot disagree. Drop an id to hide that section.
   */
  sections: z
    .array(z.enum(SECTION_IDS))
    .refine((ids) => new Set(ids).size === ids.length, {
      message:
        'sections must not repeat - each id is a DOM id and an anchor target, and duplicates break both',
    })
    .default([...SECTION_IDS]),
});

export type Link = z.infer<typeof linkSchema>;
export type Image = z.infer<typeof imageSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;

/** The three states of the timeline filter. */
export const TIMELINE_FILTERS = ['all', 'work', 'project'] as const;
export type TimelineFilterValue = (typeof TIMELINE_FILTERS)[number];
