import { Grid, GridColumn, type GridColumnProps } from '@progress/kendo-react-grid';

export interface DataGridColumn extends GridColumnProps {
  field: string;
  title: string;
}

interface DataGridProps<T> {
  data: readonly T[];
  columns: readonly DataGridColumn[];
  ariaLabel: string;
  pageable?: boolean;
  sortable?: boolean;
}

/**
 * Thin, reusable wrapper around KendoReact Grid. Centralizes grid defaults so
 * features never duplicate grid configuration.
 */
export function DataGrid<T>({
  data,
  columns,
  ariaLabel,
  pageable = false,
  sortable = true,
}: DataGridProps<T>): JSX.Element {
  return (
    <div aria-label={ariaLabel} className="data-grid">
      <Grid data={data as T[]} sortable={sortable} pageable={pageable} style={{ minHeight: 240 }}>
        {columns.map((col) => (
          <GridColumn key={col.field} {...col} />
        ))}
      </Grid>
    </div>
  );
}
