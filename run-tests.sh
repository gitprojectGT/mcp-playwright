#!/bin/bash

# MCP Playwright Test Runner
# This script provides various commands to run Playwright tests in Docker

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show usage
show_usage() {
    echo "MCP Playwright Test Runner"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  build               Build the Docker image"
    echo "  test                Run all tests (default)"
    echo "  test:unit           Run unit tests only"
    echo "  test:integration    Run integration tests only"
    echo "  test:allure         Run tests with Allure reporting"
    echo "  allure:generate     Generate Allure report"
    echo "  allure:serve        Serve Allure report (accessible at http://localhost:45282)"
    echo "  shell               Open bash shell in container"
    echo "  clean               Clean up containers and volumes"
    echo "  logs                Show container logs"
    echo ""
    echo "Options:"
    echo "  --browser BROWSER   Specify browser (chromium, firefox, webkit)"
    echo "  --headed            Run tests in headed mode"
    echo "  --debug             Run tests in debug mode"
    echo "  --workers N         Number of workers to use"
    echo "  --grep PATTERN      Run tests matching pattern"
    echo "  --help              Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 test --browser firefox"
    echo "  $0 test:unit --grep 'MoviePageHelper'"
    echo "  $0 test:allure --workers 2"
    echo "  $0 allure:serve"
}

# Function to build Docker image
build_image() {
    print_status "Building Docker image..."
    docker-compose build playwright-tests
    print_success "Docker image built successfully"
}

# Function to run tests
run_tests() {
    local test_type="$1"
    shift
    local extra_args="$@"
    
    print_status "Running $test_type tests..."
    
    # Ensure directories exist
    mkdir -p test-results playwright-report allure-results allure-report
    
    case "$test_type" in
        "all")
            docker-compose run --rm playwright-tests npm test $extra_args
            ;;
        "unit")
            docker-compose run --rm playwright-tests npx playwright test tests/unit/ $extra_args
            ;;
        "integration")
            docker-compose run --rm playwright-tests npx playwright test --grep-invert "@unit" $extra_args
            ;;
        "allure")
            docker-compose run --rm playwright-tests npm run test:allure $extra_args
            ;;
    esac
    
    print_success "Tests completed"
}

# Function to generate Allure report
generate_allure_report() {
    print_status "Generating Allure report..."
    docker-compose run --rm playwright-tests npm run allure:generate
    print_success "Allure report generated in ./allure-report/"
}

# Function to serve Allure report
serve_allure_report() {
    print_status "Starting Allure report server..."
    print_status "Report will be available at: http://localhost:45282"
    print_warning "Press Ctrl+C to stop the server"
    docker-compose --profile allure up allure-server
}

# Function to open shell
open_shell() {
    print_status "Opening bash shell in container..."
    docker-compose run --rm playwright-tests bash
}

# Function to clean up
cleanup() {
    print_status "Cleaning up containers and volumes..."
    docker-compose down -v
    docker-compose --profile allure down -v
    print_success "Cleanup completed"
}

# Function to show logs
show_logs() {
    docker-compose logs playwright-tests
}

# Parse command line arguments
COMMAND=""
BROWSER=""
EXTRA_ARGS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        build|test|test:unit|test:integration|test:allure|allure:generate|allure:serve|shell|clean|logs)
            COMMAND="$1"
            shift
            ;;
        --browser)
            BROWSER="$2"
            EXTRA_ARGS="$EXTRA_ARGS --project=$2"
            shift 2
            ;;
        --headed)
            EXTRA_ARGS="$EXTRA_ARGS --headed"
            shift
            ;;
        --debug)
            EXTRA_ARGS="$EXTRA_ARGS --debug"
            shift
            ;;
        --workers)
            EXTRA_ARGS="$EXTRA_ARGS --workers=$2"
            shift 2
            ;;
        --grep)
            EXTRA_ARGS="$EXTRA_ARGS --grep=$2"
            shift 2
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            EXTRA_ARGS="$EXTRA_ARGS $1"
            shift
            ;;
    esac
done

# Default command
if [ -z "$COMMAND" ]; then
    COMMAND="test"
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker and try again."
    exit 1
fi

# Execute command
case "$COMMAND" in
    "build")
        build_image
        ;;
    "test")
        run_tests "all" $EXTRA_ARGS
        ;;
    "test:unit")
        run_tests "unit" $EXTRA_ARGS
        ;;
    "test:integration")
        run_tests "integration" $EXTRA_ARGS
        ;;
    "test:allure")
        run_tests "allure" $EXTRA_ARGS
        ;;
    "allure:generate")
        generate_allure_report
        ;;
    "allure:serve")
        serve_allure_report
        ;;
    "shell")
        open_shell
        ;;
    "clean")
        cleanup
        ;;
    "logs")
        show_logs
        ;;
    *)
        print_error "Unknown command: $COMMAND"
        show_usage
        exit 1
        ;;
esac
