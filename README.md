# Playwright Movie App Tests

![Playwright Tests](https://github.com/gitprojectGT/mcp-playwright/actions/workflows/playwright.yml/badge.svg)

This repository contains automated tests for the Movie App using Playwright Test Framework.

## Features

- End-to-end testing of movie search and details functionality
- Page Object Model implementation with `MoviePageHelper` class
- Unit tests for helper methods
- GitHub Actions integration for continuous testing
- Automated test reports generation

## Running Tests

Install dependencies:
```bash
npm ci
```

Install Playwright browsers:
```bash
npx playwright install --with-deps
```

Run tests:
```bash
npx playwright test
```

## CI/CD

Tests are automatically run on:
- Every push to `master` branch
- Every pull request to `master` branch

### Manual Trigger
You can manually trigger the tests through GitHub Actions:
1. Go to the "Actions" tab in your repository
2. Click on "Playwright Tests" workflow
3. Click "Run workflow" button
4. Select the browser (chromium/firefox/webkit)
5. Click "Run workflow" to start the tests

Test reports are available in the GitHub Actions artifacts for each run.
