import { test, expect } from '@playwright/test';

test.describe('Dashboard Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard and wait for it to load
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Wait for metrics to load (either real data or fallback)
    await page.waitForSelector('[data-testid="metrics-grid"]', { timeout: 10000 });
  });

  test('dashboard layout - desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Wait for any animations to complete
    await page.waitForTimeout(1000);
    
    // Take screenshot of full dashboard
    await expect(page).toHaveScreenshot('dashboard-desktop.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('dashboard layout - tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('dashboard-tablet.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('dashboard layout - mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.waitForTimeout(1000);
    
    await expect(page).toHaveScreenshot('dashboard-mobile.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('metrics grid component', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Focus on metrics grid
    const metricsGrid = page.locator('[data-testid="metrics-grid"]');
    await expect(metricsGrid).toBeVisible();
    
    await expect(metricsGrid).toHaveScreenshot('metrics-grid.png', {
      threshold: 0.2,
    });
  });

  test('dashboard with loading state', async ({ page }) => {
    // Intercept API calls to simulate loading
    await page.route('**/api/dashboard/metrics', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    await page.goto('http://localhost:3002/dashboard');
    
    // Capture loading state
    await expect(page.locator('[data-testid="metrics-grid"]')).toHaveScreenshot('dashboard-loading.png', {
      threshold: 0.2,
    });
  });

  test('dashboard with error state', async ({ page }) => {
    // Intercept API calls to simulate error
    await page.route('**/api/dashboard/metrics', async route => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      });
    });

    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should show fallback data with error message
    await expect(page.locator('text=Using fallback data')).toBeVisible();
    
    await expect(page).toHaveScreenshot('dashboard-error-state.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('interactive elements hover states', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Test metric card hover
    const firstMetricCard = page.locator('[data-testid="metrics-grid"] > div > div').first();
    await firstMetricCard.hover();
    
    await expect(firstMetricCard).toHaveScreenshot('metric-card-hover.png', {
      threshold: 0.2,
    });
    
    // Test refresh button hover
    const refreshButton = page.locator('button:has-text("Refresh")');
    await refreshButton.hover();
    
    await expect(refreshButton).toHaveScreenshot('refresh-button-hover.png', {
      threshold: 0.2,
    });
  });
});
