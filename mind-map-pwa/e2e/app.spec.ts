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

  // Check that the cards are visible - using more specific selectors
  // The card titles are in Typography components with variant="h5" but component="div"
  await expect(page.locator('.MuiCard-root .MuiTypography-h5', { hasText: /Main Idea/i })).toBeVisible();
  await expect(page.locator('.MuiCard-root .MuiTypography-h5', { hasText: /Supporting Concept/i })).toBeVisible();
  await expect(page.locator('.MuiCard-root .MuiTypography-h5', { hasText: /Another Concept/i })).toBeVisible();

  // Click on the S3 Connection tab
  await page.getByRole('tab', { name: /S3 Connection/i }).click();

  // Check that the S3 Connection content is visible
  await expect(page.getByRole('heading', { name: /S3 Connection Test/i })).toBeVisible();

  // Click back to the Brainstorm Map tab
  await page.getByRole('tab', { name: /Brainstorm Map/i }).click();

  // Check that the Brainstorm Map content is visible
  // Use a more specific selector to avoid matching multiple elements
  // First, find the active tab
  const activeTab = page.getByRole('tab', { selected: true });
  await expect(activeTab).toBeVisible();

  // Then check that the corresponding tabpanel is visible
  const tabPanelId = await activeTab.getAttribute('aria-controls');
  await expect(page.locator(`#${tabPanelId}`)).toBeVisible();
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

test.skip('theme switching', async ({ page }) => {
  await page.goto('/');

  // Navigate to the Sample Cards tab to ensure we have cards visible
  await page.getByRole('tab', { name: /Sample Cards/i }).click();
  await page.waitForTimeout(500);

  // Find and click the theme switcher
  const themeSwitcher = page.getByRole('button', { name: /theme/i });
  await themeSwitcher.click();

  // Wait for the theme menu to appear and click on Dark theme
  await page.getByRole('menuitem', { name: /dark/i }).click();

  // Wait a moment for the theme to apply
  await page.waitForTimeout(1000);

  // Now we should have cards visible on the Sample Cards tab
  const cardElement = page.locator('.MuiCard-root').first();
  await expect(cardElement).toBeVisible();

  // Instead of checking computed styles, let's check if the theme class is applied to the document
  // This is more reliable than checking computed styles which might not change visibly
  const isDarkMode = await page.evaluate(() => {
    // Check for dark mode in various ways
    const html = document.documentElement;

    // Check for data-mui-color-scheme attribute
    if (html.getAttribute('data-mui-color-scheme') === 'dark') {
      return true;
    }

    // Check for dark mode class on body or html
    if (document.body.classList.contains('dark') ||
        html.classList.contains('dark') ||
        document.body.classList.contains('darkMode') ||
        html.classList.contains('darkMode')) {
      return true;
    }

    // Check for CSS variables
    const computedStyle = getComputedStyle(html);
    return computedStyle.getPropertyValue('--mind-map-palette-mode') === 'dark';
  });

  // We should be in dark mode
  expect(isDarkMode).toBeTruthy();

  // Switch back to light theme
  await themeSwitcher.click();
  await page.getByRole('menuitem', { name: /light/i }).click();

  // Wait a moment for the theme to apply
  await page.waitForTimeout(1000);

  // Now check if we're in light mode
  const isLightMode = await page.evaluate(() => {
    // Check for light mode in various ways
    const html = document.documentElement;

    // Check for data-mui-color-scheme attribute
    if (html.getAttribute('data-mui-color-scheme') === 'light') {
      return true;
    }

    // Check for light mode class on body or html
    if (document.body.classList.contains('light') ||
        html.classList.contains('light') ||
        document.body.classList.contains('lightMode') ||
        html.classList.contains('lightMode')) {
      return true;
    }

    // Check for CSS variables
    const computedStyle = getComputedStyle(html);
    return computedStyle.getPropertyValue('--mind-map-palette-mode') === 'light';
  });

  // We should be in light mode
  expect(isLightMode).toBeTruthy();
});
