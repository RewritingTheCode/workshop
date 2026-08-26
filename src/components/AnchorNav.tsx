import { AtSign, History, UserRound, type LucideIcon } from 'lucide-react';

const SECTIONS: Array<{ id: string; label: string; Icon: LucideIcon }> = [
  { id: 'top', label: 'Top', Icon: UserRound },
  { id: 'timeline', label: 'Timeline', Icon: History },
  { id: 'links', label: 'Links', Icon: AtSign },
];

/**
 * Reads like real navigation without being a multi-page app. Anchors only -
 * no router, no second page, nothing to keep in sync.
 */
export function AnchorNav() {
  return (
    <nav
      aria-label="Sections"
      className="bg-ink-50/90 border-ink-200 sticky top-0 z-10 border-b backdrop-blur"
    >
      <ul className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-2 py-2 sm:px-6">
        {SECTIONS.map(({ id, label, Icon }) => (
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
