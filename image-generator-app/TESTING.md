# Testing Guide

This document provides comprehensive information about the testing setup and practices for the Image Generator App.

## Testing Strategy

Our testing approach follows the testing pyramid principle:

### 🔺 Testing Pyramid

```
        /\
       /  \
      / E2E \     ← Few, high-level tests
     /______\
    /        \
   / Integration \ ← Some integration tests
  /______________\
 /                \
/   Unit Tests     \ ← Many, fast unit tests
\__________________/
```

## Test Types

### Unit Tests
- **Framework**: Vitest + React Testing Library
- **Coverage**: Components, hooks, utilities, stores
- **Goal**: 90%+ code coverage
- **Speed**: Very fast (< 1s)

### Integration Tests
- **Framework**: Vitest + React Testing Library
- **Coverage**: Component interactions, data flow
- **Goal**: Critical user workflows
- **Speed**: Fast (< 5s)

### End-to-End Tests
- **Frameworks**: Playwright + Puppeteer
- **Coverage**: Complete user journeys
- **Goal**: Core functionality works end-to-end
- **Speed**: Slower (30s - 2min)

## Running Tests

### Quick Commands

```bash
# Run all unit tests
npm run test

# Run tests in watch mode
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run only unit tests once
npm run test:run

# Run E2E tests (Playwright)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug
```

### Detailed Test Execution

#### Unit & Integration Tests

```bash
# Run specific test file
npx vitest run src/components/__tests__/ImageGenerator.test.tsx

# Run tests matching pattern
npx vitest run --reporter=verbose "ImageGenerator"

# Run tests with coverage for specific files
npx vitest run --coverage src/components/

# Watch mode for specific test
npx vitest --watch src/hooks/__tests__/useImageGenerator.test.ts
```

#### E2E Tests

```bash
# Run specific E2E test
npx playwright test tests/e2e/image-generator.spec.ts

# Run tests on specific browser
npx playwright test --project=chromium

# Run tests on mobile device
npx playwright test --project="Mobile Chrome"

# Run performance tests only
npx playwright test tests/e2e/performance.spec.ts

# Generate Playwright test
npx playwright codegen http://localhost:4173
```

## Test Structure

### Directory Layout

```
src/
├── components/
│   ├── __tests__/              # Component unit tests
│   │   ├── ImageGenerator.test.tsx
│   │   └── ImageGallery.test.tsx
│   └── ErrorBoundary.tsx
├── hooks/
│   └── __tests__/              # Hook tests
│       └── useImageGenerator.test.ts
├── store/
│   └── __tests__/              # Store tests
│       └── imageStore.test.ts
├── utils/
│   └── __tests__/              # Utility tests
│       └── logger.test.ts
├── __tests__/
│   └── integration/            # Integration tests
│       └── app-integration.test.tsx
└── test-setup.ts               # Test configuration

tests/
├── e2e/                        # End-to-end tests
│   ├── image-generator.spec.ts
│   └── performance.spec.ts
└── puppeteer/                  # Puppeteer tests
    └── puppeteer-tests.js
```

### Test File Naming

- Unit tests: `*.test.{ts,tsx}`
- Integration tests: `*.integration.test.{ts,tsx}`
- E2E tests: `*.spec.ts`

## Writing Tests

### Unit Test Example

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ImageGenerator } from '../ImageGenerator';

