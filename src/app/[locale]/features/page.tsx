"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ScanFace, 
  MessageSquare, 
  EyeOff, 
  MapPin, 
  Zap, 
  Gamepad, 
  MessageCircle, 
  Trophy,
  ShieldAlert,
  LayoutDashboard,
  User
} from 'lucide-react';

export default function FeaturesPage() {
  const t = useTranslations('Features');
  const tHome = useTranslations('Home');

  const features = [
    {
      icon: <LayoutDashboard className="h-8 w-8 text-blue-600" />,
      title: t('dashboardTitle'),
      description: t('dashboardDesc'),
      href: '/dashboard',
      status: 'available',
      category: 'core'
    },
    {
      icon: <ScanFace className="h-8 w-8 text-purple-600" />,
      title: t('facialAnalysisTitle'),
      description: t('facialAnalysisDesc'),
      href: '/facial-analysis-matching',
      status: 'available',
      category: 'ai'
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-green-600" />,
      title: t('aiCoachTitle'),
      description: t('aiCoachDesc'),
      href: '/ai-conversation-coach',
      status: 'available',
      category: 'ai'
    },
    {
      icon: <EyeOff className="h-8 w-8 text-gray-600" />,
      title: t('blindExchangeTitle'),
      description: t('blindExchangeDesc'),
      href: '/blind-exchange-mode',
      status: 'available',
      category: 'ai'
    },
    {
      icon: <ShieldAlert className="h-8 w-8 text-orange-600" />,
      title: t('riskyWordsTitle'),
      description: t('riskyWordsDesc'),
      href: '/risky-words-dictionary',
      status: 'available',
      category: 'ai'
    },
    {
      icon: <MapPin className="h-8 w-8 text-teal-600" />,
      title: t('geolocationTitle'),
      description: t('geolocationDesc'),
      href: '/geolocation-meeting',
      status: 'available',
      category: 'social'
    },
    {
      icon: <Zap className="h-8 w-8 text-yellow-600" />,
      title: t('speedDatingTitle'),
      description: t('speedDatingDesc'),
      href: '/speed-dating',
      status: 'available',
      category: 'social'
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-indigo-600" />,
      title: t('chatTitle'),
      description: t('chatDesc'),
      href: '/chat',
      status: 'partial',
      category: 'social'
    },
    {
      icon: <Gamepad className="h-8 w-8 text-red-600" />,
      title: t('gamesTitle'),
      description: t('gamesDesc'),
      href: '/game',
      status: 'available',
      category: 'entertainment'
    },
    {
      icon: <Trophy className="h-8 w-8 text-amber-600" />,
      title: t('rewardsTitle'),
      description: t('rewardsDesc'),
      href: '/rewards',
      status: 'available',
      category: 'gamification'
    },
    {
      icon: <User className="h-8 w-8 text-pink-600" />,
      title: t('profileTitle'),
      description: t('profileDesc'),
      href: '/profile',
      status: 'available',
      category: 'core'
    }
  ];

  const categories = [
    { key: 'core', label: t('categoryCore'), color: 'bg-blue-100 text-blue-800' },
    { key: 'ai', label: t('categoryAI'), color: 'bg-purple-100 text-purple-800' },
    { key: 'social', label: t('categorySocial'), color: 'bg-green-100 text-green-800' },
    { key: 'entertainment', label: t('categoryEntertainment'), color: 'bg-red-100 text-red-800' },
    { key: 'gamification', label: t('categoryGamification'), color: 'bg-amber-100 text-amber-800' }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'available':
        return <Badge variant="default" className="bg-green-100 text-green-800">{t('statusAvailable')}</Badge>;
      case 'partial':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{t('statusPartial')}</Badge>;
      case 'coming-soon':
        return <Badge variant="outline">{t('statusComingSoon')}</Badge>;
      default:
        return null;
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryInfo = categories.find(c => c.key === category);
    return categoryInfo ? (
      <Badge variant="outline" className={`${categoryInfo.color} border-0`}>
        {categoryInfo.label}
      </Badge>
    ) : null;
  };

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('title')}</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          {t('subtitle')}
        </p>
      </div>

      {/* Categories Legend */}
      <div className="flex flex-wrap justify-center gap-3 mb-12">
        {categories.map(category => (
          <Badge key={category.key} variant="outline" className={`${category.color} border-0`}>
            {category.label}
          </Badge>
        ))}
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {features.map((feature, index) => (
          <Card key={index} className="relative overflow-hidden group hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {feature.icon}
                  <div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {getStatusBadge(feature.status)}
                  {getCategoryBadge(feature.category)}
                </div>
              </div>
              <CardDescription className="text-sm leading-relaxed">
                {feature.description}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Link href={feature.href} className="w-full">
                <Button 
                  className="w-full" 
                  disabled={feature.status === 'coming-soon'}
                  variant={feature.status === 'available' ? 'default' : 'outline'}
                >
                  {feature.status === 'coming-soon' ? t('comingSoon') : t('tryFeature')}
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-primary/10 to-purple-100 border-primary/20">
        <CardContent className="text-center py-12">
          <h2 className="text-3xl font-bold mb-4">{t('ctaTitle')}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('ctaDescription')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="px-8">
                {t('startJourneyButton')}
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="px-8">
                {t('exploreNowButton')}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}