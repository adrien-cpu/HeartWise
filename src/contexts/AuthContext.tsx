"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
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
  
  const value = {
    user,
    loading,
    login,
    logout,
    sendPasswordReset,
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
