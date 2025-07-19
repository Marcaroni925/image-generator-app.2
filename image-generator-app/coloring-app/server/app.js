/**
 * Express application setup for Coloring Book Creator API
 * Provides AI-powered prompt refinement and DALL-E image generation endpoints
 * 
 * Architecture Evidence: 
 * - Based on architecture.md Section 2.2 Backend Stack
 * - Implements RESTful APIs with JSON responses
 * - OpenAI SDK integration for DALL-E image generation
 * - Express-validator for input sanitization
 */

import express from 'express';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';
import promptRefinementService from './services/promptRefinement.js';
import { apiLogger, loggerUtils } from './utils/logger.js';
import authRoutes from './routes/auth.js';
import admin from 'firebase-admin';

const app = express();

// Initialize Firebase Admin if not already initialized
let firebaseAdmin;
try {
  firebaseAdmin = admin.apps.length ? admin.app() : null;
  if (!firebaseAdmin && process.env.NODE_ENV !== 'development') {
    // Only initialize in production or when explicitly configured
    const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (serviceAccountKey) {
      const serviceAccount = JSON.parse(serviceAccountKey);
      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
    }
  }
} catch (error) {
  apiLogger.warn('Firebase Admin not initialized for image saving', {
    error: error.message,
    note: 'Gallery save will be disabled'
  });
}

/**
 * Helper function to save generated image to user's gallery
 */
const saveToGallery = async (userId, imageData) => {
  if (!firebaseAdmin || !userId) {
    return null; // Skip if no auth or admin not initialized
  }

  try {
    const db = firebaseAdmin.firestore();
    const imageDoc = {
      userId,
      imageUrl: imageData.imageUrl,
      originalPrompt: imageData.originalPrompt,
      refinedPrompt: imageData.refinedPrompt,
      metadata: imageData.metadata || {},
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('user_images').add(imageDoc);
    
    apiLogger.info('Image saved to gallery', {
      userId,
      imageId: docRef.id,
      promptLength: imageData.originalPrompt.length
    });

    return docRef.id;
  } catch (error) {
    apiLogger.error('Failed to save image to gallery', {
      userId,
      error: error.message
    });
    return null;
  }
};

/**
 * Initialize OpenAI client with environment-based key selection
 * Evidence: architecture.md 6.1 - Mock keys for development, API cost mitigation
 * 
 * Development mode: Uses mock key to prevent API costs during testing
 * Production mode: Uses real OpenAI API key from environment variables
 */
function initializeOpenAI() {
  const hasRealKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-mock-key-for-testing' && process.env.OPENAI_API_KEY.startsWith('sk-');
  const apiKey = hasRealKey ? process.env.OPENAI_API_KEY : 'sk-mock-key-for-testing';
  
  apiLogger.info('OpenAI client initialized', {
    mode: hasRealKey ? 'Development (Real API)' : 'Development (Mock)',
    environment: process.env.NODE_ENV,
    hasApiKey: !!apiKey,
    keyStartsWith: process.env.OPENAI_API_KEY?.substring(0, 10) + '...',
    keyLength: process.env.OPENAI_API_KEY?.length,
    isRealKey: hasRealKey
  });
  
  return new OpenAI({ apiKey });
}

const openai = initializeOpenAI();

// Middleware setup
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount auth routes
app.use('/api/auth', authRoutes);

// Optional auth middleware for gallery integration
app.use(async (req, res, next) => {
  // Try to extract user information from Authorization header (optional)
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ') && firebaseAdmin) {
    try {
      const idToken = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      
      // Add user info to request object for gallery integration
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name || decodedToken.email
      };
    } catch (error) {
      // Invalid token, but don't block the request - just continue without user
      apiLogger.debug('Optional auth failed, continuing without user context', {
        error: error.message
      });
    }
  }
  
  next();
});

// Enhanced request logging middleware with winston
app.use((req, res, next) => {
  const startTime = Date.now();
  
  // Log incoming request
  loggerUtils.logRequest(apiLogger, req);
  
  // Override res.end to capture response data
  const originalEnd = res.end;
  res.end = function(...args) {
    const responseTime = Date.now() - startTime;
    
    // Log response
    loggerUtils.logResponse(apiLogger, req, res, responseTime);
    
    originalEnd.apply(this, args);
  };
  
  next();
});

