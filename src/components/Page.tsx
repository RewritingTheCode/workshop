import { Fragment } from 'react';
import type { Profile } from '../content/schema';
import { AnchorNav } from './AnchorNav';
import { Footer } from './Footer';
import { Hero } from './Hero';
import { SECTIONS } from './sections';

type PageProps = {
  profile: Profile;
};

/**
 * The page shell, for any profile.
 *
 * `App` hands this the real content. Keeping the layout in a component that
 * takes a `Profile` is what lets the tests assert on section order against a
 * fixture instead of only against whatever is currently in `profile.ts`.
 *
 * The hero is fixed at the top; everything after it is ordered by
 * `profile.sections`. See ADR-006.
 */
export function Page({ profile }: PageProps) {
  return (
    <>
      <a
        href="#main"
        className="focus:bg-brand-600 sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-20 focus:rounded-md focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <AnchorNav sections={profile.sections} />

      <main id="main">
        <Hero profile={profile} />
        {profile.sections.map((id) => (
          <Fragment key={id}>{SECTIONS[id].render(profile)}</Fragment>
        ))}
      </main>

      <Footer name={profile.name} />
    </>
  );
}
