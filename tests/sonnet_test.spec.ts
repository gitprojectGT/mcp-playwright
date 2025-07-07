import { test, expect } from '@playwright/test';

// Test the search functionality of the Playwright Movies App
test('should search for a movie and display relevant results', async ({ page }) => {
  // Navigate to the app
  await page.goto('https://debs-obrien.github.io/playwright-movies-app');

  // Try to click the magnifier icon inside the 'Search for a movie' button
  const searchButton = page.locator('button[aria-label="Search for a movie"]');
  const magnifierIcon = searchButton.locator('img');
  await magnifierIcon.click({ force: true });

  // Now try to fill the search input
  await page.locator('#search-input-mobile').fill('Batman');

  // Assert that a movie with 'Batman' in the title appears
  await expect(page.getByRole('heading', { name: /batman/i })).toBeVisible();

  // Assert that a movie unrelated to 'Batman' does not appear
  await expect(page.getByRole('heading', { name: /frozen/i })).toHaveCount(0);
});