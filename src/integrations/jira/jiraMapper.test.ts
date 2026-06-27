import { mapJiraIssue, mapJiraIssues } from './jiraMapper';
import { mapJiraDefect, mapJiraDefects, parseDefectRelease, normalizeSeverity } from './jiraMapper';
import type { RawJiraIssue } from './jiraTypes';
import { jiraSearchFixture } from '../../../test/fixtures/jiraIssues';
import { jiraDefectsFixture } from '../../../test/fixtures/jiraDefects';

describe('jiraMapper', () => {
  it('maps a raw issue to the domain model', () => {
    const [raw] = jiraSearchFixture.issues;
    const mapped = mapJiraIssue(raw);
    expect(mapped.key).toBe('DASH-101');
    expect(mapped.statusCategory).toBe('in-progress');
    expect(mapped.assignee).toBe('A. Patel');
    expect(mapped.storyPoints).toBe(5);
  });

  it('handles null assignee and missing story points', () => {
    const mapped = mapJiraIssue(jiraSearchFixture.issues[1]);
    expect(mapped.assignee).toBeNull();
    expect(mapped.storyPoints).toBeNull();
    expect(mapped.statusCategory).toBe('done');
  });

  it('maps a collection', () => {
    expect(mapJiraIssues(jiraSearchFixture.issues)).toHaveLength(2);
  });
});

describe('jiraMapper — defects', () => {
  it('parses the release token from a Fix Version name', () => {
    expect(parseDefectRelease(['OO Release v26.2.2 #R2026Q2'])).toBe('v26.2.2');
  });

  it('falls back to "No Release" when no version token exists', () => {
    expect(parseDefectRelease([])).toBe('No Release');
  });

  it('normalizes a prefixed severity label', () => {
    expect(normalizeSeverity('2 - High')).toBe('High');
    expect(normalizeSeverity(null)).toBe('Unknown');
  });

  it('maps a raw bug to the defect analytics model', () => {
    const defect = mapJiraDefect(jiraDefectsFixture.issues[0]);
    expect(defect.key).toBe('OO-1892');
    expect(defect.release).toBe('v26.2.2.1');
    expect(defect.severity).toBe('Low');
    expect(defect.owner).toBe('Wasapon');
  });

  it('handles missing assignee, severity, and fix version', () => {
    const defect = mapJiraDefect(jiraDefectsFixture.issues[4]);
    expect(defect.owner).toBe('Unassigned');
    expect(defect.severity).toBe('Unknown');
    expect(defect.release).toBe('No Release');
  });

  it('maps a collection of defects', () => {
    expect(mapJiraDefects(jiraDefectsFixture.issues)).toHaveLength(5);
  });
});

describe('jiraMapper — status & severity edge cases', () => {
  const buildIssue = (overrides: Partial<RawJiraIssue['fields']> = {}): RawJiraIssue => ({
    id: '1',
    key: 'DASH-1',
    fields: {
      summary: 'Edge case',
      status: { name: 'To Do', statusCategory: { key: 'to-do' } },
      assignee: null,
      priority: null,
      issuetype: { name: 'Task' },
      created: '2025-01-01T00:00:00.000Z',
      updated: '2025-01-01T00:00:00.000Z',
      ...overrides,
    },
  });

  it.each(['new', 'undefined', 'to-do', 'todo'])(
    'maps the "%s" status category key to todo',
    (key) => {
      const issue = buildIssue({ status: { name: 'X', statusCategory: { key } } });
      expect(mapJiraIssue(issue).statusCategory).toBe('todo');
    },
  );

  it('treats a blank severity option value as Unknown', () => {
    const issue = buildIssue({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      customfield_10709: { value: '' },
    });
    expect(mapJiraDefect(issue).severity).toBe('Unknown');
  });

  it('treats a non-option severity shape as Unknown', () => {
    const issue = buildIssue({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      customfield_10709: 'not-an-option',
    });
    expect(mapJiraDefect(issue).severity).toBe('Unknown');
  });

  it('treats an option object without a value as Unknown', () => {
    const issue = buildIssue({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      customfield_10709: { id: '1' },
    });
    expect(mapJiraDefect(issue).severity).toBe('Unknown');
  });

  it('returns Unknown when a severity label is only a numeric prefix', () => {
    expect(normalizeSeverity('2 - ')).toBe('Unknown');
  });

  it('maps a single-select root cause value', () => {
    const issue = buildIssue({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      customfield_11886: { value: 'Coding Error' },
    });
    expect(mapJiraDefect(issue).rootCause).toBe('Coding Error');
  });

  it('treats a missing root cause as Unknown', () => {
    expect(mapJiraDefect(buildIssue()).rootCause).toBe('Unknown');
  });

  it('treats a blank root cause option value as Unknown', () => {
    const issue = buildIssue({
      // eslint-disable-next-line @typescript-eslint/naming-convention
      customfield_11886: { value: '   ' },
    });
    expect(mapJiraDefect(issue).rootCause).toBe('Unknown');
  });
});
