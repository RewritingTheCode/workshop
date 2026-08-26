import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'jest-axe';
import { describe, expect, it } from 'vitest';
import { App } from '../src/App';

/**
 * Accessibility is a gate, not a nice-to-have.
 *
 * axe will not catch everything - nothing automated does - but it catches the
 * whole class of mistakes that ships by accident: missing labels, broken
 * heading order, controls that are not controls.
 */
describe('accessibility', () => {
  it('has zero axe violations on the full page', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 30_000);

  it('still has zero violations after the timeline is filtered', async () => {
    const user = userEvent.setup();
    const { container, getByRole } = render(<App />);

    await user.click(getByRole('button', { name: 'Projects' }));

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  }, 30_000);

  it('has exactly one h1', () => {
    const { container } = render(<App />);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });

  it('does not skip heading levels', () => {
    const { container } = render(<App />);
    const levels = Array.from(container.querySelectorAll('h1,h2,h3,h4,h5,h6')).map((node) =>
      Number(node.tagName[1]),
    );

    expect(levels[0]).toBe(1);
    for (let i = 1; i < levels.length; i += 1) {
      expect(
        levels[i] - levels[i - 1],
        `heading jumped from h${levels[i - 1]} to h${levels[i]}`,
      ).toBeLessThanOrEqual(1);
    }
  });

  it('has real landmarks', () => {
    const { container } = render(<App />);
    expect(container.querySelector('main')).not.toBeNull();
    expect(container.querySelector('nav')).not.toBeNull();
    expect(container.querySelector('footer')).not.toBeNull();
  });

  it('uses buttons for the filter, never a clickable div', () => {
    const { container } = render(<App />);
    const clickableDivs = Array.from(container.querySelectorAll('div,span')).filter((node) =>
      node.hasAttribute('onclick'),
    );
    expect(clickableDivs).toHaveLength(0);
  });
});
