import {
  buildDefectAnalytics,
  collectFilterOptions,
  filterDefects,
} from '../services/defectAnalytics';
import { EMPTY_DEFECT_FILTERS, type DefectRecord } from '../models/defectModels';
import { mapJiraDefects } from '@integrations/jira';
import { jiraDefectsFixture } from '../../../../test/fixtures/jiraDefects';

const defects: DefectRecord[] = mapJiraDefects(jiraDefectsFixture.issues);

describe('defectAnalytics', () => {
  describe('collectFilterOptions', () => {
    it('returns distinct, sorted option lists', () => {
      const options = collectFilterOptions(defects);
      expect(options.releases).toEqual([
        'v26.2.3',
        'v26.2.2.1',
        'v26.2.2',
        'v25.4.1',
        'No Release',
      ]);
      expect(options.owners).toContain('Wasapon');
      expect(options.owners).toContain('Unassigned');
      expect(options.severities).toEqual(['High', 'Medium', 'Low', 'Unknown']);
    });
  });

  describe('collectFilterOptions — root cause', () => {
    it('returns distinct, alphabetically sorted root causes', () => {
      const options = collectFilterOptions(defects);
      expect(options.rootCauses).toEqual([
        'Coding Error',
        'Data Issue',
        'Requirement Gap',
        'Unknown',
      ]);
    });
  });

  describe('filterDefects', () => {
    it('returns all records when no filter is selected', () => {
      expect(filterDefects(defects, EMPTY_DEFECT_FILTERS)).toHaveLength(defects.length);
    });

    it('filters by release', () => {
      const result = filterDefects(defects, { ...EMPTY_DEFECT_FILTERS, releases: ['v26.2.2'] });
      expect(result).toHaveLength(1);
      expect(result.every((defect) => defect.release === 'v26.2.2')).toBe(true);
    });

    it('combines dimensions with AND', () => {
      const result = filterDefects(defects, {
        ...EMPTY_DEFECT_FILTERS,
        releases: ['v26.2.2'],
        severities: ['High'],
      });
      expect(result).toHaveLength(1);
      expect(result[0].key).toBe('OO-1727');
    });

    it('filters by root cause', () => {
      const result = filterDefects(defects, {
        ...EMPTY_DEFECT_FILTERS,
        rootCauses: ['Coding Error'],
      });
      expect(result).toHaveLength(2);
      expect(result.every((defect) => defect.rootCause === 'Coding Error')).toBe(true);
    });
  });

  describe('buildDefectAnalytics', () => {
    it('computes KPI cards', () => {
      const { kpis } = buildDefectAnalytics(defects, EMPTY_DEFECT_FILTERS);
      const byId = Object.fromEntries(kpis.map((kpi) => [kpi.id, kpi.value]));
      expect(byId.total).toBe(5);
      expect(byId.developers).toBe(4);
      expect(byId['top-severity']).toBe('Medium');
      expect(byId['top-developer']).toBe('Wasapon');
    });

    it('exposes the top defect developer with a defect-count unit', () => {
      const { kpis } = buildDefectAnalytics(defects, EMPTY_DEFECT_FILTERS);
      const topDeveloper = kpis.find((kpi) => kpi.id === 'top-developer');
      expect(topDeveloper).toMatchObject({
        label: 'Top Defect Developer',
        value: 'Wasapon',
        unit: '2 defects',
      });
    });

    it('falls back to a dash for the top developer when there are no defects', () => {
      const { kpis } = buildDefectAnalytics([], EMPTY_DEFECT_FILTERS);
      const topDeveloper = kpis.find((kpi) => kpi.id === 'top-developer');
      expect(topDeveloper).toMatchObject({ value: '—', unit: undefined });
    });

    it('builds a multi-series trend grouped by developer', () => {
      const { trend } = buildDefectAnalytics(defects, {
        ...EMPTY_DEFECT_FILTERS,
        owners: ['Wasapon'],
      });
      expect(trend.releases).toEqual(['v25.4.1', 'v26.2.2.1']);
      const wasapon = trend.series.find((series) => series.name === 'Wasapon');
      expect(wasapon?.data).toEqual([1, 1]);
    });

    it('orders severity chart by canonical severity', () => {
      const { bySeverity } = buildDefectAnalytics(defects, EMPTY_DEFECT_FILTERS);
      expect(bySeverity.map((point) => point.category)).toEqual([
        'High',
        'Medium',
        'Low',
        'Unknown',
      ]);
    });

    it('exposes stable filter options regardless of active filters', () => {
      const { options } = buildDefectAnalytics(defects, {
        ...EMPTY_DEFECT_FILTERS,
        releases: ['v25.4.1'],
      });
      expect(options.releases).toEqual([
        'v26.2.3',
        'v26.2.2.1',
        'v26.2.2',
        'v25.4.1',
        'No Release',
      ]);
    });

    it('aggregates root cause distribution, sorted by descending count', () => {
      const { rootCauseDistribution } = buildDefectAnalytics(defects, EMPTY_DEFECT_FILTERS);
      expect(rootCauseDistribution[0]).toEqual({ category: 'Coding Error', value: 2 });
      expect(rootCauseDistribution.map((point) => point.category)).toContain('Unknown');
    });
  });
});
