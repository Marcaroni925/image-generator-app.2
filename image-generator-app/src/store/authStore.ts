import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile as firebaseUpdateProfile,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { LoginFormData, RegisterFormData } from '../types/auth';

interface BasicAuthStore {
  user: any;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  initialized: boolean;
  
  // Placeholder methods
  initialize: () => void;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialized: (initialized: boolean) => void;
  
  // Auth methods
  signIn: (data: LoginFormData) => Promise<void>;
  signUp: (data: RegisterFormData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
  updateUserMetadata: (metadata: any) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  clearError: () => void;
}

const useAuthStore = create<BasicAuthStore>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,
      initialized: true,
      
      initialize: () => {
        if (!auth) {
          console.warn('Firebase auth not available');
          set({ initialized: true, isLoading: false });
          return;
        }
        
        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
          set({ 
            user, 
            isAuthenticated: !!user, 
            isLoading: false, 
            initialized: true 
          });
        });
        
        // Store unsubscribe function for cleanup if needed
        return unsubscribe;
      },
      
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setInitialized: (initialized) => set({ initialized }),
      
      // Firebase auth methods
      signIn: async (data: LoginFormData) => {
        if (!auth) {
          throw new Error('Firebase auth not initialized');
        }
        
        set({ isLoading: true, error: null });
        try {
          const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
          set({ user: userCredential.user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.code === 'auth/invalid-credential' 
            ? 'Invalid email or password'
            : error.message || 'Sign in failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      signUp: async (data: RegisterFormData) => {
        if (!auth) {
          throw new Error('Firebase auth not initialized');
        }
        
        set({ isLoading: true, error: null });
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
          
          // Update display name
          if (userCredential.user && data.displayName) {
            await firebaseUpdateProfile(userCredential.user, {
              displayName: data.displayName
            });
          }
          
          set({ user: userCredential.user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          const errorMessage = error.code === 'auth/email-already-in-use'
            ? 'An account with this email already exists'
            : error.code === 'auth/weak-password'
            ? 'Password should be at least 6 characters'
            : error.message || 'Sign up failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      signOut: async () => {
        if (!auth) {
          set({ user: null, isAuthenticated: false });
          return;
        }
        
        set({ isLoading: true, error: null });
        try {
          await firebaseSignOut(auth);
          set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Sign out failed', isLoading: false });
          throw error;
        }
      },
      resetPassword: async (email: string) => {
        if (!auth) {
          throw new Error('Firebase auth not initialized');
        }
        
        set({ isLoading: true, error: null });
        try {
          await sendPasswordResetEmail(auth, email);
          set({ isLoading: false });
        } catch (error: any) {
          const errorMessage = error.code === 'auth/user-not-found'
            ? 'No account found with this email address'
            : error.message || 'Password reset failed';
          set({ error: errorMessage, isLoading: false });
          throw error;
        }
      },
      updateProfile: async (data: any) => {
        if (!auth || !auth.currentUser) {
          throw new Error('No authenticated user');
        }
        
        set({ isLoading: true, error: null });
        try {
          await firebaseUpdateProfile(auth.currentUser, data);
          set({ user: auth.currentUser, isLoading: false });
        } catch (error: any) {
          set({ error: error.message || 'Profile update failed', isLoading: false });
          throw error;
        }
      },
      updateUserMetadata: async (metadata: any) => {
        console.log('Update metadata placeholder - Firebase not configured');
      },
      signInWithGoogle: async () => {
        if (!auth) {
          throw new Error('Firebase auth not initialized');
        }
        
        set({ isLoading: true, error: null });
        try {
          const provider = new GoogleAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          set({ user: userCredential.user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          if (error.code !== 'auth/popup-closed-by-user') {
            let errorMessage = 'Google sign in failed';
            
            if (error.code === 'auth/internal-error') {
              errorMessage = 'Google authentication not configured. Please check Firebase Console settings.';
            } else if (error.code === 'auth/unauthorized-domain') {
              errorMessage = 'Domain not authorized. Please add this domain to Firebase authorized domains.';
            } else if (error.code === 'auth/operation-not-supported-in-this-environment') {
              errorMessage = 'Google authentication not supported in this environment.';
            } else if (error.message) {
              errorMessage = error.message;
            }
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
          set({ isLoading: false });
        }
      },
      signInWithGitHub: async () => {
        if (!auth) {
          throw new Error('Firebase auth not initialized');
        }
        
        set({ isLoading: true, error: null });
        try {
          const provider = new GithubAuthProvider();
          const userCredential = await signInWithPopup(auth, provider);
          set({ user: userCredential.user, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
          if (error.code !== 'auth/popup-closed-by-user') {
            const errorMessage = error.message || 'GitHub sign in failed';
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
          set({ isLoading: false });
        }
      },
      clearError: () => set({ error: null })
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({
        // Only persist minimal state to avoid conflicts with Firebase
        initialized: state.initialized
      })
    }
  )
);

export default useAuthStore;