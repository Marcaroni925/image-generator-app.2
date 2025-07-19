# AI Image Generator App

A React-based AI image generator application with gallery functionality, comprehensive CI/CD pipeline, and monitoring infrastructure.

## Features

- **AI Image Generation**: Generate images using text prompts
- **User Authentication**: Complete authentication system with Firebase
- **Gallery Management**: User-specific image galleries with cloud storage
- **Social Authentication**: Google and GitHub OAuth login
- **User Profiles**: Customizable user profiles with preferences
- **Anonymous to Authenticated Migration**: Seamless image transfer
- **Responsive Design**: Works on desktop and mobile devices
- **Image Preview**: Full-screen image viewing with modal
- **State Management**: Efficient state handling with Zustand
- **TypeScript**: Full type safety throughout the application
- **Comprehensive Testing**: Unit tests with Vitest and React Testing Library
- **CI/CD Pipeline**: Automated testing, building, and deployment
- **Monitoring**: Performance monitoring, error tracking, and health checks
- **Code Quality**: ESLint, Prettier, and pre-commit hooks

## Technology Stack

### Core
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Router DOM** - Routing
- **Lucide React** - Icons

### Authentication & Backend
- **Firebase Auth** - Authentication service
- **Firestore** - Cloud database for user data
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Development & Testing
- **Vitest** - Testing framework
- **React Testing Library** - Component testing
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks

## Quick Start

### Automated Setup
```bash
# Run the automated setup script
./scripts/dev-setup.sh
```

### Manual Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup environment variables**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

3. **Setup pre-commit hooks**:
   ```bash
   npm run prepare
   ```

4. **Start the development server**:
   ```bash
   npm run dev
   ```

## Development Commands

### Core Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Code Quality
```bash
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm run type-check   # Check TypeScript types
```

### Testing
```bash
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

### Utilities
```bash
./scripts/health-check.sh    # Run comprehensive health checks
./scripts/cleanup.sh         # Clean build artifacts
./scripts/cleanup.sh --full  # Clean everything including node_modules
```

## Usage

1. Enter a description of the image you want to generate in the text area
2. Click "Generate Image" to create your image
3. View all generated images in the gallery below
4. Click on any image to view it in full screen
5. Use the download button to save images locally
6. Use the delete button to remove unwanted images

## Project Structure

```
src/
├── components/
│   ├── ImageGenerator.tsx     # Main image generation component
│   ├── ImageGallery.tsx       # Gallery display component
│   ├── ErrorBoundary.tsx      # Error boundary for error handling
│   └── __tests__/             # Component tests
├── hooks/
│   └── useImageGenerator.ts   # Custom hook for image generation
├── store/
│   └── imageStore.ts          # Zustand store for state management
├── types/
│   └── index.ts               # TypeScript type definitions
├── utils/
│   ├── logger.ts              # Logging utility
│   ├── analytics.ts           # Analytics tracking
│   ├── performance.ts         # Performance monitoring
│   └── health.ts              # Health checking
├── App.tsx                    # Main application component
├── main.tsx                   # Application entry point
├── index.css                  # Global styles
└── test-setup.ts              # Test configuration
```

## CI/CD Pipeline

### GitHub Actions Workflows

- **CI Pipeline** (`.github/workflows/ci.yml`):
  - Runs on push and pull requests
  - Tests on Node.js 18.x and 20.x
  - Linting, type checking, and building
  - Security audits and dependency checks
  - Automatic deployment to GitHub Pages

- **Monitoring** (`.github/workflows/monitor.yml`):
  - Runs every 6 hours
  - Health checks and performance monitoring
  - Bundle size analysis
  - Security audits

- **Dependabot** (`.github/dependabot.yml`):
  - Automated dependency updates
  - Weekly updates on Mondays
  - Grouped updates for development and production dependencies

### Quality Gates

All code must pass:
- ✅ ESLint with no errors
- ✅ TypeScript compilation
- ✅ All tests passing
- ✅ Security audit (no high vulnerabilities)
- ✅ Pre-commit hooks (formatting, linting)

## Monitoring & Observability

### Built-in Monitoring

- **Logger**: Structured logging with different levels
- **Performance Monitor**: Track function execution times and Web Vitals
- **Analytics**: Event tracking and user behavior analysis
- **Health Monitor**: System health checks and alerts
- **Error Boundary**: React error catching and reporting

### Usage Examples

```typescript
import { logger } from './utils/logger';
import { analytics } from './utils/analytics';
import { performanceMonitor } from './utils/performance';

