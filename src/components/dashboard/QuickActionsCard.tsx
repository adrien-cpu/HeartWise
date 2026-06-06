"use client";

import React from 'react';
import { Link } from 'next-intl'; // Corrected import
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Zap, Eye, Gamepad2, MessageSquareText, Sparkles } from 'lucide-react';

export const QuickActionsCard: React.FC = () => {
  const t = useTranslations('DashboardPage');
  const tHome = useTranslations('Home');

  const actions = [
    {
      href: "/speed-dating",
      icon: <Zap className="h-5 w-5 mr-2" />,
      label: tHome('speedDating'),
      color: "hover:bg-purple-100 hover:text-purple-700",
    },
    {
      href: "/blind-exchange-mode",
      icon: <Eye className="h-5 w-5 mr-2" />,
      label: tHome('blindExchangeMode'),
      color: "hover:bg-gray-100 hover:text-gray-700",
    },
    {
      href: "/game",
      icon: <Gamepad2 className="h-5 w-5 mr-2" />,
      label: tHome('game'),
      color: "hover:bg-red-100 hover:text-red-700",
    },
    {
      href: "/chat",
      icon: <MessageSquareText className="h-5 w-5 mr-2" />,
      label: tHome('chat'),
      color: "hover:bg-blue-100 hover:text-blue-700",
    },
  ];

  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Sparkles className="h-6 w-6 text-primary" />
          {t('quickActionsTitle')}
        </CardTitle>
        <CardDescription>{t('quickActionsDesc')}</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map(action => (
          <Link key={action.href} href={action.href} passHref>
            <Button 
              variant="ghost" 
              className={`w-full justify-start text-base p-4 rounded-lg transition-colors ${action.color}`}
            >
              {action.icon}
              {action.label}
            </Button>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
};
