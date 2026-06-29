import {
  buildDeveloperTrainingSummary,
  formatTrainingDuration,
  formatTrainingHours,
} from '../services/developerTrainingAnalytics';
import type { DeveloperTrainingRecord } from '../models/developerTrainingModels';

describe('developerTrainingAnalytics', () => {
  const records: DeveloperTrainingRecord[] = [
    {
      developer: 'Sittichart Phikunthong',
      trainingType: 'Online Learning',
      vendorType: 'Internal',
      aggregatedTimeSeconds: 32.95 * 3600,
    },
    {
      developer: 'Alice',
      trainingType: 'Workshop',
      vendorType: 'External',
      aggregatedTimeSeconds: 90 * 60,
    },
  ];

  it('formats fractional hours as hours and minutes', () => {
    expect(formatTrainingHours(32.95)).toBe('32h 57m');
    expect(formatTrainingDuration(32.95 * 3600)).toBe('32h 57m');
  });

  it('builds developer summary with formatted total training hours in KPI unit', () => {
    const summary = buildDeveloperTrainingSummary(records, { developers: [], vendorTypes: [] });

    const totalHoursKpi = summary.kpis.find((metric) => metric.id === 'total-team-hours');

    expect(totalHoursKpi).toBeDefined();
    expect(totalHoursKpi?.value).toBe('34h 27m');

    const row = summary.rows.find((item) => item.developer === 'Sittichart Phikunthong');
    expect(row).toBeDefined();
    expect(row?.totalTrainingHours).toBeCloseTo(32.95, 2);
  });
});
