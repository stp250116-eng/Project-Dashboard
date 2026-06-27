import type { ReactNode } from 'react';

interface FilterPanelProps {
  title?: string;
  onApply?: () => void;
  onReset?: () => void;
  children: ReactNode;
}

/**
 * Reusable filter container used by dashboards and list pages. Provides the
 * standard Apply/Reset affordances and an accessible region.
 */
export const FilterPanel = ({
  title = 'Filters',
  onApply,
  onReset,
  children,
}: FilterPanelProps): JSX.Element => (
  <section className="filter-panel" aria-label={title}>
    <header className="filter-panel__header">{title}</header>
    <div className="filter-panel__body">{children}</div>
    <footer className="filter-panel__actions">
      <button type="button" onClick={onReset} className="filter-panel__reset">
        Reset
      </button>
      <button type="button" onClick={onApply} className="filter-panel__apply">
        Apply
      </button>
    </footer>
  </section>
);
