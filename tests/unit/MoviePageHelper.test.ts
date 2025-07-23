import { test, expect } from '@playwright/test';
import { MoviePageHelper } from '../../helpers/MoviePageHelper';

test.describe('MoviePageHelper', () => {
    test('should initialize with correct URL', async ({ page }) => {
        const helper = new MoviePageHelper(page);
        expect(helper.url).toBe('https://debs-obrien.github.io/playwright-movies-app/');
    });

    test('should get locators correctly', async ({ page }) => {
        const helper = new MoviePageHelper(page);
        
        // Test search-related locators
        expect(helper.searchButton).toBeDefined();
        expect(helper.searchInput).toBeDefined();
        expect(helper.loadingMessage).toBeDefined();

        // Test movie-related locators
        expect(helper.firstMovieLink).toBeDefined();
        expect(helper.movieTitleInDetails).toBeDefined();
        expect(helper.movieRating).toBeDefined();

        // Test theme-related locators
        expect(helper.darkModeButton).toBeDefined();
        expect(helper.lightModeButton).toBeDefined();
        expect(helper.bodyElement).toBeDefined();

        // Test pagination-related locators
        expect(helper.page2Button).toBeDefined();
        expect(helper.allMovieTitles).toBeDefined();
        expect(helper.movieCardsWithRating).toBeDefined();
    });

    test('should navigate to home page', async ({ page }) => {
        const helper = new MoviePageHelper(page);
        await helper.navigateToHome();
        expect(page.url()).toBe(helper.url);
    });

    test('should search for a movie', async ({ page }) => {
        const helper = new MoviePageHelper(page);
        await helper.navigateToHome();
        await helper.searchForMovie('Alien');

        // Verify search input is filled
        await expect(helper.searchInput).toHaveValue('Alien');

        // Verify we have search results
        expect(await helper.hasSearchResults()).toBe(true);

        // Verify search results appear
        await expect(helper.getMovieHeading('Alien')).toBeVisible();
    });

    test('should get first movie title', async ({ page }) => {
        const helper = new MoviePageHelper(page);
        await helper.navigateToHome();

        const title = await helper.getFirstMovieTitle();
        expect(title).not.toBeNull();
        expect(typeof title).toBe('string');
    });

    test('should wait for movie load', async ({ page }) => {
        const helper = new MoviePageHelper(page);
        await helper.navigateToHome();

        // Click page 2 and wait for load
        await helper.page2Button.click();
        await helper.waitForMovieLoad();

        // Verify new movies are loaded
        const movies = await helper.allMovieTitles.count();
        expect(movies).toBeGreaterThan(0);
    });

    test('should handle theme toggling', async ({ page }) => {
        const helper = new MoviePageHelper(page);
        await helper.navigateToHome();

        // Toggle dark mode
        await helper.darkModeButton.click();
        await expect(helper.bodyElement).toHaveAttribute('class', /dark/);

        // Toggle light mode
        await helper.lightModeButton.click();
        await expect(helper.bodyElement).not.toHaveAttribute('class', /dark/);
    });

    test('should handle movie details navigation', async ({ page }) => {
        const helper = new MoviePageHelper(page);
        await helper.navigateToHome();

        // Get first movie title and navigate to details
        const title = await helper.getFirstMovieTitle();
        await helper.firstMovieLink.click();

        // Verify movie details page elements
        await expect(helper.movieTitleInDetails).toBeVisible();
        await expect(helper.synopsisHeading).toBeVisible();
        await expect(helper.genresHeading).toBeVisible();
        await expect(helper.movieRating).toBeVisible();
    });

    test('should handle movie search with no results', async ({ page }) => {
        const helper = new MoviePageHelper(page);
        await helper.navigateToHome();
        await helper.searchForMovie('nonexistentmovietitle123456789');

        // Verify no results by checking for "Sorry!" message
        expect(await helper.hasSearchResults()).toBe(false);
    });

    test('should handle multiple movie results', async ({ page }) => {
        const helper = new MoviePageHelper(page);
        await helper.navigateToHome();
        
        // Search for a common term that should exist in the movies list
        await helper.searchForMovie('a');
        
        // Verify we have search results
        expect(await helper.hasSearchResults()).toBe(true);
        
        // Verify multiple results
        const movies = await helper.allMovieTitles.count();
        expect(movies).toBeGreaterThan(1);

        // Verify each movie has a rating
        const moviesWithRatings = await helper.movieCardsWithRating.count();
        expect(moviesWithRatings).toBe(movies);
    });
});
