/**
 * @fileOverview Enhanced push notification service with FCM integration.
 * @module PushNotificationService
 * @description Provides comprehensive push notification functionality using Firebase Cloud Messaging.
 */

import { firestore, criticalConfigError } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, updateDoc, serverTimestamp, arrayUnion, arrayRemove } from 'firebase/firestore';

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  image?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, string>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

export interface NotificationTemplate {
  id: string;
  name: string;
  title: string;
  body: string;
  category: 'match' | 'message' | 'event' | 'system' | 'achievement';
  variables: string[]; // Variables that can be substituted in title/body
  defaultIcon?: string;
}

export interface UserNotificationSettings {
  userId: string;
  enabled: boolean;
  categories: {
    matches: boolean;
    messages: boolean;
    events: boolean;
    system: boolean;
    achievements: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string;   // "08:00"
  };
  deviceTokens: string[];
  updatedAt: Date;
}

class PushNotificationService {
  private readonly NOTIFICATION_SETTINGS_COLLECTION = 'notificationSettings';
  private readonly NOTIFICATION_TEMPLATES_COLLECTION = 'notificationTemplates';
  private readonly NOTIFICATION_QUEUE_COLLECTION = 'notificationQueue';

  private defaultTemplates: NotificationTemplate[] = [
    {
      id: 'new_match',
      name: 'New Match',
      title: 'You have a new match! 💕',
      body: '{matchName} is interested in connecting with you',
      category: 'match',
      variables: ['matchName'],
      defaultIcon: '/icons/heart.png'
    },
    {
      id: 'new_message',
      name: 'New Message',
      title: 'New message from {senderName}',
      body: '{messagePreview}',
      category: 'message',
      variables: ['senderName', 'messagePreview'],
      defaultIcon: '/icons/message.png'
    },
    {
      id: 'speed_dating_reminder',
      name: 'Speed Dating Reminder',
      title: 'Speed Dating starts in {timeUntil}',
      body: 'Don\'t miss your session focused on {interests}',
      category: 'event',
      variables: ['timeUntil', 'interests'],
      defaultIcon: '/icons/speed-dating.png'
    },
    {
      id: 'badge_earned',
      name: 'Badge Earned',
      title: 'Achievement unlocked! 🏆',
      body: 'You\'ve earned the "{badgeName}" badge',
      category: 'achievement',
      variables: ['badgeName'],
      defaultIcon: '/icons/trophy.png'
    }
  ];

  async initializeUserSettings(userId: string): Promise<UserNotificationSettings> {
    if (criticalConfigError) {
      return this.getDefaultSettings(userId);
    }

    try {
      const docRef = doc(firestore, this.NOTIFICATION_SETTINGS_COLLECTION, userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data() as UserNotificationSettings;
      }
      
      const defaultSettings = this.getDefaultSettings(userId);
      await setDoc(docRef, defaultSettings);
      return defaultSettings;
    } catch (error) {
      console.error('Error initializing notification settings:', error);
      return this.getDefaultSettings(userId);
    }
  }

  private getDefaultSettings(userId: string): UserNotificationSettings {
    return {
      userId,
      enabled: true,
      categories: {
        matches: true,
        messages: true,
        events: true,
        system: true,
        achievements: true
      },
      quietHours: {
        enabled: false,
        start: "22:00",
        end: "08:00"
      },
      deviceTokens: [],
      updatedAt: new Date()
    };
  }

  async updateNotificationSettings(userId: string, settings: Partial<UserNotificationSettings>): Promise<void> {
    if (criticalConfigError) return;

    try {
      const docRef = doc(firestore, this.NOTIFICATION_SETTINGS_COLLECTION, userId);
      await updateDoc(docRef, {
        ...settings,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }

  async addDeviceToken(userId: string, token: string): Promise<void> {
    if (criticalConfigError) return;

    try {
      const docRef = doc(firestore, this.NOTIFICATION_SETTINGS_COLLECTION, userId);
      await updateDoc(docRef, {
        deviceTokens: arrayUnion(token),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error adding device token:', error);
    }
  }

  async removeDeviceToken(userId: string, token: string): Promise<void> {
    if (criticalConfigError) return;

    try {
      const docRef = doc(firestore, this.NOTIFICATION_SETTINGS_COLLECTION, userId);
      await updateDoc(docRef, {
        deviceTokens: arrayRemove(token),
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error removing device token:', error);
    }
  }

  async sendNotification(
    userId: string, 
    templateId: string, 
    variables: Record<string, string> = {},
    customPayload?: Partial<PushNotificationPayload>
  ): Promise<void> {
    if (criticalConfigError) {
      console.log(`Push notification would be sent to ${userId} with template ${templateId}:`, { variables, customPayload });
      return;
    }

    try {
      // Get user settings
      const settings = await this.initializeUserSettings(userId);
      if (!settings.enabled) return;

      // Get template
      const template = this.defaultTemplates.find(t => t.id === templateId);
      if (!template) {
        throw new Error(`Template ${templateId} not found`);
      }

      // Check if category is enabled
      if (!settings.categories[template.category]) return;

      // Check quiet hours
      if (this.isInQuietHours(settings.quietHours)) return;

      // Substitute variables in template
      let title = template.title;
      let body = template.body;
      
      Object.entries(variables).forEach(([key, value]) => {
        title = title.replace(`{${key}}`, value);
        body = body.replace(`{${key}}`, value);
      });

      const payload: PushNotificationPayload = {
        title,
        body,
        icon: template.defaultIcon,
        ...customPayload
      };

      // Queue notification for delivery
      await this.queueNotification(userId, payload);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  private async queueNotification(userId: string, payload: PushNotificationPayload): Promise<void> {
    // In a real implementation, this would queue the notification for a Cloud Function to send
    // For now, we'll simulate immediate delivery
    console.log(`Notification queued for user ${userId}:`, payload);
    
    // Add to Firestore queue for Cloud Function processing
    await setDoc(doc(firestore, this.NOTIFICATION_QUEUE_COLLECTION, `${userId}_${Date.now()}`), {
      userId,
      payload,
      status: 'queued',
      createdAt: serverTimestamp()
    });
  }

  private isInQuietHours(quietHours: UserNotificationSettings['quietHours']): boolean {
    if (!quietHours.enabled) return false;
    
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // Simple time comparison - in production, you'd want more robust timezone handling
    return currentTime >= quietHours.start || currentTime <= quietHours.end;
  }

  async sendBulkNotification(
    userIds: string[],
    templateId: string,
    variables: Record<string, string> = {}
  ): Promise<void> {
    for (const userId of userIds) {
      await this.sendNotification(userId, templateId, variables);
    }
  }
}

export const pushNotificationService = new PushNotificationService();