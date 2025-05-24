"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser, signOut as firebaseSignOut, getIdToken, onIdTokenChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase'; // Firebase auth instance
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

/**
 * @interface AuthContextType
 * @description Définit la structure du contexte d'authentification.
 */
interface AuthContextType {
  currentUser: FirebaseUser | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Hook personnalisé pour utiliser le contexte d'authentification.
 * @function useAuth
 * @returns {AuthContextType} Le contexte d'authentification.
 * @throws {Error} Si utilisé en dehors d'un AuthProvider.
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
}

/**
 * @interface AuthProviderProps
 * @description Props pour le composant AuthProvider.
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Composant AuthProvider.
 * Gère l'état d'authentification et le fournit à ses enfants via le contexte.
 * @param {AuthProviderProps} props - Les props du composant.
 * @returns {JSX.Element} Le composant AuthProvider.
 */
export function AuthProvider({ children }: AuthProviderProps): JSX.Element {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const t = useTranslations('Auth');

  useEffect(() => {
    // Écouter les changements d'état d'authentification
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    // Écouter les changements de token
    const unsubscribeToken = onIdTokenChanged(auth, async (user) => {
      if (user) {
        try {
          const token = await user.getIdToken(true);
          // Stocker le token dans un cookie sécurisé
          document.cookie = `auth-token=${token}; path=/; secure; samesite=strict`;
        } catch (error) {
          console.error("Erreur lors du rafraîchissement du token:", error);
          toast({
            variant: 'destructive',
            title: t('tokenRefreshErrorTitle'),
            description: t('tokenRefreshErrorDesc'),
          });
        }
      } else {
        // Supprimer le cookie si l'utilisateur n'est pas authentifié
        document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    });

    // Nettoyer les abonnements lors du démontage
    return () => {
      unsubscribeAuth();
      unsubscribeToken();
    };
  }, [toast, t]);

  /**
   * Rafraîchit le token d'authentification.
   * @async
   * @function refreshToken
   * @returns {Promise<string | null>} Le nouveau token ou null si l'utilisateur n'est pas authentifié.
   */
  const refreshToken = async (): Promise<string | null> => {
    if (!currentUser) return null;
    try {
      const token = await getIdToken(currentUser, true);
      document.cookie = `auth-token=${token}; path=/; secure; samesite=strict`;
      return token;
    } catch (error) {
      console.error("Erreur lors du rafraîchissement du token:", error);
      toast({
        variant: 'destructive',
        title: t('tokenRefreshErrorTitle'),
        description: t('tokenRefreshErrorDesc'),
      });
      return null;
    }
  };

  /**
   * Déconnecte l'utilisateur actuel.
   * @async
   * @function logout
   * @returns {Promise<void>}
   */
  const logout = async (): Promise<void> => {
    try {
      await firebaseSignOut(auth);
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      toast({
        title: t('logoutSuccessTitle'),
        description: t('logoutSuccessDesc'),
      });
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        variant: 'destructive',
        title: t('logoutErrorTitle'),
        description: t('logoutErrorDesc'),
      });
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    logout,
    refreshToken,
  };

  // Afficher un spinner de chargement pendant la vérification de l'état d'authentification
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
