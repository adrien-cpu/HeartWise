
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { get_user, update_user_profile, UserProfile } from '@/services/user_profile'; // Assuming service exists
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

/**
 * ProfilePage component.
 *
 * @component
 * @description This page allows users to view and edit their profile details.
 * @returns {JSX.Element} The rendered Profile page.
 */
export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Mock user ID for now
  const userId = "user1";

  useEffect(() => {
    /**
     * Fetches the user profile data.
     * @async
     */
    const fetchProfile = async () => {
      try {
        const userProfile = await get_user(userId);
        setProfile(userProfile);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({
          variant: "destructive",
          title: t('fetchErrorTitle'),
          description: t('fetchErrorDescription'),
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [userId, t, toast]);

  /**
   * Handles input changes in the profile form.
   * @param {React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>} e - The change event.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

   /**
   * Handles checkbox changes for interests.
   * @param {string} interest - The interest to toggle.
   * @param {boolean} checked - The new checked state.
   */
  const handleInterestChange = (interest: string, checked: boolean) => {
    setProfile(prev => {
      if (!prev) return null;
      const currentInterests = prev.interests || [];
      const newInterests = checked
        ? [...currentInterests, interest]
        : currentInterests.filter(i => i !== interest);
      return { ...prev, interests: newInterests };
    });
  };

  /**
   * Handles switch changes for privacy settings.
   * @param {string} setting - The privacy setting key.
   * @param {boolean} value - The new value for the setting.
   */
  const handlePrivacyChange = (setting: keyof UserProfile['privacySettings'], value: boolean) => {
     setProfile(prev => {
      if (!prev) return null;
      // Ensure privacySettings exists
      const currentSettings = prev.privacySettings || { showLocation: true, showOnlineStatus: true };
      return {
        ...prev,
        privacySettings: {
          ...currentSettings,
          [setting]: value,
        },
      };
    });
  }

  /**
   * Handles the profile update submission.
   * @async
   */
  const handleUpdateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    try {
      await update_user_profile(userId, profile);
      toast({
        title: t('updateSuccessTitle'),
        description: t('updateSuccessDescription'),
      });
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        variant: "destructive",
        title: t('updateErrorTitle'),
        description: t('updateErrorDescription'),
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && !profile) {
    return <div className="container mx-auto p-4">{t('loading')}</div>;
  }

  if (!profile) {
    return <div className="container mx-auto p-4">{t('noProfile')}</div>;
  }

  const allInterests = ["Reading", "Hiking", "Photography", "Cooking", "Travel", "Music", "Sports", "Movies", "Gaming"]; // Example interests

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-row items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile.profilePicture || `https://picsum.photos/seed/${userId}/200`} alt={profile.name || 'User'} />
            <AvatarFallback>{profile.name ? profile.name.substring(0, 2).toUpperCase() : 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{profile.name || t('anonymousUser')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? t('cancel') : t('editProfile')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{t('nameLabel')}</Label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleInputChange}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">{t('bioLabel')}</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={profile.bio || ''}
                  onChange={handleInputChange}
                  placeholder={t('bioPlaceholder')}
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>{t('interestsLabel')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {allInterests.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={profile.interests?.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, !!checked)}
                        disabled={loading}
                      />
                      <label
                        htmlFor={`interest-${interest}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {interest}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
               <div className="space-y-4">
                <Label>{t('privacySettingsLabel')}</Label>
                 <div className="flex items-center space-x-2">
                  <Switch
                    id="showLocation"
                    checked={profile.privacySettings?.showLocation ?? true}
                    onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                    disabled={loading}
                   />
                  <Label htmlFor="showLocation">{t('showLocationLabel')}</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                  <Switch
                    id="showOnlineStatus"
                    checked={profile.privacySettings?.showOnlineStatus ?? true}
                    onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
                    disabled={loading}
                  />
                   <Label htmlFor="showOnlineStatus">{t('showOnlineStatusLabel')}</Label>
                 </div>
               </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <Label className="font-semibold">{t('nameLabel')}</Label>
                <p>{profile.name || t('notSet')}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold">{t('bioLabel')}</Label>
                <p>{profile.bio || t('notSet')}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold">{t('interestsLabel')}</Label>
                <div className="flex flex-wrap gap-2">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map(interest => (
                      <span key={interest} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">{interest}</span>
                    ))
                  ) : (
                    <p>{t('noInterests')}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                  <Label className="font-semibold">{t('privacySettingsLabel')}</Label>
                  <p>{t('showLocationLabel')}: {profile.privacySettings?.showLocation ? t('yes') : t('no')}</p>
                  <p>{t('showOnlineStatusLabel')}: {profile.privacySettings?.showOnlineStatus ? t('yes') : t('no')}</p>
              </div>
            </>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter>
            <Button onClick={handleUpdateProfile} disabled={loading}>
              {loading ? t('saving') : t('saveChanges')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
