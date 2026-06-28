import type { KpiMetric } from '@shared/types/common';

interface KpiCardProps {
  metric: KpiMetric;
  /** When true, the card grows to two grid columns to fit long text values. */
  wide?: boolean;
}

const trendSymbol: Record<NonNullable<KpiMetric['trend']>, string> = {
  up: '▲',
  down: '▼',
  flat: '■',
};

/** Reusable KPI summary card used across dashboards. */
export const KpiCard = ({ metric, wide = false }: KpiCardProps): JSX.Element => {
  const { label, value, delta, trend, unit } = metric;

  return (
    <article className={`kpi-card${wide ? ' kpi-card--wide' : ''}`} aria-label={label}>
      <div className="kpi-card__header">
        <span className="kpi-card__label">{label}</span>
      </div>

      <div className="kpi-card__body">
        <div className="kpi-card__value">
          <span className="kpi-card__primary">{value}</span>
          {unit ? <span className="kpi-card__unit">{unit}</span> : null}
        </div>

        {trend && typeof delta === 'number' ? (
          <footer className={`kpi-card__trend kpi-card__trend--${trend}`}>
            <span aria-hidden="true">{trendSymbol[trend]}</span> {Math.abs(delta)}%
          </footer>
        ) : null}
      </div>
    </article>
  );
};
