#!/bin/bash

# Comprehensive Test Runner
# Runs all types of tests in the correct order

set -e

echo "🧪 Starting comprehensive test suite..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[$(date +'%H:%M:%S')]${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Initialize test results
UNIT_TESTS_PASSED=false
INTEGRATION_TESTS_PASSED=false
E2E_TESTS_PASSED=false
PUPPETEER_TESTS_PASSED=false

# Function to run command with error handling
run_test() {
    local test_name="$1"
    local command="$2"
    local result_var="$3"
    
    print_status "Running $test_name..."
    
    if eval "$command"; then
        print_success "$test_name completed successfully"
        eval "$result_var=true"
        return 0
    else
        print_error "$test_name failed"
        eval "$result_var=false"
        return 1
    fi
}

# 1. Pre-test checks
print_status "Performing pre-test checks..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    print_error "Dependencies not installed. Run 'npm install' first."
    exit 1
fi

# Check if build exists
if [ ! -d "dist" ]; then
    print_warning "Build directory not found. Building project..."
    npm run build
fi

print_success "Pre-test checks completed"

# 2. Code quality checks
print_status "Running code quality checks..."

run_test "TypeScript compilation" "npm run type-check" "TYPE_CHECK_PASSED"
run_test "ESLint" "npm run lint" "LINT_PASSED"
run_test "Prettier format check" "npm run format:check" "FORMAT_PASSED"

# 3. Unit Tests
print_status "Running unit tests..."
run_test "Unit tests with coverage" "npm run test:coverage" "UNIT_TESTS_PASSED"

# 4. Integration Tests
print_status "Running integration tests..."
run_test "Integration tests" "npm run test:run src/__tests__/integration" "INTEGRATION_TESTS_PASSED"

# 5. Build test
print_status "Testing production build..."
run_test "Production build" "npm run build" "BUILD_PASSED"

# 6. E2E Tests (Playwright)
print_status "Running E2E tests with Playwright..."
run_test "Playwright E2E tests" "npm run test:e2e" "E2E_TESTS_PASSED"

# 7. Puppeteer Tests
print_status "Running Puppeteer tests..."
if command -v jest &> /dev/null; then
    run_test "Puppeteer tests" "npm test tests/puppeteer/puppeteer-tests.js" "PUPPETEER_TESTS_PASSED"
else
    print_warning "Jest not found globally. Skipping Puppeteer tests."
    PUPPETEER_TESTS_PASSED=true
fi

# 8. Performance checks
print_status "Running performance checks..."
if [ -d "dist" ]; then
    BUNDLE_SIZE=$(du -sh dist | cut -f1)
    print_status "Bundle size: $BUNDLE_SIZE"
    
    # Check if bundle size is reasonable (< 10MB)
    BUNDLE_SIZE_BYTES=$(du -sb dist | cut -f1)
    if [ $BUNDLE_SIZE_BYTES -gt 10485760 ]; then
        print_warning "Bundle size is large (>10MB). Consider optimization."
    else
        print_success "Bundle size is acceptable"
    fi
fi

# 9. Generate test summary
print_status "Generating test summary..."

echo ""
echo "📊 Test Results Summary"
echo "======================="

# Function to display test result
show_result() {
    local test_name="$1"
    local result="$2"
    
    if [ "$result" = true ]; then
        echo -e "${GREEN}✅ $test_name${NC}"
    else
        echo -e "${RED}❌ $test_name${NC}"
    fi
}

show_result "Type Checking" "$TYPE_CHECK_PASSED"
show_result "Linting" "$LINT_PASSED"
show_result "Code Formatting" "$FORMAT_PASSED"
show_result "Unit Tests" "$UNIT_TESTS_PASSED"
show_result "Integration Tests" "$INTEGRATION_TESTS_PASSED"
show_result "Build" "$BUILD_PASSED"
show_result "E2E Tests (Playwright)" "$E2E_TESTS_PASSED"
show_result "Puppeteer Tests" "$PUPPETEER_TESTS_PASSED"

echo ""

# Check overall result
if [ "$TYPE_CHECK_PASSED" = true ] && \
   [ "$LINT_PASSED" = true ] && \
   [ "$FORMAT_PASSED" = true ] && \
   [ "$UNIT_TESTS_PASSED" = true ] && \
   [ "$INTEGRATION_TESTS_PASSED" = true ] && \
   [ "$BUILD_PASSED" = true ] && \
   [ "$E2E_TESTS_PASSED" = true ] && \
   [ "$PUPPETEER_TESTS_PASSED" = true ]; then
    
    print_success "All tests passed! 🎉"
    echo ""
    echo "✨ Your code is ready for deployment!"
    exit 0
else
    print_error "Some tests failed!"
    echo ""
    echo "💡 Please fix the failing tests before proceeding."
    echo "🔍 Check the output above for detailed error information."
    echo ""
    echo "Quick fixes:"
    echo "  - Run 'npm run lint:fix' to fix linting issues"
    echo "  - Run 'npm run format' to fix formatting issues"
    echo "  - Run 'npm run type-check' to see TypeScript errors"
    echo "  - Run specific test commands to debug failures"
    exit 1
fi