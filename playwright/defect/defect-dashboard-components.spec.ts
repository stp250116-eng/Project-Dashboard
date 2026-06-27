import { test, expect, type Page, type TestInfo } from '@playwright/test';

/**
 * Component-level interaction tests for the Defect Dashboard.
 *
 * These specs exercise the KendoReact MultiSelect dropdowns (open / show
 * options / select / chip rendering) and the Reset affordance, attaching a PNG
 * screenshot of each key state to the HTML report so the visual outcome is
 * reviewable. The live Jira `/rest/api/3/search/jql` call is intercepted and
 * fulfilled with a deterministic fixture (CORS preflight included).
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
        assignee: { displayName: 'Apisit Prompha' },
        priority: { name: 'High' },
        issuetype: { name: 'Bug' },
        created: '2025-10-01T00:00:00.000Z',
        updated: '2025-10-01T00:00:00.000Z',
        fixVersions: [{ id: '3', name: 'OO Release v25.4.1 #R2025Q4' }],
        customfield_10709: { value: '3 - Medium' },
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

/** Attach a full-page PNG to the HTML report under the given label. */
const capture = async (page: Page, testInfo: TestInfo, name: string): Promise<void> => {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: true }),
    contentType: 'image/png',
  });
};

test.describe('Defect Dashboard — component interactions', () => {
  test.beforeEach(async ({ page }) => {
    await stubJira(page);
    await page.goto('/defect-dashboard');
    // Wait until data-driven UI is ready before interacting.
    await expect(page.getByLabel('Total Defects')).toBeVisible();
  });

  test('release dropdown opens and lists options', async ({ page }, testInfo) => {
    const release = page.getByLabel('Filter by release');
    await release.click();

    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    await expect(page.getByRole('option').first()).toBeVisible();
    await capture(page, testInfo, 'release-dropdown-open');

    // Releases are parsed from the Fix Version names (e.g. "v26.2.3").
    await expect(page.getByRole('option', { name: 'v26.2.3' })).toBeVisible();
  });

  test('developer dropdown opens and lists developers', async ({ page }, testInfo) => {
    const developer = page.getByLabel('Filter by developer');
    await developer.click();

    await expect(page.getByRole('listbox')).toBeVisible();
    await expect(page.getByRole('option', { name: 'Wasapon' })).toBeVisible();
    await capture(page, testInfo, 'developer-dropdown-open');
  });

  test('severity dropdown opens, selects an option, and renders a chip', async (
    { page },
    testInfo,
  ) => {
    const severity = page.getByLabel('Filter by severity');
    await severity.click();

    await expect(page.getByRole('listbox')).toBeVisible();
    await capture(page, testInfo, 'severity-dropdown-open');

    await page.getByRole('option', { name: 'High' }).click();

    const chip = page.locator('.k-chip-content', { hasText: 'High' }).first();
    await expect(chip).toBeVisible();
    await capture(page, testInfo, 'severity-chip-selected');
  });

  test('root cause dropdown opens, selects an option, and renders a chip', async (
    { page },
    testInfo,
  ) => {
    const rootCause = page.getByLabel('Filter by root cause');
    await rootCause.click();

    await expect(page.getByRole('listbox')).toBeVisible();
    await capture(page, testInfo, 'root-cause-dropdown-open');

    await page.getByRole('option', { name: 'Coding Error' }).click();

    const chip = page.locator('.k-chip-content', { hasText: 'Coding Error' }).first();
    await expect(chip).toBeVisible();
    await capture(page, testInfo, 'root-cause-chip-selected');
  });

  test('reset clears a selected filter chip', async ({ page }, testInfo) => {
    const severity = page.getByLabel('Filter by severity');
    await severity.click();
    await page.getByRole('option', { name: 'High' }).click();

    const chip = page.locator('.k-chip-content', { hasText: 'High' }).first();
    await expect(chip).toBeVisible();
    await capture(page, testInfo, 'before-reset');

    await page.getByRole('button', { name: 'Reset' }).click();

    await expect(page.locator('.k-chip-content', { hasText: 'High' })).toHaveCount(0);
    await capture(page, testInfo, 'after-reset');
  });
});
