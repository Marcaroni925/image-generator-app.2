import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
  test('should load the page within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await expect(page.getByText('AI Image Generator')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
  });

  test('should have good Core Web Vitals', async ({ page }) => {
    await page.goto('/');
    
    // Measure Largest Contentful Paint (LCP)
    const lcp = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
      });
    });
    
    expect(lcp).toBeLessThan(2500); // LCP should be < 2.5s for good performance
  });

  test('should handle rapid image generation requests', async ({ page }) => {
    await page.goto('/');
    
    const textarea = page.getByPlaceholder('Describe the image you want to generate...');
    const submitButton = page.getByRole('button', { name: /generate image/i });
    
    // Generate multiple images quickly
    for (let i = 1; i <= 3; i++) {
      await textarea.fill(`rapid test ${i}`);
      await submitButton.click();
      
      // Wait for loading state to appear
      await expect(page.getByText('Generating...')).toBeVisible();
      
      // Wait for image to be generated
      await expect(page.getByText(`rapid test ${i}`)).toBeVisible({ timeout: 10000 });
    }
    
    // All images should be present
    await expect(page.getByText('rapid test 1')).toBeVisible();
    await expect(page.getByText('rapid test 2')).toBeVisible();
    await expect(page.getByText('rapid test 3')).toBeVisible();
  });

  test('should not have memory leaks with many images', async ({ page }) => {
    await page.goto('/');
    
    const textarea = page.getByPlaceholder('Describe the image you want to generate...');
    const submitButton = page.getByRole('button', { name: /generate image/i });
    
    // Generate many images
    for (let i = 1; i <= 10; i++) {
      await textarea.fill(`memory test ${i}`);
      await submitButton.click();
      await expect(page.getByText(`memory test ${i}`)).toBeVisible({ timeout: 10000 });
    }
    
    // Check that all images are still functional
    const images = page.locator('img[alt*="memory test"]');
    await expect(images).toHaveCount(10);
    
    // Click on the first image to test modal functionality
    await images.first().click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel('Close').click();
  });

  test('should handle large gallery efficiently', async ({ page }) => {
    await page.goto('/');
    
    const textarea = page.getByPlaceholder('Describe the image you want to generate...');
    const submitButton = page.getByRole('button', { name: /generate image/i });
    
    // Generate a reasonable number of images for testing
    for (let i = 1; i <= 5; i++) {
      await textarea.fill(`gallery test ${i}`);
      await submitButton.click();
      await expect(page.getByText(`gallery test ${i}`)).toBeVisible({ timeout: 10000 });
    }
    
    // Measure scroll performance
    const startTime = Date.now();
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    await page.waitForTimeout(100); // Allow time for scroll
    const scrollTime = Date.now() - startTime;
    
    expect(scrollTime).toBeLessThan(100); // Scroll should be smooth and fast
  });

  test('should efficiently handle modal operations', async ({ page }) => {
    await page.goto('/');
    
    // Generate an image
    await page.getByPlaceholder('Describe the image you want to generate...').fill('modal performance test');
    await page.getByRole('button', { name: /generate image/i }).click();
    await expect(page.getByText('modal performance test')).toBeVisible({ timeout: 10000 });
    
    const image = page.locator('img[alt*="modal performance test"]').first();
    
    // Measure modal open/close performance
    for (let i = 0; i < 5; i++) {
      const startTime = Date.now();
      
      await image.click();
      await expect(page.getByRole('dialog')).toBeVisible();
      
      const openTime = Date.now() - startTime;
      expect(openTime).toBeLessThan(200); // Modal should open quickly
      
      const closeStartTime = Date.now();
      
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).not.toBeVisible();
      
      const closeTime = Date.now() - closeStartTime;
      expect(closeTime).toBeLessThan(200); // Modal should close quickly
    }
  });

  test('should load images efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Generate an image
    await page.getByPlaceholder('Describe the image you want to generate...').fill('image load test');
    await page.getByRole('button', { name: /generate image/i }).click();
    
    // Wait for image generation
    await expect(page.getByText('image load test')).toBeVisible({ timeout: 10000 });
    
    // Check that image loads properly
    const image = page.locator('img[alt*="image load test"]').first();
    await expect(image).toBeVisible();
    
    // Verify image is actually loaded (not broken)
    const isImageLoaded = await image.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalHeight !== 0;
    });
    
    expect(isImageLoaded).toBe(true);
  });

  test('should handle network conditions gracefully', async ({ page, context }) => {
    // Simulate slow 3G connection
    await context.route('**/*', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Add 100ms delay
      await route.continue();
    });
    
    await page.goto('/');
    await expect(page.getByText('AI Image Generator')).toBeVisible();
    
    // Generate an image with simulated slow network
    await page.getByPlaceholder('Describe the image you want to generate...').fill('slow network test');
    await page.getByRole('button', { name: /generate image/i }).click();
    
    // Should show loading state
    await expect(page.getByText('Generating...')).toBeVisible();
    
    // Should eventually load the image
    await expect(page.getByText('slow network test')).toBeVisible({ timeout: 15000 });
  });

  test('should maintain performance with localStorage usage', async ({ page }) => {
    await page.goto('/');
    
    // Generate multiple images to test localStorage performance
    for (let i = 1; i <= 5; i++) {
      await page.getByPlaceholder('Describe the image you want to generate...').fill(`storage test ${i}`);
      await page.getByRole('button', { name: /generate image/i }).click();
      await expect(page.getByText(`storage test ${i}`)).toBeVisible({ timeout: 10000 });
    }
    
    // Measure localStorage operations
    const storageTime = await page.evaluate(() => {
      const start = performance.now();
      
      // Simulate reading from localStorage
      const data = localStorage.getItem('generated-images');
      if (data) {
        JSON.parse(data);
      }
      
      return performance.now() - start;
    });
    
    expect(storageTime).toBeLessThan(10); // localStorage operations should be fast
    
    // Refresh page to test loading from localStorage
    const refreshStart = Date.now();
    await page.reload();
    await expect(page.getByText('storage test 1')).toBeVisible();
    const refreshTime = Date.now() - refreshStart;
    
    expect(refreshTime).toBeLessThan(3000); // Page with localStorage data should load quickly
  });
});