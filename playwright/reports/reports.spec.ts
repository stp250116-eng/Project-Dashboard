import { test, expect } from '@playwright/test';

test.describe('Reports', () => {
  test('renders export actions', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.getByRole('heading', { name: 'Reports', level: 1 })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Export Excel' })).toBeVisible();
  });
});
