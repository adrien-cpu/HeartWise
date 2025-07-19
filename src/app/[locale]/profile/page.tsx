"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Loader2 } from 'lucide-react';
import { AuthGuard } from '@/components/auth-guard';

const ProfilePage = () => {
  const t = useTranslations('ProfilePage');
  const { profile, loading, error, user } = useUserProfile();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-10 w-10 animate-spin" />
        <p className="ml-2">{t('loading')}</p>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">{t('fetchErrorDescription')}</div>;
  }

  return (
    <AuthGuard>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-4">{t('title')}</h1>
        {profile ? (
          <div>
            <p>{t('welcomeMessage')}, {profile.name || user?.displayName}!</p>
            {/* Profile content will go here */}
          </div>
        ) : (
          <p>{t('noProfile')}</p>
        )}
      </div>
    </AuthGuard>
  );
};

export default ProfilePage;
