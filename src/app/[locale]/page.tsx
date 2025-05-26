"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Heart, MessageCircle, Users, Trophy } from "lucide-react";
import { Sidebar } from '@/components/Sidebar';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { Icons } from '@/components/icons';
import { Link as UILink } from '@/components/ui/link';

export default function Home() {
  const t = useTranslations("Home");
  const featureT = useTranslations("FeatureCards");

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="container mx-auto max-w-4xl py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">{t('mainPageTitle')}</h1>
          <LanguageSwitcher />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <UILink href="/game" className="flex flex-col items-center text-center p-8 bg-white/10 dark:bg-card rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200">
            <Icons.gamepad className="h-10 w-10 mb-4 text-primary" />
            <h2 className="text-xl font-bold mb-2">{t('game')}</h2>
            <p className="text-muted-foreground">{featureT('gameDescription')}</p>
          </UILink>

          <UILink href="/speed-dating" className="flex flex-col items-center text-center p-8 bg-white/10 dark:bg-card rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200">
            <Icons.heart className="h-10 w-10 mb-4 text-pink-500" />
            <h2 className="text-xl font-bold mb-2">{t('speedDating')}</h2>
            <p className="text-muted-foreground">{featureT('speedDatingDescription')}</p>
          </UILink>

          <UILink href="/geolocation-meeting" className="flex flex-col items-center text-center p-8 bg-white/10 dark:bg-card rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200">
            <Icons.mapPin className="h-10 w-10 mb-4 text-green-500" />
            <h2 className="text-xl font-bold mb-2">{t('geolocationMeeting')}</h2>
            <p className="text-muted-foreground">{featureT('geolocationMeetingDescription')}</p>
          </UILink>

          <UILink href="/facial-analysis-matching" className="flex flex-col items-center text-center p-8 bg-white/10 dark:bg-card rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200">
            <Icons.scanFace className="h-10 w-10 mb-4 text-blue-500" />
            <h2 className="text-xl font-bold mb-2">{t('facialAnalysisMatching')}</h2>
            <p className="text-muted-foreground">{featureT('facialAnalysisMatchingDescription')}</p>
          </UILink>

          <UILink href="/ai-conversation-coach" className="flex flex-col items-center text-center p-8 bg-white/10 dark:bg-card rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200">
            <Icons.messageSquare className="h-10 w-10 mb-4 text-yellow-500" />
            <h2 className="text-xl font-bold mb-2">{t('aiConversationCoach')}</h2>
            <p className="text-muted-foreground">{featureT('aiConversationCoachDescription')}</p>
          </UILink>

          <UILink href="/blind-exchange-mode" className="flex flex-col items-center text-center p-8 bg-white/10 dark:bg-card rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-transform duration-200">
            <Icons.eyeOff className="h-10 w-10 mb-4 text-gray-500" />
            <h2 className="text-xl font-bold mb-2">{t('blindExchangeMode')}</h2>
            <p className="text-muted-foreground">{featureT('blindExchangeModeDescription')}</p>
          </UILink>
        </div>
      </main>
    </div>
  );
}
