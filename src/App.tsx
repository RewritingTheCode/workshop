import { profile } from './content/profile';
import { AnchorNav } from './components/AnchorNav';
import { Hero } from './components/Hero';
import { Timeline } from './components/Timeline';
import { LinksBlock } from './components/LinksBlock';
import { Footer } from './components/Footer';

export function App() {
  return (
    <>
      <a
        href="#main"
        className="focus:bg-brand-600 sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-20 focus:rounded-md focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to content
      </a>

      <AnchorNav />

      <main id="main">
        <Hero profile={profile} />
        <Timeline entries={profile.timeline} />
        <LinksBlock links={profile.links} resumeUrl={profile.resumeUrl} />
      </main>

      <Footer name={profile.name} />
    </>
  );
}
