@echo off
setlocal enabledelayedexpansion

REM Colors for Windows
set "GREEN=[92m"
set "BLUE=[94m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

REM Set default image name
set "IMAGE_NAME=mcp-playwright-tests"

REM Function to display usage
if "%1"=="--help" (
    echo.
    echo %BLUE%MCP Playwright Tests - Docker Runner for Windows%NC%
    echo.
    echo %GREEN%Usage:%NC%
    echo   run-tests.bat [options]
    echo.
    echo %GREEN%Options:%NC%
    echo   --help              Show this help message
    echo   --build             Force rebuild of Docker image
    echo   --browser [name]    Run with specific browser
    echo   --project [name]    Run specific project
    echo   --grep [pattern]    Run tests matching pattern
    echo   --headed            Run tests in headed mode
    echo   --debug             Run tests in debug mode
    echo.
    echo %GREEN%Examples:%NC%
    echo   run-tests.bat
    echo   run-tests.bat --browser firefox
    echo   run-tests.bat --project "Mobile Chrome"
    echo   run-tests.bat --grep "search"
    echo   run-tests.bat --headed --debug
    echo.
    goto :eof
)

echo.
echo %BLUE%[INFO]%NC% Starting MCP Playwright Tests in Docker
echo.

REM Check if Docker is running
docker --version >nul 2>&1
if errorlevel 1 (
    echo %RED%[ERROR]%NC% Docker is not running or not installed
    echo Please install Docker Desktop and make sure it's running
    exit /b 1
)

REM Check if we need to build the image
docker image inspect %IMAGE_NAME% >nul 2>&1
if errorlevel 1 (
    echo %YELLOW%[BUILD]%NC% Docker image not found, building...
    docker build -t %IMAGE_NAME% .
    if errorlevel 1 (
        echo %RED%[ERROR]%NC% Failed to build Docker image
        exit /b 1
    )
) else (
    if "%1"=="--build" (
        echo %YELLOW%[BUILD]%NC% Rebuilding Docker image...
        docker build -t %IMAGE_NAME% .
        if errorlevel 1 (
            echo %RED%[ERROR]%NC% Failed to build Docker image
            exit /b 1
        )
        shift
    )
)

REM Create directories for reports
if not exist "test-results" mkdir "test-results"
if not exist "allure-results" mkdir "allure-results"

echo %GREEN%[RUN]%NC% Executing tests with arguments: %*

REM Run the container with all arguments passed through
docker run --rm ^
    -v "%CD%\test-results:/app/test-results" ^
    -v "%CD%\allure-results:/app/allure-results" ^
    %IMAGE_NAME% ^
    npx playwright test %*

set "exit_code=%errorlevel%"

if %exit_code% equ 0 (
    echo.
    echo %GREEN%[SUCCESS]%NC% Tests completed successfully
    echo %BLUE%[INFO]%NC% Test results available in: test-results\
    echo %BLUE%[INFO]%NC% Allure results available in: allure-results\
) else (
    echo.
    echo %RED%[FAILED]%NC% Tests failed with exit code %exit_code%
)

echo.
exit /b %exit_code%
