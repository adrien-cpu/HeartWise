"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Icons } from '@/components/icons';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Heart, User, LogOut, Settings, Trophy, MessageCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';

const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export function Header() {
  const t = useTranslations('Navigation');
  const tAuth = useTranslations('Auth');
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="bg-primary text-primary-foreground font-bold rounded-lg px-2 py-1 text-sm">
            HW
          </div>
          <span className="text-xl font-bold text-primary hidden sm:block">
            HeartWise
          </span>
        </Link>

        {/* Navigation principale */}
        <nav className="hidden md:flex items-center space-x-1">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="ghost" className="text-sm">
                  <Icons.home className="h-4 w-4 mr-2" />
                  {t('dashboard')}
                </Button>
              </Link>
              <Link href="/chat">
                <Button variant="ghost" className="text-sm relative">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {t('chat')}
                  <Badge variant="destructive" className="ml-2 h-4 text-xs px-1">
                    3
                  </Badge>
                </Button>
              </Link>
              <Link href="/game">
                <Button variant="ghost" className="text-sm">
                  <Icons.gamepad className="h-4 w-4 mr-2" />
                  {t('games')}
                </Button>
              </Link>
              <Link href="/speed-dating">
                <Button variant="ghost" className="text-sm">
                  <Icons.zap className="h-4 w-4 mr-2" />
                  {t('speedDating')}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/about">
                <Button variant="ghost" className="text-sm">
                  {t('about')}
                </Button>
              </Link>
              <Link href="/features">
                <Button variant="ghost" className="text-sm">
                  {t('features')}
                </Button>
              </Link>
            </>
          )}
        </nav>

        {/* Actions utilisateur */}
        <div className="flex items-center space-x-3">
          <LanguageSwitcher />
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                    <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.displayName || 'Utilisateur'}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>{t('profile')}</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/rewards">
                  <DropdownMenuItem>
                    <Trophy className="mr-2 h-4 w-4" />
                    <span>{t('rewards')}</span>
                  </DropdownMenuItem>
                </Link>
                <Link href="/settings">
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>{t('settings')}</span>
                  </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-destructive focus:text-destructive"
                  onSelect={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{tAuth('logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  {tAuth('loginButton')}
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm" className="bg-primary hover:bg-primary/90">
                  {tAuth('signupButton')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}