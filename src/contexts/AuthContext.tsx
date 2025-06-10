"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, User } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  isFirebaseConfigured: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true);
  const { toast } = useToast();
  const t = useTranslations('Auth');

  useEffect(() => {
    // Check if Firebase is properly configured by checking if auth is initialized
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    const authDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    
    if (!apiKey || !authDomain || !projectId) {
      console.error("Firebase configuration is missing critical variables");
      setIsFirebaseConfigured(false);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    }, (error) => {
      console.error("Auth state change error:", error);
      // If we get an API key error, mark Firebase as not configured
      if (error.code === 'auth/invalid-api-key' || error.message?.includes('API key not valid')) {
        setIsFirebaseConfigured(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    if (!isFirebaseConfigured) {
      throw new Error(t('firebaseConfigError'));
    }
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error("Login error:", error.code, error.message);
      
      // Check for API key configuration errors
      if (error.code === 'auth/invalid-api-key' || error.message?.includes('API key not valid')) {
        setIsFirebaseConfigured(false);
        throw new Error(t('firebaseApiKeyError'));
      }
      
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    if (!isFirebaseConfigured) {
      throw new Error(t('firebaseConfigError'));
    }
    
    try {
      await signOut(auth);
      toast({
        title: t('logoutSuccessTitle'),
        description: t('logoutSuccessDesc'),
      });
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        variant: 'destructive',
        title: t('logoutErrorTitle'),
        description: t('logoutErrorDesc'),
      });
      throw error;
    }
  };

  const value = {
    currentUser,
    loading,
    isFirebaseConfigured,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}