// Family-friendly content filter
const inappropriateKeywords = [
  'violence', 'blood', 'weapon', 'gun', 'knife', 'death', 'kill',
  'sexual', 'nude', 'naked', 'adult', 'explicit', 'inappropriate',
  'drug', 'alcohol', 'beer', 'wine', 'cigarette', 'smoking',
  'scary', 'horror', 'demon', 'devil', 'evil', 'dark magic'
];

/**
 * Content filter to ensure family-friendly prompts
 * @param {string} text - Text to validate
 * @returns {boolean} - True if content is appropriate
 */
function isContentAppropriate(text) {
  const lowerText = text.toLowerCase();
  return !inappropriateKeywords.some(keyword => lowerText.includes(keyword));
}

/**
 * Legacy functions removed - now using dedicated PromptRefinementService
 * Evidence: architecture.md 3.1.3 - Modular service architecture
 * 
 * The prompt refinement logic has been moved to:
 * server/services/promptRefinement.js
 * 
 * This provides better separation of concerns, testability, and maintainability
 * following the service layer pattern outlined in architecture.md Section 3.3.2
 */

// Validation middleware for API endpoints
const validateGenerateRequest = [
  body('prompt')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Prompt must be between 1 and 500 characters')
    .custom((value) => {
      if (!isContentAppropriate(value)) {
        throw new Error('Content must be family-friendly');
      }
      return true;
    }),
  body('customizations.complexity')
    .optional()
    .isIn(['simple', 'medium', 'detailed'])
    .withMessage('Complexity must be simple, medium, or detailed'),
  body('customizations.ageGroup')
    .optional()
    .isIn(['kids', 'teens', 'adults'])
    .withMessage('Age group must be kids, teens, or adults'),
  body('customizations.lineThickness')
    .optional()
    .isIn(['thin', 'medium', 'thick'])
    .withMessage('Line thickness must be thin, medium, or thick'),
  body('customizations.border')
    .optional()
    .isIn(['with', 'without'])
    .withMessage('Border must be with or without'),
  body('customizations.theme')
    .optional()
    .isIn(['animals', 'mandalas', 'fantasy', 'nature'])
    .withMessage('Theme must be animals, mandalas, fantasy, or nature')
];

/**
 * Enhanced health check endpoint with OpenAI connection validation
 * Evidence: architecture.md 6.3 - API connection validation for reliability
 * 
 * Returns comprehensive service status including:
 * - Service health status
 * - OpenAI API connectivity  
 * - Environment mode (development/production)
 * - Prompt refinement service status
 */
app.get('/api/health', async (req, res) => {
  try {
    apiLogger.info('Health check requested');
    
    // Get prompt refinement service health
    const refinementHealth = await promptRefinementService.healthCheck();
    
    // Basic service health
    const healthData = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'Coloring Book Creator API',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'production',
      openai: refinementHealth.openaiConnected ? 'connected' : 'mock',
      promptRefinement: refinementHealth.status,
      endpoints: {
        generate: '/api/generate',
        refinePrompt: '/api/refine-prompt',
        health: '/api/health'
      }
    };

    // Log health check result with structured data
    loggerUtils.logHealthCheck(apiLogger, 'Coloring Book API', healthData.status, {
      openaiStatus: healthData.openai,
      environment: healthData.environment,
      promptRefinementStatus: healthData.promptRefinement,
      features: refinementHealth.features
    });

    res.json(healthData);
    
  } catch (error) {
    loggerUtils.logError(apiLogger, error, {
      operation: 'health-check',
      component: 'api'
    });
    
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      service: 'Coloring Book Creator API',
      error: error.message,
      environment: process.env.NODE_ENV || 'production'
    });
  }
});

