import React, { createContext, useContext, useEffect } from 'react';
import { AuthContextType, AuthProviderProps } from '../types/auth';
import useAuthStore from '../store/authStore';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    user,
    isLoading,
    isAuthenticated,
    error,
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    updateUserMetadata,
    signInWithGoogle,
    signInWithGitHub,
    clearError,
    initialize
  } = useAuthStore();

  // Initialize auth on mount with error handling
  useEffect(() => {
    if (!initialized) {
      try {
        initialize();
      } catch (error) {
        console.error('Failed to initialize auth:', error);
      }
    }
  }, [initialized, initialize]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    error,
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updateProfile,
    updateUserMetadata,
    signInWithGoogle,
    signInWithGitHub,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;