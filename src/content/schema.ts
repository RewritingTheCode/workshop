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

export const linkSchema = z.object({
  label: z.string().min(1),
  href: z.url(),
});

/**
 * An image belonging to an entry. `alt` is required, not optional - if there is
 * an image there has to be a description of it, and the schema is the right
 * place to enforce that rather than hoping someone remembers.
 */
export const imageSchema = z.object({
  src: z.string().min(1),
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

export const profileSchema = z.object({
  name: z.string().min(1),
  /** "Computer science student. I build things for the web." */
  headline: z.string().min(1),
  /** Two or three sentences, first person. */
  intro: z.string().min(1),
  location: z.string().optional(),
  avatar: z.string().default('/avatar-placeholder.svg'),
  resumeUrl: z.string().optional(),
  links: z.array(linkSchema).default([]),
  timeline: z.array(timelineEntrySchema).min(1),
});

export type Link = z.infer<typeof linkSchema>;
export type Image = z.infer<typeof imageSchema>;
export type Profile = z.infer<typeof profileSchema>;
export type TimelineEntry = z.infer<typeof timelineEntrySchema>;

/** The three states of the timeline filter. */
export const TIMELINE_FILTERS = ['all', 'work', 'project'] as const;
export type TimelineFilterValue = (typeof TIMELINE_FILTERS)[number];
