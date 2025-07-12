#!/usr/bin/env node

/**
 * Express server entry point for the Coloring Book Creator API
 * Handles AI-powered prompt refinement and DALL-E image generation
 */

import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log('🎨 Coloring Book Creator API Server');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 API available at http://localhost:${PORT}`);
  console.log(`🔑 OpenAI API Key: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Missing'}`);
  console.log('📋 Available endpoints:');
  console.log('  POST /api/generate - Generate coloring book image');
  console.log('  POST /api/refine-prompt - Refine prompt for better quality');
  console.log('  GET /api/health - Health check endpoint');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully');
  process.exit(0);
});