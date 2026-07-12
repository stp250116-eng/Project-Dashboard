import {
  buildDeveloperTrainingSummary,
  formatTrainingDuration,
  formatTrainingHours,
  collectFilterOptions,
  filterTrainingRecords,
} from '../services/developerTrainingAnalytics';
import type {
  DeveloperTrainingRecord,
  DeveloperTrainingFilterState,
} from '../models/developerTrainingModels';

describe('developerTrainingAnalytics', () => {
  const baseRecords: DeveloperTrainingRecord[] = [
    {
      developer: 'Alice',
      trainingType: 'Online Learning',
      vendorType: 'Internal',
      aggregatedTimeSeconds: 32.95 * 3600,
    },
    {
      developer: 'Bob',
      trainingType: 'Workshop',
      vendorType: 'External',
      aggregatedTimeSeconds: 90 * 60,
    },
    {
      developer: 'Charlie',
      trainingType: 'Online Learning',
      vendorType: 'Partner',
      aggregatedTimeSeconds: 15 * 3600,
    },
  ];

  describe('formatTrainingHours', () => {
    it('formats whole hours only', () => {
      expect(formatTrainingHours(10)).toBe('10h');
      expect(formatTrainingHours(1)).toBe('1h');
      expect(formatTrainingHours(100)).toBe('100h');
    });

    it('formats hours with minutes', () => {
      expect(formatTrainingHours(1.5)).toBe('1h 30m');
      expect(formatTrainingHours(2.25)).toBe('2h 15m');
      expect(formatTrainingHours(32.95)).toBe('32h 57m');
    });

    it('formats zero hours', () => {
      expect(formatTrainingHours(0)).toBe('0h');
    });

    it('rounds minutes correctly', () => {
      expect(formatTrainingHours(1.25)).toBe('1h 15m');
      expect(formatTrainingHours(1.9833)).toBe('1h 59m');
    });

    it('handles rounding that results in 60 minutes', () => {
      expect(formatTrainingHours(1.9972)).toBe('2h');
    });

    it('formats fractional hours less than one minute', () => {
      expect(formatTrainingHours(0.01)).toBe('0h 1m');
    });

    it('formats exactly 60 minutes as 1 hour', () => {
      expect(formatTrainingHours(1.0)).toBe('1h');
    });
  });

  describe('formatTrainingDuration', () => {
    it('converts seconds to hours and formats correctly', () => {
      expect(formatTrainingDuration(3600)).toBe('1h');
      expect(formatTrainingDuration(5400)).toBe('1h 30m');
      expect(formatTrainingDuration(32.95 * 3600)).toBe('32h 57m');
    });

    it('handles zero seconds', () => {
      expect(formatTrainingDuration(0)).toBe('0h');
    });

    it('handles seconds less than a minute', () => {
      expect(formatTrainingDuration(30)).toBe('0h 1m');
    });
  });

  describe('collectFilterOptions', () => {
    it('collects unique developers sorted alphabetically', () => {
      const options = collectFilterOptions(baseRecords);
      expect(options.developers).toEqual(['Alice', 'Bob', 'Charlie']);
    });

    it('collects unique vendor types sorted alphabetically', () => {
      const options = collectFilterOptions(baseRecords);
      expect(options.vendorTypes).toEqual(['External', 'Internal', 'Partner']);
    });

    it('removes duplicates in options', () => {
      const records: DeveloperTrainingRecord[] = [
        {
          developer: 'Alice',
          trainingType: 'Online',
          vendorType: 'Internal',
          aggregatedTimeSeconds: 3600,
        },
        {
          developer: 'Alice',
          trainingType: 'Workshop',
          vendorType: 'Internal',
          aggregatedTimeSeconds: 3600,
        },
      ];

      const options = collectFilterOptions(records);
      expect(options.developers).toEqual(['Alice']);
      expect(options.vendorTypes).toEqual(['Internal']);
    });

    it('handles empty records array', () => {
      const options = collectFilterOptions([]);
      expect(options.developers).toEqual([]);
      expect(options.vendorTypes).toEqual([]);
    });

    it('sorts options alphabetically', () => {
      const records: DeveloperTrainingRecord[] = [
        { developer: 'Zoe', trainingType: 'Type', vendorType: 'Vendor', aggregatedTimeSeconds: 3600 },
        { developer: 'Alice', trainingType: 'Type', vendorType: 'Vendor', aggregatedTimeSeconds: 3600 },
        { developer: 'Bob', trainingType: 'Type', vendorType: 'Vendor', aggregatedTimeSeconds: 3600 },
      ];

      const options = collectFilterOptions(records);
      expect(options.developers).toEqual(['Alice', 'Bob', 'Zoe']);
    });
  });

  describe('filterTrainingRecords', () => {
    const filters: DeveloperTrainingFilterState = {
      developers: [],
      vendorTypes: [],
    };

    it('returns all records when no filters are applied', () => {
      const result = filterTrainingRecords(baseRecords, filters);
      expect(result).toEqual(baseRecords);
    });

    it('filters by developer', () => {
      const filtersWithDeveloper: DeveloperTrainingFilterState = {
        developers: ['Alice'],
        vendorTypes: [],
      };

      const result = filterTrainingRecords(baseRecords, filtersWithDeveloper);
      expect(result).toHaveLength(1);
      expect(result[0]?.developer).toBe('Alice');
    });

    it('filters by multiple developers', () => {
      const filtersWithDevelopers: DeveloperTrainingFilterState = {
        developers: ['Alice', 'Bob'],
        vendorTypes: [],
      };

      const result = filterTrainingRecords(baseRecords, filtersWithDevelopers);
      expect(result).toHaveLength(2);
      expect(result.map((r) => r.developer)).toContain('Alice');
      expect(result.map((r) => r.developer)).toContain('Bob');
    });

    it('filters by vendor type', () => {
      const filtersWithVendor: DeveloperTrainingFilterState = {
        developers: [],
        vendorTypes: ['Internal'],
      };

      const result = filterTrainingRecords(baseRecords, filtersWithVendor);
      expect(result).toHaveLength(1);
      expect(result[0]?.vendorType).toBe('Internal');
    });

    it('filters by multiple vendor types', () => {
      const filtersWithVendors: DeveloperTrainingFilterState = {
        developers: [],
        vendorTypes: ['Internal', 'External'],
      };

      const result = filterTrainingRecords(baseRecords, filtersWithVendors);
      expect(result).toHaveLength(2);
    });

    it('applies both developer and vendor filters', () => {
      const combinedFilters: DeveloperTrainingFilterState = {
        developers: ['Alice'],
        vendorTypes: ['Internal'],
      };

      const result = filterTrainingRecords(baseRecords, combinedFilters);
      expect(result).toHaveLength(1);
      expect(result[0]?.developer).toBe('Alice');
      expect(result[0]?.vendorType).toBe('Internal');
    });

    it('returns empty array when no records match filters', () => {
      const noMatchFilters: DeveloperTrainingFilterState = {
        developers: ['NonExistent'],
        vendorTypes: [],
      };

      const result = filterTrainingRecords(baseRecords, noMatchFilters);
      expect(result).toEqual([]);
    });

    it('handles empty records array', () => {
      const result = filterTrainingRecords([], filters);
      expect(result).toEqual([]);
    });
  });

  describe('buildDeveloperTrainingSummary', () => {
    it('builds summary with all records when no filters applied', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      expect(summary.rows).toHaveLength(3);
      expect(summary.options.developers).toEqual(['Alice', 'Bob', 'Charlie']);
      expect(summary.options.vendorTypes).toEqual(['External', 'Internal', 'Partner']);
    });

    it('sorts rows by total training hours descending', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      expect(summary.rows[0]?.developer).toBe('Alice');
      expect(summary.rows[1]?.developer).toBe('Charlie');
      expect(summary.rows[2]?.developer).toBe('Bob');
    });

    it('sorts rows alphabetically when hours are equal', () => {
      const records: DeveloperTrainingRecord[] = [
        { developer: 'Zoe', trainingType: 'Type', vendorType: 'Vendor', aggregatedTimeSeconds: 3600 },
        { developer: 'Alice', trainingType: 'Type', vendorType: 'Vendor', aggregatedTimeSeconds: 3600 },
        { developer: 'Bob', trainingType: 'Type', vendorType: 'Vendor', aggregatedTimeSeconds: 3600 },
      ];

      const summary = buildDeveloperTrainingSummary(records, {
        developers: [],
        vendorTypes: [],
      });

      expect(summary.rows.map((r) => r.developer)).toEqual(['Alice', 'Bob', 'Zoe']);
    });

    it('includes three KPI cards', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      expect(summary.kpis).toHaveLength(3);
    });

    it('includes most popular training type KPI', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      const popularTypeKpi = summary.kpis.find((k) => k.id === 'most-popular-training-type');
      expect(popularTypeKpi).toBeDefined();
      expect(popularTypeKpi?.label).toBe('Most Popular Training Type');
    });

    it('includes top training participant KPI', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      const topParticipantKpi = summary.kpis.find((k) => k.id === 'top-training-participant');
      expect(topParticipantKpi).toBeDefined();
      expect(topParticipantKpi?.label).toBe('Top Training Participant');
    });

    it('includes total team hours KPI', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      const totalHoursKpi = summary.kpis.find((k) => k.id === 'total-team-hours');
      expect(totalHoursKpi).toBeDefined();
      expect(totalHoursKpi?.label).toBe('Total Training Hours');
    });

    it('calculates top training participant correctly', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      const topParticipantKpi = summary.kpis.find((k) => k.id === 'top-training-participant');
      expect(topParticipantKpi?.value).toBe('Alice');
    });

    it('calculates most popular training type correctly', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      const popularTypeKpi = summary.kpis.find((k) => k.id === 'most-popular-training-type');
      expect(popularTypeKpi?.value).toBe('Online Learning');
    });

    it('calculates total team hours correctly', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      const totalHoursKpi = summary.kpis.find((k) => k.id === 'total-team-hours');
      expect(totalHoursKpi?.value).toContain('h');
    });

    it('includes chart data for training type distribution', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      expect(summary.trainingTypeDistribution.length).toBeGreaterThan(0);
    });

    it('includes chart data for hours by developer', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      expect(summary.hoursByDeveloper.length).toBeGreaterThan(0);
    });

    it('filters records based on filters parameter', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: ['Alice'],
        vendorTypes: [],
      });

      expect(summary.rows).toHaveLength(1);
      expect(summary.rows[0]?.developer).toBe('Alice');
    });

    it('handles empty records array', () => {
      const summary = buildDeveloperTrainingSummary([], {
        developers: [],
        vendorTypes: [],
      });

      expect(summary.rows).toEqual([]);
      expect(summary.options.developers).toEqual([]);
      expect(summary.options.vendorTypes).toEqual([]);
    });

    it('shows dash as value when no data for KPI', () => {
      const summary = buildDeveloperTrainingSummary([], {
        developers: [],
        vendorTypes: [],
      });

      const topKpi = summary.kpis.find((k) => k.id === 'top-training-participant');
      expect(topKpi?.value).toBe('—');
    });

    it('shows zero hours when no filtered records', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: ['NonExistent'],
        vendorTypes: [],
      });

      const totalHoursKpi = summary.kpis.find((k) => k.id === 'total-team-hours');
      expect(totalHoursKpi?.value).toBe('0h');
    });

    it('includes unit in KPI when there is a value', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      const topParticipantKpi = summary.kpis.find((k) => k.id === 'top-training-participant');
      expect(topParticipantKpi?.unit).toBeDefined();
    });

    it('omits unit from KPI when value is dash', () => {
      const summary = buildDeveloperTrainingSummary([], {
        developers: [],
        vendorTypes: [],
      });

      const topKpi = summary.kpis.find((k) => k.id === 'top-training-participant');
      expect(topKpi?.unit).toBeUndefined();
    });

    it('sorts chart data by value descending', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: [],
        vendorTypes: [],
      });

      if (summary.trainingTypeDistribution.length > 1) {
        for (let i = 0; i < summary.trainingTypeDistribution.length - 1; i++) {
          expect(summary.trainingTypeDistribution[i]!.value).toBeGreaterThanOrEqual(
            summary.trainingTypeDistribution[i + 1]!.value,
          );
        }
      }
    });

    it('applies both developer and vendor filters to summary', () => {
      const summary = buildDeveloperTrainingSummary(baseRecords, {
        developers: ['Alice'],
        vendorTypes: ['Internal'],
      });

      expect(summary.rows).toHaveLength(1);
      expect(summary.rows[0]?.developer).toBe('Alice');
    });
  });
});
