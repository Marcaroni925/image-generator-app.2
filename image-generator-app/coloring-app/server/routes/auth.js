/**
 * Authentication and Gallery Routes for Coloring Book Creator API
 * 
 * Firebase Authentication and Firestore integration for backend operations.
 * Evidence-based implementation following Firebase Admin SDK best practices:
 * - JWT token verification for secure API access
 * - Firestore operations for user image gallery
 * - Comprehensive error handling and validation
 * - Rate limiting and security measures
 * - Integration with existing image generation flow
 */

import express from 'express';
import admin from 'firebase-admin';
import { body, validationResult } from 'express-validator';
import { apiLogger, loggerUtils } from '../utils/logger.js';

const router = express.Router();

// Initialize Firebase Admin SDK
let firebaseAdmin;

try {
  // Check if Firebase Admin is already initialized
  firebaseAdmin = admin.apps.length ? admin.app() : null;
  
  if (!firebaseAdmin) {
    // Initialize with service account or environment variables
    if (process.env.NODE_ENV === 'development') {
      // Development mode: Use Firebase emulator or service account
      if (process.env.FIREBASE_AUTH_EMULATOR_HOST) {
        apiLogger.info('Using Firebase Auth emulator for development');
        process.env.FIREBASE_AUTH_EMULATOR_HOST = 'localhost:9099';
      }
      
      firebaseAdmin = admin.initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'coloing-book-creator',
        // In development, you might use a service account key file
        // credential: admin.credential.cert(require('./path/to/service-account-key.json'))
      });
    } else {
      // Production mode: Use service account key or default credentials
      const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
      
      if (serviceAccountKey) {
        const serviceAccount = JSON.parse(serviceAccountKey);
        firebaseAdmin = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.project_id
        });
      } else {
        // Use default credentials (e.g., when running on Google Cloud)
        firebaseAdmin = admin.initializeApp();
      }
    }
  }
  
  apiLogger.info('Firebase Admin SDK initialized successfully', {
    projectId: firebaseAdmin.options.projectId,
    environment: process.env.NODE_ENV || 'production'
  });
} catch (error) {
  apiLogger.error('Failed to initialize Firebase Admin SDK', {
    error: error.message,
    stack: error.stack
  });
}

// Get Firestore instance
const db = firebaseAdmin?.firestore();

/**
 * Middleware to verify Firebase ID token
 * Extracts and validates JWT token from Authorization header
 */
const verifyToken = async (req, res, next) => {
  const startTime = Date.now();
  
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      apiLogger.warn('Missing or invalid authorization header', {
        path: req.path,
        ip: req.ip
      });
      
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
        message: 'Missing or invalid authorization token'
      });
    }
    
    const idToken = authHeader.split('Bearer ')[1];
    
    // Verify the ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    // Add user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.email,
      emailVerified: decodedToken.email_verified
    };
    
    const responseTime = Date.now() - startTime;
    
    apiLogger.info('Token verification successful', {
      userId: req.user.uid,
      email: req.user.email,
      responseTime,
      path: req.path
    });
    
    next();
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    loggerUtils.logError(apiLogger, error, {
      operation: 'token-verification',
      responseTime,
      path: req.path,
      ip: req.ip
    });
    
    let errorMessage = 'Invalid authentication token';
    let statusCode = 401;
    
    switch (error.code) {
      case 'auth/id-token-expired':
        errorMessage = 'Authentication token has expired';
        break;
      case 'auth/id-token-revoked':
        errorMessage = 'Authentication token has been revoked';
        break;
      case 'auth/invalid-id-token':
        errorMessage = 'Invalid authentication token';
        break;
      case 'auth/user-disabled':
        errorMessage = 'User account has been disabled';
        break;
      default:
        errorMessage = 'Authentication failed';
    }
    
    res.status(statusCode).json({
      success: false,
      error: 'Authentication failed',
      message: errorMessage
    });
  }
};

/**
 * POST /save-image
 * Save generated image to user's gallery
 */
router.post('/save-image',
  verifyToken,
  [
    body('imageUrl')
      .isURL()
      .withMessage('Valid image URL is required'),
    body('originalPrompt')
      .trim()
      .isLength({ min: 1, max: 1000 })
      .withMessage('Original prompt must be between 1 and 1000 characters'),
    body('refinedPrompt')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Refined prompt must be less than 2000 characters'),
    body('metadata')
      .optional()
      .isObject()
      .withMessage('Metadata must be an object')
  ],
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        apiLogger.warn('Validation failed for save-image', {
          errors: errors.array(),
          userId: req.user.uid
        });
        
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { imageUrl, originalPrompt, refinedPrompt, metadata } = req.body;
      
      // Prepare image document
      const imageDoc = {
        userId: req.user.uid,
        userEmail: req.user.email,
        imageUrl,
        originalPrompt,
        refinedPrompt: refinedPrompt || null,
        metadata: metadata || {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Save to Firestore
      const docRef = await db.collection('user_images').add(imageDoc);
      
      const processingTime = Date.now() - startTime;
      
      loggerUtils.logPerformance(apiLogger, 'image-save', processingTime, {
        userId: req.user.uid,
        imageId: docRef.id,
        promptLength: originalPrompt.length
      });
      
      res.status(201).json({
        success: true,
        imageId: docRef.id,
        message: 'Image saved to gallery successfully',
        data: {
          id: docRef.id,
          ...imageDoc,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      });
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      loggerUtils.logError(apiLogger, error, {
        operation: 'save-image',
        userId: req.user?.uid,
        processingTime
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to save image',
        message: 'An error occurred while saving the image to your gallery'
      });
    }
  }
);

/**
 * GET /get-gallery
 * Retrieve user's image gallery with pagination
 */
router.get('/get-gallery',
  verifyToken,
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { limit = 20, offset = 0, orderBy = 'createdAt', order = 'desc' } = req.query;
      
      // Validate query parameters
      const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 50);
      const offsetNum = Math.max(parseInt(offset) || 0, 0);
      
      // Build Firestore query
      let query = db.collection('user_images')
        .where('userId', '==', req.user.uid)
        .orderBy(orderBy, order)
        .limit(limitNum);
      
      if (offsetNum > 0) {
        // For pagination, you might want to use cursor-based pagination in production
        query = query.offset(offsetNum);
      }
      
      const snapshot = await query.get();
      
      const images = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        images.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString() || null,
          updatedAt: data.updatedAt?.toDate()?.toISOString() || null
        });
      });
      
      // Get total count (optional, can be expensive for large collections)
      const countSnapshot = await db.collection('user_images')
        .where('userId', '==', req.user.uid)
        .count()
        .get();
      
      const total = countSnapshot.data().count;
      
      const processingTime = Date.now() - startTime;
      
      loggerUtils.logPerformance(apiLogger, 'gallery-retrieve', processingTime, {
        userId: req.user.uid,
        imageCount: images.length,
        totalImages: total
      });
      
      res.json({
        success: true,
        data: {
          images,
          pagination: {
            total,
            limit: limitNum,
            offset: offsetNum,
            hasMore: offsetNum + limitNum < total
          }
        }
      });
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      loggerUtils.logError(apiLogger, error, {
        operation: 'get-gallery',
        userId: req.user?.uid,
        processingTime
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve gallery',
        message: 'An error occurred while loading your gallery'
      });
    }
  }
);

