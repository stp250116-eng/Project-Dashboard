import type { RawJiraSearchResponse } from '../../src/integrations/jira/jiraTypes';

/**
 * Realistic Jira search response for the "GET ALM DEFECT" filter. Mirrors the
 * shape returned by `project = OO AND issuetype = Bug` with Fix Version,
 * Severity (customfield_10709), and Root Cause (customfield_11886).
 */
export const jiraDefectsFixture: RawJiraSearchResponse = {
  isLast: true,
  issues: [
    {
      id: '20001',
      key: 'OO-1892',
      fields: {
        summary: '[DEFECT#98108] add api validate',
        status: { name: 'Done', statusCategory: { key: 'done' } },
        assignee: { displayName: 'Wasapon' },
        priority: { name: 'Medium' },
        issuetype: { name: 'Bug' },
        created: '2026-06-12T03:10:24.163-0500',
        updated: '2026-06-12T03:10:24.163-0500',
        fixVersions: [{ id: '1', name: 'OO Release v26.2.2.1 #R2026Q2' }],
        customfield_10709: { value: '4 - Low' },
        customfield_11886: { value: 'Coding Error' },
      },
    },
    {
      id: '20002',
      key: 'OO-1786',
      fields: {
        summary: '[DEFECT#98053] Group by Employee checkbox missing',
        status: { name: 'In Progress', statusCategory: { key: 'in-progress' } },
        assignee: { displayName: 'Yotin Sara' },
        priority: { name: 'High' },
        issuetype: { name: 'Bug' },
        created: '2026-06-04T04:32:57.489-0500',
        updated: '2026-06-04T04:32:57.489-0500',
        fixVersions: [{ id: '2', name: 'OO Release v26.2.3 #R2026Q2' }],
        customfield_10709: { value: '3 - Medium' },
        customfield_11886: { value: 'Requirement Gap' },
      },
    },
    {
      id: '20003',
      key: 'OO-1727',
      fields: {
        summary: '[Defect#96027] notification not displayed',
        status: { name: 'Done', statusCategory: { key: 'done' } },
        assignee: { displayName: 'Apisit Prompha' },
        priority: { name: 'High' },
        issuetype: { name: 'Bug' },
        created: '2026-05-26T09:59:45.585-0500',
        updated: '2026-05-26T09:59:45.585-0500',
        fixVersions: [{ id: '3', name: 'OO Release v26.2.2 #R2026Q2' }],
        customfield_10709: { value: '2 - High' },
        customfield_11886: { value: 'Coding Error' },
      },
    },
    {
      id: '20004',
      key: 'OO-1500',
      fields: {
        summary: '[DEFECT#90011] legacy regression',
        status: { name: 'Done', statusCategory: { key: 'done' } },
        assignee: { displayName: 'Wasapon' },
        priority: { name: 'Low' },
        issuetype: { name: 'Bug' },
        created: '2025-11-02T09:00:00.000-0500',
        updated: '2025-11-02T09:00:00.000-0500',
        fixVersions: [{ id: '4', name: 'OO Release v25.4.1 #R2025Q4' }],
        customfield_10709: { value: '3 - Medium' },
        customfield_11886: { value: 'Data Issue' },
      },
    },
    {
      id: '20005',
      key: 'OO-1499',
      fields: {
        summary: '[DEFECT#90001] missing validation, unassigned',
        status: { name: 'To Do', statusCategory: { key: 'to-do' } },
        assignee: null,
        priority: null,
        issuetype: { name: 'Bug' },
        created: '2025-09-15T09:00:00.000-0500',
        updated: '2025-09-15T09:00:00.000-0500',
        fixVersions: [],
        customfield_10709: null,
        customfield_11886: null,
      },
    },
  ],
};
