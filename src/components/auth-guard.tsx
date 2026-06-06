"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const t = useTranslations('AuthGuard');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className={cn(
        "container mx-auto flex flex-col items-center justify-center",
        "min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-150px)] p-4"
      )}>
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  if (!user) {
    // This state should ideally be caught by the useEffect redirect, but as a fallback:
    return (
      <div className={cn(
        "container mx-auto flex flex-col items-center justify-center",
        "min-h-[calc(100vh-80px)] md:min-h-[calc(100vh-150px)] p-4"
      )}>
        <p className="mr-2">{t('redirectingToLogin')}</p>
        <Loader2 className="h-8 w-8 animate-spin text-primary ml-2" />
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
};

export default AuthGuard;