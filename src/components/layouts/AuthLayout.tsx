"use client";

import React from 'react';
import { Link } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const t = useTranslations('Auth');

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-rose-100 via-purple-100 to-blue-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md relative">
        <Link href="/" className="absolute -top-16 left-0">
          <Button variant="ghost" className="text-primary hover:text-primary/80">
            <ArrowLeft className="h-4 w-4 mr-2" />
            {t('backToHome')}
          </Button>
        </Link>
        
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-primary">HeartWise</span>
          </Link>
        </div>
        
        {children}
      </div>
    </div>
  );
}
