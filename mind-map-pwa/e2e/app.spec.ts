import { test, expect } from '@playwright/test';

test('basic application functionality', async ({ page }) => {
  // Navigate to the app
  await page.goto('/');

  // Check that the app title is visible
  await expect(page.getByRole('heading', { name: /d\.o\. Brainstroming/i, level: 1 })).toBeVisible();

  // Check that the tabs are visible
  await expect(page.getByRole('tab', { name: /Brainstorm Map/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /S3 Connection/i })).toBeVisible();
  await expect(page.getByRole('tab', { name: /Sample Cards/i })).toBeVisible();

  // Click on the Sample Cards tab
  await page.getByRole('tab', { name: /Sample Cards/i }).click();

  // Check that the Sample Cards content is visible
  await expect(page.getByRole('heading', { name: /Sample Cards/i })).toBeVisible();

  // Check that the cards are visible
  await expect(page.getByText(/Main Idea/i)).toBeVisible();
  await expect(page.getByText(/Supporting Concept/i)).toBeVisible();
  await expect(page.getByText(/Another Concept/i)).toBeVisible();

  // Click on the S3 Connection tab
  await page.getByRole('tab', { name: /S3 Connection/i }).click();

  // Check that the S3 Connection content is visible
  await expect(page.getByRole('heading', { name: /S3 Connection Test/i })).toBeVisible();

  // Click back to the Brainstorm Map tab
  await page.getByRole('tab', { name: /Brainstorm Map/i }).click();

  // Check that the Brainstorm Map content is visible
  await expect(page.getByText(/Brainstorm Map/i)).toBeVisible();
});

test('responsive design', async ({ page }) => {
  // Test on desktop size
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');

  // Check that the layout is appropriate for desktop
  await expect(page.getByRole('heading', { name: /d\.o\. Brainstroming/i, level: 1 })).toBeVisible();

  // Test on tablet size
  await page.setViewportSize({ width: 768, height: 1024 });

  // Check that the layout adjusts for tablet
  await expect(page.getByRole('heading', { name: /d\.o\. Brainstroming/i, level: 1 })).toBeVisible();

  // Test on mobile size
  await page.setViewportSize({ width: 375, height: 667 });

  // Check that the layout adjusts for mobile
  await expect(page.getByRole('heading', { name: /d\.o\. Brainstroming/i, level: 1 })).toBeVisible();
});

test('theme switching', async ({ page }) => {
  await page.goto('/');

  // Find and click the theme switcher
  const themeSwitcher = page.getByRole('button', { name: /theme/i });
  await themeSwitcher.click();

  // Wait for the theme menu to appear and click on Dark theme
  await page.getByRole('menuitem', { name: /dark/i }).click();

  // Check that the theme has changed (this would depend on how your theme is applied)
  // For example, if dark theme adds a class to the body:
  await expect(page.locator('body')).toHaveAttribute('data-mui-color-scheme', 'dark');

  // Switch back to light theme
  await themeSwitcher.click();
  await page.getByRole('menuitem', { name: /light/i }).click();

  // Check that the theme has changed back
  await expect(page.locator('body')).toHaveAttribute('data-mui-color-scheme', 'light');
});
