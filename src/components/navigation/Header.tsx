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
  Zap,
  Calendar,
  HelpCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

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

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200/50">
        <div className="container mx-auto flex h-20 items-center justify-between px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-rose-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-rose-600 to-purple-600 bg-clip-text text-transparent">
              HeartWise
            </span>
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden lg:flex items-center space-x-8">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-base font-medium hover:text-rose-600 transition-colors">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="ghost" className="text-base font-medium hover:text-rose-600 transition-colors">
                    Chat
                  </Button>
                </Link>
                <Link href="/speed-dating">
                  <Button variant="ghost" className="text-base font-medium hover:text-rose-600 transition-colors">
                    Speed Dating
                  </Button>
                </Link>
                <Link href="/game">
                  <Button variant="ghost" className="text-base font-medium hover:text-rose-600 transition-colors">
                    Games
                  </Button>
                </Link>
                <Link href="/help">
                  <Button variant="ghost" className="text-base font-medium hover:text-rose-600 transition-colors">
                    Help
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/about">
                  <Button variant="ghost" className="text-base font-medium hover:text-rose-600 transition-colors">
                    About
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="ghost" className="text-base font-medium hover:text-rose-600 transition-colors">
                    Features
                  </Button>
                </Link>
              </>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-12 w-12 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white font-bold">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end">
                  <div className="flex items-center gap-3 p-3 mb-2">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                      <AvatarFallback className="bg-gradient-to-br from-rose-500 to-purple-600 text-white">
                        {getInitials(user.displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <p className="font-semibold text-gray-800">{user.displayName || 'User'}</p>
                      <p className="text-sm text-gray-600 truncate max-w-[180px]">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem>
                      <User className="mr-3 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/rewards">
                    <DropdownMenuItem>
                      <Trophy className="mr-3 h-4 w-4" />
                      Rewards
                    </DropdownMenuItem>
                  </Link>
                  <Link href="/settings">
                    <DropdownMenuItem>
                      <Settings className="mr-3 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer text-red-600 focus:text-red-600"
                    onSelect={handleLogout}
                  >
                    <LogOut className="mr-3 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button variant="ghost" className="text-base">
                    Login
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button className="text-base">
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="lg:hidden"
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
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white border-l shadow-2xl">
            <div className="flex flex-col h-full p-6 pt-24">
              {user ? (
                <div className="space-y-4">
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg p-4">
                      <Home className="mr-3 h-5 w-5" />
                      Dashboard
                    </Button>
                  </Link>
                  <Link href="/chat" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg p-4">
                      <MessageCircle className="mr-3 h-5 w-5" />
                      Chat
                    </Button>
                  </Link>
                  <Link href="/speed-dating" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg p-4">
                      <Zap className="mr-3 h-5 w-5" />
                      Speed Dating
                    </Button>
                  </Link>
                  <Link href="/game" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg p-4">
                      <Gamepad2 className="mr-3 h-5 w-5" />
                      Games
                    </Button>
                  </Link>
                  <Link href="/calendar" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg p-4">
                      <Calendar className="mr-3 h-5 w-5" />
                      Calendrier
                    </Button>
                  </Link>
                  <Link href="/help" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg p-4">
                      <HelpCircle className="mr-3 h-5 w-5" />
                      Aide
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link href="/about" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg p-4">
                      About
                    </Button>
                  </Link>
                  <Link href="/features" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start text-lg p-4">
                      Features
                    </Button>
                  </Link>
                </div>
              )}
              
              <div className="mt-auto pt-6 border-t">
                {user ? (
                  <div className="space-y-3">
                    <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        <User className="mr-2 w-4 h-4" />
                        Profile
                      </Button>
                    </Link>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 w-4 h-4" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="outline" className="w-full">
                        Se connecter
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full">
                        S'inscrire
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