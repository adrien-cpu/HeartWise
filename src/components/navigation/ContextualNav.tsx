"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Link } from 'next-intl';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  MessageCircle, 
  Brain, 
  Users, 
  Gamepad2,
  Zap,
  Eye,
  MapPin
} from 'lucide-react';

interface RelatedFeature {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  category: 'ai' | 'social' | 'entertainment';
  badge?: string;
}

export function ContextualNavigation() {
  const pathname = usePathname();
  const t = useTranslations('Navigation');

  // Define relationships between features
  const featureRelations: { [key: string]: RelatedFeature[] } = {
    '/chat': [
      {
        id: 'ai-coach',
        title: t('conversationCoach'),
        description: t('conversationCoachContextDesc'),
        href: '/ai-conversation-coach',
        icon: <Brain className="w-4 h-4" />,
        category: 'ai',
        badge: t('improveChats')
      },
      {
        id: 'blind-exchange',
        title: t('mysteryChat'),
        description: t('mysteryChatContextDesc'),
        href: '/blind-exchange-mode',
        icon: <Eye className="w-4 h-4" />,
        category: 'ai'
      }
    ],
    '/ai-conversation-coach': [
      {
        id: 'chat',
        title: t('chat'),
        description: t('chatContextDesc'),
        href: '/chat',
        icon: <MessageCircle className="w-4 h-4" />,
        category: 'social'
      },
      {
        id: 'risky-words',
        title: t('smartCommunication'),
        description: t('smartCommunicationDesc'),
        href: '/risky-words-dictionary',
        icon: <Brain className="w-4 h-4" />,
        category: 'ai'
      }
    ],
    '/facial-analysis-matching': [
      {
        id: 'blind-exchange',
        title: t('mysteryChat'),
        description: t('mysteryChatMatchDesc'),
        href: '/blind-exchange-mode',
        icon: <Eye className="w-4 h-4" />,
        category: 'ai'
      },
      {
        id: 'speed-dating',
        title: t('speedDating'),
        description: t('speedDatingMatchDesc'),
        href: '/speed-dating',
        icon: <Zap className="w-4 h-4" />,
        category: 'social'
      }
    ],
    '/speed-dating': [
      {
        id: 'games',
        title: t('games'),
        description: t('gamesSpeedDesc'),
        href: '/game',
        icon: <Gamepad2 className="w-4 h-4" />,
        category: 'entertainment'
      },
      {
        id: 'local-meetups',
        title: t('localMeetups'),
        description: t('localMeetupsSpeedDesc'),
        href: '/geolocation-meeting',
        icon: <MapPin className="w-4 h-4" />,
        category: 'social'
      }
    ]
  };

  // Get related features for current path
  const currentPath = pathname.split('/').slice(0, -1).join('/') || pathname;
  const relatedFeatures = featureRelations[currentPath];

  if (!relatedFeatures || relatedFeatures.length === 0) {
    return null;
  }

  return (
    <div className="border-t bg-muted/30">
      <div className="container max-w-screen-2xl py-6">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            {t('relatedFeatures')}
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {relatedFeatures.map((feature) => (
            <Link key={feature.id} href={feature.href}>
              <Card className="group hover:shadow-md transition-all duration-300 cursor-pointer border-l-4 border-l-primary/20 hover:border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                      {feature.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">
                          {feature.title}
                        </h4>
                        {feature.badge && (
                          <Badge variant="secondary" className="text-xs">
                            {feature.badge}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {feature.description}
                      </p>
                      <div className="flex items-center gap-1 mt-2 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs font-medium">{t('tryThis')}</span>
                        <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}