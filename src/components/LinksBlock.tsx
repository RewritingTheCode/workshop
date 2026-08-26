import { Code2, Download, Globe, Mail, Send, Users } from 'lucide-react';
import type { Link } from '../content/schema';

/**
 * Pick an icon from where the link points, not from its label, so it still
 * works when someone writes "My code" instead of "GitHub".
 */
function iconFor(href: string): typeof Globe {
  if (href.startsWith('mailto:')) return Mail;
  if (href.includes('github.com')) return Code2;
  if (href.includes('linkedin.com')) return Users;
  return Globe;
}

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
        <h2 className="text-ink-950 flex items-center gap-2.5 text-2xl font-bold tracking-tight sm:text-3xl">
          <span className="bg-brand-600 grid h-9 w-9 shrink-0 place-items-center rounded-lg text-white">
            <Send aria-hidden="true" className="h-4.5 w-4.5" />
          </span>
          Get in touch
        </h2>

        <ul className="mt-5 flex flex-wrap gap-2">
          {links.map((link) => {
            const Icon = iconFor(link.href);
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="border-ink-200 text-ink-800 hover:border-brand-500 hover:text-brand-700 inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-2 font-medium shadow-xs transition-colors"
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {link.label}
                </a>
              </li>
            );
          })}

          {resumeUrl ? (
            <li>
              <a
                href={resumeUrl}
                download
                className="bg-brand-600 hover:bg-brand-700 inline-flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-white shadow-xs transition-colors"
              >
                <Download aria-hidden="true" className="h-4 w-4" />
                Download resume
              </a>
            </li>
          ) : null}
        </ul>
      </div>
    </section>
  );
}
