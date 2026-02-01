import { test, expect } from '@playwright/test';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Boost/i);
});

test('marketing audit tool loads', async ({ page }) => {
  await page.goto('/tools/marketing-audit');
  await expect(page).toHaveTitle(/Marketing Audit/i);
  await expect(page.locator('input[type="text"], input[type="url"]').first()).toBeVisible();
});

test('target audience tool loads', async ({ page }) => {
  await page.goto('/tools/target-audience-generator');
  await expect(page).toHaveTitle(/Target Audience/i);
  await expect(page.locator('input[type="text"]').first()).toBeVisible();
});

test('headline analyzer tool loads', async ({ page }) => {
  await page.goto('/tools/headline-analyzer');
  await expect(page).toHaveTitle(/Headline/i);
  await expect(page.locator('input[type="text"]').first()).toBeVisible();
});
