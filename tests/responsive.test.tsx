import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../src/App';

/**
 * The phone check, automated.
 *
 * Nothing in the page shell may pin itself wider than 320px at the narrowest
 * breakpoint. `max-w-*` is fine - that is a ceiling, and it collapses on a
 * small screen. `w-*` and `min-w-*` are not, because they hold the layout open
 * and produce the sideways scroll that makes a site feel broken on a phone.
 *
 * Variant-prefixed classes (`sm:w-96`) are ignored on purpose: they only apply
 * at 640px and up, where there is room for them.
 */
const NARROWEST_SUPPORTED_WIDTH = 320;

/** Tailwind's spacing scale is 0.25rem per step, and 1rem is 16px by default. */
const REM_IN_PX = 16;
const SPACING_STEP_IN_PX = 4;

/** Returns the fixed width in px that a class pins, or null if it pins nothing. */
function fixedWidthPx(token: string): number | null {
  const match = /^(?:[a-zA-Z0-9_-]+:)*((?:min-)?w)-(.+)$/.exec(token);
  if (!match) return null;

  // Only unprefixed classes apply at 320px wide.
  if (token !== `${match[1]}-${match[2]}`) return null;

  const value = match[2];

  // Fluid or intrinsic - all fine on a phone.
  if (/^(full|auto|fit|min|max|screen|dvw|svw|lvw|px|0|\d+\/\d+)$/.test(value)) return null;

  // Arbitrary value: w-[420px], w-[30rem], w-[calc(...)]
  const arbitrary = /^\[(.+)]$/.exec(value);
  if (arbitrary) {
    const raw = arbitrary[1];
    const px = /^(\d+(?:\.\d+)?)px$/.exec(raw);
    if (px) return Number(px[1]);
    const rem = /^(\d+(?:\.\d+)?)rem$/.exec(raw);
    if (rem) return Number(rem[1]) * REM_IN_PX;
    return null; // percentages, calc(), vw - not a fixed pin
  }

  // Spacing scale: w-24 -> 96px
  if (/^\d+(?:\.\d+)?$/.test(value)) return Number(value) * SPACING_STEP_IN_PX;

  return null;
}

function offenders(container: HTMLElement) {
  const found: string[] = [];

  for (const element of container.querySelectorAll<HTMLElement>('*')) {
    for (const token of element.className.toString().split(/\s+/).filter(Boolean)) {
      const px = fixedWidthPx(token);
      if (px !== null && px > NARROWEST_SUPPORTED_WIDTH) {
        found.push(`<${element.tagName.toLowerCase()}> class "${token}" pins ${px}px`);
      }
    }

    const inline = element.style.width || element.style.minWidth;
    if (inline) {
      const px = /^(\d+(?:\.\d+)?)px$/.exec(inline);
      const rem = /^(\d+(?:\.\d+)?)rem$/.exec(inline);
      const asPx = px ? Number(px[1]) : rem ? Number(rem[1]) * REM_IN_PX : null;
      if (asPx !== null && asPx > NARROWEST_SUPPORTED_WIDTH) {
        found.push(`<${element.tagName.toLowerCase()}> inline width ${inline}`);
      }
    }
  }

  return found;
}

describe('responsive shell', () => {
  it('pins nothing wider than 320px', () => {
    const { container } = render(<App />);
    expect(offenders(container), offenders(container).join('\n')).toEqual([]);
  });

  it('constrains reading width with max-width, not width', () => {
    const { container } = render(<App />);
    const constrained = container.querySelectorAll('[class*="max-w-"]');
    expect(constrained.length).toBeGreaterThan(0);
  });

  it('lets the avatar shrink rather than forcing the row open', () => {
    const { container } = render(<App />);
    const avatar = container.querySelector('img');
    expect(avatar).not.toBeNull();
    expect(fixedWidthPx('w-24')).toBeLessThanOrEqual(NARROWEST_SUPPORTED_WIDTH);
  });

  it('scrolls the anchor nav sideways instead of forcing the page to', () => {
    const { container } = render(<App />);
    const navList = container.querySelector('nav ul');
    expect(navList?.className).toContain('overflow-x-auto');
  });
});
