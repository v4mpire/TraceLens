import { test, expect } from '@playwright/test';

test.describe('TraceLens Frontend Redesign', () => {
  test('homepage loads with new design system', async ({ page }) => {
    await page.goto('/');
    
    // Check for new badge component
    await expect(page.locator('text=Production Ready • Open Source')).toBeVisible();
    
    // Check for gradient typography
    await expect(page.locator('h1:has-text("TraceLens")')).toBeVisible();
    await expect(page.locator('h2:has-text("Runtime Truth Engine")')).toBeVisible();
    
    // Check for feature cards
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
    await expect(page.locator('text=Insights')).toBeVisible();
    
    // Check for modern buttons
    await expect(page.locator('a:has-text("Open Dashboard")')).toBeVisible();
    await expect(page.locator('a:has-text("View on GitHub")')).toBeVisible();
  });

  test('dashboard loads with new components', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for breadcrumb navigation
    await expect(page.locator('nav[aria-label="Breadcrumb"]')).toBeVisible();
    
    // Check for dashboard cards
    await expect(page.locator('text=System Overview')).toBeVisible();
    await expect(page.locator('text=Active Traces')).toBeVisible();
    
    // Check for status badges
    await expect(page.locator('.badge')).toBeVisible();
  });

  test('navigation works correctly', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to dashboard
    await page.click('a:has-text("Open Dashboard")');
    await expect(page).toHaveURL('/dashboard');
    
    // Check sidebar navigation
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Traces')).toBeVisible();
    await expect(page.locator('text=Performance')).toBeVisible();
    await expect(page.locator('text=Security')).toBeVisible();
  });

  test('responsive design works', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile layout
    await expect(page.locator('h1:has-text("TraceLens")')).toBeVisible();
    await expect(page.locator('text=Production Ready • Open Source')).toBeVisible();
    
    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto('/dashboard');
    
    // Check desktop layout
    await expect(page.locator('aside')).toBeVisible(); // Sidebar
    await expect(page.locator('main')).toBeVisible(); // Main content
  });

  test('theme and styling consistency', async ({ page }) => {
    await page.goto('/');
    
    // Check CSS custom properties are applied
    const rootStyles = await page.evaluate(() => {
      const root = document.documentElement;
      const styles = getComputedStyle(root);
      return {
        primary: styles.getPropertyValue('--primary'),
        background: styles.getPropertyValue('--background'),
        foreground: styles.getPropertyValue('--foreground')
      };
    });
    
    expect(rootStyles.primary).toBeTruthy();
    expect(rootStyles.background).toBeTruthy();
    expect(rootStyles.foreground).toBeTruthy();
  });
});
