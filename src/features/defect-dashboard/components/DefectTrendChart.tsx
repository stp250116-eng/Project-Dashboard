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
import type { DefectTrend } from '../models/defectModels';

interface DefectTrendChartProps {
  trend: DefectTrend;
  title: string;
}

/**
 * Multi-series release trend chart. One line per developer. Lives in the
 * feature (rather than the shared single-series `DataChart`) because
 * multi-series rendering is a defect-dashboard-specific need.
 */
export const DefectTrendChart = ({ trend, title }: DefectTrendChartProps): JSX.Element => {
  const categories = trend.releases;

  return (
    <div className="data-chart" aria-label={title}>
      <Chart style={{ height: 300 }} transitions={false}>
        <ChartTitle text={title} />
        <ChartLegend position="bottom" />
        <ChartTooltip />
        <ChartCategoryAxis>
          <ChartCategoryAxisItem categories={categories} />
        </ChartCategoryAxis>
        <ChartSeries>
          {trend.series.map((series) => (
            <ChartSeriesItem
              key={series.name}
              type="line"
              name={series.name}
              data={series.data}
            />
          ))}
        </ChartSeries>
      </Chart>
    </div>
  );
};
