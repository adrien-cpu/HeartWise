"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  AuthErrorCodes,
  // Note: We'll keep signup logic in the signup page itself for now
  // as it involves creating a user profile record in addition to auth.
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

/**
 * @interface AuthContextType
 * @description Type definition for the authentication context
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

// Create the context with a default value.
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @function AuthProvider
 * @description Provider component for authentication context. It centralizes all Firebase auth logic.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = (email: string, password: string) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };
  
  const sendPasswordReset = (email: string) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Enhanced error handling for auth operations
  const handleAuthError = (error: any): string => {
    console.error('Auth error:', error);
    
    switch (error.code) {
      case AuthErrorCodes.USER_DISABLED:
        return 'This account has been disabled. Please contact support.';
      case AuthErrorCodes.USER_DELETED:
        return 'This account no longer exists.';
      case AuthErrorCodes.INVALID_EMAIL:
        return 'The email address is not valid.';
      case AuthErrorCodes.WEAK_PASSWORD:
        return 'Password is too weak. Please choose a stronger password.';
      case AuthErrorCodes.EMAIL_EXISTS:
        return 'An account with this email already exists.';
      case AuthErrorCodes.TOO_MANY_ATTEMPTS_TRY_LATER:
        return 'Too many failed attempts. Please try again later.';
      case AuthErrorCodes.NETWORK_REQUEST_FAILED:
        return 'Network error. Please check your connection and try again.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };
  
  const value = {
    user,
    loading,
    login,
    logout,
    sendPasswordReset,
    handleAuthError,
  };

  // Render children only when not loading, or handle loading state in components
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * @function useAuth
 * @description Custom hook to use the authentication context.
 *              Ensures the hook is used within an AuthProvider.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
