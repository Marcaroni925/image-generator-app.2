#!/bin/bash

# Health Check Script
# This script performs comprehensive health checks on the application

set -e

echo "🔍 Running application health checks..."

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ Node modules not found. Run 'npm install' first."
    exit 1
fi

# Check if build directory exists
if [ ! -d "dist" ]; then
    echo "⚠️  Build directory not found. Running build..."
    npm run build
fi

# Run linting
echo "🔧 Checking code quality..."
npm run lint

# Run type checking
echo "🔍 Checking TypeScript types..."
npm run type-check

# Run tests
echo "🧪 Running tests..."
if npm run test:run &> /dev/null; then
    echo "✅ Tests passed"
else
    echo "❌ Tests failed"
    exit 1
fi

# Check bundle size
echo "📦 Checking bundle size..."
if [ -d "dist" ]; then
    BUNDLE_SIZE=$(du -sh dist | cut -f1)
    echo "📊 Bundle size: $BUNDLE_SIZE"
    
    # Check if bundle is too large (>10MB)
    BUNDLE_SIZE_BYTES=$(du -sb dist | cut -f1)
    if [ $BUNDLE_SIZE_BYTES -gt 10485760 ]; then
        echo "⚠️  Bundle size is large (>10MB). Consider optimization."
    fi
fi

# Check for security vulnerabilities
echo "🔒 Checking for security vulnerabilities..."
npm audit --audit-level=moderate

# Check for outdated packages
echo "📊 Checking for outdated packages..."
npm outdated || echo "ℹ️  Some packages may be outdated"

# Performance check
echo "⚡ Performance checks..."
if command -v lighthouse &> /dev/null; then
    echo "🚀 Lighthouse available - consider running performance audit"
else
    echo "ℹ️  Lighthouse not available - install for performance auditing"
fi

echo "✅ Health check complete!"
echo ""
echo "🎯 Next steps:"
echo "  - Review any warnings or errors above"
echo "  - Update outdated packages if needed"
echo "  - Run 'npm run dev' to start development server"
echo "  - Run 'npm run build' to create production build"