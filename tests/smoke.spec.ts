import { expect, test } from '@playwright/test';

test('renders the map and primary controls', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('.maplibregl-canvas')).toBeVisible();
  await expect(page).toHaveTitle(/GeoCheatMK2/);
  await expect(page.getByRole('searchbox')).toBeVisible();
  await expect(page.getByRole('button', { name: /coverage/i })).toBeVisible();
});

test('search opens a country detail panel', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('searchbox').fill('Deutschland');
  await page.locator('[data-search-iso="DE"]').click();
  await expect(page.locator('#detail-panel')).toHaveClass(/is-open/);
  await expect(page.locator('#detail-title')).toHaveText('Deutschland');
  await expect(page.getByText('DE / DEU')).toBeVisible();
});

test('color modes can be switched', async ({ page }) => {
  await page.goto('/');
  const coverageButton = page.getByRole('button', { name: /coverage/i });
  await coverageButton.click();
  await expect(coverageButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#legend')).toContainText('GeoGuessr');
});
