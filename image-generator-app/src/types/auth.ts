import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  phoneNumber: string | null;
  createdAt: Date;
  lastLoginAt: Date | null;
  metadata: UserMetadata;
}

export interface UserMetadata {
  theme: 'light' | 'dark';
  preferences: {
    generateOnEnter: boolean;
    autoSaveImages: boolean;
    showAdvancedOptions: boolean;
  };
  stats: {
    imagesGenerated: number;
    lastGeneratedAt: Date | null;
  };
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  initialized: boolean;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  displayName: string;
  confirmPassword: string;
}

export interface AuthError {
  code: string;
  message: string;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  initialized: boolean;
  signIn: (data: LoginFormData) => Promise<void>;
  signUp: (data: RegisterFormData) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (updates: { displayName?: string; photoURL?: string }) => Promise<void>;
  updateUserMetadata: (metadata: Partial<UserMetadata>) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGitHub: () => Promise<void>;
  clearError: () => void;
}

export interface AuthProviderProps {
  children: React.ReactNode;
}

export type AuthAction = 
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: User }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_SIGN_OUT' }
  | { type: 'AUTH_CLEAR_ERROR' }
  | { type: 'AUTH_INITIALIZED' };

// Firebase User conversion utility type
export type FirebaseUserData = FirebaseUser;

// Form validation schemas
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface UpdateProfileFormData {
  displayName: string;
  email: string;
}

// Auth persistence types
export type AuthPersistence = 'local' | 'session' | 'none';

// Social auth providers
export type SocialProvider = 'google' | 'github';

// Auth event types for analytics
export interface AuthEvent {
  type: 'sign_in' | 'sign_up' | 'sign_out' | 'password_reset' | 'profile_update';
  provider: string;
  timestamp: Date;
  userId?: string;
}