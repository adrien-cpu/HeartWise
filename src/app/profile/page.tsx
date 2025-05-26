
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
import { get_user, update_user_profile, UserProfile } from '@/services/user_profile'; // Removed UserReward as it's not directly used here
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, ShieldAlert } from 'lucide-react'; // Added ShieldAlert
import { useAuth } from '@/contexts/AuthContext';
import AuthGuard from '@/components/auth-guard';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';
import { moderateText, ModerationResult, moderateImage } from '@/services/moderation_service'; // Import moderation service


/**
 * @fileOverview Profile page component.
 * @module ProfilePage
 * @description This page allows users to view and edit their profile details, now backed by Firestore. Includes content moderation for bio and simulated moderation for profile pictures. Requires authentication.
 */

// Example interests - this list could come from a config or backend in a real app
const allInterests = ["Reading", "Hiking", "Photography", "Cooking", "Travel", "Music", "Sports", "Movies", "Gaming", "Art", "Technology", "Science"];

/**
 * ProfilePage component.
 *
 * @component
 * @returns {JSX.Element} The rendered Profile page.
 */
export default function ProfilePage() {
  const t = useTranslations('ProfilePage');
  const tChat = useTranslations('Chat'); // For moderation messages
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialProfileData, setInitialProfileData] = useState<UserProfile | null>(null); 
  const [loadingData, setLoadingData] = useState(true); 
  const [isEditing, setIsEditing] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    const fetchProfile = async () => {
      setLoadingData(true);
      try {
        const userProfile = await get_user(currentUser.uid);
        setProfile(userProfile);
        setInitialProfileData(userProfile); 
        setPreviewUrl(userProfile.profilePicture || null);
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        toast({
          variant: "destructive",
          title: t('fetchErrorTitle'),
          description: t('fetchErrorDescription'),
        });
        setProfile(null); 
        setInitialProfileData(null);
      } finally {
        setLoadingData(false);
      }
    };
    fetchProfile();
  }, [currentUser, t, toast]);

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
      if (file.size > 5 * 1024 * 1024) { 
        toast({ variant: 'destructive', title: t('fileTooLargeTitle'), description: t('fileTooLargeDesc') });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({ variant: 'destructive', title: t('invalidFileTypeTitle'), description: t('invalidFileTypeDesc') });
        return;
      }
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

  const mockUploadProfilePicture = async (file: File, userId: string): Promise<string> => {
    console.log(`Simulating upload of ${file.name} for user ${userId}...`);
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    // Simulate image moderation during upload
    const tempUrl = URL.createObjectURL(file); // Create a temporary URL for moderation simulation
    const imageModerationResult: ModerationResult = await moderateImage(tempUrl);
    // URL.revokeObjectURL(tempUrl); // Clean up temporary URL if not needed further by actual upload

    if (!imageModerationResult.isSafe) {
        toast({
            variant: 'destructive',
            title: tChat('moderationBlockTitle'),
            description: `${t('imageModerationFailed')} ${imageModerationResult.issues?.map(issue => issue.category).join(', ')}`,
            duration: 7000,
        });
        throw new Error("Image moderation failed"); // Stop the upload process
    }
    
    return URL.createObjectURL(file); // Return new object URL for preview if safe
  };

  const handleUpdateProfile = async () => {
    if (!profile || !currentUser) return;
    setIsSaving(true);
    
    // Moderate bio text
    if (profile.bio) {
        const bioModerationResult: ModerationResult = await moderateText(profile.bio);
        if (!bioModerationResult.isSafe) {
            toast({
                variant: "destructive",
                title: tChat('moderationBlockTitle'),
                description: `${t('bioModerationFailed')} ${bioModerationResult.issues?.map(issue => issue.category).join(', ')}`,
                duration: 7000,
            });
            setIsSaving(false);
            return;
        }
    }

    let uploadedImageUrl = profile.profilePicture; 

    try {
       if (profilePictureFile) {
         uploadedImageUrl = await mockUploadProfilePicture(profilePictureFile, currentUser.uid);
       }

      const updatedProfileData: UserProfile = {
        ...profile,
        id: currentUser.uid,
        profilePicture: uploadedImageUrl,
        dataAiHint: profile.name ? `${profile.name.split(' ')[0].toLowerCase()} person` : 'person', 
      };

      const newSavedProfile = await update_user_profile(currentUser.uid, updatedProfileData);
      setProfile(newSavedProfile); 
      setInitialProfileData(newSavedProfile); 
      if (newSavedProfile.profilePicture) { 
        setPreviewUrl(newSavedProfile.profilePicture);
      }

      toast({
        title: t('updateSuccessTitle'),
        description: t('updateSuccessDescription'),
      });
      setIsEditing(false);
      setProfilePictureFile(null); 
    } catch (error: any) { // Catch specific error from moderation
      console.error("Failed to update profile:", error);
      if (error.message !== "Image moderation failed") { // Don't double-toast if it's already handled
        toast({
          variant: "destructive",
          title: t('updateErrorTitle'),
          description: t('updateErrorDescription'),
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfile(initialProfileData); 
    setPreviewUrl(initialProfileData?.profilePicture || null); 
    setProfilePictureFile(null); 
    setIsEditing(false);
  };

  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  if (authLoading || (loadingData && !profile)) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-[calc(100vh-150px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center min-h-screen">
        <p className="mr-2">{t('redirectingToLogin')}</p>
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-destructive text-lg">{t('noProfileError')}</p>
        <Button onClick={() => router.push('/login')} className="mt-4">{t('returnToLogin')}</Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="w-full max-w-2xl mx-auto shadow-lg border">
        <CardHeader className="flex flex-col items-center space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="relative group">
                  <Avatar
                      className={`h-24 w-24 sm:h-32 sm:w-32 border-4 border-muted group-hover:border-primary transition-colors ${isEditing ? 'cursor-pointer' : ''}`}
                      onClick={handleAvatarClick}
                      data-ai-hint={profile.dataAiHint || "person placeholder"}
                    >
                    <AvatarImage src={previewUrl || undefined} alt={profile.name || currentUser.displayName || 'User'} priority={true} />
                    <AvatarFallback className="text-3xl sm:text-4xl">{getInitials(profile.name || currentUser.displayName)}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick} aria-label={t('uploadPicture')}>
                          <Upload className="h-8 w-8 text-white" />
                      </div>
                  )}
                  {isSaving && profilePictureFile && ( 
                      <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center rounded-full">
                          <Loader2 className="h-10 w-10 text-white animate-spin" />
                      </div>
                  )}
              </div>

              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isSaving || !isEditing}
                  aria-label={t('uploadPictureInputLabel')}
              />

              <div className="text-center sm:text-left">
                <CardTitle className="text-2xl sm:text-3xl">{profile.name || currentUser.displayName || t('anonymousUser')}</CardTitle>
                <CardDescription>{t('description')}</CardDescription>
              </div>
          </div>
          {!isEditing && (
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={isSaving || loadingData}>
              {t('editProfile')}
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {isEditing ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">{t('nameLabel')}</Label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleInputChange}
                  disabled={isSaving}
                  aria-required="true"
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
                  disabled={isSaving}
                  rows={4}
                />
                 <p className="text-xs text-muted-foreground">{t('bioModerationNote')}</p>
              </div>
              <div className="space-y-2">
                <Label>{t('interestsLabel')}</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {allInterests.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={profile.interests?.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, !!checked)}
                        disabled={isSaving}
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
                <Label className="text-base font-semibold">{t('privacySettingsLabel')}</Label>
                 <div className="flex items-center justify-between p-3 border rounded-md">
                  <Label htmlFor="showLocation" className="cursor-pointer flex-grow">{t('showLocationLabel')}</Label>
                  <Switch
                    id="showLocation"
                    checked={profile.privacySettings?.showLocation ?? true}
                    onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                    disabled={isSaving}
                   />
                 </div>
                 <div className="flex items-center justify-between p-3 border rounded-md">
                   <Label htmlFor="showOnlineStatus" className="cursor-pointer flex-grow">{t('showOnlineStatusLabel')}</Label>
                  <Switch
                    id="showOnlineStatus"
                    checked={profile.privacySettings?.showOnlineStatus ?? true}
                    onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
                    disabled={isSaving}
                  />
                 </div>
               </div>
            </>
          ) : (
             <>
              <div className="space-y-1">
                <Label className="font-semibold text-sm">{t('emailLabel')}</Label>
                <p className="text-muted-foreground">{currentUser.email || t('notSet')}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold text-sm">{t('bioLabel')}</Label>
                <p className="text-muted-foreground whitespace-pre-wrap break-words">{profile.bio || t('notSet')}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold text-sm">{t('interestsLabel')}</Label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {profile.interests && profile.interests.length > 0 ? (
                    profile.interests.map(interest => (
                      <span key={interest} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-medium">{interest}</span>
                    ))
                  ) : (
                    <p className="text-muted-foreground text-sm">{t('noInterests')}</p>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                  <Label className="font-semibold text-sm">{t('privacySettingsLabel')}</Label>
                  <p className="text-sm">{t('showLocationLabel')}: <span className="font-medium text-muted-foreground">{profile.privacySettings?.showLocation ? t('yes') : t('no')}</span></p>
                  <p className="text-sm">{t('showOnlineStatusLabel')}: <span className="font-medium text-muted-foreground">{profile.privacySettings?.showOnlineStatus ? t('yes') : t('no')}</span></p>
              </div>
            </>
          )}
        </CardContent>
        {isEditing && (
          <CardFooter className="flex justify-end space-x-3">
            <Button variant="outline" onClick={handleCancelEdit} disabled={isSaving}>
                {t('cancel')}
            </Button>
            <Button onClick={handleUpdateProfile} disabled={isSaving}>
              { isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
              {isSaving ? t('saving') : t('saveChanges')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
