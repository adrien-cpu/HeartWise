/**
 * @fileOverview Provides analytics and user behavior tracking services.
 * @module AnalyticsService
 * @description This service tracks user interactions, feature usage, and provides insights for improving user experience.
 */

import { firestore, criticalConfigError } from '@/lib/firebase';
import { collection, addDoc, doc, getDoc, getDocs, query, where, orderBy, Timestamp, serverTimestamp, updateDoc, increment } from 'firebase/firestore';

export interface UserEvent {
  id?: string;
  userId: string;
  eventType: 'page_view' | 'feature_use' | 'interaction' | 'conversion' | 'error';
  eventName: string;
  properties: Record<string, any>;
  timestamp: Timestamp;
  sessionId?: string;
}

export interface FeatureUsageStats {
  featureName: string;
  totalUsage: number;
  uniqueUsers: number;
  averageSessionDuration: number;
  conversionRate: number; // For features that have a "success" action
  lastUsed: Date;
}

export interface UserBehaviorInsights {
  userId: string;
  preferredFeatures: string[];
  averageSessionDuration: number;
  totalSessions: number;
  lastActive: Date;
  engagementScore: number; // 0-100
  churnRisk: 'low' | 'medium' | 'high';
}

class AnalyticsService {
  private readonly EVENTS_COLLECTION = 'userEvents';
  private readonly FEATURE_STATS_COLLECTION = 'featureStats';
  private readonly USER_INSIGHTS_COLLECTION = 'userInsights';

  async trackEvent(
    userId: string,
    eventType: UserEvent['eventType'],
    eventName: string,
    properties: Record<string, any> = {},
    sessionId?: string
  ): Promise<void> {
    if (criticalConfigError) {
      console.log(`Analytics: Would track ${eventType}:${eventName} for user ${userId}`, properties);
      return; // Graceful degradation
    }

    try {
      await addDoc(collection(firestore, this.EVENTS_COLLECTION), {
        userId,
        eventType,
        eventName,
        properties,
        sessionId,
        timestamp: serverTimestamp()
      } as Omit<UserEvent, 'id'>);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  async trackPageView(userId: string, pageName: string, sessionId?: string): Promise<void> {
    await this.trackEvent(userId, 'page_view', 'page_viewed', { pageName }, sessionId);
  }

  async trackFeatureUse(userId: string, featureName: string, action: string, metadata: Record<string, any> = {}): Promise<void> {
    await this.trackEvent(userId, 'feature_use', 'feature_used', { 
      featureName, 
      action,
      ...metadata 
    });
    
    // Update feature usage stats
    await this.updateFeatureStats(featureName, userId);
  }

  async trackConversion(userId: string, conversionType: string, value?: number): Promise<void> {
    await this.trackEvent(userId, 'conversion', conversionType, { value });
  }

  async trackError(userId: string, errorType: string, errorMessage: string, context: Record<string, any> = {}): Promise<void> {
    await this.trackEvent(userId, 'error', errorType, { 
      errorMessage,
      ...context 
    });
  }

  private async updateFeatureStats(featureName: string, userId: string): Promise<void> {
    if (criticalConfigError) return;

    try {
      const statsDocRef = doc(firestore, this.FEATURE_STATS_COLLECTION, featureName);
      const statsDoc = await getDoc(statsDocRef);
      
      if (statsDoc.exists()) {
        await updateDoc(statsDocRef, {
          totalUsage: increment(1),
          lastUsed: serverTimestamp(),
          [`users.${userId}`]: serverTimestamp() // Track unique users
        });
      } else {
        await setDoc(statsDocRef, {
          featureName,
          totalUsage: 1,
          lastUsed: serverTimestamp(),
          users: { [userId]: serverTimestamp() }
        });
      }
    } catch (error) {
      console.error('Error updating feature stats:', error);
    }
  }

  async getFeatureUsageStats(featureName: string): Promise<FeatureUsageStats | null> {
    if (criticalConfigError) return null;

    try {
      const docRef = doc(firestore, this.FEATURE_STATS_COLLECTION, featureName);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          featureName,
          totalUsage: data.totalUsage || 0,
          uniqueUsers: Object.keys(data.users || {}).length,
          averageSessionDuration: data.averageSessionDuration || 0,
          conversionRate: data.conversionRate || 0,
          lastUsed: data.lastUsed?.toDate() || new Date()
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching feature usage stats:', error);
      return null;
    }
  }

  async getUserBehaviorInsights(userId: string): Promise<UserBehaviorInsights | null> {
    if (criticalConfigError) return null;

    try {
      // Get user's events from the last 30 days
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const eventsQuery = query(
        collection(firestore, this.EVENTS_COLLECTION),
        where('userId', '==', userId),
        where('timestamp', '>=', Timestamp.fromDate(thirtyDaysAgo)),
        orderBy('timestamp', 'desc')
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      })) as UserEvent[];

      if (events.length === 0) {
        return null;
      }

      // Analyze behavior patterns
      const featureUsage = new Map<string, number>();
      const sessions = new Set<string>();
      let totalSessionDuration = 0;

      events.forEach(event => {
        if (event.eventType === 'feature_use') {
          const feature = event.properties.featureName;
          featureUsage.set(feature, (featureUsage.get(feature) || 0) + 1);
        }
        if (event.sessionId) {
          sessions.add(event.sessionId);
        }
      });

      const preferredFeatures = Array.from(featureUsage.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([feature]) => feature);

      const engagementScore = Math.min(100, (events.length / 30) * 10); // Simple engagement calculation
      
      let churnRisk: 'low' | 'medium' | 'high' = 'low';
      const daysSinceLastActivity = (Date.now() - Math.max(...events.map(e => e.timestamp.getTime()))) / (1000 * 60 * 60 * 24);
      if (daysSinceLastActivity > 7) churnRisk = 'high';
      else if (daysSinceLastActivity > 3) churnRisk = 'medium';

      return {
        userId,
        preferredFeatures,
        averageSessionDuration: totalSessionDuration / sessions.size || 0,
        totalSessions: sessions.size,
        lastActive: new Date(Math.max(...events.map(e => e.timestamp.getTime()))),
        engagementScore,
        churnRisk
      };
    } catch (error) {
      console.error('Error analyzing user behavior:', error);
      return null;
    }
  }

  async generatePersonalizedRecommendations(userId: string): Promise<string[]> {
    const insights = await this.getUserBehaviorInsights(userId);
    if (!insights) return [];

    const recommendations: string[] = [];

    // High churn risk recommendations
    if (insights.churnRisk === 'high') {
      recommendations.push("We miss you! Try the new Blind Exchange mode for a fresh experience.");
    }

    // Low engagement recommendations
    if (insights.engagementScore < 30) {
      recommendations.push("Boost your profile completion to get better matches.");
      recommendations.push("Try playing games to break the ice with potential matches.");
    }

    // Feature-specific recommendations
    if (!insights.preferredFeatures.includes('chat')) {
      recommendations.push("Start conversations with your matches to build connections.");
    }

    if (!insights.preferredFeatures.includes('speed-dating')) {
      recommendations.push("Join a speed dating session to meet multiple people quickly.");
    }

    return recommendations;
  }
}

export const analyticsService = new AnalyticsService();