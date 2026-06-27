import type { RawJiraSearchResponse } from '../../src/integrations/jira/jiraTypes';

/** Realistic Jira search response fixture used by MSW handlers and tests. */
export const jiraSearchFixture: RawJiraSearchResponse = {
  isLast: true,
  issues: [
    {
      id: '10001',
      key: 'DASH-101',
      fields: {
        summary: 'Add SSO support',
        status: { name: 'In Progress', statusCategory: { key: 'in-progress' } },
        assignee: { displayName: 'A. Patel' },
        priority: { name: 'High' },
        issuetype: { name: 'Story' },
        created: '2026-06-01T10:00:00.000Z',
        updated: '2026-06-12T10:00:00.000Z',
        customfield_10016: 5,
      },
    },
    {
      id: '10002',
      key: 'DASH-102',
      fields: {
        summary: 'Fix grid pagination',
        status: { name: 'Done', statusCategory: { key: 'done' } },
        assignee: null,
        priority: { name: 'Medium' },
        issuetype: { name: 'Bug' },
        created: '2026-06-03T10:00:00.000Z',
        updated: '2026-06-11T10:00:00.000Z',
      },
    },
  ],
};
