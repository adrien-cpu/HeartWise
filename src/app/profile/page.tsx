
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
import { get_user, update_user_profile, UserProfile, UserReward } from '@/services/user_profile';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Timestamp } from 'firebase/firestore';


/**
 * @fileOverview Profile page component.
 * @module ProfilePage
 * @description This page allows users to view and edit their profile details, now backed by Firestore. Requires authentication.
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
  const { toast } = useToast();
  const { currentUser, loading: authLoading } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [initialProfileData, setInitialProfileData] = useState<UserProfile | null>(null); // To track original data for cancel
  const [loadingData, setLoadingData] = useState(true); // Combined loading state
  const [isEditing, setIsEditing] = useState(false);
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (authLoading) {
      return; 
    }

    if (!currentUser) {
      router.push('/login'); 
      return;
    }

    const fetchProfile = async () => {
      setLoadingData(true);
      try {
        const userProfile = await get_user(currentUser.uid);
        setProfile(userProfile);
        setInitialProfileData(userProfile); // Store initial data for cancel
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
      // Basic client-side validation (optional, add more as needed)
      if (file.size > 5 * 1024 * 1024) { // Max 5MB
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

  // Mock function for profile picture upload - in a real app, this would upload to Firebase Storage
  const mockUploadProfilePicture = async (file: File, userId: string): Promise<string> => {
    console.log(`Simulating upload of ${file.name} for user ${userId}...`);
    // In a real app:
    // const storageRef = ref(storage, `profilePictures/${userId}/${file.name}`);
    // await uploadBytes(storageRef, file);
    // const downloadURL = await getDownloadURL(storageRef);
    // return downloadURL;
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload delay
    return URL.createObjectURL(file); // For local preview, replace with actual URL
  };

  const handleUpdateProfile = async () => {
    if (!profile || !currentUser) return;
    setIsSaving(true);
    let uploadedImageUrl = profile.profilePicture; // Keep existing if no new file

    try {
       if (profilePictureFile) {
         // In a real app, you'd upload to Firebase Storage and get the URL.
         // For now, we'll use the local preview URL, but acknowledge this is not persistent for others.
         // This mockUpload will just simulate the delay and return a local URL.
         // A real implementation would be: uploadedImageUrl = await uploadFileToFirebaseStorage(profilePictureFile, currentUser.uid);
         uploadedImageUrl = await mockUploadProfilePicture(profilePictureFile, currentUser.uid);
         // If using local object URLs for preview, you might not need to setPreviewUrl again if uploadedImageUrl IS the previewUrl
       }

      const updatedProfileData: UserProfile = {
        ...profile,
        id: currentUser.uid,
        profilePicture: uploadedImageUrl,
        dataAiHint: profile.name ? `${profile.name.split(' ')[0].toLowerCase()} person` : 'person', // Simple hint
        // Ensure timestamps are handled correctly (updatedAt is set by update_user_profile service)
      };

      const newSavedProfile = await update_user_profile(currentUser.uid, updatedProfileData);
      setProfile(newSavedProfile); // Update local state with data from Firestore
      setInitialProfileData(newSavedProfile); // Update initial data to new saved state
      if (newSavedProfile.profilePicture) { // Update preview URL from Firestore result
        setPreviewUrl(newSavedProfile.profilePicture);
      }


      toast({
        title: t('updateSuccessTitle'),
        description: t('updateSuccessDescription'),
      });
      setIsEditing(false);
      setProfilePictureFile(null); // Clear file after successful update
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        variant: "destructive",
        title: t('updateErrorTitle'),
        description: t('updateErrorDescription'),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setProfile(initialProfileData); // Restore original data
    setPreviewUrl(initialProfileData?.profilePicture || null); // Restore original preview
    setProfilePictureFile(null); // Clear any selected file
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
                    <AvatarImage src={previewUrl || undefined} alt={profile.name || currentUser.displayName || 'User'} />
                    <AvatarFallback className="text-3xl sm:text-4xl">{getInitials(profile.name || currentUser.displayName)}</AvatarFallback>
                  </Avatar>
                  {isEditing && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" onClick={handleAvatarClick} aria-label={t('uploadPicture')}>
                          <Upload className="h-8 w-8 text-white" />
                      </div>
                  )}
                  {isSaving && profilePictureFile && ( // Show loader only when uploading new pic
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
