import type { Link } from '../content/schema';

type LinksBlockProps = {
  links: Link[];
  resumeUrl?: string;
};

export function LinksBlock({ links, resumeUrl }: LinksBlockProps) {
  const hasAnything = links.length > 0 || Boolean(resumeUrl);
  if (!hasAnything) return null;

  return (
    <section id="links" className="scroll-mt-24 px-4 pt-2 pb-12 sm:px-6 sm:pb-16">
      <div className="border-ink-200 from-brand-100/60 mx-auto max-w-3xl rounded-2xl border bg-gradient-to-br to-white p-6 sm:p-9">
        <h2 className="text-ink-950 text-2xl font-bold tracking-tight sm:text-3xl">Get in touch</h2>
        <ul className="mt-5 flex flex-wrap gap-2">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="border-ink-200 text-ink-800 hover:border-brand-500 hover:text-brand-700 inline-block rounded-lg border bg-white px-4 py-2 font-medium shadow-xs transition-colors"
              >
                {link.label}
              </a>
            </li>
          ))}

          {resumeUrl ? (
            <li>
              <a
                href={resumeUrl}
                download
                className="bg-brand-600 hover:bg-brand-700 inline-block rounded-lg px-4 py-2 font-medium text-white shadow-xs transition-colors"
              >
                Download resume
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
