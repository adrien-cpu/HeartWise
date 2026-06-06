"use client";

import React from 'react';
import { Link } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const t = useTranslations('Auth');

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background avec gradients simples */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-gradient-to-br from-purple-400/30 to-rose-400/30 blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-rose-400/20 to-purple-400/20 blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Back button */}
          <Link href="/" className="absolute -top-16 left-0">
            <Button variant="ghost" className="text-gray-700 hover:text-rose-600 rounded-full px-6 py-3 bg-white/80 backdrop-blur-sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToHome')}
            </Button>
          </Link>
          
          {/* Logo */}
          <div className="text-center mb-12">
            <Link href="/" className="inline-flex items-center gap-3 group">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-rose-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                  <Heart className="h-9 w-9 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-purple-600" />
              </div>
              <span className="text-3xl font-black bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
                HeartWise
              </span>
            </Link>
          </div>
          
          {/* Auth card */}
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-200/50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}