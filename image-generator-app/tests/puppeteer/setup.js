// Global test setup for Puppeteer tests
const { spawn } = require('child_process');

let previewServer;

beforeAll(async () => {
  // Start preview server for testing
  previewServer = spawn('npm', ['run', 'preview'], {
    stdio: 'pipe',
    shell: true,
  });

  // Wait for server to start
  await new Promise((resolve) => {
    const timeout = setTimeout(() => {
      resolve();
    }, 10000); // 10 second timeout

    previewServer.stdout.on('data', (data) => {
      if (data.toString().includes('4173')) {
        clearTimeout(timeout);
        resolve();
      }
    });
  });
});

afterAll(async () => {
  // Clean up server
  if (previewServer) {
    previewServer.kill();
  }
});

// Global test configuration
global.testConfig = {
  baseUrl: 'http://localhost:4173',
  timeout: 30000,
  slowMo: process.env.CI ? 0 : 50,
};