const SECTIONS = [
  { id: 'top', label: 'Top' },
  { id: 'timeline', label: 'Timeline' },
  { id: 'links', label: 'Links' },
] as const;

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
        {SECTIONS.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              className="text-ink-600 hover:bg-brand-100 hover:text-brand-700 block rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
