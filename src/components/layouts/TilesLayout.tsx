"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useTranslations } from 'next-intl';
import { Link } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { 
  ScanFace, 
  MessageSquare, 
  EyeOff, 
  MapPin, 
  Zap, 
  Gamepad2,
  MessageCircle, 
  Trophy,
  ShieldAlert,
  LayoutDashboard,
  User,
  Settings,
  Calendar,
  ArrowRight,
  X,
  Home,
  ChevronRight
} from 'lucide-react';

interface TileFeature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  gradient: string;
  bgGradient: string;
  category: 'ai' | 'social' | 'entertainment' | 'core';
  status: 'available' | 'partial' | 'premium';
  subFeatures?: Array<{
    id: string;
    title: string;
    href: string;
    icon: React.ReactNode;
  }>;
}

interface TilesLayoutProps {
  children?: React.ReactNode;
  showTiles?: boolean;
}

export function TilesLayout({ children, showTiles = true }: TilesLayoutProps) {
  const t = useTranslations('Home');
  const tNav = useTranslations('Navigation');
  const { user } = useAuth();
  const [selectedFeature, setSelectedFeature] = useState<TileFeature | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const features: TileFeature[] = [
    {
      id: 'dashboard',
      icon: <LayoutDashboard className="w-8 h-8" />,
      title: tNav('dashboard'),
      description: 'Votre centre de contrôle personnalisé',
      href: '/dashboard',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      category: 'core',
      status: 'available',
      subFeatures: [
        { id: 'stats', title: 'Statistiques', href: '/dashboard#stats', icon: <Trophy className="w-4 h-4" /> },
        { id: 'matches', title: 'Suggestions', href: '/dashboard#matches', icon: <User className="w-4 h-4" /> }
      ]
    },
    {
      id: 'facial-analysis',
      icon: <ScanFace className="w-8 h-8" />,
      title: t('facialAnalysisMatching'),
      description: t('facialAnalysisMatchingDescription'),
      href: '/facial-analysis-matching',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      category: 'ai',
      status: 'available',
      subFeatures: [
        { id: 'upload', title: 'Analyser une photo', href: '/facial-analysis-matching', icon: <ScanFace className="w-4 h-4" /> },
        { id: 'matches', title: 'Voir les matchs', href: '/facial-analysis-matching#results', icon: <User className="w-4 h-4" /> }
      ]
    },
    {
      id: 'ai-coach',
      icon: <MessageSquare className="w-8 h-8" />,
      title: t('aiConversationCoach'),
      description: t('aiConversationCoachDescription'),
      href: '/ai-conversation-coach',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      category: 'ai',
      status: 'available',
      subFeatures: [
        { id: 'advice', title: 'Conseils de conversation', href: '/ai-conversation-coach', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'styles', title: 'Suggestions de style', href: '/ai-conversation-coach#styles', icon: <Zap className="w-4 h-4" /> }
      ]
    },
    {
      id: 'speed-dating',
      icon: <Zap className="w-8 h-8" />,
      title: t('speedDating'),
      description: t('speedDatingDescription'),
      href: '/speed-dating',
      gradient: 'from-yellow-500 to-orange-500',
      bgGradient: 'from-yellow-50 to-orange-50',
      category: 'social',
      status: 'available',
      subFeatures: [
        { id: 'find', title: 'Trouver une session', href: '/speed-dating', icon: <Calendar className="w-4 h-4" /> },
        { id: 'create', title: 'Créer une session', href: '/speed-dating#create', icon: <Zap className="w-4 h-4" /> }
      ]
    },
    {
      id: 'games',
      icon: <Gamepad2 className="w-8 h-8" />,
      title: t('game'),
      description: t('gameDescription'),
      href: '/game',
      gradient: 'from-indigo-500 to-purple-500',
      bgGradient: 'from-indigo-50 to-purple-50',
      category: 'entertainment',
      status: 'available',
      subFeatures: [
        { id: 'trivia', title: 'Culture générale', href: '/game#trivia', icon: <Gamepad2 className="w-4 h-4" /> },
        { id: 'times-up', title: 'Time\'s Up', href: '/game#times-up', icon: <Zap className="w-4 h-4" /> }
      ]
    },
    {
      id: 'blind-exchange',
      icon: <EyeOff className="w-8 h-8" />,
      title: t('blindExchangeMode'),
      description: t('blindExchangeModeDescription'),
      href: '/blind-exchange-mode',
      gradient: 'from-gray-600 to-slate-700',
      bgGradient: 'from-gray-50 to-slate-50',
      category: 'ai',
      status: 'available'
    },
    {
      id: 'chat',
      icon: <MessageCircle className="w-8 h-8" />,
      title: t('chat'),
      description: t('chatDescription'),
      href: '/chat',
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      category: 'social',
      status: 'partial',
      subFeatures: [
        { id: 'conversations', title: 'Conversations', href: '/chat', icon: <MessageCircle className="w-4 h-4" /> },
        { id: 'risky-words', title: 'Mots à risque', href: '/risky-words-dictionary', icon: <ShieldAlert className="w-4 h-4" /> }
      ]
    },
    {
      id: 'geolocation',
      icon: <MapPin className="w-8 h-8" />,
      title: t('geolocationMeeting'),
      description: t('geolocationMeetingDescription'),
      href: '/geolocation-meeting',
      gradient: 'from-red-500 to-rose-500',
      bgGradient: 'from-red-50 to-rose-50',
      category: 'social',
      status: 'available'
    }
  ];

  const handleTileClick = (feature: TileFeature) => {
    setSelectedFeature(feature);
    setSidebarOpen(true);
  };

  const categoryColors = {
    ai: 'text-purple-600 bg-purple-100',
    social: 'text-blue-600 bg-blue-100',
    entertainment: 'text-green-600 bg-green-100',
    core: 'text-gray-600 bg-gray-100'
  };

  const statusColors = {
    available: 'text-green-600 bg-green-100',
    partial: 'text-yellow-600 bg-yellow-100',
    premium: 'text-purple-600 bg-purple-100'
  };

  if (children && !showTiles) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-50">
      {/* Hero Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-6xl md:text-8xl font-black mb-8">
              <span className="bg-gradient-to-r from-rose-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
                HeartWise
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
              {t('heroDescription')}
            </p>
          </div>

          {/* Features Tiles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {features.map((feature) => (
              <Card 
                key={feature.id}
                className="group cursor-pointer overflow-hidden border-2 border-transparent hover:border-rose-200 bg-gradient-to-br from-white to-gray-50 shadow-lg hover:shadow-xl transition-all duration-500 transform hover:-translate-y-2"
                onClick={() => handleTileClick(feature)}
              >
                <CardHeader className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${categoryColors[feature.category]} border-0`}
                      >
                        {feature.category.toUpperCase()}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${statusColors[feature.status]} border-0`}
                      >
                        {feature.status}
                      </Badge>
                    </div>
                  </div>
                  <CardTitle className="text-lg font-bold group-hover:text-rose-600 transition-colors duration-300 mb-2">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-gray-600 group-hover:text-gray-700 transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="flex items-center text-rose-600 group-hover:translate-x-2 transition-transform duration-300">
                    <span className="font-semibold text-sm">Explorer</span>
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Sidebar avec menu des fonctionnalités */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="right" className="w-80 sm:w-96">
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                {selectedFeature && (
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${selectedFeature.gradient} flex items-center justify-center text-white shadow-lg`}>
                    {selectedFeature.icon}
                  </div>
                )}
                <div>
                  <h2 className="text-xl font-bold">{selectedFeature?.title}</h2>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${selectedFeature ? categoryColors[selectedFeature.category] : ''} border-0`}
                  >
                    {selectedFeature?.category.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Navigation Content */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-6">
                {/* Action principale */}
                {selectedFeature && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Action principale</h3>
                    <Link href={selectedFeature.href}>
                      <Button className="w-full justify-start" onClick={() => setSidebarOpen(false)}>
                        {selectedFeature.icon}
                        <span className="ml-3">Accéder à {selectedFeature.title}</span>
                        <ArrowRight className="ml-auto w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                )}

                <Separator />

                {/* Sous-fonctionnalités */}
                {selectedFeature?.subFeatures && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Options disponibles</h3>
                    <div className="space-y-2">
                      {selectedFeature.subFeatures.map((subFeature) => (
                        <Link key={subFeature.id} href={subFeature.href}>
                          <Button 
                            variant="ghost" 
                            className="w-full justify-start h-auto py-3"
                            onClick={() => setSidebarOpen(false)}
                          >
                            {subFeature.icon}
                            <span className="ml-3">{subFeature.title}</span>
                            <ChevronRight className="ml-auto w-4 h-4" />
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                {/* Navigation générale */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Navigation</h3>
                  <div className="space-y-1">
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setSidebarOpen(false)}>
                        <Home className="w-4 h-4 mr-3" />
                        Tableau de bord
                      </Button>
                    </Link>
                    <Link href="/calendar">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setSidebarOpen(false)}>
                        <Calendar className="w-4 h-4 mr-3" />
                        Calendrier
                      </Button>
                    </Link>
                    {user && (
                      <>
                        <Link href="/profile">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setSidebarOpen(false)}>
                            <User className="w-4 h-4 mr-3" />
                            Profil
                          </Button>
                        </Link>
                        <Link href="/rewards">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setSidebarOpen(false)}>
                            <Trophy className="w-4 h-4 mr-3" />
                            Récompenses
                          </Button>
                        </Link>
                        <Link href="/settings">
                          <Button variant="ghost" className="w-full justify-start" onClick={() => setSidebarOpen(false)}>
                            <Settings className="w-4 h-4 mr-3" />
                            Paramètres
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Autres fonctionnalités */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Autres fonctionnalités</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {features
                      .filter(f => f.id !== selectedFeature?.id)
                      .slice(0, 6)
                      .map((feature) => (
                        <Button
                          key={feature.id}
                          variant="outline"
                          size="sm"
                          className="h-auto py-3 flex flex-col gap-1"
                          onClick={() => {
                            setSelectedFeature(feature);
                          }}
                        >
                          {feature.icon}
                          <span className="text-xs font-medium">{feature.title}</span>
                        </Button>
                      ))}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </SheetContent>
      </Sheet>

      {children}
    </div>
  );
}