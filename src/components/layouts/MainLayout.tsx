"use client";

import React from 'react';
import { Header } from '@/components/navigation/Header';
import { MobileNav } from '@/components/navigation/MobileNav';
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
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Toaster />
    </div>
  );
}