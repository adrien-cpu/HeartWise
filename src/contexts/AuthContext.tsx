
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, criticalConfigError, firebaseConfig } from '@/lib/firebase'; // Firebase auth instance and error flag
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
        <Alert variant="destructive" className="max-w-lg shadow-lg">
          <AlertTriangle className="h-5 w-5" />
          <AlertTitle className="font-bold text-lg">Firebase Configuration Error</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>The application cannot connect to Firebase services. This is usually due to missing or incorrect Firebase configuration settings.</p>
            <p>Please ensure the following environment variables are correctly set in your <code>.env.local</code> file:</p>
            <ul className="list-disc list-inside space-y-1 text-sm pl-4 bg-muted p-3 rounded-md">
              <li><code>NEXT_PUBLIC_FIREBASE_API_KEY</code></li>
              <li><code>NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code></li>
              <li><code>NEXT_PUBLIC_FIREBASE_PROJECT_ID</code></li>
              {/* Add others if they become critical, e.g., APP_ID */}
            </ul>
            <p>You can find these values in your Firebase project settings: <br/> <strong>Project Settings</strong> &gt; <strong>General</strong> &gt; <strong>Your apps</strong> &gt; (Select your web app) &gt; <strong>Firebase SDK snippet</strong> &gt; <strong>Config</strong>.</p>
            <p>After adding or correcting these variables, you <strong>must restart your Next.js development server</strong> for the changes to take effect.</p>
            <p className="mt-3 text-xs text-muted-foreground">Check your server console for detailed logs from `src/lib/firebase.ts` regarding which specific variables might be missing or empty.</p>
            <p className="mt-1 text-xs text-muted-foreground">Current API Key from env (first 5 chars): {firebaseConfig.apiKey ? String(firebaseConfig.apiKey).substring(0,5) + '...' : 'MISSING or EMPTY'}</p>
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
