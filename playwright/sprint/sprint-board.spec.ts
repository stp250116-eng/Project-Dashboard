import { test, expect } from '@playwright/test';

test.describe('Sprint Board', () => {
  test('renders sprint KPIs', async ({ page }) => {
    await page.goto('/sprint-board');
    await expect(page.getByRole('heading', { name: 'Sprint Board', level: 1 })).toBeVisible();
    await expect(page.getByLabel('Committed')).toBeVisible();
  });
});
