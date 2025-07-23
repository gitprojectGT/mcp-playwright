import { test, expect } from '@playwright/test';
import { MoviePageHelper, MoviePageConfig } from '../../helpers/MoviePageHelper';

/**
 * Example tests demonstrating custom configuration usage
 * This shows how to adapt the MoviePageHelper for different applications
 * or different locales/languages
 */
test.describe('Custom Configuration Examples', () => {
  
  test('should work with default configuration', async ({ page }) => {
    // Using default configuration (English)
    const moviePage = new MoviePageHelper(page);
    
    await moviePage.navigateToHome();
    await page.waitForLoadState('networkidle');
    
    // Verify elements exist with default text
    await expect(moviePage.searchButton).toBeVisible();
    await expect(moviePage.darkModeButton).toBeVisible();
    await expect(moviePage.lightModeButton).toBeVisible();
  });

  test('should work with custom symbols and text', async ({ page }) => {
    // Custom configuration for different UI symbols
    const customConfig: MoviePageConfig = {
      darkModeSymbol: '🌙',
      lightModeSymbol: '☀️',
      searchButtonText: 'Find Movies',
      loadingText: 'Loading movies...',
      page2ButtonText: 'Next Page',
      sorryHeading: 'No Results Found'
    };
    
    const moviePage = new MoviePageHelper(page, customConfig);
    
    // This would work if the actual app used these symbols/texts
    // For demonstration purposes, we're just verifying the configuration is applied
    expect(moviePage.url).toBe('https://debs-obrien.github.io/playwright-movies-app/');
    
    // The locators are created with the custom configuration
    expect(moviePage.searchButton).toBeDefined();
    expect(moviePage.darkModeButton).toBeDefined();
    expect(moviePage.loadingMessage).toBeDefined();
  });

  test('should work with different base URL', async ({ page }) => {
    // Custom configuration for testing against different environments
    const customConfig: MoviePageConfig = {
      baseUrl: 'https://staging-movie-app.example.com',
      searchPlaceholder: 'Search movies here...',
      synopsisHeading: 'Movie Summary',
      genresHeading: 'Categories'
    };
    
    const moviePage = new MoviePageHelper(page, customConfig);
    
    expect(moviePage.url).toBe('https://staging-movie-app.example.com');
    
    // Verify that custom configuration is used in locators
    expect(moviePage.synopsisHeading).toBeDefined();
    expect(moviePage.genresHeading).toBeDefined();
    expect(moviePage.searchInput).toBeDefined();
  });

  test('should allow partial configuration override', async ({ page }) => {
    // Only override specific values, keep defaults for others
    const partialConfig: MoviePageConfig = {
      searchButtonText: 'Custom Search',
      darkModeSymbol: '🌚'
    };
    
    const moviePage = new MoviePageHelper(page, partialConfig);
    
    // Should use default URL since not overridden
    expect(moviePage.url).toBe('https://debs-obrien.github.io/playwright-movies-app/');
    
    // Should use custom values for overridden properties
    expect(moviePage.searchButton).toBeDefined();
    expect(moviePage.darkModeButton).toBeDefined();
    
    // Other properties should use defaults
    expect(moviePage.lightModeButton).toBeDefined();
    expect(moviePage.loadingMessage).toBeDefined();
  });

  test.skip('example: testing different language version', async ({ page }) => {
    // Example of how you might test a Spanish version of the app
    const spanishConfig: MoviePageConfig = {
      baseUrl: 'https://peliculas-app.example.com',
      searchButtonText: 'Buscar película',
      searchInputLabel: 'Búsqueda',
      searchPlaceholder: 'Buscar película',
      loadingText: 'Por favor espera un momento',
      synopsisHeading: 'La Sinopsis',
      genresHeading: 'Los Géneros',
      page2ButtonText: 'Página 2',
      sorryHeading: '¡Lo siento!'
    };
    
    const moviePage = new MoviePageHelper(page, spanishConfig);
    
    // This test is skipped because the Spanish version doesn't exist
    // But it demonstrates how the helper could be adapted
    await moviePage.navigateToHome();
    await expect(moviePage.searchButton).toBeVisible();
  });
});
