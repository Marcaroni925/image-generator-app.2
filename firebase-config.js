/**
 * Firebase Configuration and Initialization
 * 
 * Central configuration for Firebase services including Authentication and Firestore.
 * Evidence-based implementation following Firebase best practices:
 * - Authentication with email/password and social providers
 * - Firestore for user image gallery storage
 * - Environment-based configuration for security
 * - Error handling and connection validation
 */

import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

// Firebase configuration - Replace with your Firebase project config
const firebaseConfig = {
  // TODO: Replace with actual Firebase project configuration
  // Get this from Firebase Console > Project Settings > General > Your apps
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB5O49UF2vAtcjUVHF8Qjms6sqqdBc_IOw",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "coloing-book-creator.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "coloing-book-creator",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "coloing-book-creator.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "143460361234",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:143460361234:web:e9e2e111f1200eb54aa4cb"
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = getAuth(app);

// Initialize Firestore Database
const db = getFirestore(app);

// Development mode: Connect to Firebase emulators
if (import.meta.env.MODE === 'development' && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    // Connect to Auth emulator (default port 9099)
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    
    // Connect to Firestore emulator (default port 8080)
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    
    console.log('🔧 Connected to Firebase emulators');
  } catch {
    // Emulators might already be connected
    console.log('Firebase emulators already connected or not available');
  }
}

/**
 * Firebase service validation
 * Checks if Firebase services are properly initialized
 */
export const validateFirebaseConfig = () => {
  const requiredEnvVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID'
  ];

  const missingVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0 && import.meta.env.MODE === 'production') {
    console.warn('Missing Firebase environment variables:', missingVars);
    return false;
  }

  return {
    app: !!app,
    auth: !!auth,
    firestore: !!db,
    projectId: firebaseConfig.projectId,
    environment: import.meta.env.MODE || 'development'
  };
};

// Export Firebase services
export { app, auth, db };
export default app;

/**
 * Environment Variables Required:
 * 
 * For Production (.env.production):
 * VITE_FIREBASE_API_KEY=your-actual-api-key
 * VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
 * VITE_FIREBASE_PROJECT_ID=your-project-id
 * VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
 * VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
 * VITE_FIREBASE_APP_ID=1:123456789:web:abc123def456
 * 
 * For Development (.env.development):
 * VITE_USE_FIREBASE_EMULATOR=true
 * VITE_FIREBASE_API_KEY=demo-key
 * VITE_FIREBASE_AUTH_DOMAIN=demo-project.firebaseapp.com
 * VITE_FIREBASE_PROJECT_ID=demo-project
 * 
 * Note: All Vite environment variables must be prefixed with VITE_
 * to be accessible in the browser environment.
 */