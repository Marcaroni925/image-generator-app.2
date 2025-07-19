const puppeteer = require('puppeteer');

describe('Puppeteer Tests', () => {
  let browser;
  let page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: process.env.CI !== 'false',
      slowMo: process.env.CI ? 0 : 50,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    page = await browser.newPage();
    
    // Set viewport for consistent testing
    await page.setViewport({ width: 1280, height: 720 });
    
    // Go to the application
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle0' });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // Clear localStorage before each test
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: 'networkidle0' });
  });

  test('should load the application successfully', async () => {
    const title = await page.title();
    expect(title).toContain('Image Generator');
    
    const heading = await page.$eval('h2', el => el.textContent);
    expect(heading).toBe('AI Image Generator');
  });

  test('should interact with the image generator form', async () => {
    // Find the textarea and button
    const textarea = await page.$('textarea');
    const button = await page.$('button[type="submit"]');
    
    expect(textarea).toBeTruthy();
    expect(button).toBeTruthy();
    
    // Check initial state
    const isButtonDisabled = await page.$eval('button[type="submit"]', el => el.disabled);
    expect(isButtonDisabled).toBe(true);
    
    // Type in the textarea
    await textarea.type('A beautiful mountain landscape');
    
    // Button should now be enabled
    const isButtonEnabledNow = await page.$eval('button[type="submit"]', el => el.disabled);
    expect(isButtonEnabledNow).toBe(false);
  });

  test('should generate an image and display it in gallery', async () => {
    // Fill the form and submit
    await page.type('textarea', 'Sunset over ocean');
    await page.click('button[type="submit"]');
    
    // Wait for loading state
    await page.waitForSelector('text/Generating...', { timeout: 5000 });
    
    // Wait for image to appear in gallery
    await page.waitForSelector('img[alt*="Sunset over ocean"]', { timeout: 15000 });
    
    // Check that image is in the gallery
    const images = await page.$$('img[alt*="Sunset over ocean"]');
    expect(images.length).toBeGreaterThan(0);
    
    // Check that prompt text is displayed
    const promptText = await page.$eval('text/Sunset over ocean', el => el.textContent);
    expect(promptText).toContain('Sunset over ocean');
  });

  test('should open and close image modal', async () => {
    // Generate an image first
    await page.type('textarea', 'Modal test image');
    await page.click('button[type="submit"]');
    await page.waitForSelector('img[alt*="Modal test image"]', { timeout: 15000 });
    
    // Click on the image to open modal
    await page.click('img[alt*="Modal test image"]');
    
    // Wait for modal to appear
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Check modal is visible
    const modal = await page.$('[role="dialog"]');
    const isVisible = await modal.boundingBox();
    expect(isVisible).toBeTruthy();
    
    // Close modal by clicking close button
    await page.click('[aria-label="Close"]');
    
    // Wait for modal to disappear
    await page.waitForSelector('[role="dialog"]', { hidden: true, timeout: 5000 });
  });

  test('should delete images from gallery', async () => {
    // Generate an image
    await page.type('textarea', 'Delete test image');
    await page.click('button[type="submit"]');
    await page.waitForSelector('img[alt*="Delete test image"]', { timeout: 15000 });
    
    // Click delete button
    await page.click('[aria-label="Delete image"]');
    
    // Wait for image to be removed
    await page.waitForSelector('img[alt*="Delete test image"]', { hidden: true, timeout: 5000 });
    
    // Check that "No images generated yet" message appears
    await page.waitForSelector('text/No images generated yet', { timeout: 5000 });
  });

  test('should handle multiple image generation', async () => {
    const prompts = ['First image', 'Second image', 'Third image'];
    
    for (const prompt of prompts) {
      await page.type('textarea', prompt);
      await page.click('button[type="submit"]');
      await page.waitForSelector(`img[alt*="${prompt}"]`, { timeout: 15000 });
      
      // Clear the textarea for next input
      await page.evaluate(() => {
        document.querySelector('textarea').value = '';
      });
    }
    
    // Check all images are present
    for (const prompt of prompts) {
      const image = await page.$(`img[alt*="${prompt}"]`);
      expect(image).toBeTruthy();
    }
  });

  test('should persist images in localStorage', async () => {
    // Generate an image
    await page.type('textarea', 'Persistence test');
    await page.click('button[type="submit"]');
    await page.waitForSelector('img[alt*="Persistence test"]', { timeout: 15000 });
    
    // Check localStorage has the image
    const storageData = await page.evaluate(() => {
      return localStorage.getItem('generated-images');
    });
    
    expect(storageData).toBeTruthy();
    const parsedData = JSON.parse(storageData);
    expect(parsedData.length).toBe(1);
    expect(parsedData[0].prompt).toBe('Persistence test');
    
    // Reload page and check image is still there
    await page.reload({ waitUntil: 'networkidle0' });
    await page.waitForSelector('img[alt*="Persistence test"]', { timeout: 5000 });
  });

  test('should be responsive on mobile viewport', async () => {
    // Set mobile viewport
    await page.setViewport({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Check that elements are still visible
    const heading = await page.$('h2');
    const textarea = await page.$('textarea');
    const button = await page.$('button[type="submit"]');
    
    expect(heading).toBeTruthy();
    expect(textarea).toBeTruthy();
    expect(button).toBeTruthy();
    
    // Check that elements are within viewport
    const headingBox = await heading.boundingBox();
    const textareaBox = await textarea.boundingBox();
    const buttonBox = await button.boundingBox();
    
    expect(headingBox.width).toBeLessThanOrEqual(375);
    expect(textareaBox.width).toBeLessThanOrEqual(375);
    expect(buttonBox.width).toBeLessThanOrEqual(375);
  });

  test('should handle keyboard navigation', async () => {
    // Generate an image first
    await page.type('textarea', 'Keyboard test');
    await page.click('button[type="submit"]');
    await page.waitForSelector('img[alt*="Keyboard test"]', { timeout: 15000 });
    
    // Click on image to open modal
    await page.click('img[alt*="Keyboard test"]');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Press Escape to close modal
    await page.keyboard.press('Escape');
    await page.waitForSelector('[role="dialog"]', { hidden: true, timeout: 5000 });
  });

  test('should handle form submission with Enter key', async () => {
    await page.type('textarea', 'Enter key test');
    
    // Press Enter to submit form
    await page.keyboard.press('Enter');
    
    // Wait for loading state
    await page.waitForSelector('text/Generating...', { timeout: 5000 });
    
    // Wait for image to appear
    await page.waitForSelector('img[alt*="Enter key test"]', { timeout: 15000 });
  });

  test('should handle network errors gracefully', async () => {
    // Intercept network requests and make them fail
    await page.setRequestInterception(true);
    
    page.on('request', (request) => {
      if (request.url().includes('picsum.photos')) {
        request.abort();
      } else {
        request.continue();
      }
    });
    
    await page.type('textarea', 'Network error test');
    await page.click('button[type="submit"]');
    
    // Should show loading state briefly
    await page.waitForSelector('text/Generating...', { timeout: 5000 });
    
    // Should handle the error gracefully (loading state should disappear)
    await page.waitForFunction(
      () => !document.querySelector('text/Generating...'),
      { timeout: 10000 }
    );
    
    // Turn off request interception
    await page.setRequestInterception(false);
  });

  test('should measure performance metrics', async () => {
    // Start measuring
    await page.tracing.start({ path: 'trace.json', screenshots: true });
    
    // Perform typical user actions
    await page.type('textarea', 'Performance test');
    await page.click('button[type="submit"]');
    await page.waitForSelector('img[alt*="Performance test"]', { timeout: 15000 });
    
    // Click on image to open modal
    await page.click('img[alt*="Performance test"]');
    await page.waitForSelector('[role="dialog"]', { timeout: 5000 });
    
    // Close modal
    await page.keyboard.press('Escape');
    await page.waitForSelector('[role="dialog"]', { hidden: true, timeout: 5000 });
    
    // Stop tracing
    await page.tracing.stop();
    
    // Get performance metrics
    const metrics = await page.metrics();
    
    // Basic performance assertions
    expect(metrics.JSHeapUsedSize).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
    expect(metrics.JSHeapTotalSize).toBeLessThan(100 * 1024 * 1024); // Less than 100MB
  });
});