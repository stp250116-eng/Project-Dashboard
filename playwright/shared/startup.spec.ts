import { test, expect } from '@playwright/test';

test.describe('Application startup', () => {
  test('loads and redirects to the dashboard', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Enterprise Dashboard/);
    await expect(page.getByRole('banner')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Primary' })).toBeVisible();
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
