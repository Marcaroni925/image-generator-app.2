/**
 * Express application setup for Coloring Book Creator API
 * Provides AI-powered prompt refinement and DALL-E image generation endpoints
 */

import express from 'express';
import cors from 'cors';
import { body, validationResult } from 'express-validator';
import OpenAI from 'openai';

const app = express();

// Initialize OpenAI client with mock key fallback for testing
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-mock-key-for-testing',
});

// Middleware setup
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
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
 * Advanced prompt refinement service using OpenAI
 * Transforms simple user inputs into optimized DALL-E prompts
 * @param {string} userInput - Original user description
 * @param {Object} customizations - User preferences
 * @returns {Promise<string>} - Refined prompt for DALL-E
 */
async function refinePromptForColoringBook(userInput, customizations = {}) {
  try {
    // Set defaults for missing customizations
    const config = {
      complexity: customizations.complexity || 'medium',
      ageGroup: customizations.ageGroup || 'kids',
      lineThickness: customizations.lineThickness || 'medium',
      border: customizations.border || 'with',
      theme: customizations.theme || null
    };

    // Build enhancement prompt for OpenAI
    const enhancementPrompt = `Transform this simple coloring book request into an optimized DALL-E prompt that will generate a perfect black-and-white line art coloring page:

Original request: "${userInput}"
Target audience: ${config.ageGroup}
Complexity level: ${config.complexity}
Line thickness: ${config.lineThickness}
Border preference: ${config.border} decorative border
${config.theme ? `Theme category: ${config.theme}` : ''}

Requirements:
- Create a detailed, specific prompt for black-and-white line art
- Ensure the design is appropriate for ${config.ageGroup}
- Include "${config.complexity}" level of detail complexity
- Specify "${config.lineThickness}" line thickness
- ${config.border === 'with' ? 'Include decorative border elements' : 'No border required'}
- Must be family-friendly and suitable for coloring
- High contrast, clear outlines, no shading or fills
- 300 DPI quality for printing
- Professional coloring book style

Generate only the refined DALL-E prompt, no explanations.`;

    // Use OpenAI to intelligently refine the prompt
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert at creating DALL-E prompts for high-quality coloring book pages. You transform simple descriptions into detailed, optimized prompts that generate perfect black-and-white line art suitable for coloring.'
        },
        {
          role: 'user',
          content: enhancementPrompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3
    });

    const refinedPrompt = response.choices[0].message.content.trim();
    
    // Add technical specifications for consistent output
    const finalPrompt = `${refinedPrompt}, black-and-white line art, coloring book style, family-friendly, no shading, clear outlines, 300 DPI, high contrast`;
    
    console.log(`✨ Prompt refined: "${userInput}" → "${finalPrompt}"`);
    return finalPrompt;

  } catch (error) {
    console.error('❌ Prompt refinement error:', error.message);
    
    // Fallback to manual refinement if OpenAI fails
    return createFallbackPrompt(userInput, customizations);
  }
}

/**
 * Fallback prompt creation when OpenAI refinement fails
 * @param {string} input - Original user input
 * @param {Object} customizations - User preferences
 * @returns {string} - Basic refined prompt
 */
function createFallbackPrompt(input, customizations = {}) {
  const config = {
    complexity: customizations.complexity || 'medium',
    ageGroup: customizations.ageGroup || 'kids',
    lineThickness: customizations.lineThickness || 'medium',
    border: customizations.border || 'with'
  };

  const specs = [
    'intricate black-and-white line art of',
    input,
    `${config.complexity} complexity`,
    `${config.ageGroup} style`,
    `${config.lineThickness} lines`,
    config.border === 'with' ? 'with decorative border' : 'without border',
    'coloring book style',
    'family-friendly',
    'no shading',
    'clear outlines',
    '300 DPI'
  ];

  return specs.join(', ');
}

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

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Coloring Book Creator API',
    version: '1.0.0'
  });
});

// Prompt refinement endpoint (used by frontend)
app.post('/api/refine-prompt', 
  validateGenerateRequest,
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { prompt, customizations } = req.body;

      // Refine the prompt using OpenAI
      const refinedPrompt = await refinePromptForColoringBook(prompt, customizations);

      res.json({
        success: true,
        refinedPrompt,
        originalPrompt: prompt,
        customizations: customizations || {}
      });

    } catch (error) {
      console.error('❌ Refine prompt error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to refine prompt',
        message: error.message
      });
    }
  }
);

// Main image generation endpoint
app.post('/api/generate',
  validateGenerateRequest,
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { prompt, customizations } = req.body;

      // Step 1: Refine the prompt using OpenAI
      console.log('🔄 Refining prompt...');
      const refinedPrompt = await refinePromptForColoringBook(prompt, customizations);

      // Step 2: Generate image with DALL-E
      console.log('🎨 Generating image with DALL-E...');
      
      // Check if using mock API key
      if (process.env.OPENAI_API_KEY === 'sk-mock-key-for-testing' || !process.env.OPENAI_API_KEY) {
        console.log('⚠️  Using mock image generation (no real OpenAI API key)');
        
        // Return mock response for testing
        return res.json({
          success: true,
          imageUrl: 'https://via.placeholder.com/1024x1024/ffffff/000000?text=Mock+Coloring+Page',
          refinedPrompt,
          originalPrompt: prompt,
          customizations: customizations || {},
          metadata: {
            model: 'dall-e-3',
            size: '1024x1024',
            quality: 'standard',
            generatedAt: new Date().toISOString(),
            mock: true
          }
        });
      }

      // Real DALL-E API call
      const imageResponse = await openai.images.generate({
        model: 'dall-e-3',
        prompt: refinedPrompt,
        size: '1024x1024',
        quality: 'standard',
        n: 1,
        style: 'natural'
      });

      const imageUrl = imageResponse.data[0].url;
      
      console.log('✅ Image generated successfully');

      res.json({
        success: true,
        imageUrl,
        refinedPrompt,
        originalPrompt: prompt,
        customizations: customizations || {},
        metadata: {
          model: 'dall-e-3',
          size: '1024x1024',
          quality: 'standard',
          generatedAt: new Date().toISOString(),
          revised_prompt: imageResponse.data[0].revised_prompt
        }
      });

    } catch (error) {
      console.error('❌ Generation error:', error);
      
      // Handle rate limiting
      if (error.status === 429) {
        return res.status(429).json({
          success: false,
          error: 'Rate limit exceeded',
          message: 'Too many requests. Please try again later.',
          retryAfter: 60
        });
      }

      // Handle other OpenAI API errors
      if (error.status >= 400 && error.status < 500) {
        return res.status(error.status).json({
          success: false,
          error: 'API error',
          message: error.message
        });
      }

      // Generic server error
      res.status(500).json({
        success: false,
        error: 'Image generation failed',
        message: 'An unexpected error occurred during image generation'
      });
    }
  }
);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: 'An unexpected error occurred'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    message: `${req.method} ${req.originalUrl} is not a valid endpoint`
  });
});

export default app;