'use client';

import { useEffect, useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { notificationService } from '@/services/notification_service';
import { Bell, BellOff } from 'lucide-react';

interface NotificationPreferencesProps {
    userId: string;
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
    const t = useTranslations('NotificationPreferences');
    const [preferences, setPreferences] = useState({
        newMessages: true,
        newMatches: true,
        profileViews: true,
        eventReminders: true,
        systemUpdates: true
    });
    const [isLoading, setIsLoading] = useState(true);
    const [hasPermission, setHasPermission] = useState(false);

    const loadPreferences = useCallback(async () => {
        try {
            const prefs = await notificationService.getNotificationPreferences(userId);
            setPreferences(prefs);
        } catch (error) {
            console.error('Erreur lors du chargement des préférences:', error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    const checkPermission = useCallback(async () => {
        const permission = await notificationService.requestPermission();
        setHasPermission(permission);
    }, []);

    useEffect(() => {
        loadPreferences();
        checkPermission();
    }, [loadPreferences, checkPermission]);

    const handleToggle = async (key: keyof typeof preferences) => {
        try {
            const newPreferences = {
                ...preferences,
                [key]: !preferences[key]
            };

            await notificationService.updateNotificationPreferences(userId, newPreferences);
            setPreferences(newPreferences);
        } catch (error) {
            console.error('Erreur lors de la mise à jour des préférences:', error);
        }
    };

    const handleRequestPermission = async () => {
        const granted = await notificationService.requestPermission();
        setHasPermission(granted);
    };

    if (isLoading) {
        return <div>{t('loading')}</div>;
    }

    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    {hasPermission ? <Bell className="h-5 w-5" /> : <BellOff className="h-5 w-5" />}
                    {t('title')}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {!hasPermission && (
                    <div className="p-4 bg-muted rounded-lg">
                        <p className="text-sm text-muted-foreground mb-4">
                            {t('permissionRequired')}
                        </p>
                        <Button onClick={handleRequestPermission}>
                            {t('enableNotifications')}
                        </Button>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="newMessages">{t('newMessages')}</Label>
                        <Switch
                            id="newMessages"
                            checked={preferences.newMessages}
                            onCheckedChange={() => handleToggle('newMessages')}
                            disabled={!hasPermission}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="newMatches">{t('newMatches')}</Label>
                        <Switch
                            id="newMatches"
                            checked={preferences.newMatches}
                            onCheckedChange={() => handleToggle('newMatches')}
                            disabled={!hasPermission}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="profileViews">{t('profileViews')}</Label>
                        <Switch
                            id="profileViews"
                            checked={preferences.profileViews}
                            onCheckedChange={() => handleToggle('profileViews')}
                            disabled={!hasPermission}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="eventReminders">{t('eventReminders')}</Label>
                        <Switch
                            id="eventReminders"
                            checked={preferences.eventReminders}
                            onCheckedChange={() => handleToggle('eventReminders')}
                            disabled={!hasPermission}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Label htmlFor="systemUpdates">{t('systemUpdates')}</Label>
                        <Switch
                            id="systemUpdates"
                            checked={preferences.systemUpdates}
                            onCheckedChange={() => handleToggle('systemUpdates')}
                            disabled={!hasPermission}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
} 