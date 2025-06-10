'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Clock, Calendar } from 'lucide-react';
import { reminderService, Reminder } from '@/services/reminder_service';
import { useToast } from '@/hooks/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ReminderListProps {
    userId: string;
}

export function ReminderList({ userId }: ReminderListProps) {
    const t = useTranslations('ReminderList');
    const { toast } = useToast();
    const [reminders, setReminders] = useState<Reminder[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReminders();
        // Rafraîchir les rappels toutes les minutes
        const interval = setInterval(loadReminders, 60000);
        return () => clearInterval(interval);
    }, [userId]);

    const loadReminders = async () => {
        try {
            const userReminders = await reminderService.getUserReminders(userId);
            setReminders(userReminders);
        } catch (error) {
            toast({
                variant: "destructive",
                title: t('loadError'),
                description: t('loadErrorDescription'),
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: Reminder['status']) => {
        const statusConfig = {
            pending: { variant: 'warning', label: t('statusPending') },
            sent: { variant: 'success', label: t('statusSent') },
            cancelled: { variant: 'destructive', label: t('statusCancelled') },
        };

        const config = statusConfig[status];
        return (
            <Badge variant={config.variant as any}>
                {config.label}
            </Badge>
        );
    };

    if (loading) {
        return <div>{t('loading')}</div>;
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {t('title')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {reminders.length === 0 ? (
                        <p className="text-muted-foreground text-center">{t('noReminders')}</p>
                    ) : (
                        reminders.map((reminder) => (
                            <Card key={reminder.id} className="p-4">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-2">
                                        <h3 className="font-medium">{reminder.title}</h3>
                                        <p className="text-sm text-muted-foreground">{reminder.message}</p>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <Clock className="h-4 w-4" />
                                                <span>
                                                    {formatDistanceToNow(reminder.scheduledTime, {
                                                        addSuffix: true,
                                                        locale: fr,
                                                    })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                <span>
                                                    {format(reminder.scheduledTime, 'PPP', { locale: fr })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {getStatusBadge(reminder.status)}
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
} 