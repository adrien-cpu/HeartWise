"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { get_user, update_user_profile, UserProfile } from '@/services/user_profile';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * @fileOverview Profile page component.
 * @module ProfilePage
 * @description This page allows users to view and edit their profile details. Requires authentication.
 */

// Example interests - this list could come from a config or backend in a real app
const allInterests = ["Reading", "Hiking", "Photography", "Cooking", "Travel", "Music", "Sports", "Movies", "Gaming"];

/**
 * ProfilePage component.
 *
 * @component
 * @returns {JSX.Element} The rendered Profile page.
 */
export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfileData, setLoadingProfileData] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) {
      return; // Wait for authentication state to resolve
    }

    if (!currentUser) {
      router.push('/login'); // Redirect if not authenticated
      return;
    }

    const fetchProfile = async () => {
      setLoadingProfileData(true);
      try {
        const userProfile = await get_user(currentUser.uid);
        setProfile(userProfile);
        setPreviewUrl(userProfile.profilePicture || null);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({
          variant: "destructive",
          title: t('fetchErrorTitle'),
          description: t('fetchErrorDescription'),
        });
        setProfile(null); // Set profile to null on error
      } finally {
        setLoadingProfileData(false);
      }
    };
    fetchProfile();
  }, [currentUser, authLoading, router, t, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile(prev => prev ? { ...prev, [name]: value } : null);
  };

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

  const handlePrivacyChange = (setting: keyof NonNullable<UserProfile['privacySettings']>, value: boolean) => {
     setProfile(prev => {
      if (!prev) return null;
      const currentSettings = prev.privacySettings || { showLocation: true, showOnlineStatus: true };
      return {
        ...prev,
        privacySettings: {
          ...currentSettings,
          [setting]: value,
        },
      };
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const mockUploadProfilePicture = async (file: File): Promise<string> => {
    setIsUploading(true);
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload
    const mockUrl = URL.createObjectURL(file);
    setIsUploading(false);
    return mockUrl;
  };

  const handleUpdateProfile = async () => {
    if (!profile || !currentUser) return;
    setLoadingProfileData(true);
    let uploadedImageUrl = profile.profilePicture;

    try {
       if (profilePictureFile) {
         uploadedImageUrl = await mockUploadProfilePicture(profilePictureFile);
         if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
         }
         setPreviewUrl(uploadedImageUrl);
       }

      const updatedProfileData: UserProfile = {
        ...profile,
        id: currentUser.uid, // Ensure correct ID
        profilePicture: uploadedImageUrl,
        dataAiHint: profile.name ? `${profile.name.split(' ')[0].toLowerCase()} person` : 'person',
      };

      await update_user_profile(currentUser.uid, updatedProfileData);
      setProfile(updatedProfileData);

      toast({
        title: t('updateSuccessTitle'),
        description: t('updateSuccessDescription'),
      });
      setIsEditing(false);
      setProfilePictureFile(null);
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        variant: "destructive",
        title: t('updateErrorTitle'),
        description: t('updateErrorDescription'),
      });
    } finally {
      setLoadingProfileData(false);
      setIsUploading(false);
    }
  };

  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (authLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    // Should be redirected by useEffect, but this is a fallback display
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-2">{t('redirectingToLogin')}</p>
      </div>
    );
  }

  if (loadingProfileData && !profile) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-2">{t('loading')}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-destructive">{t('noProfileError')}</p>
        <Button onClick={() => router.push('/login')} className="mt-4">{t('returnToLogin')}</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="flex flex-col items-center space-y-4">
          <div className="relative group">
              <Avatar
                  className={`h-32 w-32 border-4 border-muted group-hover:border-primary transition-colors ${isEditing ? 'cursor-pointer' : ''}`}
                  onClick={handleAvatarClick}
                  data-ai-hint={profile.dataAiHint || "person placeholder"}
                >
                <AvatarImage src={previewUrl || undefined} alt={profile.name || currentUser.displayName || 'User'} />
                <AvatarFallback className="text-4xl">{getInitials(profile.name || currentUser.displayName)}</AvatarFallback>
              </Avatar>
              {isEditing && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick}>
                      <Upload className="h-8 w-8 text-white" />
                  </div>
              )}
              {isUploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-full">
                      <Loader2 className="h-12 w-12 text-white animate-spin" />
                  </div>
              )}
          </div>

          <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={isUploading || !isEditing}
          />

          <div className="text-center">
            <CardTitle className="text-2xl">{profile.name || currentUser.displayName || t('anonymousUser')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setIsEditing(!isEditing)} disabled={isUploading || loadingProfileData}>
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
                  disabled={loadingProfileData || isUploading}
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
                  disabled={loadingProfileData || isUploading}
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
                        disabled={loadingProfileData || isUploading}
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
                    disabled={loadingProfileData || isUploading}
                   />
                  <Label htmlFor="showLocation">{t('showLocationLabel')}</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                  <Switch
                    id="showOnlineStatus"
                    checked={profile.privacySettings?.showOnlineStatus ?? true}
                    onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
                    disabled={loadingProfileData || isUploading}
                  />
                   <Label htmlFor="showOnlineStatus">{t('showOnlineStatusLabel')}</Label>
                 </div>
               </div>
            </>
          ) : (
             <>
              <div className="space-y-1">
                <Label className="font-semibold">{t('nameLabel')}</Label>
                <p>{profile.name || currentUser.displayName || t('notSet')}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold">{t('bioLabel')}</Label>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio || t('notSet')}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold">{t('interestsLabel')}</Label>
                <div className="flex flex-wrap gap-2">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map(interest => (
                      <span key={interest} className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-sm">{interest}</span>
                    ))
                  ) : (
                    <p className="text-muted-foreground">{t('noInterests')}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                  <Label className="font-semibold">{t('privacySettingsLabel')}</Label>
                  <p>{t('showLocationLabel')}: <span className="text-muted-foreground">{profile.privacySettings?.showLocation ? t('yes') : t('no')}</span></p>
                  <p>{t('showOnlineStatusLabel')}: <span className="text-muted-foreground">{profile.privacySettings?.showOnlineStatus ? t('yes') : t('no')}</span></p>
              </div>
            </>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter>
            <Button onClick={handleUpdateProfile} disabled={loadingProfileData || isUploading}>
              { (loadingProfileData || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
              {loadingProfileData || isUploading ? t('saving') : t('saveChanges')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}