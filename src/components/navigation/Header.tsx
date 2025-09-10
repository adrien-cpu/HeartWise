"use client";

import React, { useState } from 'react';
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
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { 
  Heart, 
  User, 
  LogOut, 
  Settings, 
  Trophy, 
  MessageCircle,
  Menu,
  X,
  Home,
  Gamepad2,
  Zap
} from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigationItems = [
    { href: "/dashboard", label: t('dashboard'), icon: <Home className="w-4 h-4" /> },
    { href: "/chat", label: t('chat'), icon: <MessageCircle className="w-4 h-4" />, badge: 3 },
    { href: "/game", label: t('games'), icon: <Gamepad2 className="w-4 h-4" /> },
    { href: "/speed-dating", label: t('speedDating'), icon: <Zap className="w-4 h-4" /> }
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Heart className="w-7 h-7 text-white" />
              </div>
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              HeartWise
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            {user ? (
              <>
                {navigationItems.map((item) => (
                  <Link key={item.href} href={item.href}>
                    <Button 
                      variant="ghost" 
                      className="text-base font-medium hover:text-rose-600 hover:bg-rose-50 transition-all duration-300 rounded-full px-6"
                    >
                      {item.icon}
                      <span className="ml-2">{item.label}</span>
                      {item.badge && (
                        <Badge variant="destructive" className="ml-2 h-5 text-xs px-2">
                          {item.badge}
                        </Badge>
                      )}
                    </Button>
                  </Link>
                ))}
              </>
            ) : (
              <>
                <Link href="/about">
                  <Button variant="ghost" className="text-base font-medium hover:text-rose-600 transition-colors rounded-full px-6">
                    {t('about')}
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="ghost" className="text-base font-medium hover:text-rose-600 transition-colors rounded-full px-6">
                    {t('features')}
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Actions utilisateur */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:block">
              <LanguageSwitcher />
            </div>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full ring-2 ring-rose-200 hover:ring-rose-400 transition-all">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white font-bold">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64 p-2" align="end" forceMount>
                  <div className="flex items-center gap-3 p-3 mb-2 rounded-xl bg-gradient-to-br from-rose-50 to-purple-50">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-800">{user.displayName || 'Utilisateur'}</p>
                      <p className="text-sm text-gray-600 truncate max-w-[180px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem className="rounded-lg">
                      <User className="mr-3 h-4 w-4" />
                      <span>{t('profile')}</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/rewards">
                    <DropdownMenuItem className="rounded-lg">
                      <Trophy className="mr-3 h-4 w-4" />
                      <span>{t('rewards')}</span>
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem className="rounded-lg">
                      <Settings className="mr-3 h-4 w-4" />
                      <span>{t('settings')}</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600 rounded-lg"
                    onSelect={handleLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>{tAuth('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" className="rounded-full px-6 hover:bg-rose-50 hover:text-rose-600 transition-all">
                    {tAuth('loginButton')}
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="rounded-full px-6 bg-gradient-to-r from-rose-500 to-purple-600 hover:from-purple-600 hover:to-rose-500 transition-all duration-500 shadow-lg">
                    {tAuth('signupButton')}
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl border-l shadow-2xl">
            <div className="flex flex-col h-full p-6 pt-24">
              {user ? (
                <div className="space-y-4">
                  {navigationItems.map((item) => (
                    <Link 
                      key={item.href} 
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-lg p-4 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-all"
                      >
                        {item.icon}
                        <span className="ml-3">{item.label}</span>
                        {item.badge && (
                          <Badge variant="destructive" className="ml-auto h-5 text-xs px-2">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg p-4 rounded-2xl">
                      {t('about')}
                    </Button>
                  </Link>
                  <Link href="/features" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg p-4 rounded-2xl">
                      {t('features')}
                    </Button>
                  </Link>
                </div>
              )}
              
              <div className="mt-auto pt-6 border-t">
                <div className="sm:hidden mb-4">
                  <LanguageSwitcher />
                </div>
                {user ? (
                  <div className="space-y-3">
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-2xl">
                        <User className="mr-2 w-4 h-4" />
                        {t('profile')}
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      className="w-full rounded-2xl"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 w-4 h-4" />
                      {tAuth('logout')}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full rounded-2xl">
                        {tAuth('loginButton')}
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-purple-600">
                        {tAuth('signupButton')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}