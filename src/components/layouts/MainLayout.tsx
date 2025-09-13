"use client";

import React from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/navigation/Header';
import { usePathname } from 'next/navigation';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const pathname = usePathname();
  
  // Don't show header on home page when using tiles layout
  const showHeader = !pathname.endsWith('/') && !pathname.endsWith('/fr') && !pathname.endsWith('/en');

  return (
    <div className="min-h-screen bg-background">
      {showHeader && <Header />}
      <main className={showHeader ? "pt-20" : ""}>
        {children}
      </main>
      <Toaster />
    </div>
  );
}