"use client";

import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { UserProfile } from '@/services/user_profile';

interface ProfilePictureSectionProps {
  profile: UserProfile | null;
  uploading: boolean;
  onUpload: (file: File) => void;
}

const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
};

export const ProfilePictureSection: React.FC<ProfilePictureSectionProps> = ({ profile, uploading, onUpload }) => {
  const t = useTranslations('ProfilePage');

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onUpload(file);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <Avatar className="h-32 w-32 border-2 border-primary">
        <AvatarImage src={profile?.profilePicture || undefined} alt={profile?.name || 'Profile Picture'} />
        <AvatarFallback className="text-4xl">{getInitials(profile?.name)}</AvatarFallback>
      </Avatar>
      <label htmlFor="upload-picture">
        <Button asChild disabled={uploading}>
          <input
            type="file"
            id="upload-picture"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          {t('uploadPicture')}
        </Button>
      </label>
      <p className="text-sm text-muted-foreground">{t('uploadPictureNote')}</p>
    </div>
  );
};
