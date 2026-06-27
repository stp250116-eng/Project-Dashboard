import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test('renders KPI cards and charts', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
    await expect(page.getByLabel('Open Issues')).toBeVisible();
    await expect(page.getByLabel('Critical Defects')).toBeVisible();
  });
});
