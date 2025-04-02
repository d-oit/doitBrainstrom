// tests/navigation-sidebar.test.js
import { test, expect } from '@playwright/test';

test.describe('Navigation Sidebar', () => {
  test('should display persistent sidebar on desktop', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Navigate to the app
    await page.goto('/');
    
    // Verify the sidebar is visible
    const sidebar = page.locator('#navigation');
    await expect(sidebar).toBeVisible();
    
    // Verify the sidebar has the correct position
    const sidebarBox = await sidebar.boundingBox();
    expect(sidebarBox.y).toBeGreaterThan(50); // Should be below header
    
    // Verify navigation links are visible
    await expect(page.locator('.drawer-nav-link')).toBeVisible();
  });
  
  test('should collapse sidebar on desktop when toggle button is clicked', async ({ page }) => {
    // Set viewport to desktop size
    await page.setViewportSize({ width: 1200, height: 800 });
    
    // Navigate to the app
    await page.goto('/');
    
    // Click the collapse button
    await page.locator('.drawer-collapse-button').click();
    
    // Verify the sidebar is collapsed
    const sidebar = page.locator('#navigation');
    await expect(sidebar).toHaveClass(/collapsed/);
    
    // Verify only icons are visible in collapsed mode
    const navLinks = page.locator('.drawer-nav-link span:not(.drawer-nav-icon)');
    for (const link of await navLinks.all()) {
      await expect(link).not.toBeVisible();
    }
    
    // Verify icons are still visible
    await expect(page.locator('.drawer-nav-icon')).toBeVisible();
  });
  
  test('should hide sidebar on mobile and show when menu button is clicked', async ({ page }) => {
    // Set viewport to mobile size
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to the app
    await page.goto('/');
    
    // Verify the sidebar is hidden initially
    const sidebar = page.locator('#navigation');
    await expect(sidebar).not.toBeVisible();
    
    // Click the menu button
    await page.locator('.drawer-toggle').click();
    
    // Verify the sidebar is now visible
    await expect(sidebar).toBeVisible();
    
    // Verify the backdrop is visible
    await expect(page.locator('.drawer-backdrop')).toBeVisible();
    
    // Click the backdrop to close the sidebar
    await page.locator('.drawer-backdrop').click();
    
    // Verify the sidebar is hidden again
    await expect(sidebar).not.toBeVisible();
  });
});
