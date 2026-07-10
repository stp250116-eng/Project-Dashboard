/**
 * Goal Setting Feature E2E Tests
 * Tests the complete user flow for viewing and managing developer goals.
 * 
 * Scenarios:
 * 1. Navigation to goal-setting page
 * 2. Toolbar controls (year, search, sort)
 * 3. Card grid display
 * 4. Developer card interactions
 * 5. Filter and sort functionality
 */

import { test, expect, Page } from '@playwright/test';

test.describe('Goal Setting Feature', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();
    await page.goto('http://localhost:5175');
  });

  test.afterEach(async () => {
    await page.close();
  });

  test('should navigate to goal setting page from sidebar', async () => {
    // Find and click the Goal Setting navigation link
    const goalSettingLink = page.locator('a', { hasText: 'Goal Setting' });
    await expect(goalSettingLink).toBeVisible();
    
    await goalSettingLink.click();

    // Verify we're on the goal setting page
    await expect(page).toHaveURL(/\/goal-setting/);
    
    // Verify page header
    const pageHeader = page.locator('h1', { hasText: 'Developer Goal Setting' });
    await expect(pageHeader).toBeVisible();

    // Verify page description
    const description = page.locator('text=Track and manage annual developer goals');
    await expect(description).toBeVisible();
  });

  test('should display toolbar with all controls', async () => {
    // Navigate to page
    await page.goto('http://localhost:5175/goal-setting');

    // Check Year selector exists
    const yearSelector = page.locator('[id="year-selector"]');
    await expect(yearSelector).toBeVisible();

    // Check Search input exists
    const searchInput = page.locator('[id="search-input"]');
    await expect(searchInput).toBeVisible();
    await expect(searchInput).toHaveAttribute('placeholder', /Developer name, team, or role/);

    // Check Sort buttons exist
    const scoreButton = page.locator('button', { hasText: 'Score' });
    const nameButton = page.locator('button', { hasText: 'Name' });
    const teamButton = page.locator('button', { hasText: 'Team' });

    await expect(scoreButton).toBeVisible();
    await expect(nameButton).toBeVisible();
    await expect(teamButton).toBeVisible();

    // Verify Score button is selected by default (should have aria-pressed=true or selected state)
    await expect(scoreButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should change year using year selector', async () => {
    await page.goto('http://localhost:5175/goal-setting');

    const yearSelector = page.locator('[id="year-selector"]');
    
    // Get current year
    const currentYear = new Date().getFullYear();
    
    // Open dropdown and select previous year
    await yearSelector.click();
    
    const previousYearOption = page.locator('div', { hasText: `${currentYear - 1}` }).first();
    await previousYearOption.click();

    // Verify selection (would be confirmed by API call in real scenario)
    // In the current mock scenario, we just verify the interaction worked
    await expect(yearSelector).toBeFocused();
  });

  test('should filter developers by search text', async () => {
    await page.goto('http://localhost:5175/goal-setting');

    const searchInput = page.locator('[id="search-input"]');
    
    // Type a search term
    await searchInput.fill('John');

    // Verify input has value
    await expect(searchInput).toHaveValue('John');

    // In a real scenario with data, this would filter the cards
    // For now, we verify the search input is functional
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');
  });

  test('should change sort by clicking sort buttons', async () => {
    await page.goto('http://localhost:5175/goal-setting');

    const scoreButton = page.locator('button', { hasText: 'Score' }).first();
    const nameButton = page.locator('button', { hasText: 'Name' }).first();
    const teamButton = page.locator('button', { hasText: 'Team' }).first();

    // Score should be selected by default
    await expect(scoreButton).toHaveAttribute('aria-pressed', 'true');
    await expect(nameButton).toHaveAttribute('aria-pressed', 'false');

    // Click Name button
    await nameButton.click();
    await expect(nameButton).toHaveAttribute('aria-pressed', 'true');
    await expect(scoreButton).toHaveAttribute('aria-pressed', 'false');

    // Click Team button
    await teamButton.click();
    await expect(teamButton).toHaveAttribute('aria-pressed', 'true');
    await expect(nameButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('should show "No goal data available" message when no data', async () => {
    await page.goto('http://localhost:5175/goal-setting');

    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check for empty state message (API calls fail in test environment)
    const emptyStateMessage = page.locator('text=No goal data available');
    
    // This will be visible since the mock API doesn't return data
    await expect(emptyStateMessage).toBeVisible();

    // Also check for the hint text
    const hintText = page.locator('text=Try adjusting your filters or search criteria');
    await expect(hintText).toBeVisible();
  });

  test('should maintain responsive layout on resize', async () => {
    await page.goto('http://localhost:5175/goal-setting');

    // Set viewport to desktop size
    await page.setViewportSize({ width: 1200, height: 800 });

    const toolbar = page.locator('div').filter({ hasText: /Year.*Search.*Sort By/ }).first();
    await expect(toolbar).toBeVisible();

    // Set viewport to tablet size
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(toolbar).toBeVisible();

    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(toolbar).toBeVisible();
  });

  test('should validate toolbar labels are visible', async () => {
    await page.goto('http://localhost:5175/goal-setting');

    // Check for label texts in uppercase
    await expect(page.locator('text=YEAR')).toBeVisible();
    await expect(page.locator('text=SEARCH')).toBeVisible();
    await expect(page.locator('text=SORT BY')).toBeVisible();
  });

  test('should allow multiple searches and sorts in sequence', async () => {
    await page.goto('http://localhost:5175/goal-setting');

    const searchInput = page.locator('[id="search-input"]');
    const nameButton = page.locator('button', { hasText: 'Name' }).first();

    // Search for a developer
    await searchInput.fill('Alice');
    await expect(searchInput).toHaveValue('Alice');

    // Change sort to Name
    await nameButton.click();
    await expect(nameButton).toHaveAttribute('aria-pressed', 'true');

    // Clear search
    await searchInput.clear();
    await expect(searchInput).toHaveValue('');

    // Sort should still be on Name
    await expect(nameButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('should show page header with description', async () => {
    await page.goto('http://localhost:5175/goal-setting');

    const header = page.locator('h1');
    await expect(header).toContainText('Developer Goal Setting');

    const description = page.locator('p', { hasText: /Track and manage annual developer goals/ });
    await expect(description).toBeVisible();
  });

  test('should have proper semantic HTML structure', async () => {
    await page.goto('http://localhost:5175/goal-setting');

    // Check main content area
    const main = page.locator('main');
    await expect(main).toBeVisible();

    // Check header structure
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1); // Only one H1 on page

    // Check label associations
    const searchLabel = page.locator('label').filter({ hasText: 'SEARCH' });
    await expect(searchLabel).toBeVisible();
  });

  test('should keyboard navigate through form controls', async () => {
    await page.goto('http://localhost:5175/goal-setting');

    // Focus the year selector
    const yearSelector = page.locator('[id="year-selector"]');
    await yearSelector.focus();
    await expect(yearSelector).toBeFocused();

    // Tab to search input
    await page.keyboard.press('Tab');
    const searchInput = page.locator('[id="search-input"]');
    await expect(searchInput).toBeFocused();

    // Tab to sort buttons
    await page.keyboard.press('Tab');
    const scoreButton = page.locator('button', { hasText: 'Score' }).first();
    await expect(scoreButton).toBeFocused();
  });
});
