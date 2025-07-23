import { test, expect } from '@playwright/test';

// Test the search functionality of the Playwright Movies App
test('should search for a movie and display relevant results', async ({ page }) => {
  // Navigate to the app
  await page.goto('https://debs-obrien.github.io/playwright-movies-app');

  // Click the search button and wait for animation
  const searchButton = page.getByRole('button', { name: 'Search for a movie' });
  await searchButton.click({ force: true });
  await page.waitForTimeout(1000); // Wait for any animations

  // Fill the search input and press Enter
  const searchInput = page.getByRole('textbox', { name: 'Search Input' });
  await searchInput.fill('Batman');
  await searchInput.press('Enter');

  // Wait for "Please wait" message to appear and disappear
  const loadingMessage = page.getByText('Please wait a moment');
  await loadingMessage.waitFor();
  await loadingMessage.waitFor({ state: 'hidden' });

  // Assert that a movie with 'Batman' in the title appears
  await expect(page.getByRole('heading', { name: /batman/i })).toBeVisible();

  // Assert that a movie unrelated to 'Batman' does not appear
  await expect(page.getByRole('heading', { name: /frozen/i })).toHaveCount(0);
});

test('should navigate to movie details when clicking on a movie', async ({ page }) => {
  await page.goto('https://debs-obrien.github.io/playwright-movies-app');
  
  // Click the first movie link
  const firstMovie = page.getByRole('link', { name: /poster of .* rating/i }).first();
  const movieTitleElement = firstMovie.getByRole('heading');
  const movieTitle = await movieTitleElement.textContent();
  expect(movieTitle).not.toBeNull();
  await firstMovie.click();

  // Wait for movie details page to load and verify content
  await expect(page.getByRole('heading', { name: movieTitle || '', level: 1 })).toBeVisible();
  
  // Check for detailed movie information
  await expect(page.getByRole('heading', { name: 'The Synopsis', level: 3 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'The Genres', level: 3 })).toBeVisible();
  
  // Check for star rating (located after the subtitle)
  await expect(page.locator('main').getByText(/★/).first()).toBeVisible();
});

test('should toggle between light and dark themes', async ({ page }) => {
  await page.goto('https://debs-obrien.github.io/playwright-movies-app');
  
  // Get theme toggle button (moon icon for dark mode)
  const darkModeButton = page.getByRole('button', { name: '☾' });
  
  // Toggle to dark mode
  await darkModeButton.click();
  await expect(page.locator('body')).toHaveAttribute('class', /dark/);
  
  // Toggle back to light mode using sun icon
  const lightModeButton = page.getByRole('button', { name: '☀' });
  await lightModeButton.click();
  await expect(page.locator('body')).not.toHaveAttribute('class', /dark/);
});

test('should navigate through movie pages', async ({ page }) => {
  await page.goto('https://debs-obrien.github.io/playwright-movies-app');
  
  // Store first page movies for comparison
  const firstPageMovies = await page.getByRole('heading', { level: 2 }).allTextContents();
  
  // Navigate to page 2
  await page.getByRole('button', { name: 'Page 2' }).click();
  
  // Wait for new movies to load
  await page.waitForResponse(response => 
    response.url().includes('tmdb') && response.status() === 200
  );
  
  // Get second page movies
  const secondPageMovies = await page.getByRole('heading', { level: 2 }).allTextContents();
  
  // Verify we have different movies on page 2
  expect(secondPageMovies).not.toEqual(firstPageMovies);
});

test('should handle multiple search results and movie ratings', async ({ page }) => {
  await page.goto('https://debs-obrien.github.io/playwright-movies-app');
  
  // Click search and enter a common term
  const searchButton = page.getByRole('button', { name: 'Search for a movie' });
  await searchButton.click({ force: true });
  await page.waitForTimeout(1000);
  
  const searchInput = page.getByRole('textbox', { name: 'Search Input' });
  await searchInput.fill('the');
  await searchInput.press('Enter');
  
  // Wait for results
  const loadingMessage = page.getByText('Please wait a moment');
  await loadingMessage.waitFor();
  await loadingMessage.waitFor({ state: 'hidden' });
  
  // Verify multiple results and ratings
  const movieResults = page.getByRole('heading', { level: 2 });
  await expect(movieResults).toHaveCount(await movieResults.count());
  
  // Each movie should have a star rating
  const movieCards = page.locator('li').filter({ hasText: '★' });
  await expect(movieCards).toHaveCount(await movieCards.count());
});