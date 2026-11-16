---
name: e2e-testing
description: Use when writing, setting up or fixing end-to-end or browser tests with Playwright for a React or Next.js app — login, checkout, critical user flows, visual or accessibility checks.
---

# End-to-end testing (Playwright)

Unit/component tests (`react-testing`) cover most logic. E2E tests cover **critical flows only**: auth, checkout/payment, onboarding, the main feature of the app.

## Setup (if missing)

```bash
npm init playwright@latest   # TypeScript, tests in e2e/, add GitHub Actions workflow
```

In `playwright.config.ts`:

```ts
use: { baseURL: 'http://localhost:3000', trace: 'on-first-retry' },
webServer: { command: 'npm run build && npm run start', url: 'http://localhost:3000', reuseExistingServer: !process.env.CI },
projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }, { name: 'mobile', use: { ...devices['Pixel 7'] } }],
```

Add scripts: `"test:e2e": "playwright test"`, `"test:e2e:ui": "playwright test --ui"`.

## Rules

- Locate elements like a user: `getByRole`, `getByLabel`, `getByText`. Add `data-testid` only when nothing else is stable.
- Never use fixed waits (`waitForTimeout`). Use web-first assertions: `await expect(locator).toBeVisible()`.
- Each test is independent: own data, no order dependency.
- Log in once with a setup project and `storageState`, not through the UI in every test.
- Mock third-party services (payments, maps, analytics) with `page.route`; use a seeded test backend or API mocks for your own API.
- Name tests by user goal: `test('user can apply a coupon at checkout')`.

## Template

```ts
import { test, expect } from '@playwright/test';

test('user can log in and see the dashboard', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('qa@example.com');
  await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL(/\/dashboard/);
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

## Accessibility check in E2E

```ts
import AxeBuilder from '@axe-core/playwright';

test('home page has no a11y violations', async ({ page }) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
```

## Finish

Run `npx playwright test`. On failure, open the trace (`npx playwright show-trace`) before changing the test — fix the app if the app is wrong.
