#!/bin/bash

# Cleanup Script
# This script cleans up development artifacts and resets the environment

set -e

echo "🧹 Cleaning up development environment..."

# Clean build artifacts
if [ -d "dist" ]; then
    echo "🗑️  Removing build directory..."
    rm -rf dist
fi

# Clean coverage reports
if [ -d "coverage" ]; then
    echo "🗑️  Removing coverage directory..."
    rm -rf coverage
fi

# Clean node_modules if requested
if [ "$1" = "--full" ]; then
    echo "🗑️  Removing node_modules..."
    rm -rf node_modules
    echo "🗑️  Removing package-lock.json..."
    rm -f package-lock.json
    echo "📦 Run 'npm install' to reinstall dependencies"
fi

# Clean cache directories
if [ -d ".cache" ]; then
    echo "🗑️  Removing cache directory..."
    rm -rf .cache
fi

# Clean temporary files
echo "🗑️  Removing temporary files..."
find . -name "*.tmp" -type f -delete 2>/dev/null || true
find . -name "*.temp" -type f -delete 2>/dev/null || true
find . -name ".DS_Store" -type f -delete 2>/dev/null || true

# Clean logs
if [ -d "logs" ]; then
    echo "🗑️  Removing log files..."
    rm -rf logs
fi

# Clean test artifacts
if [ -d "test-results" ]; then
    echo "🗑️  Removing test results..."
    rm -rf test-results
fi

echo "✅ Cleanup complete!"
echo ""
echo "🎯 Next steps:"
echo "  - Run 'npm install' if you used --full flag"
echo "  - Run 'npm run build' to create fresh build"
echo "  - Run 'npm run dev' to start development server"