import puppeteer from 'puppeteer';

(async () => {
  console.log('🚀 Starting Puppeteer...');
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });
  
  const page = await browser.newPage();
  
  // Set viewport
  await page.setViewport({ width: 1280, height: 720 });
  
  try {
    console.log('📱 Navigating to application...');
    
    // Try different ports/URLs
    const urls = [
      'http://localhost:3000',
      'http://localhost:4000',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:4000',
      'http://172.25.39.148:3000',
      'http://172.25.39.148:4000',
      'http://10.255.255.254:3000',
      'http://10.255.255.254:4000'
    ];
    
    let success = false;
    for (const url of urls) {
      try {
        console.log(`Trying ${url}...`);
        await page.goto(url, { 
          waitUntil: 'networkidle0',
          timeout: 10000
        });
        success = true;
        console.log(`✅ Successfully connected to ${url}`);
        break;
      } catch (error) {
        console.log(`❌ Failed to connect to ${url}: ${error.message}`);
      }
    }
    
    if (!success) {
      console.log('❌ Could not connect to any URL');
      await browser.close();
      return;
    }
    
    // Wait for the page to fully load
    await page.waitForSelector('body', { timeout: 10000 });
    
    // Take screenshot
    console.log('📸 Taking screenshot...');
    await page.screenshot({ 
      path: 'app-screenshot.png',
      fullPage: true
    });
    
    // Get page title and basic info
    const title = await page.title();
    const url = page.url();
    
    console.log(`📱 Page title: ${title}`);
    console.log(`🌐 URL: ${url}`);
    console.log('✅ Screenshot saved as app-screenshot.png');
    
    // Try to interact with the app
    try {
      // Check if theme toggle exists
      const themeToggle = await page.$('button[title*="mode"]');
      if (themeToggle) {
        console.log('🌙 Theme toggle found - clicking...');
        await themeToggle.click();
        await page.waitForTimeout(1000);
        
        // Take another screenshot in dark mode
        await page.screenshot({ 
          path: 'app-screenshot-dark.png',
          fullPage: true
        });
        console.log('🌙 Dark mode screenshot saved as app-screenshot-dark.png');
      }
      
      // Check for navigation links
      const navLinks = await page.$$('nav a');
      console.log(`🧭 Found ${navLinks.length} navigation links`);
      
      // Check for main content
      const main = await page.$('main');
      if (main) {
        console.log('📄 Main content area found');
      }
      
    } catch (error) {
      console.log(`⚠️  Error during interaction: ${error.message}`);
    }
    
  } catch (error) {
    console.log(`❌ Error: ${error.message}`);
  }
  
  await browser.close();
  console.log('🔚 Puppeteer session ended');
})();