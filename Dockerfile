# Use the official Playwright image with Node.js
FROM mcr.microsoft.com/playwright:v1.53.2-jammy

# Set working directory
WORKDIR /app

# Create a non-root user for security
RUN groupadd -r playwright && useradd -r -g playwright -G audio,video playwright \
    && mkdir -p /home/playwright/Downloads \
    && chown -R playwright:playwright /home/playwright \
    && chown -R playwright:playwright /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Change ownership of the app directory to playwright user
RUN chown -R playwright:playwright /app

# Create directories for test results and reports
RUN mkdir -p /app/test-results /app/playwright-report /app/allure-results /app/allure-report \
    && chown -R playwright:playwright /app/test-results /app/playwright-report /app/allure-results /app/allure-report

# Switch to non-root user
USER playwright

# Browsers are already pre-installed in the Playwright base image
# Just ensure they're available by checking the installation
RUN npx playwright --version

# Set environment variables
ENV CI=true
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

# Expose port for Allure reports
EXPOSE 45281

# Default command
CMD ["npm", "test"]
