import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { Timeline } from '../src/components/Timeline';
import type { TimelineEntry } from '../src/content/schema';

/**
 * Behaviour, not markup.
 *
 * The classic thing people forget to test is that the filter actually filters.
 * It is easy to test that three buttons render. That test passes even when
 * clicking them does nothing.
 */
const entries: TimelineEntry[] = [
  {
    id: 'current-job',
    kind: 'work',
    title: 'Software Engineering Intern',
    organization: 'Northlight Health',
    startDate: '2026-05',
    endDate: null,
    summary: 'A job that is still going.',
    highlights: [],
    tags: [],
    links: [],
  },
  {
    id: 'old-job',
    kind: 'work',
    title: 'Front-End Developer',
    organization: 'Riverside Public Library',
    startDate: '2024-09',
    endDate: '2025-05',
    summary: 'A job that has ended.',
    highlights: [],
    tags: [],
    links: [],
  },
  {
    id: 'side-project',
    kind: 'project',
    title: 'Trailhead',
    startDate: '2025-06',
    endDate: '2025-09',
    summary: 'A project.',
    highlights: [],
    tags: [],
    links: [],
  },
];

/**
 * `queryAllByRole`, not `getAllByRole`: "no entries are visible" is a real state
 * this component has to handle, and the `get*` family throws on zero matches
 * rather than returning the empty array that state should produce.
 */
function visibleEntryIds(): string[] {
  return screen
    .queryAllByRole('listitem')
    .filter((node) => node.dataset.kind !== undefined)
    .map((node) => node.id);
}

describe('Timeline filter', () => {
  it('shows everything by default', () => {
    render(<Timeline entries={entries} />);
    expect(visibleEntryIds()).toHaveLength(3);
  });

  it('hides work entries when Projects is selected', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={entries} />);

    await user.click(screen.getByRole('button', { name: 'Projects' }));

    expect(screen.queryByText('Software Engineering Intern')).not.toBeInTheDocument();
    expect(screen.queryByText('Front-End Developer')).not.toBeInTheDocument();
    expect(screen.getByText('Trailhead')).toBeInTheDocument();
    expect(visibleEntryIds()).toEqual(['side-project']);
  });

  it('hides projects when Work is selected, and comes back on All', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={entries} />);

    await user.click(screen.getByRole('button', { name: 'Work' }));
    expect(visibleEntryIds()).toEqual(['current-job', 'old-job']);

    await user.click(screen.getByRole('button', { name: 'All' }));
    expect(visibleEntryIds()).toHaveLength(3);
  });

  it('is reachable and operable from the keyboard alone', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={entries} />);

    const projects = screen.getByRole('button', { name: 'Projects' });
    projects.focus();
    expect(projects).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(visibleEntryIds()).toEqual(['side-project']);
  });

  it('tells assistive tech which filter is active', async () => {
    const user = userEvent.setup();
    render(<Timeline entries={entries} />);

    const group = screen.getByRole('group', { name: 'Filter timeline' });
    expect(within(group).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await user.click(within(group).getByRole('button', { name: 'Work' }));
    expect(within(group).getByRole('button', { name: 'Work' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(within(group).getByRole('button', { name: 'All' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });

  /*
   * A resume with no side projects on it is a normal resume, and the filter has
   * to stay honest when one of its three buttons can only ever return nothing.
   * See the 2026-08-27 amendment in docs/adr/ADR-003-content-model.md.
   */
  it('shows the empty state when a filter matches nothing, not a blank stretch of page', async () => {
    const user = userEvent.setup();
    const workOnly = entries.filter((entry) => entry.kind === 'work');
    render(<Timeline entries={workOnly} />);

    await user.click(screen.getByRole('button', { name: 'Projects' }));

    expect(visibleEntryIds()).toEqual([]);
    expect(screen.getByText('Nothing here yet.')).toBeInTheDocument();
    expect(screen.getByText('Showing 0 of 2')).toBeInTheDocument();
  });

  it('sorts most recent first, with present-day entries at the top', () => {
    render(<Timeline entries={entries} />);
    // Deliberately passed in a scrambled-ish order above; ordering must come
    // from the dates, not from the array, because profile.ts gets rewritten.
    expect(visibleEntryIds()).toEqual(['current-job', 'side-project', 'old-job']);
  });
});
