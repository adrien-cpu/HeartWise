
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, criticalConfigError } from '@/lib/firebase'; // Firebase auth instance and error flag
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';


/**
 * @interface AuthContextType
 * @description Defines the shape of the authentication context.
 */
interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  isFirebaseConfigured: boolean; // New flag
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Custom hook to use the authentication context.
 * @function useAuth
 * @returns {AuthContextType} The authentication context.
 * @throws {Error} If used outside of an AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * @interface AuthProviderProps
 * @description Props for the AuthProvider component.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * AuthProvider component.
 * Manages the authentication state and provides it to its children via context.
 * @param {AuthProviderProps} props - The props for the component.
 * @returns {JSX.Element} The AuthProvider component.
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(!criticalConfigError);


  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [isFirebaseConfigured]);

  /**
   * Logs out the current user.
   * @async
   * @function logout
   * @returns {Promise<void>}
   */
  const logout = async (): Promise<void> => {
    if (!isFirebaseConfigured) {
      console.warn("[AuthContext] Firebase not configured. Logout called but will not proceed.");
      return;
    }
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Error signing out: ", error);
      // Optionally, show a toast message for sign-out errors
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    logout,
    isFirebaseConfigured,
  };

  if (!isFirebaseConfigured) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background p-4">
        <Alert variant="destructive" className="max-w-lg">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle>Firebase Configuration Error</AlertTitle>
          <AlertDescription>
            Firebase is not configured correctly. Please check the server console logs for details on missing environment variables (e.g., <code>NEXT_PUBLIC_FIREBASE_API_KEY</code>). Ensure your <code>.env</code> file is set up and the application is restarted. Authentication and other Firebase-dependent features will not work.
          </AlertDescription>
        </Alert>
      </div>
    );
  }


  // Show a loading spinner while checking auth state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

