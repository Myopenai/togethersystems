import { defineConfig } from '@playwright/test';

export default defineConfig({
  timeout: 30_000, // Reduziert auf 30 Sekunden (statt 60)
  retries: 1,
  use: {
    // TELCOMPETIOION Root-Projekt auf lokalem Server
    baseURL: process.env.PLAYWRIGHT_BASE_URL || process.env.BASE_URL || 'http://localhost:8787/',
    headless: true,
    // Wartezeiten erhöhen für langsame Tests
    actionTimeout: 10_000,
    navigationTimeout: 15_000,
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report' }]],
  projects: [
    {
      name: 'Chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'Firefox',
      use: { browserName: 'firefox' },
    },
    {
      name: 'WebKit',
      use: { browserName: 'webkit' },
    },
  ],
});