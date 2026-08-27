import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Page } from '../src/components/Page';
import type { Profile, SectionId } from '../src/content/schema';

/**
 * Section order is content, not layout - see ADR-006.
 *
 * The failure this guards against is not "the page renders". It is the page and
 * the anchor nav disagreeing: a nav that lists Links before Timeline while the
 * page has them the other way round, or a nav link pointing at a section that is
 * not on the page at all. Both used to be one forgotten edit away, because the
 * order was written down in two files.
 */
function profileWith(sections: SectionId[]): Profile {
  return {
    name: 'Ada Lovelace',
    headline: 'Mathematician. I write about engines.',
    intro: 'Notes on a machine that does not exist yet.',
    avatar: '/avatar-placeholder.svg',
    sections,
    links: [{ label: 'Email', href: 'mailto:ada@example.com' }],
    timeline: [
      {
        id: 'analytical-engine',
        kind: 'project',
        title: 'Analytical Engine',
        startDate: '1843-01',
        endDate: null,
        summary: 'Note G, and the first algorithm written for a machine.',
        highlights: [],
        tags: [],
        links: [],
      },
    ],
  };
}

/** The ids of the page's sections, in the order they appear in the document. */
function pageOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll('main section')).map((node) => node.id);
}

/** The targets of the anchor nav's links, in the order they are listed. */
function navOrder(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll<HTMLAnchorElement>('nav a')).map((node) =>
    node.getAttribute('href')!.replace('#', ''),
  );
}

describe('page sections', () => {
  it('renders sections in the order profile.sections gives, under the hero', () => {
    const { container } = render(<Page profile={profileWith(['timeline', 'links'])} />);
    expect(pageOrder(container)).toEqual(['top', 'timeline', 'links']);
  });

  it('reorders the page when the array is reordered', () => {
    const { container } = render(<Page profile={profileWith(['links', 'timeline'])} />);
    expect(pageOrder(container)).toEqual(['top', 'links', 'timeline']);
  });

  it('keeps the anchor nav in the same order as the page', () => {
    for (const sections of [
      ['timeline', 'links'],
      ['links', 'timeline'],
    ] as SectionId[][]) {
      const { container, unmount } = render(<Page profile={profileWith(sections)} />);
      expect(navOrder(container)).toEqual(pageOrder(container));
      unmount();
    }
  });

  it('drops a section from the page and the nav together', () => {
    const { container } = render(<Page profile={profileWith(['timeline'])} />);

    expect(pageOrder(container)).toEqual(['top', 'timeline']);
    expect(navOrder(container)).toEqual(['top', 'timeline']);
    expect(container.querySelector('#links')).toBeNull();
  });

  it('never points a nav link at something that is not on the page', () => {
    const { container } = render(<Page profile={profileWith(['links'])} />);

    for (const target of navOrder(container)) {
      expect(
        container.querySelector(`#${target}`),
        `the nav links to #${target}, which is not on the page`,
      ).not.toBeNull();
    }
  });

  it('still renders the hero when there are no sections at all', () => {
    const { container } = render(<Page profile={profileWith([])} />);

    expect(pageOrder(container)).toEqual(['top']);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });
});
