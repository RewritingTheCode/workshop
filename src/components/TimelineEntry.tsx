import { ArrowUpRight, Briefcase, CalendarDays, FolderGit2, MapPin } from 'lucide-react';
import type { TimelineEntry as Entry } from '../content/schema';

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/** "2024-06" -> "Jun 2024". null -> "Present". */
function formatMonth(value: string | null): string {
  if (value === null) return 'Present';
  const [year, month] = value.split('-');
  return `${MONTHS[Number(month) - 1]} ${year}`;
}

type TimelineEntryProps = {
  entry: Entry;
};

export function TimelineEntry({ entry }: TimelineEntryProps) {
  const isWork = entry.kind === 'work';
  const isCurrent = entry.endDate === null;
  const KindIcon = isWork ? Briefcase : FolderGit2;
  const dateRange = `${formatMonth(entry.startDate)} – ${formatMonth(entry.endDate)}`;

  return (
    <li
      id={entry.id}
      data-kind={entry.kind}
      className="border-ink-200 relative scroll-mt-24 border-l pb-10 pl-6 last:border-transparent last:pb-0 sm:pl-8"
    >
      {/* The marker on the rail. Filled for something still going. */}
      <span
        aria-hidden="true"
        className={
          isCurrent
            ? 'bg-brand-500 ring-ink-50 absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full ring-4'
            : 'bg-ink-200 ring-ink-50 absolute top-1.5 -left-[5px] h-2.5 w-2.5 rounded-full ring-4'
        }
      />

      <p className="text-ink-400 flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.14em] uppercase">
        <KindIcon aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2.25} />
        {isWork ? 'Work' : 'Project'}
      </p>

      <h3 className="text-ink-950 mt-1.5 text-lg leading-snug font-semibold text-pretty sm:text-xl">
        {entry.title}
        {entry.organization ? (
          <span className="text-ink-600 font-normal"> &middot; {entry.organization}</span>
        ) : null}
      </h3>

      <p className="text-ink-400 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
          <time dateTime={entry.startDate}>{dateRange}</time>
        </span>
        {entry.location ? (
          <span className="inline-flex items-center gap-1.5">
            <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
            {entry.location}
          </span>
        ) : null}
      </p>

      {/*
        Image beside the prose from `sm:` up, stacked above it on a phone.
        Keeps a timeline of six entries scannable instead of turning it into a
        column of large banners you have to scroll past.
      */}
      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        {entry.image ? (
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
        ) : null}

        <div className="min-w-0 flex-1">
          <p className="text-ink-800 leading-relaxed text-pretty">{entry.summary}</p>

          {entry.highlights.length > 0 ? (
            <ul className="text-ink-600 marker:text-brand-300 mt-3 list-disc space-y-2 pl-5 leading-relaxed">
              {entry.highlights.map((highlight) => (
                <li key={highlight} className="text-pretty">
                  {highlight}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {entry.tags.length > 0 ? (
        <ul aria-label="Tags" className="mt-4 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <li
              key={tag}
              className="border-ink-200 text-ink-600 rounded-full border bg-white px-2.5 py-0.5 text-xs font-medium"
            >
              {tag}
            </li>
          ))}
        </ul>
      ) : null}

      {entry.links.length > 0 ? (
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {entry.links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="text-brand-700 decoration-brand-300 hover:decoration-brand-700 inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4 transition-colors"
              >
                {link.label}
                <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            </li>
          ))}
        </ul>
      ) : null}
    </li>
  );
}
