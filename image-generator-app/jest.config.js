// Jest configuration for Puppeteer tests
module.exports = {
  preset: 'jest-puppeteer',
  testEnvironment: 'node',
  testMatch: ['**/tests/puppeteer/**/*.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/puppeteer/setup.js'],
  testTimeout: 30000,
  collectCoverage: false, // Puppeteer tests don't need coverage
  verbose: true,
  reporters: [
    'default',
    ['jest-html-reporters', {
      publicPath: './test-results/puppeteer',
      filename: 'report.html',
      expand: true,
    }]
  ],
};