/**
 * Prompt refinement endpoint - Standalone prompt enhancement service
 * Evidence: architecture.md 3.2.4 - Prompt Testing (Development) endpoint
 * 
 * Uses the dedicated PromptRefinementService for intelligent enhancement
 * Returns refined prompt with detailed metadata for testing and validation
 */
app.post('/api/refine-prompt', 
  validateGenerateRequest,
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      apiLogger.info('Prompt refinement requested', {
        bodySize: JSON.stringify(req.body).length
      });
      
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        apiLogger.warn('Validation failed for refine-prompt', {
          errors: errors.array(),
          input: req.body.prompt?.substring(0, 50)
        });
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { prompt, customizations } = req.body;

      // Use dedicated prompt refinement service - architecture.md 3.1.3
      const refinementResult = await promptRefinementService.refinePrompt(prompt, customizations);
      
      const processingTime = Date.now() - startTime;

      // Enhanced logging with performance metrics
      loggerUtils.logPerformance(apiLogger, 'prompt-refinement', processingTime, {
        originalLength: prompt.length,
        refinedLength: refinementResult.refinedPrompt.length,
        category: refinementResult.detectedCategory,
        success: refinementResult.success,
        method: refinementResult.metadata?.method
      });

      res.json({
        success: refinementResult.success,
        refinedPrompt: refinementResult.refinedPrompt,
        originalPrompt: prompt,
        customizations: customizations || {},
        metadata: {
          detectedCategory: refinementResult.detectedCategory,
          appliedSettings: refinementResult.appliedSettings,
          timestamp: refinementResult.timestamp,
          error: refinementResult.error,
          processingTime
        }
      });

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      loggerUtils.logError(apiLogger, error, {
        operation: 'refine-prompt',
        processingTime,
        input: req.body.prompt?.substring(0, 100)
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to refine prompt',
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Main image generation endpoint
app.post('/api/generate',
  validateGenerateRequest,
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        apiLogger.warn('Validation failed for image generation', {
          errors: errors.array(),
          input: req.body.prompt?.substring(0, 50)
        });
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { prompt, customizations } = req.body;
      
      apiLogger.info('Image generation started', {
        prompt: prompt.substring(0, 100),
        customizations,
        requestId: req.ip + '_' + Date.now()
      });

      // Step 1: Refine the prompt using dedicated service - architecture.md 4.1
      apiLogger.info('Starting prompt refinement');
      const refinementResult = await promptRefinementService.refinePrompt(prompt, customizations);
      const refinedPrompt = refinementResult.refinedPrompt;

      // Step 2: Generate image with DALL-E
      apiLogger.info('Starting DALL-E image generation');
      
      // Environment-based API call logic - Evidence: architecture.md 6.1
      const isDevelopment = process.env.NODE_ENV === 'development';
      
      if (isDevelopment) {
        apiLogger.info('Using mock image generation (development mode)');
        
        // Enhanced mock response with refinement metadata
        const mockImageData = {
          imageUrl: 'https://via.placeholder.com/1024x1024/ffffff/000000?text=Mock+Coloring+Page',
          originalPrompt: prompt,
          refinedPrompt,
          metadata: {
            model: 'dall-e-3',
            size: '1024x1024',
            quality: 'standard',
            generatedAt: new Date().toISOString(),
            mock: true,
            environment: 'development',
            refinementData: {
              category: refinementResult.detectedCategory,
              success: refinementResult.success,
              appliedSettings: refinementResult.appliedSettings
            }
          }
        };

        // Save to gallery if user is authenticated
        let galleryImageId = null;
        if (req.user) {
          galleryImageId = await saveToGallery(req.user.uid, mockImageData);
        }

        const mockResponse = {
          success: true,
          imageUrl: mockImageData.imageUrl,
          refinedPrompt,
          originalPrompt: prompt,
          customizations: customizations || {},
          metadata: mockImageData.metadata,
          galleryImageId: galleryImageId,
          savedToGallery: !!galleryImageId
        };

        // Log generation summary with structured data
        const processingTime = Date.now() - startTime;
        loggerUtils.logPerformance(apiLogger, 'image-generation-mock', processingTime, {
          mode: 'Development',
          category: refinementResult.detectedCategory,
          promptLength: prompt.length,
          refinedLength: refinedPrompt.length,
          savedToGallery: !!galleryImageId,
          userId: req.user?.uid
        });

        return res.json(mockResponse);
      }

      // Real DALL-E API call for production - Evidence: architecture.md 4.1
      apiLogger.info('Making real DALL-E API call (production mode)', {
        model: 'dall-e-3',
        refinedPromptLength: refinedPrompt.length
      });
      
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: refinedPrompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
        style: 'natural'
      });

      const imageUrl = imageResponse.data[0].url;
      const processingTime = Date.now() - startTime;
      
      apiLogger.info('Image generated successfully', {
        imageUrl: imageUrl ? 'Generated' : 'Failed',
        revisedPrompt: imageResponse.data[0].revised_prompt?.substring(0, 100)
      });

      // Prepare image data for gallery save
      const productionImageData = {
        imageUrl,
        originalPrompt: prompt,
        refinedPrompt,
        metadata: {
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'standard',
          generatedAt: new Date().toISOString(),
          environment: 'production',
          revised_prompt: imageResponse.data[0].revised_prompt,
          processingTime,
          refinementData: {
            category: refinementResult.detectedCategory,
            success: refinementResult.success,
            appliedSettings: refinementResult.appliedSettings
          }
        }
      };

      // Save to gallery if user is authenticated
      let galleryImageId = null;
      if (req.user) {
        galleryImageId = await saveToGallery(req.user.uid, productionImageData);
      }

      // Enhanced production response with comprehensive metadata
      const productionResponse = {
        success: true,
        imageUrl,
        refinedPrompt,
        originalPrompt: prompt,
        customizations: customizations || {},
        metadata: productionImageData.metadata,
        galleryImageId: galleryImageId,
        savedToGallery: !!galleryImageId
      };

      // Log successful generation with performance metrics
      loggerUtils.logPerformance(apiLogger, 'image-generation-production', processingTime, {
        mode: 'Production',
        category: refinementResult.detectedCategory,
        promptLength: prompt.length,
        refinedLength: refinedPrompt.length,
        imageGenerated: !!imageUrl,
        savedToGallery: !!galleryImageId,
        userId: req.user?.uid
      });

      res.json(productionResponse);

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Enhanced error logging with structured data - Evidence: architecture.md 6.3
      loggerUtils.logError(apiLogger, error, {
        operation: 'image-generation',
        processingTime,
        errorType: error.name,
        statusCode: error.status,
        input: req.body.prompt?.substring(0, 100)
      });
      
      // Handle rate limiting - Evidence: architecture.md 6.3 Exponential backoff
      if (error.status === 429) {
        apiLogger.warn('Rate limit exceeded', {
          retryAfter: 60,
          processingTime
        });
        
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: 60,
          timestamp: new Date().toISOString()
        });
      }

      // Handle other OpenAI API errors - Evidence: architecture.md 6.3 Error handling
      if (error.status >= 400 && error.status < 500) {
        apiLogger.warn('Client error during image generation', {
          statusCode: error.status,
          message: error.message
        });
        
        return res.status(error.status).json({
          success: false,
          error: 'API error',
          message: error.message,
          timestamp: new Date().toISOString()
        });
      }

      // Generic server error with enhanced logging
      apiLogger.error('Internal server error during image generation', {
        processingTime,
        errorMessage: error.message
      });
      
      res.status(500).json({
        success: false,
        error: 'Image generation failed',
        message: 'An unexpected error occurred during image generation',
        timestamp: new Date().toISOString()
      });
    }
  }
);

// Enhanced error handling middleware with winston
app.use((err, req, res, _next) => {
  loggerUtils.logError(apiLogger, err, {
    operation: 'unhandled-error',
    method: req.method,
    path: req.path,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

// Enhanced 404 handler with winston
app.use('*', (req, res) => {
  apiLogger.warn('Endpoint not found', {
    method: req.method,
    path: req.originalUrl,
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
  
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} is not a valid endpoint`,
    timestamp: new Date().toISOString()
  });
});

export default app;