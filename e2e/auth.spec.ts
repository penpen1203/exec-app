import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display landing page', async ({ page }) => {
    await page.goto('/');
    
    // Check if landing page loads
    await expect(page.locator('h1')).toContainText('ExecOS');
    await expect(page.locator('text=やるべきことを、確実に実行へ')).toBeVisible();
    
    // Check if sign in button exists
    await expect(page.locator('text=今すぐ始める')).toBeVisible();
  });

  test('should redirect to sign in page', async ({ page }) => {
    await page.goto('/');
    
    // Click sign in button
    await page.click('text=今すぐ始める');
    
    // Should be on sign in page
    await expect(page).toHaveURL('/auth/signin/');
    await expect(page.locator('text=Googleでサインイン')).toBeVisible();
  });

  test('should protect dashboard route', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');
    
    // Should be redirected to sign in page
    await expect(page).toHaveURL('/auth/signin/');
  });
});