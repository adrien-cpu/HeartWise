"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
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
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface TileFeature {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  color: string;
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
  const [selectedFeature, setSelectedFeature] = useState<TileFeature | null>(null);

  const features: TileFeature[] = [
    {
      id: 'dashboard',
      icon: <LayoutDashboard className="w-8 h-8" />,
      title: 'Tableau de bord',
      description: 'Votre centre de contrôle personnalisé.',
      href: '/dashboard',
      color: 'blue',
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
      title: 'Analyse faciale IA',
      description: 'Analyse de compatibilité par IA.',
      href: '/facial-analysis-matching',
      color: 'purple',
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
      title: 'Coach de conversation',
      description: 'Coaching IA en temps réel.',
      href: '/ai-conversation-coach',
      color: 'teal',
      category: 'ai',
      status: 'available',
      subFeatures: [
        { id: 'advice', title: 'Conseils de conversation', href: '/ai-conversation-coach', icon: <MessageSquare className="w-4 h-4" /> },
        { id: 'styles', title: 'Suggestions de style', href: '/ai-conversation-coach#styles', icon: <Sparkles className="w-4 h-4" /> }
      ]
    },
    {
      id: 'speed-dating',
      icon: <Zap className="w-8 h-8" />,
      title: 'Speed Dating',
      description: 'Sessions rapides pour rencontrer plusieurs personnes.',
      href: '/speed-dating',
      color: 'orange',
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
      title: 'Jeux interactifs',
      description: 'Quiz, défis et jeux pour briser la glace.',
      href: '/game',
      color: 'indigo',
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
      title: 'Échange aveugle',
      description: 'Découvrez d\'abord les personnalités.',
      href: '/blind-exchange-mode',
      color: 'slate',
      category: 'ai',
      status: 'available'
    },
    {
      id: 'chat',
      icon: <MessageCircle className="w-8 h-8" />,
      title: 'Chat intelligent',
      description: 'Messagerie avec assistance IA.',
      href: '/chat',
      color: 'blue-600',
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
      title: 'Rencontres locales',
      description: 'Rencontrez des gens près de chez vous.',
      href: '/geolocation-meeting',
      color: 'rose',
      category: 'social',
      status: 'available'
    }
  ];

  const handleTileClick = (feature: TileFeature) => {
    setSelectedFeature(feature);
  };

  const categoryStyles: { [key: string]: string } = {
    ai: 'text-purple-600 bg-purple-100 dark:text-purple-300 dark:bg-purple-900/50',
    social: 'text-blue-600 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/50',
    entertainment: 'text-green-600 bg-green-100 dark:text-green-300 dark:bg-green-900/50',
    core: 'text-gray-600 bg-gray-100 dark:text-gray-300 dark:bg-gray-700/50'
  };

  const statusStyles: { [key: string]: string } = {
    available: 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-900/50',
    partial: 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-900/50',
    premium: 'text-rose-600 bg-rose-100 dark:text-rose-300 dark:bg-rose-900/50'
  };

  const colorGradients: { [key: string]: string } = {
    blue: 'from-blue-500 to-cyan-400',
    purple: 'from-purple-500 to-pink-500',
    teal: 'from-emerald-500 to-teal-500',
    orange: 'from-yellow-500 to-orange-500',
    indigo: 'from-indigo-500 to-violet-500',
    slate: 'from-gray-600 to-slate-500',
    rose: 'from-red-500 to-rose-500',
    'blue-600': 'from-blue-600 to-indigo-600'
  };

  if (children && !showTiles) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background gradient-hero">
      <header className="py-20 text-center">
        <div className="container mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-black mb-6 animate-float">
            <span className="bg-gradient-to-r from-primary via-rose-500 to-amber-400 bg-clip-text text-transparent">
              HeartWise
            </span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Explorez des connexions authentiques et intelligentes grâce à nos outils innovants.
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Sheet key={feature.id} onOpenChange={(isOpen) => !isOpen && setSelectedFeature(null)}>
              <SheetTrigger asChild>
                <Card 
                  className="group cursor-pointer overflow-hidden bg-card border-2 border-transparent hover:border-primary/50 shadow-soft hover:shadow-card-hover transition-all duration-300 ease-in-out transform hover:-translate-y-1.5 animate-slide-up-fast"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => handleTileClick(feature)}
                >
                  <CardHeader className="p-5">
                    <div className={`mb-4 w-14 h-14 rounded-2xl bg-gradient-to-br ${colorGradients[feature.color]} flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors duration-300">
                      {feature.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-muted-foreground">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-5 pt-0">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <Badge variant="outline" className={`border-0 ${categoryStyles[feature.category]}`}>
                        {feature.category}
                      </Badge>
                      <Badge variant="outline" className={`border-0 ${statusStyles[feature.status]}`}>
                        {feature.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </SheetTrigger>
              {selectedFeature && selectedFeature.id === feature.id && (
                <SheetContent side="right" className="w-full max-w-md bg-card p-0">
                  <div className="flex flex-col h-full">
                    <div className={`p-6 bg-gradient-to-br ${colorGradients[selectedFeature.color]} text-white`}>
                      <div className="flex items-center gap-4">
                        <div className="bg-white/20 p-3 rounded-xl">
                          {selectedFeature.icon}
                        </div>
                        <div>
                          <h2 className="text-2xl font-bold">{selectedFeature.title}</h2>
                          <p className="text-sm opacity-90">{selectedFeature.description}</p>
                        </div>
                      </div>
                    </div>

                    <ScrollArea className="flex-1">
                      <div className="p-6 space-y-6">
                        <div className="space-y-2">
                          <h3 className="font-semibold text-foreground">Action principale</h3>
                          <Link href={selectedFeature.href} passHref>
                            <Button className="w-full justify-start h-auto py-3 text-base" size="lg">
                              <Sparkles className="w-5 h-5 mr-3" />
                              Accéder à {selectedFeature.title}
                              <ArrowRight className="ml-auto w-5 h-5" />
                            </Button>
                          </Link>
                        </div>

                        {selectedFeature.subFeatures && selectedFeature.subFeatures.length > 0 && (
                          <>
                            <Separator />
                            <div className="space-y-2">
                              <h3 className="font-semibold text-foreground">Options</h3>
                              <div className="space-y-1">
                                {selectedFeature.subFeatures.map((sub) => (
                                  <Link key={sub.id} href={sub.href} passHref>
                                    <Button variant="ghost" className="w-full justify-start">
                                      {sub.icon}
                                      <span className="ml-3">{sub.title}</span>
                                      <ChevronRight className="ml-auto w-4 h-4 text-muted-foreground" />
                                    </Button>
                                  </Link>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        
                        <Separator />

                        <div className="space-y-3">
                          <h3 className="font-semibold text-foreground">Explorer d\'autres fonctionnalités</h3>
                          <div className="grid grid-cols-3 gap-2">
                            {features
                              .filter(f => f.id !== selectedFeature.id)
                              .slice(0, 6)
                              .map(f => (
                                <Button 
                                  key={f.id} 
                                  variant="outline"
                                  className="h-20 flex flex-col items-center justify-center gap-1.5 p-2 text-center"
                                  onClick={() => handleTileClick(f)}
                                >
                                  <div className={`w-8 h-8 flex items-center justify-center text-white rounded-lg bg-gradient-to-br ${colorGradients[f.color]}`}>
                                    {React.cloneElement(f.icon, {className: "w-5 h-5"})}
                                  </div>
                                  <span className="text-xs font-medium text-center text-muted-foreground">{f.title}</span>
                                </Button>
                              ))}
                          </div>
                        </div>
                      </div>
                    </ScrollArea>
                  </div>
                </SheetContent>
              )}
            </Sheet>
          ))}
        </div>
      </main>

      {children}
    </div>
  );
}
