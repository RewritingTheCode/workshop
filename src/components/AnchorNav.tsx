import { UserRound, type LucideIcon } from 'lucide-react';
import type { SectionId } from '../content/schema';
import { SECTIONS } from './sections';

type AnchorNavProps = {
  /** The page's sections, in page order. The nav follows it exactly. */
  sections: SectionId[];
};

type NavItem = {
  id: string;
  label: string;
  Icon: LucideIcon;
};

/** Always first, because the hero is always first. See ADR-006. */
const TOP: NavItem = { id: 'top', label: 'Top', Icon: UserRound };

/**
 * Reads like real navigation without being a multi-page app. Anchors only -
 * no router, no second page, nothing to keep in sync.
 *
 * The order comes from `profile.sections`, the same array the page renders
 * from, so a nav link can never point somewhere the page does not have.
 */
export function AnchorNav({ sections }: AnchorNavProps) {
  const items: NavItem[] = [
    TOP,
    ...sections.map((id) => ({ id, label: SECTIONS[id].label, Icon: SECTIONS[id].Icon })),
  ];

  return (
    <nav
      aria-label="Sections"
      className="bg-ink-50/90 border-ink-200 sticky top-0 z-10 border-b backdrop-blur"
    >
      <ul className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 py-2 sm:px-6">
        {items.map(({ id, label, Icon }) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className="text-ink-600 hover:bg-brand-100 hover:text-brand-700 flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
