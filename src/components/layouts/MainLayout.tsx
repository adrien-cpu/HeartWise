"use client";

import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/navigation/Header';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20">
        {children}
      </main>
      <Toaster />
    </div>
  );
}