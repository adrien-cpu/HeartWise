"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { 
  Heart, 
  Home, 
  MessageCircle, 
  Users, 
  Gamepad2,
  Zap,
  Brain,
  Eye,
  MapPin,
  User,
  Trophy,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Sparkles,
  Globe,
  Bell,
  HelpCircle
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: number;
  description?: string;
  category?: 'main' | 'ai' | 'social' | 'profile';
  requiresAuth?: boolean;
}

interface NavigationCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  items: NavigationItem[];
  color: string;
}

const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export function NavigationSystem() {
  const t = useTranslations('Navigation');
  const tAuth = useTranslations('Auth');
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(3); // Mock data

  // Structured navigation with clear categories
  const navigationCategories: NavigationCategory[] = [
    {
      id: 'main',
      label: t('categoryMain'),
      icon: <Home className="w-5 h-5" />,
      color: 'from-blue-500 to-cyan-500',
      items: [
        {
          id: 'dashboard',
          label: t('dashboard'),
          href: '/dashboard',
          icon: <Home className="w-4 h-4" />,
          description: t('dashboardDesc'),
          requiresAuth: true
        },
        {
          id: 'discover',
          label: t('discover'),
          href: '/discover',
          icon: <Sparkles className="w-4 h-4" />,
          description: t('discoverDesc'),
          requiresAuth: true
        }
      ]
    },
    {
      id: 'connections',
      label: t('categoryConnections'),
      icon: <Users className="w-5 h-5" />,
      color: 'from-rose-500 to-pink-500',
      items: [
        {
          id: 'chat',
          label: t('chat'),
          href: '/chat',
          icon: <MessageCircle className="w-4 h-4" />,
          badge: unreadMessages,
          description: t('chatDesc'),
          requiresAuth: true
        },
        {
          id: 'speed-dating',
          label: t('speedDating'),
          href: '/speed-dating',
          icon: <Zap className="w-4 h-4" />,
          description: t('speedDatingDesc'),
          requiresAuth: true
        },
        {
          id: 'local-meetups',
          label: t('localMeetups'),
          href: '/geolocation-meeting',
          icon: <MapPin className="w-4 h-4" />,
          description: t('localMeetupsDesc'),
          requiresAuth: true
        }
      ]
    },
    {
      id: 'ai-features',
      label: t('categoryAI'),
      icon: <Brain className="w-5 h-5" />,
      color: 'from-purple-500 to-indigo-500',
      items: [
        {
          id: 'smart-matching',
          label: t('smartMatching'),
          href: '/facial-analysis-matching',
          icon: <Eye className="w-4 h-4" />,
          description: t('smartMatchingDesc'),
          requiresAuth: true
        },
        {
          id: 'conversation-coach',
          label: t('conversationCoach'),
          href: '/ai-conversation-coach',
          icon: <MessageCircle className="w-4 h-4" />,
          description: t('conversationCoachDesc'),
          requiresAuth: true
        },
        {
          id: 'mystery-chat',
          label: t('mysteryChat'),
          href: '/blind-exchange-mode',
          icon: <Eye className="w-4 h-4" />,
          description: t('mysteryChatDesc'),
          requiresAuth: true
        }
      ]
    },
    {
      id: 'entertainment',
      label: t('categoryEntertainment'),
      icon: <Gamepad2 className="w-5 h-5" />,
      color: 'from-green-500 to-emerald-500',
      items: [
        {
          id: 'games',
          label: t('games'),
          href: '/game',
          icon: <Gamepad2 className="w-4 h-4" />,
          description: t('gamesDesc'),
          requiresAuth: true
        }
      ]
    }
  ];

  const profileItems = [
    { id: 'profile', label: t('profile'), href: '/profile', icon: <User className="w-4 h-4" /> },
    { id: 'rewards', label: t('rewards'), href: '/rewards', icon: <Trophy className="w-4 h-4" /> },
    { id: 'settings', label: t('settings'), href: '/settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const publicItems = [
    { id: 'about', label: t('about'), href: '/about', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'features', label: t('features'), href: '/features', icon: <Sparkles className="w-4 h-4" /> }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      setMobileOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActivePath = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <>
      {/* Desktop Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center">
          {/* Logo */}
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Heart className="h-6 w-6 text-primary" />
              <span className="hidden font-bold sm:inline-block text-xl">
                HeartWise
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="mr-4 hidden md:flex">
            <nav className="flex items-center gap-4 text-sm lg:gap-6">
              {user ? (
                <>
                  {/* Main navigation items for authenticated users */}
                  <Link
                    href="/dashboard"
                    className={`transition-colors hover:text-foreground/80 ${
                      isActivePath('/dashboard') ? 'text-foreground font-medium' : 'text-foreground/60'
                    }`}
                  >
                    {t('dashboard')}
                  </Link>
                  <Link
                    href="/chat"
                    className={`transition-colors hover:text-foreground/80 flex items-center gap-1 ${
                      isActivePath('/chat') ? 'text-foreground font-medium' : 'text-foreground/60'
                    }`}
                  >
                    {t('chat')}
                    {unreadMessages > 0 && (
                      <Badge variant="destructive" className="h-4 w-4 p-0 text-xs">
                        {unreadMessages}
                      </Badge>
                    )}
                  </Link>
                  
                  {/* AI Features Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium transition-colors hover:text-foreground/80 text-foreground/60">
                      {t('aiFeatures')}
                      <ChevronRight className="h-4 w-4 rotate-90" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>{t('aiFeatures')}</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {navigationCategories.find(c => c.id === 'ai-features')?.items.map((item) => (
                        <DropdownMenuItem key={item.id} asChild>
                          <Link href={item.href} className="flex items-center gap-2">
                            {item.icon}
                            <div>
                              <div className="font-medium">{item.label}</div>
                              {item.description && (
                                <div className="text-xs text-muted-foreground">{item.description}</div>
                              )}
                            </div>
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <Link
                    href="/speed-dating"
                    className={`transition-colors hover:text-foreground/80 ${
                      isActivePath('/speed-dating') ? 'text-foreground font-medium' : 'text-foreground/60'
                    }`}
                  >
                    {t('speedDating')}
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/features"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    {t('features')}
                  </Link>
                  <Link
                    href="/about"
                    className="transition-colors hover:text-foreground/80 text-foreground/60"
                  >
                    {t('about')}
                  </Link>
                </>
              )}
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              <div className="flex items-center gap-2">
                {/* Language switcher */}
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Globe className="h-4 w-4" />
                </Button>

                {user ? (
                  <>
                    {/* Notifications */}
                    <Button variant="ghost" size="sm">
                      <Bell className="h-4 w-4" />
                      {unreadMessages > 0 && (
                        <Badge variant="destructive" className="ml-1 h-4 w-4 p-0 text-xs">
                          {unreadMessages}
                        </Badge>
                      )}
                    </Button>

                    {/* User menu */}
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
                        <DropdownMenuLabel className="font-normal">
                          <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">
                              {user.displayName || 'User'}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground">
                              {user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          {profileItems.map((item) => (
                            <DropdownMenuItem key={item.id} asChild>
                              <Link href={item.href} className="flex items-center gap-2">
                                {item.icon}
                                {item.label}
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                          <LogOut className="mr-2 h-4 w-4" />
                          {tAuth('logout')}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link href="/login">
                      <Button variant="ghost" size="sm">
                        {tAuth('loginButton')}
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm">
                        {tAuth('signupButton')}
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile menu trigger */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                >
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">{t('toggleMenu')}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <MobileNavigation 
                  user={user}
                  categories={navigationCategories}
                  profileItems={profileItems}
                  publicItems={publicItems}
                  unreadMessages={unreadMessages}
                  onItemClick={() => setMobileOpen(false)}
                  onLogout={handleLogout}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
    </>
  );
}

// Mobile Navigation Component
interface MobileNavigationProps {
  user: any;
  categories: NavigationCategory[];
  profileItems: any[];
  publicItems: any[];
  unreadMessages: number;
  onItemClick: () => void;
  onLogout: () => void;
}

function MobileNavigation({ 
  user, 
  categories, 
  profileItems, 
  publicItems, 
  unreadMessages, 
  onItemClick, 
  onLogout 
}: MobileNavigationProps) {
  const t = useTranslations('Navigation');
  const tAuth = useTranslations('Auth');
  const pathname = usePathname();

  const isActivePath = (path: string) => {
    return pathname === path || pathname.startsWith(path + '/');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="flex items-center gap-2 px-6 py-6 border-b">
        <Heart className="h-8 w-8 text-primary" />
        <span className="text-2xl font-bold">HeartWise</span>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 overflow-auto px-6 py-6">
        {user ? (
          <div className="space-y-8">
            {/* User Profile Section */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                <AvatarFallback>{getInitials(user.displayName)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{user.displayName || 'User'}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t('quickAccess')}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Link href="/chat" onClick={onItemClick}>
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <MessageCircle className="h-6 w-6" />
                    <span className="text-xs">{t('chat')}</span>
                    {unreadMessages > 0 && (
                      <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs">
                        {unreadMessages}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link href="/dashboard" onClick={onItemClick}>
                  <Button variant="outline" className="w-full h-20 flex-col gap-2">
                    <Home className="h-6 w-6" />
                    <span className="text-xs">{t('dashboard')}</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Categorized Navigation */}
            {categories.map((category) => (
              <div key={category.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg bg-gradient-to-r ${category.color}`}>
                    <div className="text-white">
                      {category.icon}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold">{category.label}</h3>
                </div>
                <div className="space-y-1 ml-4">
                  {category.items
                    .filter(item => !item.requiresAuth || user)
                    .map((item) => (
                      <Link key={item.id} href={item.href} onClick={onItemClick}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-3 h-12 ${
                            isActivePath(item.href) ? 'bg-accent text-accent-foreground' : ''
                          }`}
                        >
                          {item.icon}
                          <span className="flex-1 text-left">{item.label}</span>
                          {item.badge && item.badge > 0 && (
                            <Badge variant="destructive" className="h-5 px-2 text-xs">
                              {item.badge}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    ))}
                </div>
              </div>
            ))}

            {/* Profile Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                {t('account')}
              </h3>
              <div className="space-y-1">
                {profileItems.map((item) => (
                  <Link key={item.id} href={item.href} onClick={onItemClick}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start gap-3 h-12 ${
                        isActivePath(item.href) ? 'bg-accent text-accent-foreground' : ''
                      }`}
                    >
                      {item.icon}
                      {item.label}
                    </Button>
                  </Link>
                ))}
                <Separator className="my-2" />
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 text-red-600 hover:text-red-600 hover:bg-red-50"
                  onClick={onLogout}
                >
                  <LogOut className="h-4 w-4" />
                  {tAuth('logout')}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Public Navigation */}
            <div className="space-y-2">
              {publicItems.map((item) => (
                <Link key={item.id} href={item.href} onClick={onItemClick}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-12 ${
                      isActivePath(item.href) ? 'bg-accent text-accent-foreground' : ''
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            <Separator />

            {/* Auth Actions */}
            <div className="space-y-3">
              <Link href="/login" onClick={onItemClick}>
                <Button variant="outline" className="w-full">
                  {tAuth('loginButton')}
                </Button>
              </Link>
              <Link href="/signup" onClick={onItemClick}>
                <Button className="w-full">
                  {tAuth('signupButton')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}