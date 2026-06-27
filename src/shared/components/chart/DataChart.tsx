import {
  Chart,
  ChartSeries,
  ChartSeriesItem,
  ChartCategoryAxis,
  ChartCategoryAxisItem,
  ChartTitle,
  ChartLegend,
  ChartTooltip,
} from '@progress/kendo-react-charts';
import type { ChartSeriesPoint } from '@shared/types/common';

type ChartType = 'column' | 'bar' | 'line' | 'area' | 'pie' | 'donut';

interface DataChartProps {
  title: string;
  data: readonly ChartSeriesPoint[];
  type?: ChartType;
  ariaLabel?: string;
  /** Chart height in px. Defaults to 280. */
  height?: number;
}

/** Chart types that render as a circular (category-labelled) single series. */
const CIRCULAR_TYPES: ReadonlySet<ChartType> = new Set(['pie', 'donut']);

/**
 * Reusable wrapper around KendoReact Charts for single-series categorical data.
 * Supports vertical/horizontal bars, line/area trends, and pie/doughnut
 * distributions so feature dashboards share one consistent chart configuration.
 */
export const DataChart = ({
  title,
  data,
  type = 'column',
  ariaLabel,
  height = 280,
}: DataChartProps): JSX.Element => {
  const categories = data.map((point) => point.category);
  const values = data.map((point) => point.value);
  const isCircular = CIRCULAR_TYPES.has(type);

  return (
    <div aria-label={ariaLabel ?? title} className="data-chart">
      <Chart style={{ height }} transitions={false}>
        <ChartTitle text={title} />
        <ChartLegend position="bottom" visible={isCircular} />
        <ChartTooltip />
        {isCircular ? (
          <ChartSeries>
            <ChartSeriesItem
              type={type === 'donut' ? 'donut' : 'pie'}
              data={data.map((point) => ({ category: point.category, value: point.value }))}
              field="value"
              categoryField="category"
            />
          </ChartSeries>
        ) : (
          <>
            <ChartCategoryAxis>
              <ChartCategoryAxisItem categories={categories} />
            </ChartCategoryAxis>
            <ChartSeries>
              <ChartSeriesItem type={type} data={values} />
            </ChartSeries>
          </>
        )}
      </Chart>
    </div>
  );
};
