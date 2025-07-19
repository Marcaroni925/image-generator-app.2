interface ValidationResult {
  isValid: boolean;
  sanitizedValue?: string;
  error?: string;
}

const MAX_PROMPT_LENGTH = 500;
const MIN_PROMPT_LENGTH = 3;

export const validateAndSanitizePrompt = (prompt: string): ValidationResult => {
  if (!prompt || typeof prompt !== 'string') {
    return {
      isValid: false,
      error: 'Prompt must be provided as a string',
    };
  }

  const trimmed = prompt.trim();
  
  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: 'Prompt cannot be empty',
    };
  }

  if (trimmed.length < MIN_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt must be at least ${MIN_PROMPT_LENGTH} characters long`,
    };
  }

  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return {
      isValid: false,
      error: `Prompt cannot exceed ${MAX_PROMPT_LENGTH} characters`,
    };
  }

  // Basic XSS prevention - remove potentially harmful characters
  const sanitized = trimmed
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/data:/gi, '') // Remove data protocol
    .replace(/vbscript:/gi, '') // Remove vbscript protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters

  // Check for potentially malicious patterns
  const suspiciousPatterns = [
    /script/i,
    /iframe/i,
    /object/i,
    /embed/i,
    /form/i,
    /input/i,
    /select/i,
    /textarea/i,
    /button/i,
    /link/i,
    /meta/i,
    /base/i,
    /eval\(/i,
    /function\(/i,
    /alert\(/i,
    /confirm\(/i,
    /prompt\(/i,
    /document\./i,
    /window\./i,
    /location\./i,
    /cookie/i,
    /localStorage/i,
    /sessionStorage/i,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(sanitized)) {
      return {
        isValid: false,
        error: 'Prompt contains potentially unsafe content',
      };
    }
  }

  return {
    isValid: true,
    sanitizedValue: sanitized,
  };
};

export const validateImageId = (id: string): boolean => {
  if (!id || typeof id !== 'string') {
    return false;
  }

  // UUID v4 pattern validation
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(id);
};

export const sanitizeString = (input: string, maxLength: number = 100): string => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .trim()
    .slice(0, maxLength)
    .replace(/[<>]/g, '')
    .replace(/[\x00-\x1F\x7F]/g, '');
};