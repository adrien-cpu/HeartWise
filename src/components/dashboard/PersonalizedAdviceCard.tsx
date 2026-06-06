"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Lightbulb } from 'lucide-react';

interface PersonalizedAdviceCardProps {
  loading: boolean;
}

export const PersonalizedAdviceCard: React.FC<PersonalizedAdviceCardProps> = ({ loading }) => {
  const t = useTranslations('DashboardPage');
  const [currentAdvice, setCurrentAdvice] = useState('');

  useEffect(() => {
    // This effect runs once to pick a random piece of advice.
    // It's client-side to ensure it can be different on each load.
    const mockAdvices = [
      t('mockAdvice1'),
      t('mockAdvice2'),
      t('mockAdvice3'),
    ];
    setCurrentAdvice(mockAdvices[Math.floor(Math.random() * mockAdvices.length)]);
  }, [t]);

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Lightbulb className="h-6 w-6 text-primary" />
          {t('personalizedAdviceTitle')}
        </CardTitle>
        <CardDescription>{t('personalizedAdviceDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-10 w-full" />
        ) : currentAdvice ? (
          <p className="text-lg italic leading-relaxed text-primary/80">{`"${currentAdvice}"`}</p>
        ) : (
          <p className="text-muted-foreground">{t('noAdviceAvailable')}</p>
        )}
      </CardContent>
    </Card>
  );
};
