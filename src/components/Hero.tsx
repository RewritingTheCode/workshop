import { MapPin } from 'lucide-react';
import type { Profile } from '../content/schema';

type HeroProps = {
  profile: Profile;
};

/**
 * Name, headline, photo, intro. The first fifteen seconds of the page.
 * Mobile first: single column with no prefix, two columns from `sm:` up.
 */
export function Hero({ profile }: HeroProps) {
  return (
    <section
      id="top"
      className="from-brand-100/70 relative scroll-mt-24 overflow-hidden bg-gradient-to-b to-transparent px-4 pt-10 pb-10 sm:px-6 sm:pt-16 sm:pb-14"
    >
      {/* Dot lattice. Fades out before it reaches the intro paragraph. */}
      <div
        aria-hidden="true"
        className="text-brand-500/25 pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
          backgroundSize: '18px 18px',
          maskImage: 'linear-gradient(to bottom, black, transparent 72%)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent 72%)',
        }}
      />

      <div className="relative mx-auto max-w-3xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-8">
          <img
            src={profile.avatar}
            alt=""
            width={160}
            height={160}
            className="ring-brand-300/60 h-28 w-28 shrink-0 rounded-2xl object-cover shadow-sm ring-1 sm:h-40 sm:w-40"
          />

          <div className="min-w-0">
            <h1 className="text-hero text-ink-950 leading-[1.05] font-bold tracking-tight text-balance">
              {profile.name}
            </h1>
            <p className="text-brand-700 mt-2.5 text-lg leading-snug font-medium text-pretty sm:text-xl">
              {profile.headline}
            </p>
            {profile.location ? (
              <p className="text-ink-400 mt-2 flex items-center gap-1.5 text-sm font-medium tracking-wide">
                <MapPin aria-hidden="true" className="h-3.5 w-3.5" />
                {profile.location}
              </p>
            ) : null}
          </div>
        </div>

        <p className="text-ink-600 mt-7 max-w-2xl text-base leading-relaxed text-pretty sm:text-lg">
          {profile.intro}
        </p>
      </div>
    </section>
  );
}
