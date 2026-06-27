import { test, expect } from '@playwright/test';

test.describe('Jira Overview', () => {
  test('renders the issues grid', async ({ page }) => {
    await page.goto('/jira-overview');
    await expect(page.getByRole('heading', { name: 'Jira Overview', level: 1 })).toBeVisible();
    await expect(page.getByLabel('Open Issues')).toBeVisible();
  });
});
