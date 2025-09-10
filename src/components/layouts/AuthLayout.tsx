"use client";

import React from 'react';
import { Link } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const t = useTranslations('Auth');

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background avec gradients et effets */}
      <div className="absolute inset-0 gradient-hero">
        <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-gradient-to-br from-primary/30 to-accent/30 blur-3xl animate-float"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 rounded-full bg-gradient-to-tr from-accent/20 to-primary/20 blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-primary/10 to-accent/10 blur-3xl"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          {/* Back button */}
          <Link href="/" className="absolute -top-16 left-0">
            <Button variant="ghost" className="text-foreground/70 hover:text-primary rounded-full px-6 py-3 glass">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('backToHome')}
            </Button>
          </Link>
          
          {/* Logo */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-12"
          >
            <Link href="/" className="inline-flex items-center gap-3 group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 10 }}
                className="relative"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-3xl flex items-center justify-center shadow-glow">
                  <Heart className="h-9 w-9 text-white" />
                </div>
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-accent animate-pulse" />
              </motion.div>
              <span className="text-3xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                HeartWise
              </span>
            </Link>
          </motion.div>
          
          {/* Auth card with glass effect */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="glass rounded-3xl p-1 shadow-card-hover"
          >
            <div className="bg-background/80 backdrop-blur-xl rounded-3xl">
              {children}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}