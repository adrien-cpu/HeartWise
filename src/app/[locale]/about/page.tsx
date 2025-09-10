"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Users, Brain, Shield, Sparkles, Target } from 'lucide-react';

export default function AboutPage() {
  const t = useTranslations('About');

  const features = [
    {
      icon: <Brain className="h-8 w-8 text-blue-500" />,
      title: t('aiMatchingTitle'),
      description: t('aiMatchingDesc')
    },
    {
      icon: <Heart className="h-8 w-8 text-red-500" />,
      title: t('emotionalIntelligenceTitle'),
      description: t('emotionalIntelligenceDesc')
    },
    {
      icon: <Users className="h-8 w-8 text-green-500" />,
      title: t('realWorldMeetingsTitle'),
      description: t('realWorldMeetingsDesc')
    },
    {
      icon: <Shield className="h-8 w-8 text-purple-500" />,
      title: t('privacyFirstTitle'),
      description: t('privacyFirstDesc')
    }
  ];

  const values = [
    {
      icon: <Target className="h-6 w-6 text-primary" />,
      title: t('authenticConnectionsTitle'),
      description: t('authenticConnectionsDesc')
    },
    {
      icon: <Shield className="h-6 w-6 text-primary" />,
      title: t('respectConsentTitle'),
      description: t('respectConsentDesc')
    },
    {
      icon: <Sparkles className="h-6 w-6 text-primary" />,
      title: t('innovationTitle'),
      description: t('innovationDesc')
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 mb-4">
          <Heart className="h-8 w-8 text-primary" />
          <Badge variant="secondary" className="text-sm">
            {t('betaVersion')}
          </Badge>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-primary mb-6">
          HeartWise
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto mb-8">
          {t('heroDescription')}
        </p>
        <p className="text-lg text-foreground max-w-4xl mx-auto">
          {t('visionStatement')}
        </p>
      </div>

      {/* Features Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t('keyFeaturesTitle')}</h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Values Section */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t('ourValuesTitle')}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {values.map((value, index) => (
            <div key={index} className="text-center p-6">
              <div className="flex justify-center mb-4">
                {value.icon}
              </div>
              <h3 className="text-lg font-semibold mb-3">{value.title}</h3>
              <p className="text-muted-foreground">{value.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Mission Section */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{t('missionTitle')}</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            {t('missionStatement')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}