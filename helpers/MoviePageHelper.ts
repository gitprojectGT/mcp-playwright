import { Page, Locator } from '@playwright/test';

export class MoviePageHelper {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // Navigation
    get url() {
        return 'https://debs-obrien.github.io/playwright-movies-app/';
    }

    // Search elements
    get searchButton(): Locator {
        return this.page.getByRole('button', { name: 'Search for a movie' });
    }

    get searchInput(): Locator {
        return this.page.getByRole('textbox', { name: 'Search Input' });
    }

    get loadingMessage(): Locator {
        return this.page.getByText('Please wait a moment');
    }

    // Movie elements
    getMovieHeading(title: string): Locator {
        return this.page.getByRole('heading', { name: new RegExp(`^${title}$`, 'i') }).first();
    }

    get firstMovieLink(): Locator {
        return this.page.getByRole('link', { name: /poster of .* rating/i }).first();
    }

    get movieTitleInDetails(): Locator {
        return this.page.getByRole('heading', { level: 1 });
    }

    // Movie details elements
    get synopsisHeading(): Locator {
        return this.page.getByRole('heading', { name: 'The Synopsis', level: 3 });
    }

    get genresHeading(): Locator {
        return this.page.getByRole('heading', { name: 'The Genres', level: 3 });
    }

    get movieRating(): Locator {
        return this.page.locator('main').getByText(/★/).first();
    }

    // Theme elements
    get darkModeButton(): Locator {
        return this.page.getByRole('button', { name: '☾' });
    }

    get lightModeButton(): Locator {
        return this.page.getByRole('button', { name: '☀' });
    }

    get bodyElement(): Locator {
        return this.page.locator('body');
    }

    // Pagination elements
    get page2Button(): Locator {
        return this.page.getByRole('button', { name: 'Page 2' });
    }

    get allMovieTitles(): Locator {
        return this.page.locator('li').filter({ hasText: /★/ }).locator('h2');
    }

    get movieCardsWithRating(): Locator {
        return this.page.locator('li').filter({ hasText: /★/ });
    }

    // Helper methods
    async navigateToHome() {
        await this.page.goto(this.url);
    }

    async searchForMovie(searchTerm: string) {
        await this.searchButton.click({ force: true });
        await this.page.waitForTimeout(1000); // Wait for animations
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
        const sorryHeading = this.page.getByRole('heading', { name: 'Sorry!', level: 3 });
        return !(await sorryHeading.isVisible());
    }
}
