
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
import { get_user, update_user_profile, UserProfile } from '@/services/user_profile'; // Assuming service exists
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload } from 'lucide-react'; // Import Loader2 and Upload icon

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
  const [profilePictureFile, setProfilePictureFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock user ID for now
  const userId = "user1"; // Replace with actual user ID fetching logic

  useEffect(() => {
    /**
     * Fetches the user profile data.
     * @async
     */
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const userProfile = await get_user(userId);
        setProfile(userProfile);
        setPreviewUrl(userProfile.profilePicture || null); // Set initial preview
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
  const handlePrivacyChange = (setting: keyof NonNullable<UserProfile['privacySettings']>, value: boolean) => {
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
   * Handles the profile picture file selection.
   * @param {React.ChangeEvent<HTMLInputElement>} e - The change event.
   */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePictureFile(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Triggers the hidden file input click event.
   */
  const handleAvatarClick = () => {
    if (isEditing && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Simulates uploading the profile picture.
   * @param {File} file - The file to upload.
   * @returns {Promise<string>} A promise resolving to the mock uploaded image URL.
   */
  const mockUploadProfilePicture = async (file: File): Promise<string> => {
    setIsUploading(true);
    console.log("Uploading file:", file.name);
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    // In a real app, upload the file to storage (e.g., Firebase Storage)
    // and get the download URL.
    const mockUrl = URL.createObjectURL(file); // Use blob URL for local preview simulation
    console.log("Mock upload complete. URL:", mockUrl);
    setIsUploading(false);
    return mockUrl; // Return the object URL for preview
  };


  /**
   * Handles the profile update submission.
   * @async
   */
  const handleUpdateProfile = async () => {
    if (!profile) return;
    setLoading(true);
    let uploadedImageUrl = profile.profilePicture; // Keep existing if no new file

    try {
       // Upload new profile picture if selected
       if (profilePictureFile) {
         uploadedImageUrl = await mockUploadProfilePicture(profilePictureFile);
         // Revoke previous object URL if it exists and is a blob URL
         if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
         }
         setPreviewUrl(uploadedImageUrl); // Update preview to the "uploaded" URL
       }

      const updatedProfileData: UserProfile = {
        ...profile,
        profilePicture: uploadedImageUrl, // Use the potentially updated URL
        dataAiHint: profile.name ? `${profile.name.split(' ')[0].toLowerCase()} person` : 'person', // Add a basic AI hint
      };


      // Remove profilePicture from data sent if it wasn't changed and wasn't uploaded
      // This depends on how your backend handles updates. If it merges, sending undefined might clear it.
      // If it requires explicit fields, you might need to adjust.
      const dataToSend: Partial<UserProfile> = { ...updatedProfileData };
      if (!profilePictureFile && dataToSend.profilePicture === mockUserData[userId]?.profilePicture) {
         // If no new file and the URL hasn't changed from the initial load,
         // you might not need to send the profilePicture field at all,
         // unless your backend expects it. Let's keep it for now assuming merge.
      }


      await update_user_profile(userId, dataToSend); // Send updated data

      // Update local state with the final profile, including the potentially new image URL
      setProfile(updatedProfileData);

      toast({
        title: t('updateSuccessTitle'),
        description: t('updateSuccessDescription'),
      });
      setIsEditing(false);
      setProfilePictureFile(null); // Clear the selected file after successful upload/save
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast({
        variant: "destructive",
        title: t('updateErrorTitle'),
        description: t('updateErrorDescription'),
      });
    } finally {
      setLoading(false);
      setIsUploading(false);
    }
  };

  // Helper function to get initials
  const getInitials = (name?: string): string => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Mock user data store for demonstration purposes (replace with actual data fetching)
  const mockUserData: { [key: string]: UserProfile } = {
      "user1": {
          id: "user1",
          name: "Alice",
          bio: "Loves hiking and photography.",
          interests: ["Hiking", "Photography", "Reading"],
          profilePicture: "https://picsum.photos/seed/alice/200", 
          dataAiHint: "woman nature",
          privacySettings: { showLocation: true, showOnlineStatus: true }
      },
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
        <CardHeader className="flex flex-col items-center space-y-4">
          <div className="relative group">
              <Avatar
                  className={`h-32 w-32 border-4 border-muted group-hover:border-primary transition-colors ${isEditing ? 'cursor-pointer' : ''}`}
                  onClick={handleAvatarClick}
                  data-ai-hint={profile.dataAiHint || "person placeholder"}
                >
                <AvatarImage src={previewUrl || undefined} alt={profile.name || 'User'} />
                <AvatarFallback className="text-4xl">{getInitials(profile.name)}</AvatarFallback>
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
            <CardTitle className="text-2xl">{profile.name || t('anonymousUser')}</CardTitle>
            <CardDescription>{t('description')}</CardDescription>
          </div>
          <Button variant="outline" size="sm" className="ml-auto" onClick={() => setIsEditing(!isEditing)} disabled={isUploading}>
            {isEditing ? t('cancel') : t('editProfile')}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {isEditing ? (
            <>
             {/* Profile Fields */}
              <div className="space-y-2">
                <Label htmlFor="name">{t('nameLabel')}</Label>
                <Input
                  id="name"
                  name="name"
                  value={profile.name || ''}
                  onChange={handleInputChange}
                  disabled={loading || isUploading}
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
                  disabled={loading || isUploading}
                />
              </div>
               {/* Interests Section */}
              <div className="space-y-2">
                <Label>{t('interestsLabel')}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {allInterests.map(interest => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={`interest-${interest}`}
                        checked={profile.interests?.includes(interest)}
                        onCheckedChange={(checked) => handleInterestChange(interest, !!checked)}
                        disabled={loading || isUploading}
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
              {/* Privacy Settings Section */}
               <div className="space-y-4">
                <Label>{t('privacySettingsLabel')}</Label>
                 <div className="flex items-center space-x-2">
                  <Switch
                    id="showLocation"
                    checked={profile.privacySettings?.showLocation ?? true}
                    onCheckedChange={(checked) => handlePrivacyChange('showLocation', checked)}
                    disabled={loading || isUploading}
                   />
                  <Label htmlFor="showLocation">{t('showLocationLabel')}</Label>
                 </div>
                 <div className="flex items-center space-x-2">
                  <Switch
                    id="showOnlineStatus"
                    checked={profile.privacySettings?.showOnlineStatus ?? true}
                    onCheckedChange={(checked) => handlePrivacyChange('showOnlineStatus', checked)}
                    disabled={loading || isUploading}
                  />
                   <Label htmlFor="showOnlineStatus">{t('showOnlineStatusLabel')}</Label>
                 </div>
               </div>
            </>
          ) : (
             <>
               {/* Display Profile Fields */}
              <div className="space-y-1">
                <Label className="font-semibold">{t('nameLabel')}</Label>
                <p>{profile.name || t('notSet')}</p>
              </div>
              <div className="space-y-1">
                <Label className="font-semibold">{t('bioLabel')}</Label>
                <p className="text-muted-foreground whitespace-pre-wrap">{profile.bio || t('notSet')}</p>
              </div>
               {/* Display Interests */}
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
              {/* Display Privacy Settings */}
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
            <Button onClick={handleUpdateProfile} disabled={loading || isUploading}>
              { (loading || isUploading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
              {loading || isUploading ? t('saving') : t('saveChanges')}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  );
}
