import { DataGrid, type DataGridColumn } from '@shared/components';
import type { RecentActivityItem } from '../models/dashboardModels';

interface RecentActivityProps {
  items: readonly RecentActivityItem[];
}

const columns: DataGridColumn[] = [
  { field: 'title', title: 'Activity' },
  { field: 'actor', title: 'By' },
  { field: 'timestamp', title: 'When' },
];

/** Recent activity panel backed by the reusable KendoReact grid wrapper. */
export const RecentActivity = ({ items }: RecentActivityProps): JSX.Element => (
  <section className="surface" aria-label="Recent activity">
    <h2 className="section-title">Recent Activity</h2>
    <DataGrid data={items} columns={columns} ariaLabel="Recent activity grid" />
  </section>
);
