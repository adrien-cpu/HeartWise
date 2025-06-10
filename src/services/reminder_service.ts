import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc, getDoc, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { notificationService } from './notification_service';

export interface Reminder {
    id: string;
    bookingId: string;
    userId: string;
    title: string;
    message: string;
    scheduledTime: Date;
    status: 'pending' | 'sent' | 'cancelled';
    createdAt: Date;
    updatedAt: Date;
}

export interface ReminderTemplate {
    id: string;
    title: string;
    message: string;
    timeBeforeEvent: number; // en minutes
}

class ReminderService {
    private readonly REMINDERS_COLLECTION = 'reminders';
    private readonly TEMPLATES_COLLECTION = 'reminder_templates';

    private readonly DEFAULT_TEMPLATES: ReminderTemplate[] = [
        {
            id: '24h',
            title: 'Rappel de rendez-vous',
            message: 'Votre rendez-vous est prévu dans 24 heures.',
            timeBeforeEvent: 24 * 60,
        },
        {
            id: '1h',
            title: 'Rappel de rendez-vous',
            message: 'Votre rendez-vous est prévu dans 1 heure.',
            timeBeforeEvent: 60,
        },
        {
            id: '15min',
            title: 'Rappel de rendez-vous',
            message: 'Votre rendez-vous est prévu dans 15 minutes.',
            timeBeforeEvent: 15,
        },
    ];

    async createReminder(bookingId: string, userId: string, scheduledTime: Date): Promise<Reminder> {
        try {
            const templates = await this.getTemplates();
            const reminders: Reminder[] = [];

            for (const template of templates) {
                const reminderTime = new Date(scheduledTime.getTime() - template.timeBeforeEvent * 60 * 1000);

                if (reminderTime > new Date()) {
                    const reminderData = {
                        bookingId,
                        userId,
                        title: template.title,
                        message: template.message,
                        scheduledTime: reminderTime,
                        status: 'pending',
                        createdAt: Timestamp.now(),
                        updatedAt: Timestamp.now(),
                    };

                    const docRef = await addDoc(collection(db, this.REMINDERS_COLLECTION), reminderData);
                    reminders.push({
                        id: docRef.id,
                        ...reminderData,
                        createdAt: reminderData.createdAt.toDate(),
                        updatedAt: reminderData.updatedAt.toDate(),
                    });
                }
            }

            return reminders[0]; // Retourne le premier rappel créé
        } catch (error) {
            console.error('Erreur lors de la création des rappels:', error);
            throw new Error('Impossible de créer les rappels');
        }
    }

    async getTemplates(): Promise<ReminderTemplate[]> {
        try {
            const q = query(collection(db, this.TEMPLATES_COLLECTION));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                // Si aucun template n'existe, créer les templates par défaut
                for (const template of this.DEFAULT_TEMPLATES) {
                    await addDoc(collection(db, this.TEMPLATES_COLLECTION), template);
                }
                return this.DEFAULT_TEMPLATES;
            }

            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            })) as ReminderTemplate[];
        } catch (error) {
            console.error('Erreur lors de la récupération des templates:', error);
            throw new Error('Impossible de récupérer les templates');
        }
    }

    async getUserReminders(userId: string): Promise<Reminder[]> {
        try {
            const q = query(
                collection(db, this.REMINDERS_COLLECTION),
                where('userId', '==', userId),
                where('status', '==', 'pending')
            );

            const querySnapshot = await getDocs(q);
            return querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt.toDate(),
                updatedAt: doc.data().updatedAt.toDate(),
                scheduledTime: doc.data().scheduledTime.toDate(),
            })) as Reminder[];
        } catch (error) {
            console.error('Erreur lors de la récupération des rappels:', error);
            throw new Error('Impossible de récupérer les rappels');
        }
    }

    async updateReminderStatus(reminderId: string, status: Reminder['status']): Promise<void> {
        try {
            const docRef = doc(db, this.REMINDERS_COLLECTION, reminderId);
            await updateDoc(docRef, {
                status,
                updatedAt: Timestamp.now(),
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut:', error);
            throw new Error('Impossible de mettre à jour le statut du rappel');
        }
    }

    async processReminders(): Promise<void> {
        try {
            const now = new Date();
            const q = query(
                collection(db, this.REMINDERS_COLLECTION),
                where('status', '==', 'pending'),
                where('scheduledTime', '<=', now)
            );

            const querySnapshot = await getDocs(q);

            for (const doc of querySnapshot.docs) {
                const reminder = {
                    id: doc.id,
                    ...doc.data(),
                    createdAt: doc.data().createdAt.toDate(),
                    updatedAt: doc.data().updatedAt.toDate(),
                    scheduledTime: doc.data().scheduledTime.toDate(),
                } as Reminder;

                // Envoyer la notification
                await notificationService.sendNotification({
                    userId: reminder.userId,
                    title: reminder.title,
                    body: reminder.message,
                    data: {
                        type: 'reminder',
                        bookingId: reminder.bookingId,
                    },
                });

                // Mettre à jour le statut
                await this.updateReminderStatus(reminder.id, 'sent');
            }
        } catch (error) {
            console.error('Erreur lors du traitement des rappels:', error);
            throw new Error('Impossible de traiter les rappels');
        }
    }
}

export const reminderService = new ReminderService(); 