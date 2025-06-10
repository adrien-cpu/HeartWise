"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User
} from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';
import { criticalConfigError } from '@/lib/firebase';

/**
 * @interface AuthContextType
 * @description Type definition for the authentication context
 */
interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, password: string) => Promise<User>;
  signup: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * @function AuthProvider
 * @description Provider component for authentication context
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const t = useTranslations('Auth');
  const auth = getAuth();
  const isFirebaseConfigured = !criticalConfigError;

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, [auth, isFirebaseConfigured]);

  const login = async (email: string, password: string): Promise<User> => {
    if (!isFirebaseConfigured) {
      throw new Error(t('firebaseConfigError'));
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (error: any) {
      console.error('Login error:', error.code, error.message);
      
      let errorMessage = t('loginErrorDefault');
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = t('loginErrorInvalidCredentials');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('loginErrorInvalidEmail');
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = t('loginErrorTooManyAttempts');
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = t('networkError');
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = t('loginErrorAccountDisabled');
      } else if (error.code === 'auth/invalid-api-key' || error.code === 'auth/api-key-not-valid.' || error.message?.includes('API key not valid')) {
        errorMessage = t('firebaseApiKeyErrorDetailed');
      }
      
      throw new Error(errorMessage);
    }
  };

  const signup = async (email: string, password: string): Promise<User> => {
    if (!isFirebaseConfigured) {
      throw new Error(t('firebaseConfigError'));
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      return userCredential.user;
    } catch (error: any) {
      console.error('Signup error:', error.code, error.message);
      
      let errorMessage = t('signupErrorDefault');
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = t('signupErrorEmailInUse');
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = t('signupErrorInvalidEmail');
      } else if (error.code === 'auth/weak-password') {
        errorMessage = t('signupErrorWeakPassword');
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = t('networkError');
      } else if (error.code === 'auth/invalid-api-key' || error.code === 'auth/api-key-not-valid.' || error.message?.includes('API key not valid')) {
        errorMessage = t('firebaseApiKeyErrorDetailed');
      }
      
      throw new Error(errorMessage);
    }
  };

  const logout = async (): Promise<void> => {
    if (!isFirebaseConfigured) {
      console.warn('Firebase not configured, simulating logout');
      setCurrentUser(null);
      return;
    }

    try {
      await signOut(auth);
      setCurrentUser(null);
      toast({
        title: t('logoutSuccessTitle'),
        description: t('logoutSuccessDesc'),
      });
    } catch (error: any) {
      console.error('Logout error:', error);
      toast({
        variant: 'destructive',
        title: t('logoutErrorTitle'),
        description: t('logoutErrorDesc'),
      });
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    isFirebaseConfigured,
    login,
    signup,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * @function useAuth
 * @description Custom hook to use the authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};