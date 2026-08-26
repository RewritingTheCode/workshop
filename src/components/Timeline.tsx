import { useMemo, useState } from 'react';
import type { TimelineEntry as Entry, TimelineFilterValue } from '../content/schema';
import { TimelineEntry } from './TimelineEntry';
import { TimelineFilter } from './TimelineFilter';

/**
 * Most recent first. `null` endDate means "present", which sorts above
 * everything finished. Ties break on startDate, also descending.
 *
 * This exists because array order in `profile.ts` is not a source of truth -
 * that file gets rewritten wholesale when you import a resume, and nothing
 * guarantees the order survives.
 */
function sortTimeline(entries: Entry[]): Entry[] {
  return [...entries].sort((a, b) => {
    if (a.endDate === null && b.endDate !== null) return -1;
    if (b.endDate === null && a.endDate !== null) return 1;
    if (a.endDate !== null && b.endDate !== null && a.endDate !== b.endDate) {
      return a.endDate < b.endDate ? 1 : -1;
    }
    if (a.startDate === b.startDate) return 0;
    return a.startDate < b.startDate ? 1 : -1;
  });
}

type TimelineProps = {
  entries: Entry[];
};

export function Timeline({ entries }: TimelineProps) {
  const [filter, setFilter] = useState<TimelineFilterValue>('all');

  const sorted = useMemo(() => sortTimeline(entries), [entries]);
  const visible = useMemo(
    () => (filter === 'all' ? sorted : sorted.filter((entry) => entry.kind === filter)),
    [sorted, filter],
  );

  return (
    <section id="timeline" className="scroll-mt-24 px-4 py-10 sm:px-6 sm:py-14">
      <div className="mx-auto max-w-3xl">
        <div className="border-ink-200 flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b pb-4">
          <div>
            <h2 className="text-ink-950 text-2xl font-bold tracking-tight sm:text-3xl">
              Work and projects
            </h2>
            <p aria-live="polite" className="text-ink-400 mt-1 text-sm">
              Showing {visible.length} of {sorted.length}
            </p>
          </div>
          <TimelineFilter value={filter} onChange={setFilter} />
        </div>

        {visible.length > 0 ? (
          <ul className="mt-8 pl-1">
            {visible.map((entry) => (
              <TimelineEntry key={entry.id} entry={entry} />
            ))}
          </ul>
        ) : (
          <p className="text-ink-600 mt-8">Nothing here yet.</p>
        )}
      </div>
    </section>
  );
}
