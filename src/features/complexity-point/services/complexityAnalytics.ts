import type { ComplexityRecord, ComplexitySummary } from '../models/complexityModels';

export const parseComplexityValue = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value.trim());
    return Number.isFinite(parsed) ? parsed : 0;
  }

  if (value && typeof value === 'object' && 'value' in value) {
    return parseComplexityValue((value as { value: unknown }).value);
  }

  return 0;
};

export const getComplexityValueFromFields = (fields: Record<string, unknown>): number => {
  const explicit = fields.customfield_10704 ?? fields.customfield_11530;
  if (explicit !== undefined) {
    const parsed = parseComplexityValue(explicit);
    if (parsed > 0) {
      return parsed;
    }
  }

  for (const [key, value] of Object.entries(fields)) {
    if (/complexity/i.test(key)) {
      const parsed = parseComplexityValue(value);
      if (parsed > 0) {
        return parsed;
      }
    }
  }

  return 0;
};

const distinctSorted = (values: readonly string[]): string[] =>
  Array.from(new Set(values)).sort((a, b) => a.localeCompare(b));

export const filterComplexityRecords = (
  records: readonly ComplexityRecord[],
  assignees: readonly string[],
): ComplexityRecord[] => {
  if (assignees.length === 0) {
    return [...records];
  }

  return records.filter((record) => assignees.includes(record.assignee));
};

export const buildComplexityAnalytics = (
  records: readonly ComplexityRecord[],
  allRecords: readonly ComplexityRecord[] = records,
): ComplexitySummary => {
  const byAssignee = new Map<string, number>();

  for (const record of records) {
    const current = byAssignee.get(record.assignee) ?? 0;
    byAssignee.set(record.assignee, current + record.complexity);
  }

  const rows = Array.from(byAssignee.entries())
    .map(([assignee, complexity]) => ({ assignee, complexity }))
    .sort((a, b) => b.complexity - a.complexity || a.assignee.localeCompare(b.assignee));

  const assignees = distinctSorted(allRecords.map((record) => record.assignee));

  const totalEmployees = rows.length;
  const totalComplexity = rows.reduce((sum, row) => sum + row.complexity, 0);
  const highest = rows[0];

  return {
    rows,
    options: { assignees },
    kpis: [
      { id: 'employees', label: 'Total Employees', value: totalEmployees },
      { id: 'complexity', label: 'Total Complexity', value: totalComplexity },
      {
        id: 'highest',
        label: 'Highest Complexity',
        value: highest?.complexity ?? 0,
        unit: highest ? `${highest.assignee}` : undefined,
      },
      {
        id: 'top-contributor',
        label: 'Top Complexity Contributor',
        value: highest?.assignee ?? '—',
        unit: highest ? `${highest.complexity} pts` : undefined,
      },
    ],
  };
};
