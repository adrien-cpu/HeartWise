"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { get_user, update_user_profile, UserProfile } from '@/services/user_profile';
import { Loader2, Settings, Bell, Shield, Palette, Globe } from 'lucide-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useTheme } from 'next-themes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AuthGuard from '@/components/auth-guard';

export default function SettingsPage() {
  const t = useTranslations('Settings');
  const { user } = useAuth();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    notifications: {
      newMessages: true,
      newMatches: true,
      speedDatingReminders: true,
      gameInvitations: true,
      systemUpdates: true,
    },
    privacy: {
      showLocation: true,
      showOnlineStatus: true,
      allowFacialAnalysis: true,
      profileVisibility: 'everyone' as 'everyone' | 'matches' | 'nobody',
    },
    preferences: {
      theme: theme || 'system',
      autoSaveMessages: true,
      soundNotifications: true,
    }
  });

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const userProfile = await get_user(user.uid);
          setProfile(userProfile);
          
          // Update settings based on profile
          if (userProfile.privacySettings) {
            setSettings(prev => ({
              ...prev,
              privacy: {
                ...prev.privacy,
                showLocation: userProfile.privacySettings?.showLocation ?? true,
                showOnlineStatus: userProfile.privacySettings?.showOnlineStatus ?? true,
              }
            }));
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          toast({
            variant: 'destructive',
            title: t('errorTitle'),
            description: t('errorLoadingSettings')
          });
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [user, t, toast]);

  const handleSaveSettings = async () => {
    if (!user || !profile) return;
    
    setSaving(true);
    try {
      await update_user_profile(user.uid, {
        ...profile,
        privacySettings: {
          showLocation: settings.privacy.showLocation,
          showOnlineStatus: settings.privacy.showOnlineStatus,
        }
      });

      toast({
        title: t('settingsSavedTitle'),
        description: t('settingsSavedDesc')
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        variant: 'destructive',
        title: t('errorTitle'),
        description: t('errorSavingSettings')
      });
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (category: keyof typeof settings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            {t('title')}
          </h1>
          <p className="text-muted-foreground mt-2">{t('subtitle')}</p>
        </div>

        <div className="grid gap-6">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                {t('notificationsTitle')}
              </CardTitle>
              <CardDescription>{t('notificationsDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="new-messages">{t('newMessages')}</Label>
                <Switch
                  id="new-messages"
                  checked={settings.notifications.newMessages}
                  onCheckedChange={(checked) => updateSetting('notifications', 'newMessages', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="new-matches">{t('newMatches')}</Label>
                <Switch
                  id="new-matches"
                  checked={settings.notifications.newMatches}
                  onCheckedChange={(checked) => updateSetting('notifications', 'newMatches', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="speed-dating">{t('speedDatingReminders')}</Label>
                <Switch
                  id="speed-dating"
                  checked={settings.notifications.speedDatingReminders}
                  onCheckedChange={(checked) => updateSetting('notifications', 'speedDatingReminders', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="game-invitations">{t('gameInvitations')}</Label>
                <Switch
                  id="game-invitations"
                  checked={settings.notifications.gameInvitations}
                  onCheckedChange={(checked) => updateSetting('notifications', 'gameInvitations', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="system-updates">{t('systemUpdates')}</Label>
                <Switch
                  id="system-updates"
                  checked={settings.notifications.systemUpdates}
                  onCheckedChange={(checked) => updateSetting('notifications', 'systemUpdates', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                {t('privacyTitle')}
              </CardTitle>
              <CardDescription>{t('privacyDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-location">{t('showLocation')}</Label>
                  <p className="text-sm text-muted-foreground">{t('showLocationDesc')}</p>
                </div>
                <Switch
                  id="show-location"
                  checked={settings.privacy.showLocation}
                  onCheckedChange={(checked) => updateSetting('privacy', 'showLocation', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-online">{t('showOnlineStatus')}</Label>
                  <p className="text-sm text-muted-foreground">{t('showOnlineStatusDesc')}</p>
                </div>
                <Switch
                  id="show-online"
                  checked={settings.privacy.showOnlineStatus}
                  onCheckedChange={(checked) => updateSetting('privacy', 'showOnlineStatus', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="facial-analysis">{t('allowFacialAnalysis')}</Label>
                  <p className="text-sm text-muted-foreground">{t('facialAnalysisDesc')}</p>
                </div>
                <Switch
                  id="facial-analysis"
                  checked={settings.privacy.allowFacialAnalysis}
                  onCheckedChange={(checked) => updateSetting('privacy', 'allowFacialAnalysis', checked)}
                />
              </div>
              <div>
                <Label htmlFor="profile-visibility">{t('profileVisibility')}</Label>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) => updateSetting('privacy', 'profileVisibility', value)}
                >
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="everyone">{t('visibilityEveryone') as React.ReactNode}</SelectItem>
                    <SelectItem value="matches">{t('visibilityMatches') as React.ReactNode}</SelectItem>
                    <SelectItem value="nobody">{t('visibilityNobody') as React.ReactNode}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                {t('preferencesTitle')}
              </CardTitle>
              <CardDescription>{t('preferencesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="theme">{t('theme')}</Label>
                <Select value={theme || 'system'} onValueChange={setTheme}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">{t('themeLight') as React.ReactNode}</SelectItem>
                    <SelectItem value="dark">{t('themeDark') as React.ReactNode}</SelectItem>
                    <SelectItem value="system">{t('themeSystem') as React.ReactNode}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="flex items-center gap-2 mb-2">
                  <Globe className="h-4 w-4" />
                  {t('language')}
                </Label>
                <LanguageSwitcher />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-save">{t('autoSaveMessages')}</Label>
                  <p className="text-sm text-muted-foreground">{t('autoSaveDesc')}</p>
                </div>
                <Switch
                  id="auto-save"
                  checked={settings.preferences.autoSaveMessages}
                  onCheckedChange={(checked) => updateSetting('preferences', 'autoSaveMessages', checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sound-notifications">{t('soundNotifications')}</Label>
                  <p className="text-sm text-muted-foreground">{t('soundNotificationsDesc')}</p>
                </div>
                <Switch
                  id="sound-notifications"
                  checked={settings.preferences.soundNotifications}
                  onCheckedChange={(checked) => updateSetting('preferences', 'soundNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving} size="lg">
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('saveChanges')}
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}