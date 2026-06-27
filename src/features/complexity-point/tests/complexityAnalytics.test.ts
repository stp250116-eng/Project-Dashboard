import {
  buildComplexityAnalytics,
  filterComplexityRecords,
  getComplexityValueFromFields,
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

  it('reads the Jira custom complexity field when present', () => {
    expect(
      getComplexityValueFromFields({ customfield_10704: { value: '7' }, summary: 'Example' }),
    ).toBe(7);
  });
});
