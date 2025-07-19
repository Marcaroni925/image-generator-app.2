import { test, expect } from '@playwright/test';

test.describe('Image Generator App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load the main page', async ({ page }) => {
    await expect(page).toHaveTitle(/Image Generator/);
    await expect(page.getByText('AI Image Generator')).toBeVisible();
  });

  test('should have the main form elements', async ({ page }) => {
    await expect(page.getByPlaceholder('Describe the image you want to generate...')).toBeVisible();
    await expect(page.getByRole('button', { name: /generate image/i })).toBeVisible();
  });

  test('should disable submit button when prompt is empty', async ({ page }) => {
    const submitButton = page.getByRole('button', { name: /generate image/i });
    await expect(submitButton).toBeDisabled();
  });

  test('should enable submit button when prompt is entered', async ({ page }) => {
    const textarea = page.getByPlaceholder('Describe the image you want to generate...');
    const submitButton = page.getByRole('button', { name: /generate image/i });
    
    await textarea.fill('a beautiful sunset');
    await expect(submitButton).toBeEnabled();
  });

  test('should generate an image when form is submitted', async ({ page }) => {
    const textarea = page.getByPlaceholder('Describe the image you want to generate...');
    const submitButton = page.getByRole('button', { name: /generate image/i });
    
    // Fill in the prompt
    await textarea.fill('a beautiful sunset over mountains');
    
    // Submit the form
    await submitButton.click();
    
    // Should show loading state
    await expect(page.getByText('Generating...')).toBeVisible();
    
    // Wait for image to be generated and appear in gallery
    await expect(page.getByText('Generated Images')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('img[alt*="a beautiful sunset"]')).toBeVisible({ timeout: 10000 });
    
    // Prompt should be cleared
    await expect(textarea).toHaveValue('');
  });

  test('should display images in the gallery', async ({ page }) => {
    // Generate an image first
    await page.getByPlaceholder('Describe the image you want to generate...').fill('test image');
    await page.getByRole('button', { name: /generate image/i }).click();
    
    // Wait for image to appear
    await expect(page.locator('img[alt*="test image"]')).toBeVisible({ timeout: 10000 });
    
    // Check gallery elements
    await expect(page.getByText('Generated Images')).toBeVisible();
    await expect(page.getByText('test image')).toBeVisible();
  });

  test('should open image modal when clicked', async ({ page }) => {
    // Generate an image first
    await page.getByPlaceholder('Describe the image you want to generate...').fill('modal test');
    await page.getByRole('button', { name: /generate image/i }).click();
    
    // Wait for image to appear and click it
    const image = page.locator('img[alt*="modal test"]').first();
    await expect(image).toBeVisible({ timeout: 10000 });
    await image.click();
    
    // Check modal is open
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog').locator('img')).toBeVisible();
  });

  test('should close modal when close button is clicked', async ({ page }) => {
    // Generate an image and open modal
    await page.getByPlaceholder('Describe the image you want to generate...').fill('close test');
    await page.getByRole('button', { name: /generate image/i }).click();
    
    const image = page.locator('img[alt*="close test"]').first();
    await expect(image).toBeVisible({ timeout: 10000 });
    await image.click();
    
    // Close modal
    await page.getByLabel('Close').click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should close modal when pressing Escape', async ({ page }) => {
    // Generate an image and open modal
    await page.getByPlaceholder('Describe the image you want to generate...').fill('escape test');
    await page.getByRole('button', { name: /generate image/i }).click();
    
    const image = page.locator('img[alt*="escape test"]').first();
    await expect(image).toBeVisible({ timeout: 10000 });
    await image.click();
    
    // Press Escape to close
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should delete images when delete button is clicked', async ({ page }) => {
    // Generate an image
    await page.getByPlaceholder('Describe the image you want to generate...').fill('delete test');
    await page.getByRole('button', { name: /generate image/i }).click();
    
    // Wait for image to appear
    await expect(page.getByText('delete test')).toBeVisible({ timeout: 10000 });
    
    // Click delete button
    await page.getByLabel('Delete image').click();
    
    // Image should be removed
    await expect(page.getByText('delete test')).not.toBeVisible();
    await expect(page.getByText('No images generated yet')).toBeVisible();
  });

  test('should handle multiple image generation', async ({ page }) => {
    // Generate first image
    await page.getByPlaceholder('Describe the image you want to generate...').fill('first image');
    await page.getByRole('button', { name: /generate image/i }).click();
    await expect(page.getByText('first image')).toBeVisible({ timeout: 10000 });
    
    // Generate second image
    await page.getByPlaceholder('Describe the image you want to generate...').fill('second image');
    await page.getByRole('button', { name: /generate image/i }).click();
    await expect(page.getByText('second image')).toBeVisible({ timeout: 10000 });
    
    // Both images should be visible
    await expect(page.getByText('first image')).toBeVisible();
    await expect(page.getByText('second image')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that elements are still visible and functional on mobile
    await expect(page.getByText('AI Image Generator')).toBeVisible();
    await expect(page.getByPlaceholder('Describe the image you want to generate...')).toBeVisible();
    await expect(page.getByRole('button', { name: /generate image/i })).toBeVisible();
    
    // Test image generation on mobile
    await page.getByPlaceholder('Describe the image you want to generate...').fill('mobile test');
    await page.getByRole('button', { name: /generate image/i }).click();
    
    await expect(page.getByText('mobile test')).toBeVisible({ timeout: 10000 });
  });

  test('should handle form submission with keyboard', async ({ page }) => {
    const textarea = page.getByPlaceholder('Describe the image you want to generate...');
    
    await textarea.fill('keyboard test');
    await textarea.press('Enter');
    
    // Should show loading state
    await expect(page.getByText('Generating...')).toBeVisible();
    
    // Wait for image to be generated
    await expect(page.getByText('keyboard test')).toBeVisible({ timeout: 10000 });
  });

  test('should show empty state when no images', async ({ page }) => {
    await expect(page.getByText('No images generated yet')).toBeVisible();
    await expect(page.getByText('Generated Images')).toBeVisible();
  });

  test('should preserve images after page refresh', async ({ page }) => {
    // Generate an image
    await page.getByPlaceholder('Describe the image you want to generate...').fill('persist test');
    await page.getByRole('button', { name: /generate image/i }).click();
    await expect(page.getByText('persist test')).toBeVisible({ timeout: 10000 });
    
    // Refresh the page
    await page.reload();
    
    // Image should still be there (localStorage persistence)
    await expect(page.getByText('persist test')).toBeVisible();
  });

  test('should handle accessibility', async ({ page }) => {
    // Check for proper ARIA labels and roles
    await expect(page.getByRole('button', { name: /generate image/i })).toBeVisible();
    await expect(page.getByRole('textbox')).toBeVisible();
    
    // Generate an image to test more accessibility features
    await page.getByPlaceholder('Describe the image you want to generate...').fill('accessibility test');
    await page.getByRole('button', { name: /generate image/i }).click();
    
    await expect(page.getByLabel('Delete image')).toBeVisible({ timeout: 10000 });
    await expect(page.getByLabel('Download image')).toBeVisible();
  });
});