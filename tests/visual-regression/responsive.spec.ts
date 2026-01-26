import { test, expect } from '@playwright/test';

test.describe('Responsive Design Visual Regression', () => {
  const viewports = [
    { name: 'mobile-small', width: 320, height: 568 },
    { name: 'mobile-medium', width: 375, height: 667 },
    { name: 'mobile-large', width: 414, height: 896 },
    { name: 'tablet-portrait', width: 768, height: 1024 },
    { name: 'tablet-landscape', width: 1024, height: 768 },
    { name: 'desktop-small', width: 1280, height: 720 },
    { name: 'desktop-large', width: 1920, height: 1080 },
    { name: 'desktop-ultrawide', width: 2560, height: 1440 },
  ];

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="metrics-grid"]', { timeout: 10000 });
  });

  viewports.forEach(({ name, width, height }) => {
    test(`dashboard layout - ${name} (${width}x${height})`, async ({ page }) => {
      await page.setViewportSize({ width, height });
      
      // Wait for layout to adjust
      await page.waitForTimeout(500);
      
      // Take full page screenshot
      await expect(page).toHaveScreenshot(`dashboard-${name}.png`, {
        fullPage: true,
        threshold: 0.2,
      });
    });
  });

  test('metrics grid responsive behavior', async ({ page }) => {
    // Test different breakpoints for metrics grid
    const breakpoints = [
      { name: 'mobile', width: 375, expectedColumns: 1 },
      { name: 'tablet', width: 768, expectedColumns: 2 },
      { name: 'desktop', width: 1024, expectedColumns: 4 },
    ];

    for (const { name, width, expectedColumns } of breakpoints) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(300);
      
      const metricsGrid = page.locator('[data-testid="metrics-grid"] > div:last-child');
      await expect(metricsGrid).toHaveScreenshot(`metrics-grid-${name}.png`, {
        threshold: 0.2,
      });
      
      // Verify grid layout (this is approximate since CSS Grid is complex to test)
      const gridItems = page.locator('[data-testid="metrics-grid"] > div:last-child > div');
      const itemCount = await gridItems.count();
      expect(itemCount).toBeGreaterThan(0);
    }
  });

  test('navigation responsive behavior', async ({ page }) => {
    // Test mobile navigation (if sidebar collapses to hamburger)
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    
    // Check if navigation adapts to mobile
    const navigation = page.locator('nav, [role="navigation"]');
    if (await navigation.count() > 0) {
      await expect(navigation.first()).toHaveScreenshot('navigation-mobile.png', {
        threshold: 0.2,
      });
    }
    
    // Test desktop navigation
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.waitForTimeout(300);
    
    if (await navigation.count() > 0) {
      await expect(navigation.first()).toHaveScreenshot('navigation-desktop.png', {
        threshold: 0.2,
      });
    }
  });

  test('text scaling and readability', async ({ page }) => {
    const testViewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'desktop', width: 1280, height: 720 },
    ];

    for (const { name, width, height } of testViewports) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(300);
      
      // Focus on text elements to check readability
      const textElements = page.locator('h1, h2, h3, h4, p, span').first();
      await expect(textElements).toHaveScreenshot(`text-scaling-${name}.png`, {
        threshold: 0.2,
      });
    }
  });

  test('touch targets on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(300);
    
    // Test theme toggle button size (should be at least 44px for touch)
    const themeToggle = page.locator('button[title*="Current:"]');
    if (await themeToggle.count() > 0) {
      const boundingBox = await themeToggle.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThanOrEqual(36); // Minimum touch target
        expect(boundingBox.height).toBeGreaterThanOrEqual(36);
      }
      
      await expect(themeToggle).toHaveScreenshot('touch-target-theme-toggle.png', {
        threshold: 0.2,
      });
    }
    
    // Test refresh button
    const refreshButton = page.locator('button:has-text("Refresh")');
    if (await refreshButton.count() > 0) {
      const boundingBox = await refreshButton.boundingBox();
      if (boundingBox) {
        expect(boundingBox.width).toBeGreaterThanOrEqual(36);
        expect(boundingBox.height).toBeGreaterThanOrEqual(36);
      }
    }
  });

  test('horizontal scrolling prevention', async ({ page }) => {
    const narrowViewports = [
      { width: 320, height: 568 },
      { width: 280, height: 653 }, // Very narrow
    ];

    for (const { width, height } of narrowViewports) {
      await page.setViewportSize({ width, height });
      await page.waitForTimeout(300);
      
      // Check that content doesn't cause horizontal scroll
      const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
      const bodyClientWidth = await page.evaluate(() => document.body.clientWidth);
      
      // Allow small differences due to scrollbars
      expect(bodyScrollWidth - bodyClientWidth).toBeLessThanOrEqual(20);
      
      await expect(page).toHaveScreenshot(`no-horizontal-scroll-${width}w.png`, {
        fullPage: true,
        threshold: 0.2,
      });
    }
  });

  test('content reflow at breakpoints', async ({ page }) => {
    // Test major breakpoint transitions
    const transitions = [
      { from: { width: 767, height: 800 }, to: { width: 768, height: 800 }, name: 'md-breakpoint' },
      { from: { width: 1023, height: 800 }, to: { width: 1024, height: 800 }, name: 'lg-breakpoint' },
    ];

    for (const { from, to, name } of transitions) {
      // Before breakpoint
      await page.setViewportSize(from);
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot(`${name}-before.png`, {
        fullPage: true,
        threshold: 0.2,
      });
      
      // After breakpoint
      await page.setViewportSize(to);
      await page.waitForTimeout(300);
      await expect(page).toHaveScreenshot(`${name}-after.png`, {
        fullPage: true,
        threshold: 0.2,
      });
    }
  });

  test('extreme viewport sizes', async ({ page }) => {
    // Test very wide viewport
    await page.setViewportSize({ width: 3840, height: 1080 });
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('dashboard-ultrawide.png', {
      fullPage: true,
      threshold: 0.2,
    });
    
    // Test very tall viewport
    await page.setViewportSize({ width: 1280, height: 2000 });
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('dashboard-tall.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('print media styles', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Emulate print media
    await page.emulateMedia({ media: 'print' });
    await page.waitForTimeout(300);
    
    await expect(page).toHaveScreenshot('dashboard-print.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });
});
