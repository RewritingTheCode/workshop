import { Page } from './components/Page';
import { profile } from './content/profile';

/**
 * Wires the real content into the page shell, and nothing else. The layout
 * lives in `Page` so it can be tested against a fixture - see ADR-006.
 */
export function App() {
  return <Page profile={profile} />;
}
