import {
  Accessibility,
  Atom,
  Braces,
  Bus,
  ChartNoAxesColumn,
  Cloud,
  Compass,
  Database,
  FlaskConical,
  Map,
  Palette,
  Sigma,
  Smartphone,
  Tag,
  Terminal,
  Users,
  type LucideIcon,
} from 'lucide-react';

/**
 * Tags are free text - people write whatever their resume says. This maps the
 * common ones onto an icon and falls back to a generic tag, so an unrecognised
 * technology still looks deliberate rather than broken.
 *
 * The third value is how *specific* the tag is. Half a portfolio is tagged
 * "React", so when we need one icon to stand for a whole entry we want the tag
 * that says something about the work - Leaflet over React, GTFS over Python.
 * Without this, four entries in a row get the same atom.
 */
const TAG_ICONS: Array<[match: string, icon: LucideIcon, specificity: number]> = [
  ['accessib', Accessibility, 3],
  ['react', Atom, 1],
  ['vue', Atom, 1],
  ['svelte', Atom, 1],
  ['typescript', Braces, 1],
  ['javascript', Braces, 1],
  ['node', Braces, 1],
  ['python', Terminal, 1],
  ['bash', Terminal, 1],
  ['css', Palette, 2],
  ['tailwind', Palette, 2],
  ['design', Palette, 2],
  ['test', FlaskConical, 3],
  ['vitest', FlaskConical, 3],
  ['research', Users, 3],
  ['netlify', Cloud, 2],
  ['serverless', Cloud, 2],
  ['aws', Cloud, 2],
  ['sql', Database, 3],
  ['indexeddb', Database, 3],
  ['database', Database, 3],
  ['pwa', Smartphone, 3],
  ['mobile', Smartphone, 3],
  ['leaflet', Map, 4],
  ['maps', Map, 4],
  ['gtfs', Bus, 4],
  ['transit', Bus, 4],
  ['algorithm', Sigma, 4],
  ['data', ChartNoAxesColumn, 3],
  ['analytics', ChartNoAxesColumn, 3],
];

function lookup(tag: string): { icon: LucideIcon; specificity: number } {
  const needle = tag.toLowerCase();
  for (const [match, icon, specificity] of TAG_ICONS) {
    if (needle.includes(match)) return { icon, specificity };
  }
  return { icon: Tag, specificity: 0 };
}

export function iconForTag(tag: string): LucideIcon {
  return lookup(tag).icon;
}

/**
 * The icon that stands for a whole entry: its most specific recognised tag, so
 * a project about maps gets a map rather than the same atom as everything else
 * built in React.
 */
export function iconForEntry(tags: string[], fallback: LucideIcon = Compass): LucideIcon {
  let best = { icon: fallback, specificity: 0 };
  for (const tag of tags) {
    const found = lookup(tag);
    if (found.specificity > best.specificity) best = found;
  }
  return best.icon;
}

/**
 * A stable hue per entry, so every cover looks distinct without anyone having
 * to choose a colour. Constrained to the blue-through-magenta arc the rest of
 * the site lives in - a full-spectrum hash would look like confetti - but wide
 * enough that neighbouring entries are visibly different.
 */
export function hueFor(seed: string): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 33) ^ seed.charCodeAt(i);
  return 212 + (Math.abs(hash) % 148);
}
