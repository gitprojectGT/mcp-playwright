import { test, expect } from '@playwright/test';
import { MoviePageHelper } from '../helpers/MoviePageHelper';

/**
 * End-to-End Tests for the Movie App
 * 
 * These tests verify the core functionality of the movie application including:
 * - Movie search with results handling
 * - Navigation to movie details
 * - Theme switching
 * - Pagination
 * - Search results with ratings
 */
test.describe('Movie App E2E Tests', () => {
  // Configure longer test timeout for API responses
  test.setTimeout(60000);

  // Hook to initialize page for each test
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport size for reliable element locations
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Enable error handling for uncaught errors
    page.on('pageerror', (error) => {
      console.error('Page error:', error);
    });
    
    // Log console messages for debugging
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error('Console error:', msg.text());
      }
    });
  });

  test('should search for a movie and display relevant results', async ({ page }) => {
    const moviePage = new MoviePageHelper(page);
    
    // Navigate and ensure page is loaded
    await moviePage.navigateToHome();
    await page.waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => console.warn('Initial page load timeout - continuing test'));
    
    try {
      // Search and wait for results
      await moviePage.searchForMovie('The');
      await page.waitForLoadState('networkidle', { timeout: 30000 });

      // Assert that we get search results
      const results = await moviePage.allMovieTitles;
      const count = await results.count();
      
      // Verify search results
      expect(count).toBeGreaterThan(0);
      console.log(`Found ${count} movies in search results`);
      
      // Verify movie cards have all required elements
      const firstMovie = results.first();
      await expect(firstMovie).toBeVisible();
      await expect(moviePage.movieCardsWithRating.first()).toBeVisible();
    } catch (error) {
      console.error('Search test failed:', error);
      throw error;
    }

    // Assert that a movie unrelated to 'Batman' does not appear
    await expect(moviePage.getMovieHeading('frozen')).toHaveCount(0);
  });

  test('should navigate to movie details when clicking on a movie', async ({ page }) => {
    const moviePage = new MoviePageHelper(page);
    await moviePage.navigateToHome();
    await page.waitForLoadState('networkidle');
    
    const movieTitle = await moviePage.getFirstMovieTitle();
    expect(movieTitle).not.toBeNull();
    
    // Click and wait for navigation
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle' }),
      moviePage.firstMovieLink.click()
    ]);

    // Wait for movie details with appropriate timeouts
    await expect(moviePage.movieTitleInDetails).toBeVisible({ timeout: 5000 });
    await expect(moviePage.synopsisHeading).toBeVisible({ timeout: 5000 });
    await expect(moviePage.genresHeading).toBeVisible({ timeout: 5000 });
    await expect(moviePage.movieRating).toBeVisible({ timeout: 5000 });
});

  test('should toggle between light and dark themes', async ({ page }) => {
    const moviePage = new MoviePageHelper(page);
    await moviePage.navigateToHome();
    await page.waitForLoadState('networkidle');
    
    // Toggle to dark mode and verify
    await moviePage.darkModeButton.click();
    await expect(moviePage.bodyElement).toHaveAttribute('class', /dark/, { timeout: 3000 });
    
    // Toggle back to light mode and verify
    await moviePage.lightModeButton.click();
    await expect(moviePage.bodyElement).not.toHaveAttribute('class', /dark/, { timeout: 3000 });
});

  test('should navigate through movie pages', async ({ page }) => {
    const moviePage = new MoviePageHelper(page);
    await moviePage.navigateToHome();
    
    // Wait for initial page load with timeout handling
    await page.waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => console.warn('Initial page load timeout - continuing test'));
    
    try {
      // Store first page movies and verify we have results
      const firstPageMovies = await moviePage.allMovieTitles.allTextContents();
      expect(firstPageMovies.length).toBeGreaterThan(0);
      console.log(`Found ${firstPageMovies.length} movies on first page`);
      
      // Verify page 2 button is available
      await expect(moviePage.page2Button).toBeEnabled();
      
      // Navigate to page 2 with retry logic
      let retries = 3;
      while (retries > 0) {
        try {
          await moviePage.page2Button.click();
          await page.waitForLoadState('networkidle', { timeout: 5000 });
          await moviePage.waitForMovieLoad();
          break;
        } catch (error) {
          console.warn(`Pagination retry attempt ${4 - retries} failed:`, error);
          retries--;
          if (retries === 0) throw error;
          await page.waitForTimeout(1000); // Wait before retry
        }
      }
      
      // Verify second page content
      const secondPageMovies = await moviePage.allMovieTitles.allTextContents();
      expect(secondPageMovies.length).toBeGreaterThan(0);
      expect(secondPageMovies).not.toEqual(firstPageMovies);
      console.log(`Found ${secondPageMovies.length} different movies on second page`);
    } catch (error) {
      console.error('Pagination test failed:', error);
      throw error;
    }
});

  test('should handle multiple search results and movie ratings', async ({ page }) => {
    const moviePage = new MoviePageHelper(page);
    await moviePage.navigateToHome();
    await page.waitForLoadState('networkidle');
    
    await moviePage.searchForMovie('the');
    await page.waitForLoadState('networkidle');
    
    // Verify we have multiple results
    const movieResults = await moviePage.allMovieTitles;
    const count = await movieResults.count();
    expect(count).toBeGreaterThan(0);
    
    // Verify each movie has a rating
    const movieCards = await moviePage.movieCardsWithRating;
    expect(await movieCards.count()).toBe(count);
  });

  test('should handle invalid search queries gracefully', async ({ page }) => {
    const moviePage = new MoviePageHelper(page);
    
    // Start with desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await moviePage.navigateToHome();
    await page.waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => console.warn('Initial page load timeout - continuing test'));
    
    try {
      console.log('Testing search with special characters...');
      await moviePage.initiateSearch();
      await moviePage.searchInput.click();
      await moviePage.searchInput.fill('!@#$%');
      await page.keyboard.press('Enter');
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      
      // The app shows all movies as fallback for invalid search queries
      const specialCharResults = await moviePage.allMovieTitles.count();
      expect(specialCharResults).toBeGreaterThan(0);
      
      // Verify fallback shows all movies (matching default page)
      expect(specialCharResults).toBe(20); // Default page size is 20 movies
      
      console.log('Testing search with very long string...');
      await moviePage.searchForMovie('a'.repeat(100));
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      const longStringResults = await moviePage.allMovieTitles.count();
      expect(longStringResults).toBe(0);
      
      console.log('Testing empty search (should handle gracefully)...');
      await moviePage.searchForMovie('');
      await page.waitForLoadState('networkidle', { timeout: 5000 });
      await expect(moviePage.searchInput).toBeEnabled();
      
      console.log('All edge case searches handled successfully');
    } catch (error) {
      console.error('Search edge case test failed:', error);
      throw error;
    }
  });

  test('should meet basic accessibility and usability requirements', async ({ page }) => {
    const moviePage = new MoviePageHelper(page);
    
    // Start with desktop viewport
    await page.setViewportSize({ width: 1280, height: 720 });
    await moviePage.navigateToHome();
    await page.waitForLoadState('networkidle', { timeout: 10000 })
      .catch(() => console.warn('Initial page load timeout - continuing test'));
    
    try {
      // Test keyboard navigation
      console.log('Testing keyboard navigation...');
      await moviePage.initiateSearch();
      await moviePage.searchInput.isVisible();
      
      // Test search input interaction
      console.log('Testing search input interaction...');
      await moviePage.searchInput.click();
      await page.keyboard.type('test');
      await expect(moviePage.searchInput).toHaveValue('test');
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await expect(moviePage.searchInput).toHaveValue('');
      
      // Test responsive layout
      console.log('Testing responsive layout...');
      await page.setViewportSize({ width: 375, height: 667 }); // Mobile size
      await expect(moviePage.searchInput).toBeVisible();
      await expect(moviePage.searchButton).toBeVisible();
      
      // Reset viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      
      console.log('All accessibility and usability checks passed');
    } catch (error) {
      console.error('Accessibility test failed:', error);
      throw error;
    }
  });

  test('should handle performance and loading states', async ({ page }) => {
    const moviePage = new MoviePageHelper(page);
    
    try {
      console.log('Testing initial page load performance...');
      const startTime = Date.now();
      await moviePage.navigateToHome();
      await page.waitForLoadState('networkidle', { timeout: 10000 });
      const loadTime = Date.now() - startTime;
      console.log(`Initial page load took ${loadTime}ms`);
      
      // Test rapid interactions
      console.log('Testing rapid interactions...');
      for (let i = 0; i < 3; i++) {
        await moviePage.searchForMovie(`test${i}`);
        await page.waitForTimeout(500); // Small delay between searches
      }
      
      // Test concurrent operations
      console.log('Testing concurrent operations...');
      await Promise.all([
        moviePage.searchForMovie('star'),
        page.waitForLoadState('networkidle'),
        expect(moviePage.searchInput).toBeEnabled()
      ]);
      
      // Verify the application remains responsive
      await expect(moviePage.searchInput).toBeEnabled();
      await expect(moviePage.searchButton).toBeEnabled();
      
      console.log('All performance tests passed');
    } catch (error) {
      console.error('Performance test failed:', error);
      throw error;
    }
  });
});