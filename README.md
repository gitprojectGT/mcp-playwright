# Playwright Movie App Tests

![Playwright Tests](https://github.com/gitprojectGT/mcp-playwright/actions/workflows/playwright.yml/badge.svg)

This repository contains automated tests for the Movie App using Playwright Test Framework with Docker containerization and MCP (Model Context Protocol) support.

## Features

- End-to-end testing of movie search and details functionality
- Configurable Page Object Model implementation with `MoviePageHelper` class
- Support for different environments, languages, and UI variations through configuration
- Unit tests for helper methods
- GitHub Actions integration for continuous testing
- Allure reporting for detailed test results and analytics
- Automated test reports generation
- Docker containerization for cross-platform test execution
- MCP integration for enhanced test execution and reporting
- Cross-platform command-line scripts (Linux/macOS/Windows)

## MoviePageHelper Configuration

The `MoviePageHelper` class now supports custom configuration to adapt to different applications, environments, or UI variations:

### Basic Usage (Default Configuration)
```typescript
import { MoviePageHelper } from './helpers/MoviePageHelper';

// Uses default configuration for the movie app
const moviePage = new MoviePageHelper(page);
```

### Custom Configuration
```typescript
import { MoviePageHelper, MoviePageConfig } from './helpers/MoviePageHelper';

const customConfig: MoviePageConfig = {
  baseUrl: 'https://staging-movie-app.com',
  searchButtonText: 'Find Movies',
  darkModeSymbol: '🌙',
  lightModeSymbol: '☀️',
  loadingText: 'Loading movies...'
};

const moviePage = new MoviePageHelper(page, customConfig);
```

### Available Configuration Options

| Property | Default Value | Description |
|----------|---------------|-------------|
| `baseUrl` | `'https://debs-obrien.github.io/playwright-movies-app/'` | Base URL of the application |
| `searchButtonText` | `'Search for a movie'` | Text/label for the search button |
| `searchInputLabel` | `'Search Input'` | Label for the search input field |
| `searchPlaceholder` | `'Search for a movie'` | Placeholder text for search input |
| `loadingText` | `'Please wait a moment'` | Loading message text |
| `synopsisHeading` | `'The Synopsis'` | Synopsis section heading |
| `genresHeading` | `'The Genres'` | Genres section heading |
| `darkModeSymbol` | `'☾'` | Dark mode button symbol |
| `lightModeSymbol` | `'☀'` | Light mode button symbol |
| `page2ButtonText` | `'Page 2'` | Page 2 navigation button text |
| `sorryHeading` | `'Sorry!'` | No results message heading |
| `starSymbol` | `'★'` | Star rating symbol |
| `movieLinkPattern` | `/poster of .* rating/i` | Pattern for movie link recognition |

### Use Cases

1. **Different Environments**: Test against staging, production, or local environments
2. **Internationalization**: Support different languages and locales
3. **UI Variations**: Adapt to different themes or symbol sets
4. **A/B Testing**: Test different UI variations with the same test logic

## Running Tests

### Prerequisites

Install dependencies:
```bash
npm ci
```

Install Playwright browsers:
```bash
npx playwright install --with-deps
```

### Basic Test Execution

Run all tests:
```bash
npm test
```

Run tests in headed mode (with browser UI):
```bash
npm run test:headed
```

Run tests in debug mode:
```bash
npm run test:debug
```

Run unit tests only:
```bash
npm run test:unit
```

Run integration tests only:
```bash
npm run test:integration
```

### Allure Reporting

Run tests with Allure reporting:
```bash
npm run test:allure
```

Generate Allure report:
```bash
npm run allure:generate
```

Serve Allure report:
```bash
npm run allure:serve
```

Open generated Allure report:
```bash
npm run allure:open
```

### Advanced Playwright Commands

Run specific test file:
```bash
npx playwright test tests/sonnet_test.spec.ts
```

Run tests with specific browser:
```bash
npx playwright test --project chromium
npx playwright test --project firefox  
npx playwright test --project webkit
```

Run tests matching pattern:
```bash
npx playwright test --grep "search"
```

Run tests with UI mode:
```bash
npx playwright test --ui
```

Show test report:
```bash
npx playwright show-report
```

## Docker Usage

This project supports Docker containerization for cross-platform test execution with MCP integration.

### Prerequisites

- Docker Desktop installed and running
- Git (for cloning the repository)

### Quick Start

1. **Build the Docker image:**
   ```bash
   docker build -t mcp-playwright-tests .
   ```

2. **Run all tests with Docker:**
   ```bash
   # Linux/macOS
   ./run-tests.sh

   # Windows
   run-tests.bat
   ```

### Docker Commands

#### Using Shell Scripts (Recommended)

**Linux/macOS (`run-tests.sh`):**
```bash
# Make executable (first time only)
chmod +x run-tests.sh

# Run all tests
./run-tests.sh

# Run with options
./run-tests.sh --browser firefox --project "Mobile Chrome"
./run-tests.sh --headed --debug
./run-tests.sh --grep "search"
```

**Windows (`run-tests.bat`):**
```cmd
# Run all tests
run-tests.bat

# Run with options
run-tests.bat --browser webkit --project "Desktop Safari"
run-tests.bat --headed --debug
```

#### Manual Docker Commands

**Basic test execution:**
```bash
docker run --rm \
  -v ${PWD}/test-results:/app/test-results \
  -v ${PWD}/allure-results:/app/allure-results \
  mcp-playwright-tests npm test
```

**Run specific tests:**
```bash
docker run --rm \
  -v ${PWD}/test-results:/app/test-results \
  -v ${PWD}/allure-results:/app/allure-results \
  mcp-playwright-tests npx playwright test --grep "search"
```

**Run with specific browser:**
```bash
docker run --rm \
  -v ${PWD}/test-results:/app/test-results \
  -v ${PWD}/allure-results:/app/allure-results \
  mcp-playwright-tests npx playwright test --project chromium
```

### Docker Compose

For more complex setups with Allure reporting server:

```bash
# Run tests only
docker-compose up playwright-tests

# Run tests with Allure report server
docker-compose --profile allure up

# Run in detached mode
docker-compose --profile allure up -d

# View Allure reports at http://localhost:5050
```

### Cross-Platform Support

The Docker setup works on:
- **Linux** (native Docker)
- **macOS** (Docker Desktop)
- **Windows** (Docker Desktop, WSL2, or native)
- **Ubuntu on Windows** (via WSL2 or VM)

### Script Features

Both shell scripts (`run-tests.sh` and `run-tests.bat`) support:
- ✅ Automatic Docker image building
- ✅ Volume mounting for persistent reports
- ✅ All Playwright CLI options pass-through
- ✅ Colored output and status messages
- ✅ Cross-platform compatibility
- ✅ Error handling and cleanup

## Allure Reporting

This project uses Allure for comprehensive test reporting with the following features:

- **Rich Test Reports**: Visual reports with test execution details, screenshots, and logs
- **Test Analytics**: Historical data, trends, and flaky test detection
- **Integration**: Automatically generated in CI/CD pipeline
- **Artifacts**: Test results and reports are saved as GitHub Actions artifacts

### Available Scripts

- `npm run test:allure` - Run tests with Allure reporter
- `npm run allure:generate` - Generate static HTML report from results
- `npm run allure:serve` - Start local server to view report
- `npm run allure:open` - Open generated report in browser

## CI/CD

The test workflow runs in two stages with Allure reporting:

1. **Unit Tests**
   - Runs tests in `tests/unit/` directory
   - Must pass before integration tests can start
   - Generates both HTML and Allure reports
   - Artifacts: "unit-test-report", "unit-allure-report", "unit-allure-results"

2. **Integration Tests**
   - Runs only after unit tests pass
   - Executes all non-unit tests
   - Can be run on different browsers (chromium/firefox/webkit)
   - Generates both HTML and Allure reports
   - Artifacts: "integration-test-report", "integration-allure-report", "integration-allure-results"
   - Test report available as "integration-test-report" artifact

Tests are automatically run on:
- Every push to `master` branch
- Every pull request to `master` branch

### Manual Trigger
You can manually trigger the tests through GitHub Actions:
1. Go to the "Actions" tab in your repository
2. Click on "Playwright Tests" workflow
3. Click "Run workflow" button
4. Select the browser for integration tests (chromium/firefox/webkit)
5. Click "Run workflow" to start the tests

Both unit test and integration test reports are available in the GitHub Actions artifacts for each run.