/**
 * DELETE /delete-image/:imageId
 * Delete a single image from user's gallery
 */
router.delete('/delete-image/:imageId',
  verifyToken,
  async (req, res) => {
    const startTime = Date.now();
    
    try {
      const { imageId } = req.params;
      
      if (!imageId) {
        return res.status(400).json({
          success: false,
          error: 'Image ID is required'
        });
      }
      
      // Verify the image belongs to the user
      const imageDoc = await db.collection('user_images').doc(imageId).get();
      
      if (!imageDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }
      
      const imageData = imageDoc.data();
      
      if (imageData.userId !== req.user.uid) {
        return res.status(403).json({
          success: false,
          error: 'Unauthorized to delete this image'
        });
      }
      
      // Delete the image
      await db.collection('user_images').doc(imageId).delete();
      
      const processingTime = Date.now() - startTime;
      
      loggerUtils.logPerformance(apiLogger, 'image-delete', processingTime, {
        userId: req.user.uid,
        imageId
      });
      
      res.json({
        success: true,
        message: 'Image deleted successfully',
        imageId
      });
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      loggerUtils.logError(apiLogger, error, {
        operation: 'delete-image',
        userId: req.user?.uid,
        imageId: req.params.imageId,
        processingTime
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to delete image',
        message: 'An error occurred while deleting the image'
      });
    }
  }
);

/**
 * POST /delete-bulk
 * Delete multiple images from user's gallery
 */
router.post('/delete-bulk',
  verifyToken,
  [
    body('imageIds')
      .isArray({ min: 1, max: 50 })
      .withMessage('Image IDs must be an array with 1-50 items'),
    body('imageIds.*')
      .isString()
      .withMessage('Each image ID must be a string')
  ],
  async (req, res) => {
    const startTime = Date.now();
    
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
      
      const { imageIds } = req.body;
      
      // Verify all images belong to the user
      const batch = db.batch();
      const verificationPromises = imageIds.map(async (imageId) => {
        const imageDoc = await db.collection('user_images').doc(imageId).get();
        
        if (!imageDoc.exists) {
          throw new Error(`Image ${imageId} not found`);
        }
        
        const imageData = imageDoc.data();
        
        if (imageData.userId !== req.user.uid) {
          throw new Error(`Unauthorized to delete image ${imageId}`);
        }
        
        // Add to batch delete
        batch.delete(db.collection('user_images').doc(imageId));
        
        return imageId;
      });
      
      const verifiedIds = await Promise.all(verificationPromises);
      
      // Execute batch delete
      await batch.commit();
      
      const processingTime = Date.now() - startTime;
      
      loggerUtils.logPerformance(apiLogger, 'bulk-delete', processingTime, {
        userId: req.user.uid,
        deletedCount: verifiedIds.length
      });
      
      res.json({
        success: true,
        message: `${verifiedIds.length} images deleted successfully`,
        deletedIds: verifiedIds
      });
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      loggerUtils.logError(apiLogger, error, {
        operation: 'delete-bulk',
        userId: req.user?.uid,
        processingTime
      });
      
      let statusCode = 500;
      let errorMessage = 'Failed to delete images';
      
      if (error.message.includes('not found')) {
        statusCode = 404;
        errorMessage = error.message;
      } else if (error.message.includes('Unauthorized')) {
        statusCode = 403;
        errorMessage = error.message;
      }
      
      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        message: 'An error occurred while deleting the images'
      });
    }
  }
);

/**
 * GET /auth-status
 * Check authentication status and user information
 */
router.get('/auth-status',
  verifyToken,
  async (req, res) => {
    try {
      res.json({
        success: true,
        user: {
          uid: req.user.uid,
          email: req.user.email,
          displayName: req.user.displayName,
          emailVerified: req.user.emailVerified
        },
        authenticated: true
      });
    } catch (error) {
      loggerUtils.logError(apiLogger, error, {
        operation: 'auth-status',
        userId: req.user?.uid
      });
      
      res.status(500).json({
        success: false,
        error: 'Failed to get auth status'
      });
    }
  }
);

export default router;