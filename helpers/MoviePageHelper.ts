import { Page, Locator } from '@playwright/test';

/**
 * Configuration interface for MoviePageHelper
 * Allows customization of strings and selectors used in the helper
 */
export interface MoviePageConfig {
    baseUrl?: string;
    searchButtonText?: string;
    searchInputLabel?: string;
    searchPlaceholder?: string;
    loadingText?: string;
    synopsisHeading?: string;
    genresHeading?: string;
    darkModeSymbol?: string;
    lightModeSymbol?: string;
    page2ButtonText?: string;
    sorryHeading?: string;
    starSymbol?: string;
    movieLinkPattern?: RegExp;
}

/**
 * Default configuration for the Movie App
 */
const DEFAULT_CONFIG: Required<MoviePageConfig> = {
    baseUrl: 'https://debs-obrien.github.io/playwright-movies-app/',
    searchButtonText: 'Search for a movie',
    searchInputLabel: 'Search Input',
    searchPlaceholder: 'Search for a movie',
    loadingText: 'Please wait a moment',
    synopsisHeading: 'The Synopsis',
    genresHeading: 'The Genres',
    darkModeSymbol: '☾',
    lightModeSymbol: '☀',
    page2ButtonText: 'Page 2',
    sorryHeading: 'Sorry!',
    starSymbol: '★',
    movieLinkPattern: /poster of .* rating/i
};

/**
 * Helper class for interacting with the Movie App
 * Provides methods and locators for all major page interactions
 */
export class MoviePageHelper {
    readonly page: Page;
    private readonly config: Required<MoviePageConfig>;
    private readonly defaultTimeout = 30000;

    constructor(page: Page, config: MoviePageConfig = {}) {
        this.page = page;
        this.config = { ...DEFAULT_CONFIG, ...config };
    }

    // Navigation
    get url() {
        return this.config.baseUrl;
    }

    /**
     * Waits for search results to load
     * @returns Promise<boolean> true if results are found, false otherwise
     */
    private async waitForSearchResults(): Promise<boolean> {
        try {
            await this.allMovieTitles.first().waitFor({ timeout: 5000 });
            return true;
        } catch {
            return false;
        }
    }

    // Search elements
    get searchButton(): Locator {
        return this.page.getByRole('button', { name: this.config.searchButtonText }).or(this.page.getByLabel(this.config.searchButtonText));
    }

    get searchInput(): Locator {
        return this.page.getByRole('textbox', { name: this.config.searchInputLabel }).or(this.page.getByPlaceholder(this.config.searchPlaceholder));
    }

    get searchForm(): Locator {
        return this.page.getByRole('search');
    }

    get loadingMessage(): Locator {
        return this.page.getByText(this.config.loadingText);
    }

    /**
     * Initiates search interaction in a way that handles both expanded and collapsed search states
     */
    async initiateSearch(): Promise<void> {
        // Try clicking the form first if it's visible
        const form = await this.searchForm;
        if (await form.isVisible()) {
            await form.click();
            return;
        }
        
        // Fallback to button click if form isn't directly clickable
        await this.searchButton.click();
    }

    // Movie elements
    getMovieHeading(title: string): Locator {
        return this.page.getByRole('heading', { name: new RegExp(`^${title}$`, 'i') }).first();
    }

    get firstMovieLink(): Locator {
        return this.page.getByRole('link', { name: this.config.movieLinkPattern }).first();
    }

    get movieTitleInDetails(): Locator {
        return this.page.getByRole('heading', { level: 1 });
    }

    // Movie details elements
    get synopsisHeading(): Locator {
        return this.page.getByRole('heading', { name: this.config.synopsisHeading, level: 3 });
    }

    get genresHeading(): Locator {
        return this.page.getByRole('heading', { name: this.config.genresHeading, level: 3 });
    }

    get movieRating(): Locator {
        return this.page.locator('main').getByText(new RegExp(this.config.starSymbol)).first();
    }

    // Theme elements
    get darkModeButton(): Locator {
        return this.page.getByRole('button', { name: this.config.darkModeSymbol });
    }

    get lightModeButton(): Locator {
        return this.page.getByRole('button', { name: this.config.lightModeSymbol });
    }

    get bodyElement(): Locator {
        return this.page.locator('body');
    }

    // Pagination elements
    get page2Button(): Locator {
        return this.page.getByRole('button', { name: this.config.page2ButtonText });
    }

    get allMovieTitles(): Locator {
        return this.page.locator('li').filter({ hasText: new RegExp(this.config.starSymbol) }).locator('h2');
    }

    get movieCardsWithRating(): Locator {
        return this.page.locator('li').filter({ hasText: new RegExp(this.config.starSymbol) });
    }

    // Helper methods
    async navigateToHome() {
        await this.page.goto(this.url);
    }

    async searchForMovie(searchTerm: string) {
        await this.initiateSearch();
        await this.searchInput.fill(searchTerm);
        await this.searchInput.press('Enter');
        
        // Wait for loading state
        await this.waitForMovieLoad();

        // Wait for search results to appear
        await this.page.waitForSelector('main', { state: 'visible' });
    }

    async getFirstMovieTitle(): Promise<string | null> {
        const movieTitleElement = this.firstMovieLink.getByRole('heading');
        return await movieTitleElement.textContent();
    }

    async waitForMovieLoad() {
        // Wait for the loading message to appear and disappear if it's present
        const loadingMessageVisible = await this.loadingMessage.isVisible();
        if (loadingMessageVisible) {
            await this.loadingMessage.waitFor({ state: 'hidden' });
        }

        // Wait for either movie list or "Sorry!" message
        await this.page.waitForSelector('main', { state: 'visible' });
    }

    async hasSearchResults(): Promise<boolean> {
        const sorryHeading = this.page.getByRole('heading', { name: this.config.sorryHeading, level: 3 });
        return !(await sorryHeading.isVisible());
    }
}
