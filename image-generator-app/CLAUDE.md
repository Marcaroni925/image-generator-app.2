# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
npm run dev          # Start development server (port 3000, auto-increment if occupied)
npm run build        # Build for production (runs TypeScript compilation + Vite build)
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check formatting without fixing
npm run type-check   # TypeScript type checking without compilation
```

### Testing
```bash
npm run test         # Run unit tests in watch mode (Vitest)
npm run test:run     # Run tests once
npm run test:ui      # Run tests with Vitest UI
npm run test:coverage # Run tests with coverage report
npm run test:e2e     # Run E2E tests (Playwright)
npm run test:e2e:ui  # Run E2E tests with Playwright UI
npm run test:all     # Run comprehensive test suite via script
```

### Utilities
```bash
./scripts/dev-setup.sh    # Automated development setup
./scripts/health-check.sh # Comprehensive health checks
./scripts/cleanup.sh      # Clean build artifacts
./scripts/test-all.sh     # Run all tests and quality checks
```

## Architecture Overview

This is a React TypeScript application with Firebase authentication and AI image generation capabilities. The architecture follows modern React patterns with emphasis on type safety, testing, and maintainability.

### State Management
- **Zustand** for global state management with persistence
- **Three main stores**: `authStore`, `generationStore`, `imageStore`
- **Hybrid approach**: Zustand stores wrapped in React Context for component tree integration
- **Persistence**: localStorage integration with automatic hydration

### Authentication System
- **Firebase Authentication** (currently using placeholder implementations)
- **Protected routes** with ProtectedRoute component
- **Social auth support** (Google, GitHub) ready for integration
- **Anonymous to authenticated migration** for seamless UX

### Component Architecture
- **Pages**: High-level route components (`src/pages/`)
- **Feature components**: Domain-specific components (`src/components/`)
- **UI library**: Reusable components (`src/components/ui/`) with barrel exports
- **Layouts**: Conditional layouts based on authentication state

### Key Custom Hooks
- **`useImageGenerator`**: Core image generation logic with validation
- **`useAuth`**: Authentication state management
- **`useBreadcrumbs`**: Dynamic breadcrumb generation based on routes

## Code Style and Patterns

### TypeScript Configuration
- **Strict mode enabled** with comprehensive type checking
- **Interfaces defined** in `src/types/` for all major entities
- **Environment validation** with runtime type checking in `src/config/environment.ts`

### Styling System
- **Tailwind CSS** with custom Aigenr design system
- **Custom gradient backgrounds** with theme support
- **Responsive design** with mobile-first approach
- **Dark mode support** via ThemeContext

### Testing Strategy
- **Unit tests**: Vitest + React Testing Library
- **E2E tests**: Playwright for full user workflows
- **Coverage requirements**: 80% statements, 75% branches, 90% functions
- **Performance tests**: Dedicated Puppeteer setup

### Error Handling
- **Comprehensive error tracking** (`src/utils/errorTracking.ts`)
- **Error boundaries** for React component crashes
- **Input validation** with security focus (`src/utils/validation.ts`)
- **Graceful degradation** for API failures

## Development Workflow

### Pre-commit Process
- **Husky git hooks** automatically run on commit
- **Lint-staged** runs formatting, linting, and type checking
- **Test suite** runs on pre-push hook
- **Quality gates** must pass before commit

### Environment Setup
1. Copy `.env.example` to `.env.local`
2. Configure Firebase credentials and API keys
3. Run `npm run prepare` to set up git hooks
4. Use `./scripts/dev-setup.sh` for automated setup

### Firebase Integration
- **Current state**: Placeholder implementations ready for Firebase
- **Authentication**: Firebase Auth with social providers
- **Database**: Firestore for user data and image metadata
- **Storage**: Firebase Storage for image files

## Key Files and Locations

### Configuration Files
- `tailwind.config.js` - Tailwind CSS configuration with custom Aigenr theme
- `vite.config.ts` - Vite build configuration
- `vitest.config.ts` - Unit test configuration
- `playwright.config.ts` - E2E test configuration

### Core Application Files
- `src/App.tsx` - Main app component with routing and layout logic
- `src/main.tsx` - Application entry point
- `src/index.css` - Global styles and custom CSS

### State Management
- `src/store/` - Zustand stores for auth, generation, and images
- `src/contexts/` - React contexts for theme and auth
- `src/hooks/` - Custom hooks for business logic

### Environment and Configuration
- `src/config/environment.ts` - Runtime environment validation
- `src/types/` - TypeScript interfaces and types
- `src/utils/` - Utility functions for validation, error tracking, etc.

## Common Issues and Solutions

### Build Issues
- Run `npm run type-check` to see TypeScript errors
- Ensure all environment variables are configured
- Check for missing dependencies with `npm install`

### Test Failures
- Use `npm run test:run` for one-time test execution
- Check `src/test-setup.ts` for test configuration
- Verify mock implementations in test files

### Authentication
- Firebase configuration is placeholder - implement real Firebase setup
- Check `src/store/authStore.ts` for authentication state management
- Ensure protected routes are properly configured

### Performance
- Use built-in performance monitoring utilities
- Check bundle size with production builds
- Run `./scripts/health-check.sh` for diagnostic information

## Security Considerations

- **Input validation**: All user inputs are sanitized in `src/utils/validation.ts`
- **No secrets in code**: Environment variables for sensitive data
- **Content Security Policy**: Ready for implementation
- **Dependency scanning**: Automated via CI/CD pipeline
- **Firebase security rules**: Implement proper Firestore rules when integrating