// Logging
logger.info('Image generation started', { prompt: 'sunset beach' });

// Analytics
analytics.trackImageGeneration('sunset beach', true, 2000);

// Performance monitoring
const duration = performanceMonitor.measureFunction('generateImage', () => {
  // Your function here
});
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
# Image Generation Service
VITE_API_URL=your-api-url
VITE_API_KEY=your-api-key
VITE_IMAGE_SERVICE_URL=your-image-service-url
VITE_IMAGE_SERVICE_KEY=your-image-service-key

# Firebase Configuration
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id

# Firebase Development (Optional)
VITE_USE_FIREBASE_EMULATOR=false

# Authentication Settings
VITE_AUTH_PERSISTENCE=local
VITE_AUTH_REDIRECT_URL=http://localhost:3000

# Analytics (optional)
VITE_ANALYTICS_ID=your-analytics-id

# Development
VITE_DEV_MODE=true
VITE_LOG_LEVEL=info
```

## Development Workflow

1. **Create a new branch**:
   ```bash
   git checkout -b feature/your-feature
   ```

2. **Make your changes** following the code style

3. **Run quality checks**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   ```

4. **Commit your changes** (pre-commit hooks will run automatically)

5. **Push and create a pull request**

6. **CI pipeline will run** and deploy preview if successful

## VS Code Setup

The project includes VS Code configuration for:
- Recommended extensions
- Auto-formatting on save
- ESLint integration
- TypeScript support
- Tailwind CSS IntelliSense

## Production Deployment

### Automatic Deployment
- Pushes to `main` branch trigger automatic deployment to GitHub Pages
- Build artifacts are created and deployed automatically

### Manual Deployment
```bash
npm run build
# Deploy the `dist` folder to your hosting service
```

## Integration with AI Services

This application uses placeholder images from Picsum Photos for demonstration purposes. In a production environment, you would integrate with a real AI image generation service like:

- **OpenAI DALL-E**: High-quality image generation
- **Midjourney API**: Artistic image creation
- **Stable Diffusion**: Open-source image generation
- **Google Imagen**: Google's AI image generator

### Example Integration

```typescript
// Example integration with OpenAI DALL-E
const generateImage = async (prompt: string) => {
  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      n: 1,
      size: '1024x1024',
    }),
  });
  
  const data = await response.json();
  return data.data[0].url;
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the full test suite
6. Submit a pull request

See the [Development Workflow](#development-workflow) section for detailed instructions.

## Troubleshooting

### Common Issues

**Build fails with TypeScript errors**:
- Run `npm run type-check` to see detailed errors
- Ensure all dependencies are installed: `npm install`

**Tests failing**:
- Run `npm run test:run` to see specific test failures
- Check test setup in `src/test-setup.ts`

**Pre-commit hooks not running**:
- Run `npm run prepare` to set up Husky
- Ensure Git hooks are executable: `chmod +x .husky/*`

**Performance issues**:
- Use the performance monitor to identify bottlenecks
- Check bundle size with `npm run build`
- Use the health check script: `./scripts/health-check.sh`

### Getting Help

1. Check the [GitHub Issues](https://github.com/your-repo/issues) for existing problems
2. Run `./scripts/health-check.sh` to diagnose issues
3. Check the browser console for error messages
4. Review the CI/CD logs for build failures

## Performance Optimization

### Bundle Size
- Code splitting with dynamic imports
- Tree shaking for unused code
- Optimize images and assets
- Use production builds for deployment

### Runtime Performance
- Performance monitoring built-in
- React.memo for expensive components
- Virtualization for large lists
- Debounced inputs for search

### Monitoring
- Real-time performance metrics
- Error tracking and reporting
- User analytics and behavior
- System health monitoring

## Security

- No secrets in code or environment variables
- Content Security Policy headers
- Input validation and sanitization
- Regular security audits via CI/CD
- Dependency vulnerability scanning

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using React, TypeScript, and modern development practices.**