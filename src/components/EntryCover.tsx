import { createElement } from 'react';
import { Briefcase, FolderGit2 } from 'lucide-react';
import type { TimelineEntry } from '../content/schema';
import { hueFor, iconForEntry } from './icon-map';

type EntryCoverProps = {
  entry: TimelineEntry;
};

/**
 * The visual for an entry.
 *
 * If you gave it an image, that wins - a screenshot of the thing you built
 * beats anything generated. Otherwise we draw a cover from the entry itself:
 * a stable hue from its id, and an icon picked from its tags, so a project
 * about maps gets a map. Nobody has to choose a colour, and no two entries
 * look the same.
 */
export function EntryCover({ entry }: EntryCoverProps) {
  if (entry.image) {
    return (
      <figure className="sm:order-last sm:w-56 sm:shrink-0">
        <img
          src={entry.image.src}
          alt={entry.image.alt}
          width={960}
          height={640}
          loading="lazy"
          decoding="async"
          className="border-ink-200 aspect-[3/2] w-full rounded-xl border object-cover"
        />
        {entry.image.credit ? (
          <figcaption className="text-ink-400 mt-1.5 text-[0.6875rem] leading-snug">
            {entry.image.credit}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  const hue = hueFor(entry.id);
  const glyph = createElement(iconForEntry(entry.tags, entry.kind === 'work' ? Briefcase : FolderGit2), {
    className: 'absolute top-1/2 left-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 text-white/85',
    strokeWidth: 1.5,
  });

  return (
    <div
      aria-hidden="true"
      className="border-ink-200 relative aspect-[3/2] w-full shrink-0 overflow-hidden rounded-xl border sm:order-last sm:w-56"
      style={{
        backgroundImage: `linear-gradient(135deg, oklch(0.72 0.16 ${hue}), oklch(0.44 0.19 ${hue + 26}))`,
      }}
    >
      {/* Dot lattice, for texture that does not compete with the icon. */}
      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '11px 11px',
          color: 'oklch(1 0 0 / 0.5)',
        }}
      />
      {/* Light falling from the top left, so the panel has a direction. */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(120% 90% at 18% 8%, oklch(1 0 0 / 0.42), transparent 62%)',
        }}
      />
      {glyph}
    </div>
  );
}
