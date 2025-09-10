"use client";

import React from 'react';
import { NavigationSystem } from '@/components/navigation/NavigationSystem';
import { BreadcrumbNavigation } from '@/components/navigation/Breadcrumbs';
import { ContextualNavigation } from '@/components/navigation/ContextualNav';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Initialisation de HeartWise...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <NavigationSystem />
      <BreadcrumbNavigation />
      <main className="flex-1">
        {children}
      </main>
      <ContextualNavigation />
      <Toaster />
    </div>
  );
}