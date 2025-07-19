/**
 * Enhanced Prompt Refinement Service for Coloring Book Creator
 * 
 * Core innovation module implementing intelligent prompt enhancement
 * with expanded patterns, optional GPT refinement, input sanitization,
 * winston logging, and comprehensive testing exports.
 * 
 * Evidence-based implementation following OpenAI best practices:
 * - Clear, specific instructions for consistent results (architecture.md 6.3)
 * - Subject categorization and enhancement patterns (architecture.md 3.1.2)
 * - Fallback mechanisms for error resilience (architecture.md 3.1.3)
 * 
 * Enhancements:
 * - Winston structured logging for production monitoring
 * - Expanded subject patterns (200+ keywords across 15+ categories)
 * - Advanced enhancement templates with sub-complexity levels
 * - Optional GPT-based intelligent refinement method
 * - Comprehensive input sanitization and validation
 * - Full testing exports for unit test coverage
 */

import OpenAI from 'openai';
import winston from 'winston';

/**
 * Logger configuration with structured output
 * Production-ready logging with multiple levels and formats
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'prompt-refinement' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 5242880,
      maxFiles: 5 
    })
  ]
});

// Console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

/**
 * Input Sanitization Utilities
 * Comprehensive validation and cleaning of user inputs
 */
class InputSanitizer {
  static sanitizeText(input) {
    if (!input || typeof input !== 'string') {
      throw new Error('Invalid input: must be a non-empty string');
    }

    // Basic sanitization
    let sanitized = input.trim();
    
    // Remove potentially harmful characters but preserve coloring book terms
    sanitized = sanitized.replace(/[<>"'`]/g, '');
    
    // Normalize whitespace
    sanitized = sanitized.replace(/\s+/g, ' ');
    
    // Length validation
    if (sanitized.length < 1 || sanitized.length > 500) {
      throw new Error('Input must be between 1 and 500 characters');
    }

    return sanitized;
  }

  static validateCustomizations(customizations) {
    if (!customizations || typeof customizations !== 'object') {
      return {};
    }

    const validatedCustomizations = {};

    // Validate complexity
    if (customizations.complexity) {
      if (!['simple', 'medium', 'detailed'].includes(customizations.complexity)) {
        throw new Error('Invalid complexity level');
      }
      validatedCustomizations.complexity = customizations.complexity;
    }

    // Validate age group
    if (customizations.ageGroup) {
      if (!['kids', 'teens', 'adults'].includes(customizations.ageGroup)) {
        throw new Error('Invalid age group');
      }
      validatedCustomizations.ageGroup = customizations.ageGroup;
    }

    // Validate line thickness
    if (customizations.lineThickness) {
      if (!['thin', 'medium', 'thick'].includes(customizations.lineThickness)) {
        throw new Error('Invalid line thickness');
      }
      validatedCustomizations.lineThickness = customizations.lineThickness;
    }

    // Validate border
    if (customizations.border) {
      if (!['with', 'without'].includes(customizations.border)) {
        throw new Error('Invalid border option');
      }
      validatedCustomizations.border = customizations.border;
    }

    // Validate theme
    if (customizations.theme) {
      const validThemes = ['animals', 'mandalas', 'fantasy', 'nature', 'vehicles', 'food', 'holidays', 'sports'];
      if (!validThemes.includes(customizations.theme)) {
        throw new Error('Invalid theme');
      }
      validatedCustomizations.theme = customizations.theme;
    }

    return validatedCustomizations;
  }

  static checkFamilyFriendly(input) {
    const inappropriateKeywords = [
      'violence', 'blood', 'weapon', 'gun', 'knife', 'death', 'kill', 'murder',
      'sexual', 'nude', 'naked', 'adult', 'explicit', 'inappropriate', 'sexy',
      'drug', 'alcohol', 'beer', 'wine', 'cigarette', 'smoking', 'marijuana',
      'scary', 'horror', 'demon', 'devil', 'evil', 'dark magic', 'satanic',
      'suicide', 'self-harm', 'cutting', 'depression', 'anxiety'
    ];

    const lowerInput = input.toLowerCase();
    const foundInappropriate = inappropriateKeywords.filter(keyword => 
      lowerInput.includes(keyword)
    );

    if (foundInappropriate.length > 0) {
      throw new Error(`Content contains inappropriate terms: ${foundInappropriate.join(', ')}`);
    }

    return true;
  }
}

/**
 * Enhanced PromptRefinementService - Core prompt enhancement engine
 * 
 * Implements the 4-step refinement process with advanced features:
 * 1. Detect subject type (15+ categories, 200+ patterns)
 * 2. Generate base prompt structure with templates  
 * 3. Add contextual details with sub-complexity levels
 * 4. Apply quality parameters with optional GPT enhancement
 */
class PromptRefinementService {
  constructor() {
    // Initialize logger first
    this.logger = logger;
    this.enableLogging = true;
    
    // Initialize OpenAI client with environment-based key selection
    this.openai = new OpenAI({
      apiKey: this.getApiKey()
    });
    
    // Expanded subject detection patterns - 15+ categories, 200+ keywords
    this.subjectPatterns = {
      // Domestic Animals (25 patterns)
      domesticAnimals: [
        'dog', 'puppy', 'cat', 'kitten', 'rabbit', 'bunny', 'hamster', 'guinea pig',
        'bird', 'parrot', 'canary', 'fish', 'goldfish', 'horse', 'pony', 'cow',
        'pig', 'sheep', 'goat', 'chicken', 'duck', 'goose', 'turkey', 'llama', 'alpaca'
      ],
      
      // Wild Animals (30 patterns)
      wildAnimals: [
        'lion', 'tiger', 'elephant', 'giraffe', 'zebra', 'rhinoceros', 'hippopotamus',
        'bear', 'wolf', 'fox', 'deer', 'moose', 'elk', 'squirrel', 'raccoon',
        'monkey', 'ape', 'gorilla', 'chimpanzee', 'kangaroo', 'koala', 'panda',
        'leopard', 'cheetah', 'jaguar', 'lynx', 'bobcat', 'buffalo', 'bison', 'camel'
      ],
      
      // Prehistoric Animals (15 patterns)
      prehistoric: [
        'dinosaur', 'tyrannosaurus', 't-rex', 'triceratops', 'stegosaurus', 'brontosaurus',
        'velociraptor', 'pterodactyl', 'mammoth', 'saber-tooth', 'sabertooth',
        'dino', 'prehistoric', 'fossil', 'ancient'
      ],
      
      // Marine Life (20 patterns)
      marineLife: [
        'whale', 'dolphin', 'shark', 'octopus', 'squid', 'jellyfish', 'starfish',
        'seahorse', 'turtle', 'seal', 'walrus', 'penguin', 'crab', 'lobster',
        'shrimp', 'manta ray', 'stingray', 'coral', 'seaweed', 'submarine'
      ],
      
      // Insects & Small Creatures (15 patterns)
      insects: [
        'butterfly', 'bee', 'ladybug', 'spider', 'ant', 'grasshopper', 'cricket',
        'dragonfly', 'caterpillar', 'snail', 'worm', 'beetle', 'moth', 'firefly', 'centipede'
      ],
      
      // Fantasy Creatures (25 patterns)
      fantasy: [
        'dragon', 'unicorn', 'fairy', 'mermaid', 'phoenix', 'griffin', 'pegasus',
        'centaur', 'elf', 'dwarf', 'troll', 'goblin', 'ogre', 'wizard', 'witch',
        'magic', 'magical', 'enchanted', 'mystical', 'legendary', 'mythical',
        'castle', 'tower', 'potion', 'wand'
      ],
      
      // Nature Elements (30 patterns)
      nature: [
        'tree', 'forest', 'flower', 'rose', 'sunflower', 'daisy', 'tulip', 'lily',
        'garden', 'leaf', 'grass', 'bush', 'mountain', 'hill', 'valley', 'river',
        'lake', 'ocean', 'beach', 'desert', 'waterfall', 'rainbow', 'cloud',
        'sun', 'moon', 'star', 'snowflake', 'lightning', 'landscape', 'scenery'
      ],
      
      // Vehicles & Transportation (25 patterns)
      vehicles: [
        'car', 'truck', 'bus', 'motorcycle', 'bicycle', 'train', 'airplane', 'helicopter',
        'boat', 'ship', 'submarine', 'rocket', 'spaceship', 'tank', 'tractor',
        'fire truck', 'ambulance', 'police car', 'taxi', 'van', 'jeep', 'sports car',
        'race car', 'hot air balloon', 'scooter'
      ],
      
      // Food & Treats (20 patterns)
      food: [
        'cake', 'cookie', 'ice cream', 'pizza', 'burger', 'sandwich', 'apple',
        'banana', 'orange', 'strawberry', 'cherry', 'donut', 'cupcake', 'candy',
        'chocolate', 'fruit', 'vegetable', 'bread', 'cheese', 'pie'
      ],
      
      // Household Objects (20 patterns)
      objects: [
        'house', 'home', 'chair', 'table', 'lamp', 'clock', 'book', 'toy',
        'ball', 'kite', 'balloon', 'umbrella', 'hat', 'shoe', 'bag', 'cup',
        'bottle', 'key', 'phone', 'computer'
      ],
      
      // Sports & Activities (15 patterns)
      sports: [
        'soccer', 'football', 'basketball', 'baseball', 'tennis', 'golf', 'swimming',
        'running', 'cycling', 'skating', 'skiing', 'surfing', 'climbing', 'dancing', 'yoga'
      ],
      
      // Holidays & Celebrations (15 patterns)
      holidays: [
        'christmas', 'halloween', 'easter', 'birthday', 'valentine', 'thanksgiving',
        'new year', 'party', 'celebration', 'gift', 'present', 'ornament',
        'decoration', 'holiday', 'festival'
      ],
      
      // Musical Instruments (10 patterns)
      music: [
        'guitar', 'piano', 'violin', 'drums', 'trumpet', 'flute', 'saxophone',
        'harp', 'organ', 'microphone'
      ],
      
      // Mandala & Geometric Patterns (10 patterns)
      mandalas: [
        'mandala', 'pattern', 'geometric', 'circular', 'symmetrical', 'ornate',
        'decorative', 'intricate', 'spiral', 'kaleidoscope'
      ],
      
      // Abstract & Artistic (10 patterns)
      abstract: [
        'abstract', 'artistic', 'design', 'creative', 'modern', 'contemporary',
        'minimalist', 'stylized', 'artistic pattern', 'art'
      ]
    };
    
    // Advanced enhancement templates with sub-complexity levels
    this.enhancementTemplates = {
      domesticAnimals: {
        simple: (subject) => `friendly ${subject} with basic features, cute expression, and simple pose`,
        medium: (subject) => `detailed ${subject} with natural fur/feather textures, expressive eyes, playful pose, and simple background elements`,
        detailed: (subject) => `intricate ${subject} with complex fur/feather patterns, highly detailed anatomical features, dynamic pose, environmental context, and companion elements`
      },
      
      wildAnimals: {
        simple: (subject) => `majestic ${subject} with basic features, calm expression, and natural stance`,
        medium: (subject) => `detailed ${subject} with natural textures, environmental context, characteristic features, and habitat elements`,
        detailed: (subject) => `intricate ${subject} with complex patterns, detailed anatomy, natural habitat scene, weather effects, and ecosystem elements`
      },
      
      prehistoric: {
        simple: (subject) => `friendly ${subject} with basic dinosaur features, simple prehistoric elements, and gentle appearance`,
        medium: (subject) => `detailed ${subject} with scale textures, prehistoric vegetation, volcanic landscape, and period-appropriate elements`,
        detailed: (subject) => `intricate ${subject} with complex scale patterns, detailed prehistoric ecosystem, volcanic activity, ancient plant life, and geological formations`
      },
      
      marineLife: {
        simple: (subject) => `graceful ${subject} with basic aquatic features, simple water elements, and peaceful expression`,
        medium: (subject) => `detailed ${subject} with natural textures, ocean currents, coral reef elements, and marine ecosystem context`,
        detailed: (subject) => `intricate ${subject} with complex patterns, detailed underwater scene, coral formations, sea plants, and diverse marine life`
      },
      
      insects: {
        simple: (subject) => `cute ${subject} with basic insect features, simple garden elements, and friendly appearance`,
        medium: (subject) => `detailed ${subject} with wing patterns, garden setting, flower elements, and natural textures`,
        detailed: (subject) => `intricate ${subject} with complex wing designs, detailed garden ecosystem, various flowers, leaves, and micro-environment elements`
      },
      
      fantasy: {
        simple: (subject) => `magical ${subject} with basic fantasy elements, gentle mystical features, and enchanted appearance`,
        medium: (subject) => `enchanted ${subject} with mystical details, magical sparkles, fantasy landscape, and ethereal elements`,
        detailed: (subject) => `intricate ${subject} with complex magical patterns, detailed fantasy realm, mystical creatures, magical phenomena, and elaborate enchanted environment`
      },
      
      nature: {
        simple: (subject) => `beautiful ${subject} with basic natural features, simple environmental elements, and peaceful setting`,
        medium: (subject) => `detailed ${subject} with natural textures, seasonal elements, wildlife touches, and environmental context`,
        detailed: (subject) => `intricate ${subject} with complex natural patterns, detailed ecosystem, weather effects, multiple layers of vegetation, and rich environmental detail`
      },
      
      vehicles: {
        simple: (subject) => `cool ${subject} with basic vehicle features, simple design elements, and clean lines`,
        medium: (subject) => `detailed ${subject} with mechanical features, environmental setting, motion elements, and contextual background`,
        detailed: (subject) => `intricate ${subject} with complex mechanical details, dynamic scene, environmental context, technical elements, and rich background details`
      },
      
      food: {
        simple: (subject) => `delicious ${subject} with basic food features, simple presentation, and appetizing appearance`,
        medium: (subject) => `detailed ${subject} with textures, garnishes, serving elements, and kitchen/dining context`,
        detailed: (subject) => `intricate ${subject} with complex textures, elaborate presentation, detailed ingredients, cooking elements, and rich culinary scene`
      },
      
      objects: {
        simple: (subject) => `useful ${subject} with basic design features, simple form, and clean presentation`,
        medium: (subject) => `detailed ${subject} with textures, functional elements, environmental setting, and contextual details`,
        detailed: (subject) => `intricate ${subject} with complex design patterns, detailed components, rich environmental context, and elaborate decorative elements`
      },
      
      sports: {
        simple: (subject) => `active ${subject} with basic sports elements, simple equipment, and dynamic pose`,
        medium: (subject) => `detailed ${subject} with sports equipment, playing field elements, action details, and athletic context`,
        detailed: (subject) => `intricate ${subject} with complex equipment details, detailed sports venue, crowd elements, dynamic action, and rich athletic environment`
      },
      
      holidays: {
        simple: (subject) => `festive ${subject} with basic holiday elements, simple decorations, and celebratory mood`,
        medium: (subject) => `detailed ${subject} with holiday decorations, seasonal elements, traditional motifs, and festive atmosphere`,
        detailed: (subject) => `intricate ${subject} with elaborate decorations, detailed traditional elements, complex patterns, celebratory scenes, and rich holiday atmosphere`
      },
      
      music: {
        simple: (subject) => `musical ${subject} with basic instrument features, simple musical elements, and harmonic design`,
        medium: (subject) => `detailed ${subject} with musical notes, performance setting, acoustic elements, and artistic details`,
        detailed: (subject) => `intricate ${subject} with complex musical patterns, detailed performance scene, ornate decorations, musical notation, and rich artistic environment`
      },
      
      mandalas: {
        simple: (subject) => `geometric ${subject} with basic symmetrical patterns, simple repetitive elements, and balanced design`,
        medium: (subject) => `detailed ${subject} with intricate geometric patterns, layered symmetry, decorative elements, and balanced complexity`,
        detailed: (subject) => `complex ${subject} with elaborate geometric designs, multiple pattern layers, sophisticated symmetrical elements, and rich decorative details`
      },
      
      abstract: {
        simple: (subject) => `artistic ${subject} with basic design elements, simple forms, and creative expression`,
        medium: (subject) => `detailed ${subject} with artistic patterns, creative elements, expressive forms, and design complexity`,
        detailed: (subject) => `intricate ${subject} with complex artistic patterns, elaborate design elements, sophisticated forms, and rich creative expression`
      },
      
      general: {
        simple: (subject) => `simple ${subject} with basic details and clear features`,
        medium: (subject) => `detailed ${subject} with enhanced features, textures, and contextual elements`,
        detailed: (subject) => `intricate ${subject} with complex details, rich context, and sophisticated elements`
      }
    };
  }

  /**
   * Get OpenAI API key based on environment
   * Evidence: architecture.md 6.1 - API cost mitigation, mock keys for development
   */
  getApiKey() {
    const hasRealKey = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'sk-mock-key-for-testing' && process.env.OPENAI_API_KEY.startsWith('sk-');
    if (hasRealKey) {
      this.logger.info('Using real OpenAI key', {
        keyLength: process.env.OPENAI_API_KEY.length,
        keyPrefix: process.env.OPENAI_API_KEY.substring(0, 10) + '...'
      });
      return process.env.OPENAI_API_KEY;
    } else {
      this.logger.info('Using mock OpenAI key in development mode', {
        hasEnvKey: !!process.env.OPENAI_API_KEY,
        keyLength: process.env.OPENAI_API_KEY?.length
      });
      return 'sk-mock-key-for-testing';
    }
  }

  /**
   * Main prompt refinement function with input sanitization
   * 
   * @param {string} userInput - Original user description
   * @param {Object} customizations - User preferences for complexity, age, etc.
   * @param {Object} options - Additional options like useGPT
   * @returns {Promise<Object>} - Refined prompt with metadata
   */
  async refinePrompt(userInput, customizations = {}, options = {}) {
    const startTime = Date.now();
    
    try {
      // Input sanitization and validation
      const sanitizedInput = InputSanitizer.sanitizeText(userInput);
      const validatedCustomizations = InputSanitizer.validateCustomizations(customizations);
      InputSanitizer.checkFamilyFriendly(sanitizedInput);

      this.logger.info('Starting prompt refinement', {
        originalLength: userInput.length,
        sanitizedLength: sanitizedInput.length,
        customizations: validatedCustomizations,
        options
      });

      // Set defaults for missing customizations
      const config = {
        complexity: validatedCustomizations.complexity || 'medium',
        ageGroup: validatedCustomizations.ageGroup || 'kids',
        lineThickness: validatedCustomizations.lineThickness || 'medium',
        border: validatedCustomizations.border || 'with',
        theme: validatedCustomizations.theme || null
      };

      let refinedPrompt;
      let method = 'template-based';

      // Choose refinement method
      if (options.useGPT && process.env.NODE_ENV !== 'development') {
        this.logger.info('Using GPT-based refinement method');
        refinedPrompt = await this.gptRefinement(sanitizedInput, config);
        method = 'gpt-enhanced';
      } else {
        this.logger.info('Using template-based refinement method');
        refinedPrompt = await this.templateRefinement(sanitizedInput, config);
      }

      const processingTime = Date.now() - startTime;

      // Log successful refinement
      this.logger.info('Prompt refinement completed successfully', {
        processingTime,
        method,
        originalLength: sanitizedInput.length,
        refinedLength: refinedPrompt.length
      });

      return {
        success: true,
        refinedPrompt,
        originalInput: sanitizedInput,
        detectedCategory: this.detectSubjectCategory(sanitizedInput),
        appliedSettings: config,
        metadata: {
          method,
          processingTime,
          sanitized: true,
          familyFriendly: true
        },
        timestamp: new Date().toISOString()
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('Prompt refinement error', {
        error: error.message,
        stack: error.stack,
        processingTime,
        input: userInput?.substring(0, 100)
      });
      
      // Fallback mechanism
      return {
        success: false,
        refinedPrompt: this.createFallbackPrompt(userInput, customizations),
        originalInput: userInput,
        error: error.message,
        metadata: {
          method: 'fallback',
          processingTime,
          sanitized: false
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Template-based refinement method (original approach)
   */
  async templateRefinement(input, config) {
    // Step 1: Detect subject category
    const subjectCategory = this.detectSubjectCategory(input);
    
    // Step 2: Build enhanced description using templates
    const enhancedDescription = this.enhanceDescription(
      input, 
      subjectCategory, 
      config.complexity,
      config.ageGroup
    );
    
    // Step 3: Apply coloring book specifications
    const refinedPrompt = this.applyColoringBookSpecs(
      enhancedDescription,
      config
    );
    
    return refinedPrompt;
  }

  /**
   * Optional GPT-based refinement method for enhanced results
   * Uses OpenAI's GPT model to intelligently enhance prompts
   */
  async gptRefinement(input, config) {
    const enhancementPrompt = `Transform this coloring book request into an optimized DALL-E prompt for perfect black-and-white line art:

Original: "${input}"
Target: ${config.ageGroup} (${config.complexity} complexity, ${config.lineThickness} lines, ${config.border === 'with' ? 'with border' : 'no border'})

Requirements:
- Black-and-white line art only
- Age-appropriate for ${config.ageGroup}
- ${config.complexity} level detail
- ${config.lineThickness} line thickness
- ${config.border === 'with' ? 'Decorative border included' : 'Clean edges, no border'}
- Family-friendly content
- Clear outlines, no shading
- 300 DPI print quality
- Professional coloring book style

Generate only the refined DALL-E prompt:`;

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating DALL-E prompts for high-quality coloring book pages. Transform descriptions into detailed, optimized prompts for perfect black-and-white line art.'
          },
          {
            role: 'user',
            content: enhancementPrompt
          }
        ],
        max_tokens: 250,
        temperature: 0.3
      });

      const gptRefined = response.choices[0].message.content.trim();
      
      // Add technical specifications
      return `${gptRefined}, black-and-white line art, coloring book style, family-friendly, no shading, clear outlines, 300 DPI, high contrast`;
      
    } catch (error) {
      this.logger.warn('GPT refinement failed, falling back to template method', {
        error: error.message
      });
      
      // Fallback to template method
      return this.templateRefinement(input, config);
    }
  }

  /**
   * Enhanced subject category detection with expanded patterns
   */
  detectSubjectCategory(input) {
    const lowercaseInput = input.toLowerCase();
    
    // Check each category pattern with scoring
    let bestMatch = { category: 'general', score: 0 };
    
    for (const [category, patterns] of Object.entries(this.subjectPatterns)) {
      const matches = patterns.filter(pattern => lowercaseInput.includes(pattern));
      const score = matches.length;
      
      if (score > bestMatch.score) {
        bestMatch = { category, score };
      }
    }
    
    this.logger.debug('Subject category detected', {
      input: input.substring(0, 50),
      category: bestMatch.category,
      confidence: bestMatch.score
    });
    
    return bestMatch.category;
  }

  /**
   * Enhanced description building with expanded templates
   */
  enhanceDescription(input, category, complexity, ageGroup) {
    const baseDescription = input.trim();
    
    // Get enhancement template for category and complexity
    const templates = this.enhancementTemplates[category] || this.enhancementTemplates.general;
    const enhancedBase = templates[complexity] ? templates[complexity](baseDescription) : baseDescription;
    
    // Add age-appropriate adjustments
    const ageAdjustment = this.getAgeAdjustment(ageGroup);
    
    return `${enhancedBase}${ageAdjustment}`;
  }

  /**
   * Enhanced age-appropriate content adjustments
   */
  getAgeAdjustment(ageGroup) {
    const adjustments = {
      kids: ', with friendly expressions, safe rounded features, bright cheerful elements, and child-appropriate simplicity',
      teens: ', with moderate detail, contemporary style elements, dynamic composition, and age-appropriate complexity',
      adults: ', with sophisticated details, complex patterns, artistic elements, intricate design, and mature aesthetic appeal'
    };
    
    return adjustments[ageGroup] || ', with balanced detail level and universal appeal';
  }

  /**
   * Enhanced coloring book specifications
   */
  applyColoringBookSpecs(description, config) {
    const specs = [
      'professional black-and-white line art of',
      description,
      `optimized for ${config.complexity} complexity level`,
      `designed for ${config.ageGroup} target audience`,
      `featuring ${config.lineThickness} line thickness`,
      config.border === 'with' ? 'with elegant decorative border elements' : 'with clean edges and no border',
      'coloring book style',
      'family-friendly content',
      'no shading or color fills',
      'clear distinct outlines',
      'high contrast black lines on white background',
      '300 DPI print quality',
      'suitable for coloring with crayons, markers, or colored pencils'
    ];

    return specs.join(', ');
  }

  /**
   * Enhanced fallback prompt creation
   */
  createFallbackPrompt(input, customizations = {}) {
    try {
      const sanitizedInput = typeof input === 'string' ? input.trim() : 'drawing';
      const config = {
        complexity: customizations.complexity || 'medium',
        ageGroup: customizations.ageGroup || 'kids',
        lineThickness: customizations.lineThickness || 'medium',
        border: customizations.border || 'with'
      };

      return `black-and-white line art of ${sanitizedInput}, ${config.complexity} complexity, ${config.ageGroup} style, ${config.lineThickness} lines, ${config.border === 'with' ? 'with border' : 'no border'}, coloring book style, family-friendly, no shading, 300 DPI`;
    } catch (error) {
      this.logger.error('Fallback prompt creation failed', { error: error.message });
      return 'black-and-white line art coloring book page, family-friendly, no shading, 300 DPI';
    }
  }

  /**
   * Enhanced health check method
   */
  async healthCheck() {
    try {
      const startTime = Date.now();
      
      // Basic service health
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'production',
        features: {
          inputSanitization: true,
          expandedPatterns: Object.keys(this.subjectPatterns).length,
          enhancementTemplates: Object.keys(this.enhancementTemplates).length,
          gptRefinement: process.env.NODE_ENV !== 'development',
          winstonLogging: true
        }
      };

      // For development/mock mode
      if (process.env.NODE_ENV === 'development') {
        health.mode = 'development';
        health.apiKey = 'mock';
        health.responseTime = Date.now() - startTime;
        return health;
      }

      // For production, test OpenAI connection
      const testResponse = await this.openai.models.list();
      
      health.mode = 'production';
      health.apiKey = 'configured';
      health.openaiConnected = true;
      health.modelsAvailable = testResponse.data?.length || 0;
      health.responseTime = Date.now() - startTime;
      
      this.logger.info('Health check completed', health);
      return health;
      
    } catch (error) {
      this.logger.error('Health check failed', { error: error.message });
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

// Testing exports for unit tests
export const TestingExports = {
  InputSanitizer,
  PromptRefinementService,
  logger
};

// Export singleton instance for consistent usage across application
const promptRefinementService = new PromptRefinementService();
export default promptRefinementService;