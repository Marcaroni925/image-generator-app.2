import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  connectAuthEmulator,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { AuthPersistence } from '../types/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase with error handling
let app;
try {
  if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
    throw new Error('Missing required Firebase configuration');
  }
  app = initializeApp(firebaseConfig);
} catch (error) {
  console.warn('Firebase initialization failed:', error);
  // Create a minimal fallback for development
  app = null;
}

// Initialize Auth with fallback
export const auth = app ? getAuth(app) : null;

// Initialize Firestore (for user metadata) with fallback
export const db = app ? getFirestore(app) : null;

// Development emulator setup
if (app && import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  const AUTH_EMULATOR_HOST = 'localhost';
  const AUTH_EMULATOR_PORT = 9099;
  const FIRESTORE_EMULATOR_PORT = 8080;
  
  if (auth) {
    connectAuthEmulator(auth, `http://${AUTH_EMULATOR_HOST}:${AUTH_EMULATOR_PORT}`);
  }
  if (db) {
    connectFirestoreEmulator(db, AUTH_EMULATOR_HOST, FIRESTORE_EMULATOR_PORT);
  }
}

// Set auth persistence based on environment
export const setAuthPersistence = async (persistence: AuthPersistence): Promise<void> => {
  if (!auth) {
    console.warn('Firebase auth not initialized, skipping persistence setup');
    return;
  }

  const persistenceMap = {
    local: browserLocalPersistence,
    session: browserSessionPersistence,
    none: browserSessionPersistence // Fallback to session
  };

  try {
    await setPersistence(auth, persistenceMap[persistence]);
  } catch (error) {
    console.error('Failed to set auth persistence:', error);
    // Fallback to local persistence
    try {
      await setPersistence(auth, browserLocalPersistence);
    } catch (fallbackError) {
      console.warn('Failed to set fallback persistence:', fallbackError);
    }
  }
};

// Initialize with default persistence only if Firebase is available
if (auth) {
  const defaultPersistence = (import.meta.env.VITE_AUTH_PERSISTENCE as AuthPersistence) || 'local';
  setAuthPersistence(defaultPersistence);
}

export default app;