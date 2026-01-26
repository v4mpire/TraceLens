import { test, expect } from '@playwright/test';

test.describe('Theme System Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3002/dashboard');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="metrics-grid"]', { timeout: 10000 });
  });

  test('light theme appearance', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Ensure light theme is active
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tracelens-ui-theme', 'light');
    });
    
    // Wait for theme transition
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('dashboard-light-theme.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('dark theme appearance', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Ensure dark theme is active
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tracelens-ui-theme', 'dark');
    });
    
    // Wait for theme transition
    await page.waitForTimeout(500);
    
    await expect(page).toHaveScreenshot('dashboard-dark-theme.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('theme toggle functionality', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Start with light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tracelens-ui-theme', 'light');
    });
    
    // Find and click theme toggle
    const themeToggle = page.locator('button[title*="Current:"]');
    await expect(themeToggle).toBeVisible();
    
    // Take screenshot of light theme
    await expect(page).toHaveScreenshot('theme-before-toggle.png', {
      fullPage: true,
      threshold: 0.2,
    });
    
    // Click to switch theme
    await themeToggle.click();
    
    // Wait for theme transition
    await page.waitForTimeout(500);
    
    // Take screenshot after toggle
    await expect(page).toHaveScreenshot('theme-after-toggle.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('theme toggle button states', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    const themeToggle = page.locator('button[title*="Current:"]');
    
    // Test light theme button
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tracelens-ui-theme', 'light');
    });
    await page.waitForTimeout(300);
    
    await expect(themeToggle).toHaveScreenshot('theme-toggle-light.png', {
      threshold: 0.2,
    });
    
    // Test dark theme button
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tracelens-ui-theme', 'dark');
    });
    await page.waitForTimeout(300);
    
    await expect(themeToggle).toHaveScreenshot('theme-toggle-dark.png', {
      threshold: 0.2,
    });
    
    // Test system theme button
    await page.evaluate(() => {
      localStorage.setItem('tracelens-ui-theme', 'system');
    });
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(300);
    
    await expect(themeToggle).toHaveScreenshot('theme-toggle-system.png', {
      threshold: 0.2,
    });
  });

  test('theme persistence across page reload', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Set dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tracelens-ui-theme', 'dark');
    });
    
    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="metrics-grid"]', { timeout: 10000 });
    
    // Wait for theme to be applied
    await page.waitForTimeout(500);
    
    // Verify dark theme persisted
    const isDark = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    
    expect(isDark).toBe(true);
    
    await expect(page).toHaveScreenshot('theme-persistence-dark.png', {
      fullPage: true,
      threshold: 0.2,
    });
  });

  test('glassmorphism effects in different themes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Test glassmorphism in light theme
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tracelens-ui-theme', 'light');
    });
    await page.waitForTimeout(300);
    
    // Focus on a card with glass effects
    const glassCard = page.locator('[data-testid="metrics-grid"] > div > div').first();
    await expect(glassCard).toHaveScreenshot('glass-effect-light.png', {
      threshold: 0.2,
    });
    
    // Test glassmorphism in dark theme
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tracelens-ui-theme', 'dark');
    });
    await page.waitForTimeout(300);
    
    await expect(glassCard).toHaveScreenshot('glass-effect-dark.png', {
      threshold: 0.2,
    });
  });

  test('color contrast accessibility', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Test light theme contrast
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('tracelens-ui-theme', 'light');
    });
    await page.waitForTimeout(300);
    
    // Check that text is readable (this is a visual test, actual contrast would need axe-core)
    const textElements = page.locator('text=Response Time, text=Uptime, text=Critical Paths, text=Security Risks');
    await expect(textElements.first()).toBeVisible();
    
    // Test dark theme contrast
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('tracelens-ui-theme', 'dark');
    });
    await page.waitForTimeout(300);
    
    await expect(textElements.first()).toBeVisible();
  });
});