describe('ImageGenerator', () => {
  it('should render with correct elements', () => {
    render(<ImageGenerator />);
    
    expect(screen.getByText('AI Image Generator')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Describe the image...')).toBeInTheDocument();
  });

  it('should handle form submission', async () => {
    render(<ImageGenerator />);
    
    const textarea = screen.getByPlaceholderText('Describe the image...');
    const button = screen.getByRole('button', { name: /generate/i });
    
    fireEvent.change(textarea, { target: { value: 'test prompt' } });
    fireEvent.click(button);
    
    expect(screen.getByText('Generating...')).toBeInTheDocument();
  });
});
```

### Integration Test Example

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../../App';

describe('App Integration', () => {
  it('should complete image generation workflow', async () => {
    render(<App />);
    
    // Fill form
    fireEvent.change(
      screen.getByPlaceholderText('Describe the image...'),
      { target: { value: 'test image' } }
    );
    
    // Submit
    fireEvent.click(screen.getByRole('button', { name: /generate/i }));
    
    // Verify result
    await waitFor(() => {
      expect(screen.getByText('test image')).toBeInTheDocument();
    });
  });
});
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should generate and display image', async ({ page }) => {
  await page.goto('/');
  
  await page.fill('textarea', 'beautiful sunset');
  await page.click('button:has-text("Generate Image")');
  
  await expect(page.locator('text=Generating...')).toBeVisible();
  await expect(page.locator('img[alt*="beautiful sunset"]')).toBeVisible();
});
```

## Mocking

### Mock External APIs

```typescript
// Mock fetch for API calls
const mockFetch = vi.fn();
global.fetch = mockFetch;

beforeEach(() => {
  mockFetch.mockResolvedValue({
    ok: true,
    blob: () => Promise.resolve(new Blob()),
  });
});
```

### Mock Browser APIs

```typescript
// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock URL APIs
URL.createObjectURL = vi.fn().mockReturnValue('blob:test-url');
URL.revokeObjectURL = vi.fn();
```

### Mock React Hooks

```typescript
// Mock custom hooks
vi.mock('../hooks/useImageGenerator', () => ({
  useImageGenerator: () => ({
    generateImage: vi.fn().mockResolvedValue(mockImage),
    isGenerating: false,
  }),
}));
```

## Coverage Requirements

### Coverage Targets

- **Statements**: 90%+
- **Branches**: 85%+
- **Functions**: 95%+
- **Lines**: 90%+

### Coverage Reports

```bash
# Generate coverage report
npm run test:coverage

# View HTML coverage report
open coverage/index.html

# Coverage in CI
# Reports are uploaded as artifacts in GitHub Actions
```

### Excluding Files from Coverage

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    coverage: {
      exclude: [
        'node_modules/',
        'dist/',
        '*.config.ts',
        'src/test-setup.ts',
      ],
    },
  },
});
```

## CI/CD Integration

### GitHub Actions Workflows

1. **CI Pipeline** (`.github/workflows/ci.yml`)
   - Runs on every push/PR
   - Unit tests + coverage
   - Build verification

2. **E2E Tests** (`.github/workflows/e2e-tests.yml`)
   - Cross-browser testing
   - Mobile device testing
   - Performance testing

### Pre-commit Hooks

```bash
# Automatically run before each commit
- Lint-staged (formatting)
- Type checking
- Unit tests
```

### Pre-push Hooks

```bash
# Automatically run before each push
- All tests
- Linting
- Build verification
```

## Best Practices

### Test Writing

1. **Follow AAA Pattern**
   ```typescript
   // Arrange
   const user = { id: 1, name: 'Test' };
   
   // Act
   const result = processUser(user);
   
   // Assert
   expect(result).toBe('Processed: Test');
   ```

2. **Use Descriptive Test Names**
   ```typescript
   // ❌ Bad
   it('should work', () => {});
   
   // ✅ Good
   it('should generate image when valid prompt is provided', () => {});
   ```

3. **Test Behavior, Not Implementation**
   ```typescript
   // ❌ Bad - testing implementation
   expect(component.state.loading).toBe(true);
   
   // ✅ Good - testing behavior
   expect(screen.getByText('Loading...')).toBeInTheDocument();
   ```

### Async Testing

```typescript
// Use waitFor for async operations
await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});

// Use findBy for elements that appear asynchronously
const element = await screen.findByText('Async Content');
```

### Accessibility Testing

```typescript
// Test keyboard navigation
fireEvent.keyDown(element, { key: 'Enter' });

// Test ARIA labels
expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();

// Test screen reader content
expect(screen.getByRole('button', { name: /generate/i })).toBeInTheDocument();
```

## Performance Testing

### Metrics to Monitor

- **Load Time**: < 3 seconds
- **LCP (Largest Contentful Paint)**: < 2.5 seconds
- **FID (First Input Delay)**: < 100ms
- **Bundle Size**: Monitor and set limits

### Performance Test Example

```typescript
test('should load page within acceptable time', async ({ page }) => {
  const startTime = Date.now();
  await page.goto('/');
  const loadTime = Date.now() - startTime;
  
  expect(loadTime).toBeLessThan(3000);
});
```

## Debugging Tests

### Unit Test Debugging

```typescript
// Add debug output
import { screen } from '@testing-library/react';

// Print DOM tree
screen.debug();

// Print specific element
screen.debug(screen.getByRole('button'));
```

### E2E Test Debugging

```bash
# Run in headed mode (visible browser)
npm run test:e2e:headed

# Debug specific test
npx playwright test --debug tests/e2e/image-generator.spec.ts

# Generate test with recorder
npx playwright codegen http://localhost:4173
```

### VS Code Integration

```json
// .vscode/launch.json
{
  "configurations": [
    {
      "name": "Debug Vitest",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
      "args": ["run", "--reporter=verbose"],
      "console": "integratedTerminal"
    }
  ]
}
```

## Troubleshooting

### Common Issues

**Tests timing out**
```typescript
// Increase timeout for slow operations
await waitFor(() => {
  expect(element).toBeInTheDocument();
}, { timeout: 10000 });
```

**Mock not working**
```typescript
// Ensure mocks are cleared between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

**E2E tests failing**
```typescript
// Add wait conditions
await page.waitForLoadState('networkidle');
await page.waitForSelector('[data-testid="image"]');
```

### Getting Help

1. Check test logs and error messages
2. Review coverage reports for missed cases
3. Use debugging tools (browser dev tools for E2E)
4. Check CI artifacts for failed test details

## Continuous Improvement

### Test Metrics to Track

- Test execution time
- Test failure rate
- Coverage trends
- Flaky test identification

### Regular Tasks

- Review and update test coverage
- Remove/update obsolete tests
- Optimize slow-running tests
- Update test dependencies

---

**Remember**: Good tests are your safety net. They should give you confidence to refactor and deploy with peace of mind! 🛡️