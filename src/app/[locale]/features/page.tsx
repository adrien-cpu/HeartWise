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

      {/* Hero Section */}
      <section className="gradient-hero py-24">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center max-w-4xl mx-auto"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
            }}
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {t('title')}
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Legend */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-6">
          <motion.div 
            className="flex flex-wrap justify-center gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {categories.map(category => (
              <motion.div
                key={category.key}
                variants={{ hidden: { opacity: 0, scale: 0.8 }, visible: { opacity: 1, scale: 1 } }}
              >
                <Badge 
                  variant="outline" 
                  className={`${category.color} border-0 px-6 py-3 text-sm font-semibold rounded-full shadow-soft hover:shadow-glow transition-all cursor-default`}
                >
                  {category.label}
                </Badge>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-6">
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
                }}
                whileHover={{ y: -8 }}
                className="group"
              >
                <Card className="relative overflow-hidden border-2 border-transparent hover:border-primary/20 bg-gradient-to-br from-background to-muted/30 shadow-soft hover:shadow-card-hover transition-all duration-500 h-full">
                  <CardHeader>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-muted to-secondary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          {feature.icon}
                        </div>
                        <div>
                          <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors">
                            {feature.title}
                          </CardTitle>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(feature.status)}
                        {getCategoryBadge(feature.category)}
                      </div>
                    </div>
                    <CardDescription className="text-base leading-relaxed group-hover:text-foreground/70 transition-colors">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Link href={feature.href} className="w-full">
                      <Button 
                        className="w-full rounded-2xl" 
                        disabled={feature.status === 'coming-soon'}
                        variant={feature.status === 'available' ? 'default' : 'outline'}
                      >
                        {feature.status === 'coming-soon' ? t('comingSoon') : t('tryFeature')}
                        {feature.status !== 'coming-soon' && <ArrowRight className="ml-2 w-4 h-4" />}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: { opacity: 0, y: 40 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.8 } }
            }}
          >
            <Card className="max-w-4xl mx-auto bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/20 text-center overflow-hidden relative">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-accent/30 to-primary/30 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-primary/30 to-accent/30 rounded-full blur-2xl"></div>
              
              <CardContent className="relative z-10 py-16">
                <h2 className="text-3xl md:text-4xl font-black mb-6">{t('ctaTitle')}</h2>
                <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                  {t('ctaDescription')}
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link href="/signup">
                    <Button size="lg" className="px-10 py-4 text-lg rounded-full shadow-glow">
                      {t('startJourneyButton')}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/dashboard">
                    <Button variant="outline" size="lg" className="px-10 py-4 text-lg rounded-full glass">
                      {t('exploreNowButton')}
                    </Button>
                  </Link>
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
    </div>
  );
}