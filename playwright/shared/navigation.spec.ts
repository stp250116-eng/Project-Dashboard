import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test('navigates between primary sections', async ({ page }) => {
    await page.goto('/dashboard');

    await page.getByRole('link', { name: 'Jira Overview' }).click();
    await expect(page).toHaveURL(/\/jira-overview/);
    await expect(page.getByRole('heading', { name: 'Jira Overview', level: 1 })).toBeVisible();

    await page.getByRole('link', { name: 'Sprint Board' }).click();
    await expect(page).toHaveURL(/\/sprint-board/);
    await expect(page.getByRole('heading', { name: 'Sprint Board', level: 1 })).toBeVisible();

    await page.getByRole('link', { name: 'Reports' }).click();
    await expect(page).toHaveURL(/\/reports/);
    await expect(page.getByRole('heading', { name: 'Reports', level: 1 })).toBeVisible();
  });
});
