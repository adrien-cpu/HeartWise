"use client";

import { useState, useEffect } from 'react';
import { get_user, UserProfile } from '@/services/user_profile';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

export function useUserProfile() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const t = useTranslations('ProfilePage');

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      setLoading(true);
      return;
    }

    if (!user) {
      setLoading(false);
      setProfile(null);
      // No need to set an error here, the component will handle the redirect.
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const userProfile = await get_user(user.uid);
        setProfile(userProfile);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        const errorMessage = t('fetchErrorDescription');
        setError(errorMessage);
        toast({
          variant: "destructive",
          title: t('fetchErrorTitle'),
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, t, toast]);

  return { profile, loading, error, user, authLoading };
}
