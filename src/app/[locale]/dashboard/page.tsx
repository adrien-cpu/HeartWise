"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Loader2, AlertTriangle } from 'lucide-react';

// Import the new modular components
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { MatchSuggestionCard } from '@/components/dashboard/MatchSuggestionCard';
import { QuickActionsCard } from '@/components/dashboard/QuickActionsCard';
import { PersonalizedAdviceCard } from '@/components/dashboard/PersonalizedAdviceCard';
import { ProfileCompletenessCard } from '@/components/dashboard/ProfileCompletenessCard';
import { QuickStatsCard } from '@/components/dashboard/QuickStatsCard';
import { RecentBadgesCard } from '@/components/dashboard/RecentBadgesCard';

/**
 * @fileOverview Implements the refactored and modular Intelligent User Dashboard.
 * @module LocalizedDashboardPage
 * @description Displays a personalized and dynamic dashboard for the authenticated user.
 *              It uses the `useUserProfile` hook for data fetching and state management,
 *              and assembles modular components for a clean and maintainable structure.
 */
export default function LocalizedDashboardPage() {
  const t = useTranslations('DashboardPage');
  const router = useRouter();
  const { profile, loading, error, user, authLoading } = useUserProfile();

  // Handles loading, authentication, and error states at a high level.
  if (authLoading || (loading && !profile)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">
          {authLoading ? t('authenticating') : t('loadingDashboard')}
        </p>
      </div>
    );
  }

  if (!user) {
    // This should be caught by the middleware, but as a robust fallback,
    // we redirect the user to the login page.
    router.replace('/login');
    return null; // Render nothing while redirecting
  }

  if (error) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-center">
            <AlertTriangle className="h-12 w-12 text-destructive" />
            <h2 className="mt-4 text-xl font-semibold text-destructive">{t('profileLoadError')}</h2>
            <p className="text-muted-foreground">{error}</p>
        </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 bg-gray-50/50 min-h-screen">
      <DashboardHeader loading={loading} profile={profile} user={user} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <MatchSuggestionCard loading={loading} />
          <PersonalizedAdviceCard loading={loading} />
          <RecentBadgesCard loading={loading} profile={profile} />
        </div>
        
        {/* Sidebar Column */}
        <div className="lg:col-span-1 space-y-6">
          <QuickActionsCard />
          <ProfileCompletenessCard loading={loading} profile={profile} />
          <QuickStatsCard loading={loading} profile={profile} />
        </div>
      </div>
    </div>
  );
}
