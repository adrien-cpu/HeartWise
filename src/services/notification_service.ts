import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

interface NotificationPayload {
    title: string;
    body: string;
    icon?: string;
    click_action?: string;
    data?: Record<string, string>;
}

interface NotificationPreferences {
    newMessages: boolean;
    newMatches: boolean;
    profileViews: boolean;
    eventReminders: boolean;
    systemUpdates: boolean;
}

export class NotificationService {
    private static instance: NotificationService;
    private messaging: any;
    private notificationCallbacks: ((payload: NotificationPayload) => void)[] = [];

    private constructor() {
        const app = initializeApp({
            // Configuration Firebase
            apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
            messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
            appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
        });

        this.messaging = getMessaging(app);
        this.setupMessageListener();
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    private setupMessageListener() {
        onMessage(this.messaging, (payload) => {
            this.notificationCallbacks.forEach(callback => callback(payload));
        });
    }

    async requestPermission(): Promise<boolean> {
        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                await this.saveFCMToken();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur lors de la demande de permission:', error);
            return false;
        }
    }

    private async saveFCMToken() {
        try {
            const token = await getToken(this.messaging, {
                vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
            });

            if (token) {
                const userDoc = doc(db, 'users', 'current-user-id'); // À remplacer par l'ID de l'utilisateur connecté
                await setDoc(userDoc, {
                    fcmToken: token,
                    notificationPreferences: {
                        newMessages: true,
                        newMatches: true,
                        profileViews: true,
                        eventReminders: true,
                        systemUpdates: true
                    }
                }, { merge: true });
            }
        } catch (error) {
            console.error('Erreur lors de la sauvegarde du token FCM:', error);
        }
    }

    async updateNotificationPreferences(
        userId: string,
        preferences: Partial<NotificationPreferences>
    ): Promise<void> {
        try {
            const userDoc = doc(db, 'users', userId);
            await updateDoc(userDoc, {
                notificationPreferences: preferences
            });
        } catch (error) {
            console.error('Erreur lors de la mise à jour des préférences:', error);
            throw error;
        }
    }

    async getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
        try {
            const userDoc = doc(db, 'users', userId);
            const docSnap = await getDoc(userDoc);

            if (docSnap.exists()) {
                return docSnap.data().notificationPreferences;
            }

            return {
                newMessages: true,
                newMatches: true,
                profileViews: true,
                eventReminders: true,
                systemUpdates: true
            };
        } catch (error) {
            console.error('Erreur lors de la récupération des préférences:', error);
            throw error;
        }
    }

    onNotification(callback: (payload: NotificationPayload) => void): () => void {
        this.notificationCallbacks.push(callback);
        return () => {
            this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
        };
    }

    async sendNotification(
        userId: string,
        payload: NotificationPayload
    ): Promise<void> {
        try {
            const userDoc = doc(db, 'users', userId);
            const docSnap = await getDoc(userDoc);

            if (!docSnap.exists()) {
                throw new Error('Utilisateur non trouvé');
            }

            const userData = docSnap.data();
            const fcmToken = userData.fcmToken;

            if (!fcmToken) {
                throw new Error('Token FCM non trouvé');
            }

            // Envoyer la notification via Firebase Cloud Functions
            // Cette partie sera implémentée côté serveur
            console.log('Envoi de notification à:', userId, payload);
        } catch (error) {
            console.error('Erreur lors de l\'envoi de la notification:', error);
            throw error;
        }
    }

    async sendBulkNotifications(
        userIds: string[],
        payload: NotificationPayload
    ): Promise<void> {
        try {
            for (const userId of userIds) {
                await this.sendNotification(userId, payload);
            }
        } catch (error) {
            console.error('Erreur lors de l\'envoi des notifications en masse:', error);
            throw error;
        }
    }
}

export const notificationService = NotificationService.getInstance(); 