import type { TimelineFilterValue } from '../content/schema';

type Option = {
  value: TimelineFilterValue;
  label: string;
};

const OPTIONS: Option[] = [
  { value: 'all', label: 'All' },
  { value: 'work', label: 'Work' },
  { value: 'project', label: 'Projects' },
];

type TimelineFilterProps = {
  value: TimelineFilterValue;
  onChange: (next: TimelineFilterValue) => void;
};

/**
 * Real <button> elements in a real group. Tab reaches them, Enter and Space
 * activate them, and `aria-pressed` tells a screen reader which one is on.
 * Never a <div> with an onClick.
 */
export function TimelineFilter({ value, onChange }: TimelineFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter timeline"
      className="border-ink-200 flex flex-wrap gap-1 rounded-lg border p-1"
    >
      {OPTIONS.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(option.value)}
            className={
              isActive
                ? 'bg-brand-600 rounded-md px-3 py-1.5 text-sm font-medium text-white'
                : 'text-ink-600 hover:bg-ink-100 rounded-md px-3 py-1.5 text-sm font-medium transition-colors'
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
