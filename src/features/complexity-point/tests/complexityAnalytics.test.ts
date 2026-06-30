import {
  buildComplexityAnalytics,
  filterComplexityRecords,
  getComplexityValueFromFields,
  parseComplexityValue,
} from '../services/complexityAnalytics.ts';
import type { ComplexityRecord } from '../models/complexityModels.ts';

const records: ComplexityRecord[] = [
  { assignee: 'Alice', complexity: 5 },
  { assignee: 'Bob', complexity: 3 },
  { assignee: 'Alice', complexity: 2 },
  { assignee: 'Cara', complexity: 4 },
];

describe('complexityAnalytics', () => {
  it('aggregates and sorts complexity points by assignee descending', () => {
    const result = buildComplexityAnalytics(records);

    expect(result.rows).toEqual([
      { assignee: 'Alice', complexity: 7 },
      { assignee: 'Cara', complexity: 4 },
      { assignee: 'Bob', complexity: 3 },
    ]);
    expect(result.options.assignees).toEqual(['Alice', 'Bob', 'Cara']);
    expect(result.kpis).toEqual([
      { id: 'employees', label: 'Total Employees', value: 3 },
      { id: 'complexity', label: 'Total Complexity', value: 14 },
      { id: 'highest', label: 'Highest Complexity', value: 7, unit: 'Alice' },
      { id: 'top-contributor', label: 'Top Complexity Contributor', value: 'Alice', unit: '7 pts' },
    ]);
  });

  it('filters records by the selected assignees', () => {
    const filtered = filterComplexityRecords(records, ['Alice']);

    expect(filtered).toEqual([
      { assignee: 'Alice', complexity: 5 },
      { assignee: 'Alice', complexity: 2 },
    ]);
  });

  it('preserves the full developer options list after filtering', () => {
    const filtered = filterComplexityRecords(records, ['Alice']);
    const result = buildComplexityAnalytics(filtered, records);

    expect(result.rows).toEqual([{ assignee: 'Alice', complexity: 7 }]);
    expect(result.options.assignees).toEqual(['Alice', 'Bob', 'Cara']);
  });

  it('returns zeroed analytics when there are no records', () => {
    const result = buildComplexityAnalytics([]);

    expect(result.rows).toEqual([]);
    expect(result.options.assignees).toEqual([]);
    expect(result.kpis).toEqual([
      { id: 'employees', label: 'Total Employees', value: 0 },
      { id: 'complexity', label: 'Total Complexity', value: 0 },
      { id: 'highest', label: 'Highest Complexity', value: 0, unit: undefined },
      { id: 'top-contributor', label: 'Top Complexity Contributor', value: '—', unit: undefined },
    ]);
  });

  it('reads the Jira custom complexity field when present', () => {
    expect(
      getComplexityValueFromFields({ customfield_10704: { value: '7' }, summary: 'Example' }),
    ).toBe(7);
  });

  it('falls back to other complexity-ish fields and defaults to zero for invalid values', () => {
    expect(getComplexityValueFromFields({ complexityField: '9' })).toBe(9);
    expect(getComplexityValueFromFields({ summary: 'Example' })).toBe(0);
    expect(getComplexityValueFromFields({ customfield_10704: 'bad' })).toBe(0);
  });

  it('parses numeric values directly and falls back to zero for empty input', () => {
    expect(parseComplexityValue(4)).toBe(4);
    expect(parseComplexityValue(null)).toBe(0);
  });

  it('uses the assignee name as a tie-breaker when complexities match', () => {
    const result = buildComplexityAnalytics([
      { assignee: 'Bob', complexity: 5 },
      { assignee: 'Alice', complexity: 5 },
    ]);

    expect(result.rows).toEqual([
      { assignee: 'Alice', complexity: 5 },
      { assignee: 'Bob', complexity: 5 },
    ]);
  });
});
