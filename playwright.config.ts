import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://127.0.0.1:3000'

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  timeout: 120_000,
  use: {
    baseURL,
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
    reducedMotion: 'reduce'
  },
  webServer: {
    command: 'npx nuxt dev --host 127.0.0.1 --port 3000',
    url: baseURL,
    timeout: 240_000,
    reuseExistingServer: !process.env.CI
  }
})
