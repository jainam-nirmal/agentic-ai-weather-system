import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,

  reporter: [
    ['list'],
    ['html', {
      outputFolder: 'reports/html-report',
      open: 'never',
      host: 'localhost',
      port: 9323,
    }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['allure-playwright', {
      resultsDir: 'reports/allure-results',
      detail: true,
      suiteTitle: true,
      environmentInfo: {
        framework: 'Playwright',
        node: process.version,
      },
    }],
  ],

  use: {
    extraHTTPHeaders: {
      Accept: 'application/json',
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: true,
    launchOptions: {
      slowMo: 300,
    },
  },
});
