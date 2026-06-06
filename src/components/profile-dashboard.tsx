import React, { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'use-intl';
import { useAuthContext } from '../contexts/AuthContext';
import { profileService } from '../services/profileService';
import { UserProfile } from '../types/UserProfile';

interface ProfileDashboardProps {
    userId: string;
}

export function ProfileDashboard({ userId }: ProfileDashboardProps) {
    const t = useTranslations('ProfileDashboard');
    const { user } = useAuthContext();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Partial<UserProfile>>({});

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const data = await profileService.getUserProfile(userId);
            setProfile(data);
            setFormData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleUpdateProfile = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const updatedProfile = await profileService.updateUserProfile(userId, formData);
            setProfile(updatedProfile);
            setIsEditing(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    }, [userId, formData]);

    // ... existing code ...
} 