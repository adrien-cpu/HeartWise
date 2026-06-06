"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Icons } from '@/components/icons';
import { Menu, X, Heart, Home, MessageCircle, Gamepad, Zap, User, Trophy, LogOut } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function MobileNav() {
  const t = useTranslations('Navigation');
  const tAuth = useTranslations('Auth');
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">{t('toggleMenu')}</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[400px]">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center space-x-2 pb-6">
            <Heart className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold text-primary">HeartWise</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Home className="h-5 w-5 mr-3" />
                    {t('dashboard')}
                  </Button>
                </Link>
                <Link href="/chat" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <MessageCircle className="h-5 w-5 mr-3" />
                    {t('chat')}
                    <Badge variant="destructive" className="ml-auto h-4 text-xs px-1">
                      3
                    </Badge>
                  </Button>
                </Link>
                <Link href="/game" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Gamepad className="h-5 w-5 mr-3" />
                    {t('games')}
                  </Button>
                </Link>
                <Link href="/speed-dating" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Zap className="h-5 w-5 mr-3" />
                    {t('speedDating')}
                  </Button>
                </Link>
                <div className="border-t pt-4 mt-4">
                  <p className="text-sm font-medium text-muted-foreground mb-2 px-3">
                    {t('aiFeatures')}
                  </p>
                  <Link href="/facial-analysis-matching" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Icons.scanFace className="h-5 w-5 mr-3" />
                      {t('facialAnalysis')}
                    </Button>
                  </Link>
                  <Link href="/ai-conversation-coach" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Icons.messageSquare className="h-5 w-5 mr-3" />
                      {t('aiCoach')}
                    </Button>
                  </Link>
                  <Link href="/blind-exchange-mode" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Icons.eyeOff className="h-5 w-5 mr-3" />
                      {t('blindExchange')}
                    </Button>
                  </Link>
                </div>
                <div className="border-t pt-4 mt-4">
                  <Link href="/profile" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <User className="h-5 w-5 mr-3" />
                      {t('profile')}
                    </Button>
                  </Link>
                  <Link href="/rewards" onClick={() => setOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">
                      <Trophy className="h-5 w-5 mr-3" />
                      {t('rewards')}
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/about" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Icons.helpCircle className="h-5 w-5 mr-3" />
                    {t('about')}
                  </Button>
                </Link>
                <Link href="/features" onClick={() => setOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Icons.heart className="h-5 w-5 mr-3" />
                    {t('features')}
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Footer actions */}
          <div className="border-t pt-4 space-y-2">
            {user ? (
              <Button 
                variant="ghost" 
                className="w-full justify-start text-destructive hover:text-destructive"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5 mr-3" />
                {tAuth('logout')}
              </Button>
            ) : (
              <div className="space-y-2">
                <Link href="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    {tAuth('loginButton')}
                  </Button>
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)}>
                  <Button className="w-full">
                    {tAuth('signupButton')}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}