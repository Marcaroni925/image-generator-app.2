#!/bin/bash

# Development Environment Setup Script
# This script sets up the development environment for the image generator app

set -e

echo "🚀 Setting up development environment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node --version)
echo "✅ Node.js version: $NODE_VERSION"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup Husky if not already done
if [ ! -d ".husky" ]; then
    echo "🔧 Setting up Husky pre-commit hooks..."
    npm run prepare
fi

# Create .env.local from .env.example if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📄 Creating .env.local from .env.example..."
    cp .env.example .env.local
    echo "⚠️  Please update .env.local with your actual values"
fi

# Run type checking
echo "🔍 Running type check..."
npm run type-check

# Run linting
echo "🔧 Running linter..."
npm run lint

# Run tests if they exist
if npm run test:run &> /dev/null; then
    echo "🧪 Running tests..."
    npm run test:run
else
    echo "ℹ️  No tests found to run"
fi

# Build the project
echo "🏗️  Building project..."
npm run build

echo "✅ Development environment setup complete!"
echo ""
echo "🎯 Quick start commands:"
echo "  npm run dev          - Start development server"
echo "  npm run build        - Build for production"
echo "  npm run test         - Run tests"
echo "  npm run test:ui      - Run tests with UI"
echo "  npm run lint         - Run linter"
echo "  npm run format       - Format code"
echo "  npm run type-check   - Check TypeScript types"
echo ""
echo "📚 See README.md for more detailed instructions."