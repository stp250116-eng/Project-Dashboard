import { test, expect, type Page } from '@playwright/test';

/**
 * Defect dashboard E2E. The browser never holds a Jira token, so the live
 * `/rest/api/3/search/jql` call is intercepted and fulfilled with a
 * deterministic fixture (also covering the CORS preflight) to exercise the
 * full UI.
 */
const defectsPayload = {
  isLast: true,
  issues: [
    {
      id: '30001',
      key: 'OO-9001',
      fields: {
        summary: 'Defect A',
        status: { name: 'Done', statusCategory: { key: 'done' } },
        assignee: { displayName: 'Wasapon' },
        priority: { name: 'Medium' },
        issuetype: { name: 'Bug' },
        created: '2026-03-01T00:00:00.000Z',
        updated: '2026-03-01T00:00:00.000Z',
        fixVersions: [{ id: '1', name: 'OO Release v26.2.3 #R2026Q2' }],
        customfield_10709: { value: '2 - High' },
        customfield_11886: { value: 'Coding Error' },
      },
    },
    {
      id: '30002',
      key: 'OO-9002',
      fields: {
        summary: 'Defect B',
        status: { name: 'Done', statusCategory: { key: 'done' } },
        assignee: { displayName: 'Yotin Sara' },
        priority: { name: 'Low' },
        issuetype: { name: 'Bug' },
        created: '2026-02-01T00:00:00.000Z',
        updated: '2026-02-01T00:00:00.000Z',
        fixVersions: [{ id: '2', name: 'OO Release v26.1.2 #R2026Q1' }],
        customfield_10709: { value: '4 - Low' },
        customfield_11886: { value: 'Requirement Gap' },
      },
    },
    {
      id: '30003',
      key: 'OO-9003',
      fields: {
        summary: 'Defect C',
        status: { name: 'Done', statusCategory: { key: 'done' } },
        assignee: { displayName: 'Wasapon' },
        priority: { name: 'Medium' },
        issuetype: { name: 'Bug' },
        created: '2025-10-01T00:00:00.000Z',
        updated: '2025-10-01T00:00:00.000Z',
        fixVersions: [{ id: '3', name: 'OO Release v25.4.1 #R2025Q4' }],
        customfield_10709: { value: '3 - Medium' },
        customfield_11886: { value: 'Coding Error' },
      },
    },
    {
      id: '30004',
      key: 'OO-9004',
      fields: {
        summary: 'Defect D',
        status: { name: 'To Do', statusCategory: { key: 'to-do' } },
        assignee: { displayName: 'Apisit Prompha' },
        priority: { name: 'High' },
        issuetype: { name: 'Bug' },
        created: '2025-08-01T00:00:00.000Z',
        updated: '2025-08-01T00:00:00.000Z',
        fixVersions: [{ id: '4', name: 'OO Release v25.3.1 #R2025Q3' }],
        customfield_10709: { value: '2 - High' },
        customfield_11886: { value: 'Data Issue' },
      },
    },
  ],
};

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': '*',
  'access-control-allow-methods': 'GET,OPTIONS',
};

const stubJira = async (page: Page): Promise<void> => {
  await page.route('**/rest/api/3/search/jql*', async (route) => {
    if (route.request().method() === 'OPTIONS') {
      await route.fulfill({ status: 204, headers: CORS_HEADERS });
      return;
    }
    await route.fulfill({
      status: 200,
      headers: { 'content-type': 'application/json', ...CORS_HEADERS },
      body: JSON.stringify(defectsPayload),
    });
  });
};

test.describe('Defect Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await stubJira(page);
    await page.goto('/defect-dashboard');
  });

  test('renders the heading and KPI cards', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Defect Dashboard', level: 1 })).toBeVisible();
    await expect(page.getByLabel('Total Defects')).toBeVisible();
    await expect(page.getByLabel('Total Developers')).toBeVisible();
    await expect(page.getByLabel('Most Frequent Severity')).toBeVisible();
    await expect(page.getByLabel('Top Defect Developer')).toBeVisible();
  });

  test('renders the analytics charts', async ({ page }) => {
    await expect(page.getByRole('region', { name: 'Defect trend by release' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Defects by severity' })).toBeVisible();
    await expect(
      page.getByRole('region', { name: 'Top developers with most defects' }),
    ).toBeVisible();
    await expect(page.getByRole('region', { name: 'Root cause distribution' })).toBeVisible();
  });

  test('filters by root cause', async ({ page }) => {
    await expect(page.getByLabel('Total Defects')).toBeVisible();
    const rootCause = page.getByLabel('Filter by root cause');
    await rootCause.click();
    await page.getByRole('option', { name: 'Coding Error' }).click();
    await expect(
      page.locator('.k-chip-content', { hasText: 'Coding Error' }).first(),
    ).toBeVisible();
  });

  test('filters by severity', async ({ page }) => {
    await expect(page.getByLabel('Total Defects')).toBeVisible();
    const severity = page.getByLabel('Filter by severity');
    await severity.click();
    await page.getByRole('option', { name: 'High' }).click();
    // The selected token should appear in the multi-select.
    await expect(page.locator('.k-chip-content', { hasText: 'High' }).first()).toBeVisible();
  });
});
